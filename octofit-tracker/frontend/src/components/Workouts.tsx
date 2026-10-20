import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Workout = { title?: string; reason?: string };

async function loadWorkouts() {
  const response = await getJson<{ suggestions: Workout[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`);
  return response.suggestions;
}

export default function Workouts() {
  return <CapabilityCard<Workout>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    loadItems={loadWorkouts}
    emptyMessage="No workout suggestions available."
    renderItem={(workout) => <>{workout.title ?? 'Workout'}{workout.reason ? `: ${workout.reason}` : ''}</>}
  />;
}
