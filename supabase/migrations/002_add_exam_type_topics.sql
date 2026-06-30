-- Add exam_type and topics columns to subjects table
ALTER TABLE public.subjects 
  ADD COLUMN IF NOT EXISTS exam_type TEXT DEFAULT 'final' CHECK (exam_type IN ('midterm', 'final', 'quiz', 'assignment', 'other')),
  ADD COLUMN IF NOT EXISTS topics JSONB DEFAULT '[]'::jsonb;
