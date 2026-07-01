-- Add concept_summary to study_plans
ALTER TABLE public.study_plans
ADD COLUMN IF NOT EXISTS concept_summary TEXT;
