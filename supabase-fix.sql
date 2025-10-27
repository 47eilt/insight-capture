-- ================================================
-- INSIGHT CAPTURE - FIX EXISTING TABLE
-- ================================================

-- 1. Drop existing table completely (clean start)
DROP TABLE IF EXISTS public.insights CASCADE;

-- 2. Create insights table with ALL fields
CREATE TABLE public.insights (
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

-- 3. Create indexes
CREATE INDEX insights_user_id_idx ON public.insights(user_id);
CREATE INDEX insights_created_at_idx ON public.insights(created_at DESC);

-- 4. Enable Row Level Security
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
CREATE POLICY "Users can view their own insights"
  ON public.insights
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own insights"
  ON public.insights
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON public.insights
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insights"
  ON public.insights
  FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.insights
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Done!
