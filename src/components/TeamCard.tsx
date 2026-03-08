import { Team, formatPrice } from "@/lib/mockData";

export function TeamCard({ team }: { team: Team }) {
  const budgetUsed = team.budgetTotal - team.budgetRemaining;
  const budgetPercent = (budgetUsed / team.budgetTotal) * 100;

  return (
    <div className="glass-card p-5 hover:glass-card-glow transition-all duration-300">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center text-3xl">
          {team.logo}
        </div>
        <div>
          <h3 className="font-heading text-xl font-bold">{team.name}</h3>
          <p className="text-sm text-muted-foreground">{team.ownerName}</p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">{formatPrice(team.budgetRemaining)} / {formatPrice(team.budgetTotal)}</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full gold-gradient transition-all duration-500"
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Squad</span>
          <span className="font-medium">{team.squad.length}/25</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">RTM Cards</span>
          <span className="font-medium text-primary">{team.rtmCount}</span>
        </div>
      </div>
    </div>
  );
}
