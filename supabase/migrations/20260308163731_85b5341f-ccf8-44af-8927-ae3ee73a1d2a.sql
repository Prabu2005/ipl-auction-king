
-- Fix: restrict bid insertion to team owners bidding for their own team
DROP POLICY "Authenticated users can place bids" ON public.bids;

CREATE POLICY "Team owners can place bids for their team" ON public.bids
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams
      WHERE teams.id = team_id
        AND teams.owner_user_id = auth.uid()
    )
  );
