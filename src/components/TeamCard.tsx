import { DbTeam, formatPrice } from "@/hooks/useAuction";

export function TeamCard({ team }: { team: DbTeam }) {
  const budgetUsed = team.budget_total - team.budget_remaining;
  const budgetPercent = (budgetUsed / team.budget_total) * 100;

  return (
    <div className="glass-card p-5 hover:glass-card-glow transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-3xl">
          {team.logo_emoji || "🏏"}
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold">{team.name}</h3>
          <p className="text-sm text-muted-foreground">{team.owner_name}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">{formatPrice(team.budget_remaining)} / {formatPrice(team.budget_total)}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full gold-gradient transition-all duration-500"
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">RTM Cards</span>
          <span className="font-medium text-primary">{team.rtm_count}</span>
        </div>
      </div>
    </div>
  );
}
