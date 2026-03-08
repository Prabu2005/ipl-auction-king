
-- Allow newly signed up users to insert their own role (for first admin setup)
CREATE POLICY "Users can insert own role" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
