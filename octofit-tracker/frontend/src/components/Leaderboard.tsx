import { CapabilityCard } from './CapabilityCard.js';

type Entry = { rank?: number; teamName?: string; totalPoints?: number };

export default function Leaderboard() {
  return <CapabilityCard<Entry>
    title="Leaderboard"
    description="Compare team point totals."
    endpoint="/api/leaderboard"
    itemsKey="leaderboard"
    emptyMessage="No leaderboard scores yet."
    renderItem={(entry) => <>#{entry.rank ?? '-'} {entry.teamName ?? 'Team'}: {entry.totalPoints ?? 0} points</>}
  />;
}
