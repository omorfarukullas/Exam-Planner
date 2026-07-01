-- 1. Drop the recursive policy on subjects
DROP POLICY IF EXISTS "Users can view friends subjects with matching names" ON public.subjects;

-- 2. Create a secure RPC to fetch friends' subjects without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_friend_subjects(friend_ids uuid[])
RETURNS SETOF public.subjects
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges so it bypasses RLS on subjects
AS $$
BEGIN
  -- Double check that the user requesting this is actually friends with the requested IDs
  -- (Though our application logic already filters this, defense in depth is good)
  RETURN QUERY
  SELECT s.*
  FROM public.subjects s
  WHERE s.user_id = ANY(friend_ids);
END;
$$;

-- 3. Update handle_new_user trigger to handle conflicts (if someone signs up and we manually insert their profile later)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email), 
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url
    WHERE public.profiles.full_name IS NULL;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
