import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Entry = { rank?: number; teamName?: string; totalPoints?: number };

async function loadLeaderboard() {
  const response = await getJson<{ leaderboard: Entry[] }>('/api/leaderboard');
  return response.leaderboard;
}

export default function Leaderboard() {
  return <CapabilityCard<Entry>
    title="Leaderboard"
    description="Compare team point totals."
    loadItems={loadLeaderboard}
    emptyMessage="No leaderboard scores yet."
    renderItem={(entry) => <>#{entry.rank ?? '-'} {entry.teamName ?? 'Team'}: {entry.totalPoints ?? 0} points</>}
  />;
}
