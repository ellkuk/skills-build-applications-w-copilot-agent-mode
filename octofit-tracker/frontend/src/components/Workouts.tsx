import { CapabilityCard } from './CapabilityCard.js';

type Workout = { title?: string; reason?: string };

export default function Workouts() {
  return <CapabilityCard<Workout>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    endpoint={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
    itemsKey="suggestions"
    emptyMessage="No workout suggestions available."
    renderItem={(workout) => <>{workout.title ?? 'Workout'}{workout.reason ? `: ${workout.reason}` : ''}</>}
  />;
}
