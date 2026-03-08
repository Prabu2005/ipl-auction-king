import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// ── Types ──
export type DbTeam = {
  id: string;
  name: string;
  short_name: string;
  logo_url: string;
  logo_emoji: string;
  color: string;
  budget_total: number;
  budget_remaining: number;
  owner_name: string;
  owner_user_id: string | null;
  rtm_count: number;
  max_squad_size: number;
  max_overseas: number;
  password_hash: string | null;
};

export type DbPlayer = {
  id: string;
  name: string;
  photo_url: string;
  role: string;
  country: string;
  base_price: number;
  stats: Record<string, number>;
  badge: string | null;
  status: string;
  sold_to_team_id: string | null;
  sold_price: number | null;
  auction_set: number;
  auction_order: number;
};

export type DbBid = {
  id: string;
  player_id: string;
  team_id: string;
  amount: number;
  created_at: string;
};

export type DbAuctionState = {
  id: string;
  status: string;
  current_player_id: string | null;
  timer_duration: number;
  timer_end: string | null;
  bid_increment: number;
};

// ── Queries ──
export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*").order("name");
      if (error) throw error;
      return data as DbTeam[];
    },
  });
}

export function usePlayers() {
  return useQuery({
    queryKey: ["players"],
    queryFn: async () => {
      const { data, error } = await supabase.from("players").select("*").order("auction_order");
      if (error) throw error;
      return data as DbPlayer[];
    },
  });
}

export function useAuctionState() {
  return useQuery({
    queryKey: ["auction_state"],
    queryFn: async () => {
      const { data, error } = await supabase.from("auction_state").select("*").limit(1).single();
      if (error) throw error;
      return data as DbAuctionState;
    },
  });
}

export function useBidsForPlayer(playerId: string | null) {
  return useQuery({
    queryKey: ["bids", playerId],
    enabled: !!playerId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bids")
        .select("*")
        .eq("player_id", playerId!)
        .order("amount", { ascending: false });
      if (error) throw error;
      return data as DbBid[];
    },
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });
}

// ── Real-time subscriptions ──
export function useRealtimeSubscriptions() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("auction-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bids" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["bids"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "auction_state" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["auction_state"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "teams" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["teams"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["players"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "announcements" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["announcements"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

// ── Mutations ──
export function useAddPlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (player: Omit<DbPlayer, "id" | "sold_to_team_id" | "sold_price">) => {
      const { error } = await supabase.from("players").insert(player as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useAddTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (team: { name: string; short_name: string; owner_name: string; logo_emoji?: string; color?: string; budget_total?: number }) => {
      const { error } = await supabase.from("teams").insert({
        ...team,
        budget_remaining: team.budget_total || 9000,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function useDeletePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("players").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["players"] }),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["teams"] }),
  });
}

export function usePlaceBid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bid: { player_id: string; team_id: string; amount: number }) => {
      const { error } = await supabase.from("bids").insert(bid);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bids"] }),
  });
}

export const formatPrice = (lakhs: number): string => {
  if (lakhs >= 100) return `₹${(lakhs / 100).toFixed(1)} Cr`;
  return `₹${lakhs}L`;
};
