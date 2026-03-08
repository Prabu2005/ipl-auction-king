import { useState } from "react";
import { motion } from "framer-motion";
import { usePlayers, useTeams, useAddPlayer, useAddTeam, useDeletePlayer, useDeleteTeam, useAuctionState, useRealtimeSubscriptions, formatPrice } from "@/hooks/useAuction";
import { PlayerCard } from "@/components/PlayerCard";
import { TeamCard } from "@/components/TeamCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Gavel, Users, UserPlus, Play, Pause, SkipForward,
  BarChart3, Trophy, ArrowLeft, Search, Upload, Trash2, Loader2
} from "lucide-react";

type Tab = "players" | "teams" | "auction" | "analytics";

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>("players");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: players, isLoading: loadingPlayers } = usePlayers();
  const { data: teams } = useTeams();
  const { data: auctionState } = useAuctionState();
  useRealtimeSubscriptions();

  const addPlayer = useAddPlayer();
  const addTeam = useAddTeam();
  const deletePlayer = useDeletePlayer();
  const deleteTeam = useDeleteTeam();

  const filteredPlayers = (players || []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const soldPlayers = (players || []).filter(p => p.status === "sold");
  const unsoldPlayers = (players || []).filter(p => p.status === "unsold");
  const totalSpent = soldPlayers.reduce((sum, p) => sum + (p.sold_price || 0), 0);
  const mostExpensive = [...soldPlayers].sort((a, b) => (b.sold_price || 0) - (a.sold_price || 0))[0];

  // ── Auction controls ──
  const startAuction = async () => {
    const firstPlayer = (players || []).find(p => p.status === "pending");
    if (!firstPlayer) { toast.error("No pending players"); return; }
    await supabase.from("players").update({ status: "active" } as any).eq("id", firstPlayer.id);
    await supabase.from("auction_state").update({
      status: "in_progress",
      current_player_id: firstPlayer.id,
      timer_end: new Date(Date.now() + (auctionState?.timer_duration || 30) * 1000).toISOString(),
    } as any).eq("id", auctionState!.id);
    toast.success("Auction started!");
  };

  const pauseAuction = async () => {
    await supabase.from("auction_state").update({ status: "paused" } as any).eq("id", auctionState!.id);
    toast("Auction paused");
  };

  const nextPlayer = async () => {
    // Mark current as unsold if not sold
    if (auctionState?.current_player_id) {
      const current = players?.find(p => p.id === auctionState.current_player_id);
      if (current && current.status === "active") {
        await supabase.from("players").update({ status: "unsold" } as any).eq("id", current.id);
      }
    }
    const next = (players || []).find(p => p.status === "pending");
    if (!next) { toast("No more players"); return; }
    await supabase.from("players").update({ status: "active" } as any).eq("id", next.id);
    await supabase.from("auction_state").update({
      current_player_id: next.id,
      timer_end: new Date(Date.now() + (auctionState?.timer_duration || 30) * 1000).toISOString(),
    } as any).eq("id", auctionState!.id);
    toast.success(`Now bidding: ${next.name}`);
  };

  const markSold = async () => {
    if (!auctionState?.current_player_id) return;
    const { data: topBid } = await supabase
      .from("bids")
      .select("*")
      .eq("player_id", auctionState.current_player_id)
      .order("amount", { ascending: false })
      .limit(1)
      .single();
    if (!topBid) { toast.error("No bids placed"); return; }
    await supabase.from("players").update({
      status: "sold",
      sold_to_team_id: topBid.team_id,
      sold_price: topBid.amount,
    } as any).eq("id", auctionState.current_player_id);
    // Deduct budget
    const team = teams?.find(t => t.id === topBid.team_id);
    if (team) {
      await supabase.from("teams").update({
        budget_remaining: team.budget_remaining - topBid.amount,
      } as any).eq("id", team.id);
    }
    toast.success("Player SOLD!");
  };

  const markUnsold = async () => {
    if (!auctionState?.current_player_id) return;
    await supabase.from("players").update({ status: "unsold" } as any).eq("id", auctionState.current_player_id);
    toast("Player marked UNSOLD");
  };

  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: "", role: "Batsman", country: "India", base_price: 100 });
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", short_name: "", owner_name: "", logo_emoji: "🏏" });

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "players", label: "Players", icon: <Users className="w-4 h-4" /> },
    { id: "teams", label: "Teams", icon: <Trophy className="w-4 h-4" /> },
    { id: "auction", label: "Auction", icon: <Gavel className="w-4 h-4" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
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

      <div className="flex gap-1 px-6 py-3 border-b border-border/30">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
              <h2 className="font-heading text-2xl font-bold">Player Management ({players?.length || 0})</h2>
              <div className="flex gap-2">
                <Button variant="gold" size="sm" onClick={() => setShowAddPlayer(!showAddPlayer)}>
                  <UserPlus className="w-4 h-4" /> Add Player
                </Button>
              </div>
            </div>

            {showAddPlayer && (
              <div className="glass-card p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <input placeholder="Name" className="h-9 rounded-lg bg-muted border border-border px-3 text-sm" value={newPlayer.name} onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })} />
                <select className="h-9 rounded-lg bg-muted border border-border px-3 text-sm" value={newPlayer.role} onChange={e => setNewPlayer({ ...newPlayer, role: e.target.value })}>
                  <option>Batsman</option><option>Bowler</option><option>All-rounder</option><option>WK</option>
                </select>
                <input placeholder="Country" className="h-9 rounded-lg bg-muted border border-border px-3 text-sm" value={newPlayer.country} onChange={e => setNewPlayer({ ...newPlayer, country: e.target.value })} />
                <div className="flex gap-2">
                  <input type="number" placeholder="Base Price" className="h-9 rounded-lg bg-muted border border-border px-3 text-sm flex-1" value={newPlayer.base_price} onChange={e => setNewPlayer({ ...newPlayer, base_price: Number(e.target.value) })} />
                  <Button size="sm" onClick={() => {
                    if (!newPlayer.name) { toast.error("Name required"); return; }
                    addPlayer.mutate({ name: newPlayer.name, role: newPlayer.role, country: newPlayer.country, base_price: newPlayer.base_price, photo_url: "", stats: {}, badge: null, status: "pending", auction_set: 1, auction_order: 0 } as any);
                    setNewPlayer({ name: "", role: "Batsman", country: "India", base_price: 100 });
                    setShowAddPlayer(false);
                    toast.success("Player added!");
                  }}>Add</Button>
                </div>
              </div>
            )}

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Search players..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loadingPlayers ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : filteredPlayers.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-3">🏏</div>
                <p className="text-muted-foreground">No players yet. Add your first player above!</p>
              </div>
            ) : (
              <div className="grid gap-3">
                {filteredPlayers.map(player => (
                  <div key={player.id} className="flex items-center gap-2">
                    <div className="flex-1"><PlayerCard player={player} /></div>
                    <Button variant="ghost" size="icon" onClick={() => { deletePlayer.mutate(player.id); toast("Player deleted"); }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "teams" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold">Team Management ({teams?.length || 0})</h2>
              <Button variant="gold" size="sm" onClick={() => setShowAddTeam(!showAddTeam)}>
                <UserPlus className="w-4 h-4" /> Add Team
              </Button>
            </div>

            {showAddTeam && (
              <div className="glass-card p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <input placeholder="Team Name" className="h-9 rounded-lg bg-muted border border-border px-3 text-sm" value={newTeam.name} onChange={e => setNewTeam({ ...newTeam, name: e.target.value })} />
                <input placeholder="Short Name (e.g. MI)" className="h-9 rounded-lg bg-muted border border-border px-3 text-sm" value={newTeam.short_name} onChange={e => setNewTeam({ ...newTeam, short_name: e.target.value })} />
                <input placeholder="Owner Name" className="h-9 rounded-lg bg-muted border border-border px-3 text-sm" value={newTeam.owner_name} onChange={e => setNewTeam({ ...newTeam, owner_name: e.target.value })} />
                <div className="flex gap-2">
                  <input placeholder="Emoji" className="h-9 w-16 rounded-lg bg-muted border border-border px-3 text-sm" value={newTeam.logo_emoji} onChange={e => setNewTeam({ ...newTeam, logo_emoji: e.target.value })} />
                  <Button size="sm" onClick={() => {
                    if (!newTeam.name || !newTeam.short_name || !newTeam.owner_name) { toast.error("All fields required"); return; }
                    addTeam.mutate(newTeam);
                    setNewTeam({ name: "", short_name: "", owner_name: "", logo_emoji: "🏏" });
                    setShowAddTeam(false);
                    toast.success("Team added!");
                  }}>Add</Button>
                </div>
              </div>
            )}

            {(teams || []).length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-4xl mb-3">🏆</div>
                <p className="text-muted-foreground">No teams yet. Add your first team above!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teams?.map(team => (
                  <div key={team.id} className="relative group">
                    <TeamCard team={team} />
                    <button onClick={() => { deleteTeam.mutate(team.id); toast("Team deleted"); }} className="absolute top-2 right-2 p-1.5 rounded-lg bg-destructive/20 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "auction" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-heading text-2xl font-bold mb-6">Auction Controls</h2>
            <div className="glass-card p-6 max-w-xl space-y-4">
              <div className="text-sm text-muted-foreground mb-2">
                Status: <strong className="text-foreground">{auctionState?.status || "not_started"}</strong>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="gold" size="lg" onClick={startAuction} disabled={auctionState?.status === "in_progress"}>
                  <Play className="w-5 h-5" /> Start
                </Button>
                <Button variant="glass" size="lg" onClick={pauseAuction} disabled={auctionState?.status !== "in_progress"}>
                  <Pause className="w-5 h-5" /> Pause
                </Button>
              </div>
              <Button variant="electric" size="lg" className="w-full" onClick={nextPlayer}>
                <SkipForward className="w-5 h-5" /> Next Player
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="glass" onClick={markSold}>✅ Mark SOLD</Button>
                <Button variant="glass" onClick={markUnsold}>❌ Mark UNSOLD</Button>
              </div>
            </div>
          </motion.div>
        )}

        {tab === "analytics" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="font-heading text-2xl font-bold mb-6">Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Spent", value: formatPrice(totalSpent), icon: "💰" },
                { label: "Players Sold", value: String(soldPlayers.length), icon: "✅" },
                { label: "Players Unsold", value: String(unsoldPlayers.length), icon: "❌" },
                { label: "Most Expensive", value: mostExpensive?.name || "—", icon: "🌟" },
              ].map((stat, i) => (
                <div key={i} className="glass-card p-5">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <div className="font-heading text-2xl font-bold mt-1">{stat.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
