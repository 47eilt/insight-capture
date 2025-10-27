-- ================================================
-- INSIGHT CAPTURE - SUPABASE SCHEMA
-- ================================================
-- Run this in Supabase SQL Editor
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- ================================================

-- 1. Create insights table
CREATE TABLE IF NOT EXISTS public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  creator_email TEXT,
  text TEXT,
  note TEXT,
  url TEXT,
  page_url TEXT,
  page_title TEXT,
  screenshots JSONB,
  screenshot_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS insights_user_id_idx ON public.insights(user_id);

-- 3. Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS insights_created_at_idx ON public.insights(created_at DESC);

-- 4. Enable Row Level Security
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own insights" ON public.insights;
DROP POLICY IF EXISTS "Users can insert their own insights" ON public.insights;
DROP POLICY IF EXISTS "Users can update their own insights" ON public.insights;
DROP POLICY IF EXISTS "Users can delete their own insights" ON public.insights;

-- 6. Create RLS Policies
-- Policy: Users can only view their own insights
CREATE POLICY "Users can view their own insights"
  ON public.insights
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own insights
CREATE POLICY "Users can insert their own insights"
  ON public.insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own insights
CREATE POLICY "Users can update their own insights"
  ON public.insights
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own insights
CREATE POLICY "Users can delete their own insights"
  ON public.insights
  FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger for updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.insights;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.insights
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ================================================
-- VERIFICATION QUERIES (optional - run after setup)
-- ================================================

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'insights'
);

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'insights';

-- ================================================
-- DONE! Your database is now ready.
-- ================================================
