
-- Teams already have password_hash column, no migration needed for that.
-- Add a policy so team owners can update their own team's budget (for bid deduction)
CREATE POLICY "Team owners can update own team" ON public.teams
  FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid());
