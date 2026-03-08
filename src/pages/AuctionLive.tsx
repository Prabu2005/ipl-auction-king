import { motion } from "framer-motion";
import { usePlayers, useTeams, useAuctionState, useBidsForPlayer, useRealtimeSubscriptions, formatPrice, DbPlayer } from "@/hooks/useAuction";
import { PlayerCard } from "@/components/PlayerCard";
import { Gavel, Trophy, Timer, Wifi, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AuctionLive() {
  const navigate = useNavigate();
  const { data: players, isLoading: loadingPlayers } = usePlayers();
  const { data: teams } = useTeams();
  const { data: auctionState } = useAuctionState();
  useRealtimeSubscriptions();

  const activePlayer = players?.find(p => p.id === auctionState?.current_player_id) || players?.find(p => p.status === "active");
  const soldPlayers = players?.filter(p => p.status === "sold") || [];
  const { data: bids } = useBidsForPlayer(activePlayer?.id || null);

  const topBid = bids?.[0];
  const topBidTeam = teams?.find(t => t.id === topBid?.team_id);

  if (loadingPlayers) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-3 border-b border-border/30">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <Gavel className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-xl font-bold text-gold-gradient">LIVE AUCTION</h1>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Wifi className="w-4 h-4 text-success" />
          <span className="text-success font-medium">
            {auctionState?.status === "in_progress" ? "LIVE" : auctionState?.status?.toUpperCase() || "OFFLINE"}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 h-[calc(100vh-57px)]">
        <div className="lg:col-span-3 p-6 flex flex-col">
          {activePlayer ? (
            <motion.div
              key={activePlayer.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card-glow p-8 flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Timer className="w-4 h-4" /> NOW BIDDING
              </div>
              <div className="w-28 h-28 rounded-2xl bg-muted flex items-center justify-center font-heading text-5xl font-bold text-muted-foreground mb-4">
                {activePlayer.photo_url ? (
                  <img src={activePlayer.photo_url} alt={activePlayer.name} className="w-full h-full object-cover rounded-2xl" />
                ) : activePlayer.name.charAt(0)}
              </div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold mb-2">{activePlayer.name}</h2>
              <p className="text-secondary font-medium mb-1">{activePlayer.role} • {activePlayer.country}</p>
              {activePlayer.badge && <span className="text-xs px-3 py-1 rounded-full badge-elite mb-4">{activePlayer.badge}</span>}

              <div className="flex gap-6 my-6">
                {Object.entries(activePlayer.stats || {}).map(([key, val]) => (
                  <div key={key} className="text-center">
                    <div className="text-2xl font-heading font-bold">{val as number}</div>
                    <div className="text-xs text-muted-foreground capitalize">{key}</div>
                  </div>
                ))}
              </div>

              <div className="glass-card p-6 rounded-2xl mb-4 w-full max-w-md">
                <div className="text-sm text-muted-foreground mb-1">Current Bid</div>
                <div className="font-heading text-5xl font-bold text-gold-gradient animate-count-up">
                  {topBid ? formatPrice(topBid.amount) : formatPrice(activePlayer.base_price)}
                </div>
                {topBidTeam && (
                  <div className="text-sm text-muted-foreground mt-1">by <strong className="text-foreground">{topBidTeam.short_name}</strong></div>
                )}
              </div>

              {/* Bid history */}
              <div className="mt-4 w-full max-w-md space-y-2">
                {bids?.slice(0, 5).map((bid) => {
                  const bidTeam = teams?.find(t => t.id === bid.team_id);
                  return (
                    <div key={bid.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-muted/50">
                      <span className="font-medium">{bidTeam?.short_name || "?"}</span>
                      <span className="text-primary font-heading font-bold">{formatPrice(bid.amount)}</span>
                      <span className="text-xs text-muted-foreground">{new Date(bid.created_at).toLocaleTimeString()}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-16 flex-1 flex flex-col items-center justify-center text-center">
              <Gavel className="w-16 h-16 text-muted-foreground mb-4" />
              <h2 className="font-heading text-3xl font-bold mb-2">Auction Not Started</h2>
              <p className="text-muted-foreground">Waiting for admin to start the auction...</p>
            </div>
          )}
        </div>

        <div className="border-l border-border/30 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border/30">
            <h3 className="font-heading text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" /> Teams
            </h3>
            <div className="space-y-2">
              {teams?.map(team => (
                <div key={team.id} className="flex items-center gap-3 text-sm">
                  <span className="text-lg">{team.logo_emoji}</span>
                  <span className="flex-1 font-medium truncate">{team.short_name}</span>
                  <span className="text-muted-foreground">{formatPrice(team.budget_remaining)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="font-heading text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Sold Players</h3>
            <div className="space-y-3">
              {soldPlayers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No players sold yet.</p>
              ) : (
                soldPlayers.map(player => <PlayerCard key={player.id} player={player} compact />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
