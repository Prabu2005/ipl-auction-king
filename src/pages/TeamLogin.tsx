import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthContext";
import { useTeams } from "@/hooks/useAuction";
import { toast } from "sonner";
import { Users, ArrowLeft, Loader2, LogIn } from "lucide-react";

export default function TeamLogin() {
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setTeamId } = useAuth();
  const { data: teams, isLoading } = useTeams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) { toast.error("Select a team"); return; }
    if (!pin) { toast.error("Enter team PIN"); return; }
    setLoading(true);

    try {
      const team = teams?.find(t => t.id === selectedTeamId);
      if (!team) throw new Error("Team not found");

      // For now, simple PIN check against password_hash (plaintext for demo)
      // In production, use bcrypt via edge function
      if (team.password_hash && team.password_hash !== pin) {
        throw new Error("Incorrect PIN");
      }

      // If no password set yet, accept any PIN (first-time setup)
      if (!team.password_hash) {
        toast.info("PIN not set for this team. Access granted for setup.");
      }

      setTeamId(selectedTeamId);
      toast.success(`Welcome, ${team.name}!`);
      navigate("/team");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-glow p-8 w-full max-w-md relative z-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 rounded-lg electric-gradient flex items-center justify-center">
            <Users className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold">Team Login</h1>
            <p className="text-sm text-muted-foreground">Enter your team credentials</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Select Team</label>
            {isLoading ? (
              <div className="h-11 rounded-lg bg-muted flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : (teams || []).length === 0 ? (
              <div className="h-11 rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
                No teams created yet
              </div>
            ) : (
              <select
                className="w-full h-11 rounded-lg bg-muted border border-border px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={selectedTeamId}
                onChange={e => setSelectedTeamId(e.target.value)}
              >
                <option value="">Choose your team...</option>
                {teams?.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.logo_emoji} {team.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Team PIN</label>
            <input
              type="password"
              className="w-full h-11 rounded-lg bg-muted border border-border px-4 text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="••••"
              value={pin}
              onChange={e => setPin(e.target.value)}
              maxLength={6}
            />
          </div>

          <Button variant="electric" size="lg" className="w-full" type="submit" disabled={loading || !selectedTeamId}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-5 h-5" /> Enter Auction Room</>}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Get your team PIN from the auction admin
        </p>
      </motion.div>
    </div>
  );
}
