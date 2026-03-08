import { useState } from "react";
import { motion } from "framer-motion";
import { mockPlayers, mockTeams, formatPrice } from "@/lib/mockData";
import { PlayerCard } from "@/components/PlayerCard";
import { TeamCard } from "@/components/TeamCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Gavel, Users, UserPlus, Play, Pause, SkipForward,
  BarChart3, Trophy, ArrowLeft, Search, Upload
} from "lucide-react";

type Tab = "players" | "teams" | "auction" | "analytics";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("players");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredPlayers = mockPlayers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "players", label: "Players", icon: <Users className="w-4 h-4" /> },
    { id: "teams", label: "Teams", icon: <Trophy className="w-4 h-4" /> },
    { id: "auction", label: "Auction", icon: <Gavel className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <Gavel className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-xl font-bold">Admin Dashboard</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 px-6 py-3 border-b border-border/30">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="p-6">
        {tab === "players" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold">Player Management</h2>
              <div className="flex gap-2">
                <Button variant="glass" size="sm"><Upload className="w-4 h-4" /> Import CSV</Button>
                <Button variant="gold" size="sm"><UserPlus className="w-4 h-4" /> Add Player</Button>
              </div>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Search players..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="grid gap-3">
              {filteredPlayers.map(player => (
                <PlayerCard key={player.id} player={player} />
              ))}
            </div>
          </motion.div>
        )}

        {tab === "teams" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold">Team Management</h2>
              <Button variant="gold" size="sm"><UserPlus className="w-4 h-4" /> Add Team</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockTeams.map(team => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          </motion.div>
        )}

        {tab === "auction" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-heading text-2xl font-bold mb-6">Auction Controls</h2>
            <div className="glass-card p-6 max-w-xl space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button variant="gold" size="lg"><Play className="w-5 h-5" /> Start Auction</Button>
                <Button variant="glass" size="lg"><Pause className="w-5 h-5" /> Pause</Button>
              </div>
              <Button variant="electric" size="lg" className="w-full"><SkipForward className="w-5 h-5" /> Next Player</Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="glass">Mark SOLD</Button>
                <Button variant="glass">Mark UNSOLD</Button>
              </div>

              <div className="pt-4 border-t border-border/30">
                <h4 className="font-heading font-bold mb-2">Settings</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-muted-foreground text-xs">Timer (seconds)</label>
                    <select className="w-full mt-1 h-9 rounded-lg bg-muted border border-border px-3 text-sm">
                      <option>15</option><option>30</option><option>60</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs">Bid Increment</label>
                    <select className="w-full mt-1 h-9 rounded-lg bg-muted border border-border px-3 text-sm">
                      <option>5L</option><option>10L</option><option>25L</option><option>50L</option><option>1Cr</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "analytics" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-heading text-2xl font-bold mb-6">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Spent", value: formatPrice(4700), icon: "💰" },
                { label: "Players Sold", value: "2", icon: "✅" },
                { label: "Players Unsold", value: "1", icon: "❌" },
                { label: "Most Expensive", value: "Bumrah", icon: "🌟" },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-5">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <div className="font-heading text-2xl font-bold mt-1">{stat.value}</div>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-sm">Charts will be added when connected to the backend.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
