import { motion } from "framer-motion";
import { mockPlayers, mockTeams, formatPrice } from "@/lib/mockData";
import { PlayerCard } from "@/components/PlayerCard";
import { Gavel, Trophy, Timer, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";

const activePlayer = mockPlayers.find(p => p.status === "active") || mockPlayers[2];
const soldPlayers = mockPlayers.filter(p => p.status === "sold");

const mockBids = [
  { team: "MI", amount: 300, time: "2s ago" },
  { team: "CSK", amount: 250, time: "5s ago" },
  { team: "RCB", amount: 200, time: "8s ago" },
];

export default function AuctionLive() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border/30">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <Gavel className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-xl font-bold text-gold-gradient">LIVE AUCTION</h1>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Wifi className="w-4 h-4 text-success" />
          <span className="text-success font-medium">LIVE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 h-[calc(100vh-57px)]">
        {/* Main: Current Player */}
        <div className="lg:col-span-3 p-6 flex flex-col">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card-glow p-8 flex-1 flex flex-col items-center justify-center text-center"
          >
            <div className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
              <Timer className="w-4 h-4" /> NOW BIDDING
            </div>

            <div className="w-28 h-28 rounded-2xl bg-muted flex items-center justify-center font-heading text-5xl font-bold text-muted-foreground mb-4">
              {activePlayer.name.charAt(0)}
            </div>

            <h2 className="font-heading text-4xl md:text-5xl font-bold mb-2">{activePlayer.name}</h2>
            <p className="text-secondary font-medium mb-1">{activePlayer.role} • {activePlayer.country}</p>

            {activePlayer.badge && (
              <span className="text-xs px-3 py-1 rounded-full badge-elite mb-4">{activePlayer.badge}</span>
            )}

            {/* Stats */}
            <div className="flex gap-6 my-6">
              {activePlayer.stats.runs != null && (
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold">{activePlayer.stats.runs}</div>
                  <div className="text-xs text-muted-foreground">Runs</div>
                </div>
              )}
              {activePlayer.stats.wickets != null && (
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold">{activePlayer.stats.wickets}</div>
                  <div className="text-xs text-muted-foreground">Wickets</div>
                </div>
              )}
              {activePlayer.stats.average != null && (
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold">{activePlayer.stats.average}</div>
                  <div className="text-xs text-muted-foreground">Average</div>
                </div>
              )}
              {activePlayer.stats.strikeRate != null && (
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold">{activePlayer.stats.strikeRate}</div>
                  <div className="text-xs text-muted-foreground">SR</div>
                </div>
              )}
              {activePlayer.stats.economy != null && (
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold">{activePlayer.stats.economy}</div>
                  <div className="text-xs text-muted-foreground">Economy</div>
                </div>
              )}
            </div>

            {/* Current Bid */}
            <div className="glass-card p-6 rounded-2xl mb-4 w-full max-w-md">
              <div className="text-sm text-muted-foreground mb-1">Current Bid</div>
              <div className="font-heading text-5xl font-bold text-gold-gradient animate-count-up">
                {formatPrice(mockBids[0].amount)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">by <strong className="text-foreground">{mockBids[0].team}</strong></div>
            </div>

            {/* Timer bar */}
            <div className="w-full max-w-md h-2 rounded-full bg-muted overflow-hidden">
              <div className="timer-bar timer-yellow" style={{ width: "60%" }} />
            </div>

            {/* Bid history */}
            <div className="mt-6 w-full max-w-md space-y-2">
              {mockBids.map((bid, i) => (
                <div key={i} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-muted/50">
                  <span className="font-medium">{bid.team}</span>
                  <span className="text-primary font-heading font-bold">{formatPrice(bid.amount)}</span>
                  <span className="text-xs text-muted-foreground">{bid.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="border-l border-border/30 flex flex-col overflow-hidden">
          {/* Team Leaderboard */}
          <div className="p-4 border-b border-border/30">
            <h3 className="font-heading text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" /> Teams
            </h3>
            <div className="space-y-2">
              {mockTeams.map(team => (
                <div key={team.id} className="flex items-center gap-3 text-sm">
                  <span className="text-lg">{team.logo}</span>
                  <span className="flex-1 font-medium truncate">{team.shortName}</span>
                  <span className="text-muted-foreground">{formatPrice(team.budgetRemaining)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sold Players */}
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="font-heading text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Sold Players
            </h3>
            <div className="space-y-3">
              {soldPlayers.map(player => (
                <PlayerCard key={player.id} player={player} compact />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
