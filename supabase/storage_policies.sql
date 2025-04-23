-- Function to get policies for a storage bucket
CREATE OR REPLACE FUNCTION public.get_policies_for_object(bucket_name text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  SELECT json_agg(json_build_object(
    'policy_name', polname,
    'cmd', 
    CASE polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      ELSE polcmd::text
    END,
    'roles', polroles,
    'using_qual', pg_get_expr(polqual, polrelid),
    'with_check_qual', pg_get_expr(polwithcheck, polrelid)
  ))
  INTO result
  FROM pg_policy
  WHERE polrelid = 'storage.objects'::regclass
  AND pg_get_expr(polqual, polrelid) LIKE '%' || bucket_name || '%'
  OR pg_get_expr(polwithcheck, polrelid) LIKE '%' || bucket_name || '%';

  RETURN result;
END;
$$;
