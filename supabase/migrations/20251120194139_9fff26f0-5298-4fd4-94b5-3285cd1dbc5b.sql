-- Drop the problematic RLS policy that blocks all quote insertions
DROP POLICY IF EXISTS "Users can insert quotes" ON quotes;

-- Create new policy that allows anyone (authenticated or not) to insert quotes
CREATE POLICY "Anyone can insert quotes"
  ON quotes
  FOR INSERT
  TO public
  WITH CHECK (true);