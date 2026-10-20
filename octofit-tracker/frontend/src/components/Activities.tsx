import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Activity = { type?: string; minutes?: number; points?: number };

async function loadActivities() {
  const response = await getJson<{ activities: Activity[] }>('/api/activities');
  return response.activities;
}

export default function Activities() {
  return <CapabilityCard<Activity>
    title="Activities"
    description="Track student activity minutes and points."
    loadItems={loadActivities}
    emptyMessage="No activities yet."
    renderItem={(activity) => <>{activity.type ?? 'Activity'}: {activity.minutes ?? 0} minutes, {activity.points ?? 0} points</>}
  />;
}
