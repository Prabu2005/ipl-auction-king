import { useState } from "react";
import { motion } from "framer-motion";
import { mockTeams, mockPlayers, formatPrice } from "@/lib/mockData";
import { PlayerCard } from "@/components/PlayerCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gavel, Wallet, Users, Shield, Timer, Wifi } from "lucide-react";

const team = mockTeams[0]; // Mock: logged in as MI
const activePlayer = mockPlayers.find(p => p.status === "active") || mockPlayers[2];
const currentBid = 300;
const currentBidTeam = "CSK";

export default function TeamDashboard() {
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const navigate = useNavigate();

  const squad = team.squad;
  const filteredSquad = roleFilter === "all" ? squad : squad.filter(p => p.role === roleFilter);
  const roles = ["all", "Batsman", "Bowler", "All-rounder", "WK"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <span className="text-2xl">{team.logo}</span>
          <div>
            <h1 className="font-heading text-xl font-bold">{team.name}</h1>
            <p className="text-xs text-muted-foreground">{team.ownerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Budget</div>
            <div className="font-heading text-xl font-bold text-gold-gradient">{formatPrice(team.budgetRemaining)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Squad</div>
            <div className="font-heading text-lg font-bold">{squad.length}/25</div>
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

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card-glow p-6 flex-1 flex flex-col items-center justify-center text-center"
          >
            <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center font-heading text-4xl font-bold text-muted-foreground mb-3">
              {activePlayer.name.charAt(0)}
            </div>
            <h3 className="font-heading text-2xl font-bold">{activePlayer.name}</h3>
            <p className="text-sm text-secondary">{activePlayer.role} • {activePlayer.country}</p>

            <div className="flex gap-4 my-4 text-sm">
              {activePlayer.stats.runs != null && <span>Runs: <strong>{activePlayer.stats.runs}</strong></span>}
              {activePlayer.stats.wickets != null && <span>Wkts: <strong>{activePlayer.stats.wickets}</strong></span>}
              {activePlayer.stats.economy != null && <span>Eco: <strong>{activePlayer.stats.economy}</strong></span>}
            </div>

            <div className="glass-card p-4 rounded-xl w-full max-w-xs mb-4">
              <div className="text-xs text-muted-foreground">Current Bid</div>
              <div className="font-heading text-3xl font-bold text-gold-gradient">{formatPrice(currentBid)}</div>
              <div className="text-xs text-muted-foreground">by <strong className="text-foreground">{currentBidTeam}</strong></div>
            </div>

            {/* Timer */}
            <div className="w-full max-w-xs h-2 rounded-full bg-muted overflow-hidden mb-6">
              <div className="timer-bar timer-green" style={{ width: "75%" }} />
            </div>

            {/* Bid Button */}
            <Button variant="bid" size="bid" className="w-full max-w-xs">
              <Gavel className="w-6 h-6" /> BID {formatPrice(currentBid + 25)}
            </Button>

            <div className="flex gap-2 mt-3 w-full max-w-xs">
              <Button variant="glass" size="sm" className="flex-1">
                <Shield className="w-4 h-4" /> Use RTM ({team.rtmCount})
              </Button>
            </div>
          </motion.div>
        </div>

        {/* My Squad */}
        <div className="p-6 overflow-y-auto">
          <h2 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" /> My Squad
          </h2>

          <div className="flex gap-2 mb-4 flex-wrap">
            {roles.map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  roleFilter === role
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-muted/50 text-muted-foreground hover:text-foreground"
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
