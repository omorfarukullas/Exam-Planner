-- Create study_plans table
CREATE TABLE public.study_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_date DATE NOT NULL,
  topic TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL DEFAULT 30,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies - users can only access plans for their own subjects
CREATE POLICY "Users can view own study plans"
ON public.study_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study plans"
ON public.study_plans FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study plans"
ON public.study_plans FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own study plans"
ON public.study_plans FOR DELETE
USING (auth.uid() = user_id);

-- Index for fast subject plan lookups
CREATE INDEX idx_study_plans_subject_id ON public.study_plans(subject_id);
CREATE INDEX idx_study_plans_user_day ON public.study_plans(user_id, day_date);

-- Add daily_hours column to subjects table
ALTER TABLE public.subjects
  ADD COLUMN IF NOT EXISTS daily_hours NUMERIC(3,1) DEFAULT 2.0;
