import { DbPlayer, formatPrice } from "@/hooks/useAuction";
import { cn } from "@/lib/utils";

const roleColors: Record<string, string> = {
  Batsman: "text-primary",
  Bowler: "text-secondary",
  "All-rounder": "text-success",
  WK: "text-electric",
};

const badgeStyles: Record<string, string> = {
  "Star Player": "badge-elite",
  Uncapped: "badge-risky",
  Overseas: "badge-quality",
};

export function PlayerCard({ player, compact = false }: { player: DbPlayer; compact?: boolean }) {
  const stats = player.stats || {};
  return (
    <div className={cn("glass-card overflow-hidden group hover:glass-card-glow transition-all duration-300", compact ? "p-3" : "p-5")}>
      <div className="flex items-start gap-4">
        <div className={cn("rounded-lg bg-muted flex items-center justify-center font-heading font-bold text-muted-foreground shrink-0", compact ? "w-12 h-12 text-lg" : "w-16 h-16 text-2xl")}>
          {player.photo_url ? (
            <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            player.name.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={cn("font-heading font-bold truncate", compact ? "text-base" : "text-lg")}>{player.name}</h4>
            {player.badge && (
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", badgeStyles[player.badge] || "")}>
                {player.badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={cn("font-medium", roleColors[player.role] || "")}>{player.role}</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">{player.country}</span>
          </div>
          {!compact && (
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              {stats.runs != null && <span>Runs: <strong className="text-foreground">{stats.runs}</strong></span>}
              {stats.wickets != null && <span>Wkts: <strong className="text-foreground">{stats.wickets}</strong></span>}
              {stats.average != null && <span>Avg: <strong className="text-foreground">{stats.average}</strong></span>}
              {stats.strikeRate != null && <span>SR: <strong className="text-foreground">{stats.strikeRate}</strong></span>}
              {stats.economy != null && <span>Eco: <strong className="text-foreground">{stats.economy}</strong></span>}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          {player.status === "sold" && player.sold_price ? (
            <div className="text-primary font-heading font-bold">{formatPrice(player.sold_price)}</div>
          ) : (
            <div className="text-muted-foreground text-sm">Base: {formatPrice(player.base_price)}</div>
          )}
          <span className={cn("text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded-full", {
            "bg-primary/20 text-primary": player.status === "sold",
            "bg-destructive/20 text-destructive": player.status === "unsold",
            "bg-secondary/20 text-secondary": player.status === "active",
            "bg-muted text-muted-foreground": player.status === "pending",
          })}>
            {player.status.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
