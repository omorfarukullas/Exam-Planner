-- 1. Create friendships table
CREATE TABLE public.friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, friend_id)
);

-- RLS for friendships
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view friendships involving them"
ON public.friendships FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can insert friendships for themselves"
ON public.friendships FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can accept friend requests sent to them"
ON public.friendships FOR UPDATE
USING (auth.uid() = friend_id);

CREATE POLICY "Users can delete their own friendships or incoming requests"
ON public.friendships FOR DELETE
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- 2. Create study_sessions table
CREATE TABLE public.study_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  minutes_logged INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, subject_id, date)
);

-- RLS for study_sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own study sessions"
ON public.study_sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Update profiles RLS to allow authenticated users to view all profiles (for searching)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 4. Shared Courses: Update subjects RLS
-- Let users view subjects belonging to friends if they have a subject with the same name
CREATE POLICY "Users can view friends subjects with matching names"
ON public.subjects FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.friendships f
    WHERE f.status = 'accepted'
    AND (
      (f.user_id = auth.uid() AND f.friend_id = subjects.user_id) OR
      (f.friend_id = auth.uid() AND f.user_id = subjects.user_id)
    )
  )
  AND EXISTS (
    SELECT 1 FROM public.subjects my_subs
    WHERE my_subs.user_id = auth.uid()
    AND lower(my_subs.name) = lower(subjects.name)
  )
);

-- 5. Secure RPC function for searching users by email or name
CREATE OR REPLACE FUNCTION public.search_users(search_query text)
RETURNS TABLE (id uuid, full_name text, avatar_url text)
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with creator privileges (can read auth.users)
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.full_name, p.avatar_url
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  WHERE 
    p.id != auth.uid() -- Don't return the searcher
    AND (
      p.full_name ILIKE '%' || search_query || '%'
      OR u.email ILIKE '%' || search_query || '%'
    )
  LIMIT 20;
END;
$$;
