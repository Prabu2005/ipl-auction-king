import { motion } from "framer-motion";
import { mockTeams, mockPlayers, formatPrice } from "@/lib/mockData";
import { TeamCard } from "@/components/TeamCard";
import { PlayerCard } from "@/components/PlayerCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy, Download, Share2 } from "lucide-react";

const soldPlayers = mockPlayers.filter(p => p.status === "sold");
const unsoldPlayers = mockPlayers.filter(p => p.status === "unsold");
const totalSpent = soldPlayers.reduce((sum, p) => sum + (p.soldPrice || 0), 0);
const mostExpensive = soldPlayers.sort((a, b) => (b.soldPrice || 0) - (a.soldPrice || 0))[0];

export default function Results() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-3 border-b border-border/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="font-heading text-xl font-bold">Auction Results</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="glass" size="sm"><Download className="w-4 h-4" /> Export</Button>
          <Button variant="glass" size="sm"><Share2 className="w-4 h-4" /> Share</Button>
        </div>
      </header>

      <div className="p-6 max-w-6xl mx-auto space-y-8">
        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Spent", value: formatPrice(totalSpent), icon: "💰" },
            { label: "Players Sold", value: String(soldPlayers.length), icon: "✅" },
            { label: "Players Unsold", value: String(unsoldPlayers.length), icon: "❌" },
            { label: "Most Expensive", value: mostExpensive?.name || "—", sub: mostExpensive ? formatPrice(mostExpensive.soldPrice || 0) : "", icon: "🌟" },
          ].map((s, i) => (
            <div key={i} className="glass-card p-5">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="font-heading text-2xl font-bold mt-1">{s.value}</div>
              {s.sub && <div className="text-sm text-primary font-medium">{s.sub}</div>}
            </div>
          ))}
        </motion.div>

        {/* Teams */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="font-heading text-2xl font-bold mb-4">Team Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTeams.map((team, i) => (
              <div key={team.id} className="relative">
                {i === 0 && (
                  <div className="absolute -top-2 -right-2 z-10 w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-sm font-bold text-primary-foreground">🏆</div>
                )}
                <TeamCard team={team} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sold Players */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="font-heading text-2xl font-bold mb-4">Sold Players</h2>
          <div className="grid gap-3">
            {soldPlayers.map(p => <PlayerCard key={p.id} player={p} />)}
          </div>
        </motion.div>

        {/* Unsold */}
        {unsoldPlayers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
            <h2 className="font-heading text-2xl font-bold mb-4">Unsold Players</h2>
            <div className="grid gap-3">
              {unsoldPlayers.map(p => <PlayerCard key={p.id} player={p} />)}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
