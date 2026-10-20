import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function serviceError(message: string, status: number) {
  return Object.assign(new Error(message), { status });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw serviceError('Activity input must be an object', 400);
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' || !mongoose.isObjectIdOrHexString(userId) ||
    typeof teamId !== 'string' || !mongoose.isObjectIdOrHexString(teamId) ||
    typeof type !== 'string' || type.trim().length === 0 ||
    typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0
  ) {
    throw serviceError('Activity requires valid userId, teamId, type, and positive minutes', 400);
  }

  const [user, team] = await Promise.all([
    User.findById(userId).select('_id'),
    Team.findById(teamId).select('_id'),
  ]);
  if (!user || !team) {
    throw serviceError('Activity user or team was not found', 404);
  }

  return Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw serviceError('Team input must be an object', 400);
  }

  const { name, mascot, members } = input as Record<string, unknown>;
  if (typeof name !== 'string' || name.trim().length === 0) {
    throw serviceError('Team name is required', 400);
  }
  if (typeof mascot !== 'string' || mascot.trim().length === 0) {
    throw serviceError('Team mascot is required', 400);
  }
  if (
    members !== undefined &&
    (!Array.isArray(members) || members.some((member) => typeof member !== 'string' || !mongoose.isObjectIdOrHexString(member)))
  ) {
    throw serviceError('Team members must be user IDs', 400);
  }

  return Team.create({ name, mascot, members: members ?? [] });
}

export async function getLeaderboard() {
  const totals = await Team.aggregate([
    {
      $lookup: {
        from: Activity.collection.name,
        localField: '_id',
        foreignField: 'team',
        as: 'activities',
      },
    },
    { $unwind: { path: '$activities', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$_id',
        teamName: { $first: '$name' },
        totalPoints: { $sum: { $ifNull: ['$activities.points', 0] } },
      },
    },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);

  return totals.map(({ teamName, totalPoints }, index) => ({ teamName, totalPoints, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw serviceError('User was not found', 404);
  }

  const recentActivities = await Activity.find({ user: user._id })
    .sort({ occurredAt: -1 })
    .limit(10)
    .lean();
  const focusForActivity = (type: string) => {
    const normalizedType = type.toLowerCase();
    if (['run', 'cycle', 'cycling', 'bike', 'swim'].includes(normalizedType)) return 'endurance';
    return normalizedType;
  };
  const preferredFocuses = [...new Set([
    user.fitnessGoal?.toLowerCase(),
    ...recentActivities.map(({ type }) => focusForActivity(type)),
  ].filter((focus): focus is string => Boolean(focus)))];

  const workouts = await Workout.find().lean();
  workouts.sort((first, second) => {
    const firstRank = preferredFocuses.indexOf(first.focus.toLowerCase());
    const secondRank = preferredFocuses.indexOf(second.focus.toLowerCase());
    return (firstRank < 0 ? Number.MAX_SAFE_INTEGER : firstRank) -
      (secondRank < 0 ? Number.MAX_SAFE_INTEGER : secondRank) || (first.title ?? '').localeCompare(second.title ?? '');
  });

  return workouts.map((workout) => {
    const workoutFocus = workout.focus.toLowerCase();
    const matchingActivity = recentActivities.find(({ type }) => focusForActivity(type) === workoutFocus);
    const reason = user.fitnessGoal?.toLowerCase() === workoutFocus
      ? `Matches your ${user.fitnessGoal} goal.`
      : matchingActivity
        ? `Recommended based on your recent ${matchingActivity.type} activity.`
        : 'A suggested workout for your routine.';
    return { ...workout, reason };
  });
}

export { User };
