-- Helper function to assign admin role to a user by email
-- This should be run AFTER the user has signed up through the auth system

-- To use this, first sign up with email: boutros.georges513@gmail.com
-- Then run this to assign admin role:
-- SELECT assign_admin_role('boutros.georges513@gmail.com');

CREATE OR REPLACE FUNCTION public.assign_admin_role(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from auth.users by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;

  IF target_user_id IS NULL THEN
    RETURN 'User not found. Please sign up first.';
  END IF;

  -- Insert admin role if it doesn't exist
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Create profile if it doesn't exist
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (target_user_id, 'Admin User')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN 'Admin role assigned successfully to ' || user_email;
END;
$$;