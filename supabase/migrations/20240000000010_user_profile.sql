/**
 * -------------------------------------------------------
 * Section - User profiles and admin users
 * Create a user profile whenever an account is created
 * Based on: https://www.reddit.com/r/Supabase/comments/qru9uh/having_an_admin_user/
 * -------------------------------------------------------
 */



CREATE TABLE IF NOT EXISTS public.user_profiles (
    id            uuid PRIMARY KEY,
    email         text,


    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE SET NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_profiles TO authenticated, service_role;

alter table public.user_profiles enable row level security;

create policy "Profiles are only visible by the user who owns it" on public.user_profiles 
for select using (auth.uid () = id);


drop function if exists handle_new_user ();

create function handle_new_user () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin

  insert into public.user_profiles (id, email)
  values (new.id, new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure handle_new_user();

-- Create another table to handle admin state of user profiles


create table public.admin_users (
    user_profile_id          uuid references public.user_profiles(id) on delete cascade,
    admin                boolean default false not null,
    constraint admin_users_pkey primary key (user_profile_id)
);
alter table public.admin_users enable row level security;

create or replace function public.get_is_admin () 
returns boolean 
language sql 
security definer 
set search_path = public 
as $$
    select coalesce(
        (select admin_users.admin 
         from public.admin_users 
         where admin_users.user_profile_id = auth.uid()), 
        false
    )
$$;

-- RLS policy for the admin_users table
create policy "Admin can change admin state of a user" on public.admin_users 
as permissive for all to authenticated 
using (public.get_is_admin());

create policy "Admin can view user profile data" on public.user_profiles 
as permissive for select using (public.get_is_admin());

/**
Returns the personal account for the current user
*/
create
or replace function public.get_profile () returns public.user_profiles language plpgsql as $$
DECLARE
    result public.user_profiles;
BEGIN
  SELECT INTO result *
  FROM public.user_profiles
  WHERE id = auth.uid()
  LIMIT 1; -- Ensures only one row is returned

  RETURN result;
END;
$$;

grant execute on function public.get_profile () to authenticated;
