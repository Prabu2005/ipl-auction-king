import { useState } from "react";
import { motion } from "framer-motion";
import { useTeams, usePlayers, useAuctionState, useBidsForPlayer, useRealtimeSubscriptions, usePlaceBid, formatPrice } from "@/hooks/useAuction";
import { PlayerCard } from "@/components/PlayerCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthContext";
import { toast } from "sonner";
import { ArrowLeft, Gavel, Users, Shield, Wifi, Loader2, LogOut } from "lucide-react";

export default function TeamDashboard() {
  const [roleFilter, setRoleFilter] = useState("all");
  const navigate = useNavigate();
  const { teamId, setTeamId } = useAuth();

  const { data: teams, isLoading } = useTeams();
  const { data: players } = usePlayers();
  const { data: auctionState } = useAuctionState();
  useRealtimeSubscriptions();

  const team = teams?.find(t => t.id === teamId) || teams?.[0];
  const activePlayer = players?.find(p => p.id === auctionState?.current_player_id);
  const { data: bids } = useBidsForPlayer(activePlayer?.id || null);
  const placeBid = usePlaceBid();

  const topBid = bids?.[0];
  const topBidTeam = teams?.find(t => t.id === topBid?.team_id);
  const currentBidAmount = topBid?.amount || activePlayer?.base_price || 0;
  const nextBidAmount = currentBidAmount + (auctionState?.bid_increment || 25);

  const squad = (players || []).filter(p => p.sold_to_team_id === team?.id);
  const filteredSquad = roleFilter === "all" ? squad : squad.filter(p => p.role === roleFilter);
  const roles = ["all", "Batsman", "Bowler", "All-rounder", "WK"];

  const canBid = team && team.budget_remaining >= nextBidAmount && auctionState?.status === "in_progress";

  const handleBid = () => {
    if (!team || !activePlayer) return;
    if (team.budget_remaining < nextBidAmount) { toast.error("Insufficient budget!"); return; }
    placeBid.mutate({ player_id: activePlayer.id, team_id: team.id, amount: nextBidAmount }, {
      onSuccess: () => toast.success(`Bid placed: ${formatPrice(nextBidAmount)}`),
      onError: () => toast.error("Failed to place bid"),
    });
  };

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-md">
          <div className="text-4xl mb-4">🏏</div>
          <h2 className="font-heading text-2xl font-bold mb-2">No Teams Available</h2>
          <p className="text-muted-foreground mb-4">Ask the admin to create teams first.</p>
          <Button variant="gold" onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-3 border-b border-border/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-2xl">{team.logo_emoji}</span>
          <div>
            <h1 className="font-heading text-xl font-bold">{team.name}</h1>
            <p className="text-xs text-muted-foreground">{team.owner_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Team selector */}
          <select
            className="h-8 rounded-lg bg-muted border border-border px-2 text-xs"
            value={team.id}
            onChange={e => setSelectedTeamId(e.target.value)}
          >
            {teams?.map(t => <option key={t.id} value={t.id}>{t.short_name}</option>)}
          </select>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Budget</div>
            <div className="font-heading text-xl font-bold text-gold-gradient">{formatPrice(team.budget_remaining)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Squad</div>
            <div className="font-heading text-lg font-bold">{squad.length}/{team.max_squad_size}</div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Wifi className="w-3 h-3 text-success" />
            <span className="text-success text-xs">LIVE</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-[calc(100vh-57px)]">
        {/* Live Auction Panel */}
        <div className="border-r border-border/30 p-6 flex flex-col">
          <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
            <Gavel className="w-5 h-5 text-primary" /> Live Auction
          </h2>

          {activePlayer ? (
            <motion.div
              key={activePlayer.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card-glow p-6 flex-1 flex flex-col items-center justify-center text-center"
            >
              <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center font-heading text-4xl font-bold text-muted-foreground mb-3">
                {activePlayer.photo_url ? (
                  <img src={activePlayer.photo_url} alt={activePlayer.name} className="w-full h-full object-cover rounded-xl" />
                ) : activePlayer.name.charAt(0)}
              </div>
              <h3 className="font-heading text-2xl font-bold">{activePlayer.name}</h3>
              <p className="text-sm text-secondary">{activePlayer.role} • {activePlayer.country}</p>

              <div className="glass-card p-4 rounded-xl w-full max-w-xs my-4">
                <div className="text-xs text-muted-foreground">Current Bid</div>
                <div className="font-heading text-3xl font-bold text-gold-gradient">{formatPrice(currentBidAmount)}</div>
                {topBidTeam && (
                  <div className="text-xs text-muted-foreground">
                    by <strong className={topBidTeam.id === team.id ? "text-primary" : "text-foreground"}>{topBidTeam.short_name}{topBidTeam.id === team.id ? " (YOU)" : ""}</strong>
                  </div>
                )}
              </div>

              <Button
                variant="bid"
                size="bid"
                className="w-full max-w-xs"
                disabled={!canBid}
                onClick={handleBid}
              >
                <Gavel className="w-6 h-6" /> BID {formatPrice(nextBidAmount)}
              </Button>

              {!canBid && team.budget_remaining < nextBidAmount && (
                <p className="text-xs text-destructive mt-2">Insufficient budget</p>
              )}

              <div className="flex gap-2 mt-3 w-full max-w-xs">
                <Button variant="glass" size="sm" className="flex-1">
                  <Shield className="w-4 h-4" /> Use RTM ({team.rtm_count})
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="glass-card p-12 flex-1 flex flex-col items-center justify-center text-center">
              <Gavel className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">Waiting for auction to begin...</p>
            </div>
          )}
        </div>

        {/* My Squad */}
        <div className="p-6 overflow-y-auto">
          <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> My Squad ({squad.length})
          </h2>

          <div className="flex gap-2 mb-4 flex-wrap">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  roleFilter === role ? "bg-primary/10 text-primary border border-primary/20" : "bg-muted/50 text-muted-foreground hover:text-foreground"
                }`}
              >
                {role === "all" ? "All" : role}
              </button>
            ))}
          </div>

          {filteredSquad.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <div className="text-4xl mb-3">🏏</div>
              <p className="text-muted-foreground">No players in this category yet.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredSquad.map(player => (
                <PlayerCard key={player.id} player={player} compact />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
