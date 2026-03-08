import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trophy, Users, Eye, Shield, Gavel, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/3 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center">
            <Gavel className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-gold-gradient">IPL AUCTION</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="glass" size="sm" onClick={() => navigate("/auction")}>
            <Eye className="w-4 h-4" /> Watch Live
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Season 2026 — Live Now</span>
          </div>

          <h2 className="font-heading text-5xl md:text-7xl font-bold leading-tight mb-6">
            <span className="text-foreground">THE ULTIMATE</span>
            <br />
            <span className="text-gold-gradient">IPL AUCTION</span>
            <br />
            <span className="text-electric-gradient">EXPERIENCE</span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Build your dream squad. Bid in real-time. Compete with friends.
            The most immersive cricket auction simulation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="gold" size="xl" onClick={() => navigate("/admin")}>
              <Shield className="w-5 h-5" /> Admin Panel
            </Button>
            <Button variant="electric" size="xl" onClick={() => navigate("/team")}>
              <Users className="w-5 h-5" /> Team Login
            </Button>
            <Button variant="glass" size="xl" onClick={() => navigate("/auction")}>
              <Eye className="w-5 h-5" /> Spectate
            </Button>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-4xl w-full"
        >
          {[
            { icon: Gavel, title: "Real-Time Bidding", desc: "Place bids live with countdown timers and instant updates across all connected clients." },
            { icon: Trophy, title: "Smart Analytics", desc: "Player scores, team strength analysis, value picks, and detailed comparison tools." },
            { icon: Users, title: "Multi-Role System", desc: "Admin controls, team owner dashboards, and spectator views — each with a tailored experience." },
          ].map((feature, i) => (
            <div key={i} className="glass-card p-6 hover:glass-card-glow transition-all duration-300 group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-gold transition-all">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-border/30">
        <p className="text-sm text-muted-foreground">
          🏏 IPL Auction Simulator — Built for cricket fans
        </p>
      </footer>
    </div>
  );
};

export default Index;
