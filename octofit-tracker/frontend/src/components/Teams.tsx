import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

type Team = { name?: string; mascot?: string; members?: string[] };

async function loadTeams() {
  const response = await getJson<{ teams: Team[] }>('/api/teams');
  return response.teams;
}

export default function Teams() {
  return <CapabilityCard<Team>
    title="Teams"
    description="Manage teams and members."
    loadItems={loadTeams}
    emptyMessage="No teams yet."
    renderItem={(team) => <>{team.name ?? 'Team'}{team.mascot ? ` (${team.mascot})` : ''}{team.members?.length ? ` · ${team.members.length} members` : ''}</>}
  />;
}
