
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'team_owner', 'spectator');

-- User roles table (never store roles on profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  logo_url TEXT DEFAULT '',
  logo_emoji TEXT DEFAULT '🏏',
  color TEXT DEFAULT '#004BA0',
  budget_total NUMERIC NOT NULL DEFAULT 9000,
  budget_remaining NUMERIC NOT NULL DEFAULT 9000,
  owner_name TEXT NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  password_hash TEXT,
  rtm_count INTEGER NOT NULL DEFAULT 2,
  max_squad_size INTEGER NOT NULL DEFAULT 25,
  max_overseas INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Players table
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  photo_url TEXT DEFAULT '',
  role TEXT NOT NULL CHECK (role IN ('Batsman', 'Bowler', 'All-rounder', 'WK')),
  country TEXT NOT NULL DEFAULT 'India',
  base_price NUMERIC NOT NULL DEFAULT 100,
  stats JSONB NOT NULL DEFAULT '{}',
  badge TEXT CHECK (badge IN ('Star Player', 'Uncapped', 'Overseas', NULL)),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'sold', 'unsold')),
  sold_to_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  sold_price NUMERIC,
  auction_set INTEGER DEFAULT 1,
  auction_order INTEGER DEFAULT 0,
  ipl_team_history TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

-- Bids table
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Auction state (singleton)
CREATE TABLE public.auction_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'paused', 'completed')),
  current_player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  timer_duration INTEGER NOT NULL DEFAULT 30,
  timer_end TIMESTAMPTZ,
  bid_increment NUMERIC NOT NULL DEFAULT 25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.auction_state ENABLE ROW LEVEL SECURITY;

-- Announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- user_roles: only admins can manage, users can read their own
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- teams: everyone can read, admins can manage, owners can read their own
CREATE POLICY "Anyone can view teams" ON public.teams
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage teams" ON public.teams
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- players: everyone can read, admins can manage
CREATE POLICY "Anyone can view players" ON public.players
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage players" ON public.players
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- bids: everyone can read, authenticated can insert (budget validation in app)
CREATE POLICY "Anyone can view bids" ON public.bids
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can place bids" ON public.bids
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage bids" ON public.bids
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- auction_state: everyone can read, admins can manage
CREATE POLICY "Anyone can view auction state" ON public.auction_state
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage auction state" ON public.auction_state
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- announcements: everyone can read, admins can manage
CREATE POLICY "Anyone can view announcements" ON public.announcements
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;

-- Insert initial auction state
INSERT INTO public.auction_state (status, timer_duration, bid_increment)
VALUES ('not_started', 30, 25);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auction_state_updated_at BEFORE UPDATE ON public.auction_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
