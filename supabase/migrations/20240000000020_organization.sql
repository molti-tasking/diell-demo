/**
Basejump is a starter kit for building SaaS products on top of Supabase.
Learn more at https://usebasejump.com
*/
/**
 * -------------------------------------------------------
 * Section - organization
 * -------------------------------------------------------
 */
/**
 * Account roles allow you to provide permission levels to users
 * when they're acting on an account.  By default, we provide
 * "owner" and "member".  The only distinction is that owners can
 * also manage billing and invite/remove account members.
 */
DO $$
    BEGIN
        -- check it account_role already exists on public schema
        IF NOT EXISTS(SELECT 1
                      FROM pg_type t
                               JOIN pg_namespace n ON n.oid = t.typnamespace
                      WHERE t.typname = 'account_role'
                        AND n.nspname = 'public') THEN
            CREATE TYPE public.account_role AS ENUM ('owner', 'member');
        end if;
    end;
$$;

/**
 * organization are the primary grouping for most objects within
 * the system. They have many users, and all billing is connected to
 * an account.
 */
CREATE TABLE IF NOT EXISTS public.organization  
  (
    id                      uuid unique NOT NULL DEFAULT extensions.uuid_generate_v4(),
    
    name                    text, -- Account name
    
    logo_image_path             text,
    logo_image_public_url       text,
    logo_image_description      text,

    updated_at              timestamp with time zone,
    created_at              timestamp with time zone,
    created_by              uuid references auth.users on delete set null,
    updated_by              uuid references auth.users on delete set null,
    private_metadata        jsonb default '{}'::jsonb,
    public_metadata         jsonb default '{}'::jsonb,
    PRIMARY KEY (id)
  );

-- Open up access to organization
GRANT SELECT, INSERT, UPDATE,
DELETE ON TABLE public.organization TO authenticated,
service_role;

/**
 * We want to protect some fields on organization from being updated
 * Specifically the primary owner user id and account id.
 */
CREATE
OR REPLACE FUNCTION public.protect_account_fields () RETURNS TRIGGER AS $$
BEGIN
    IF current_user IN ('authenticated', 'anon') THEN
        -- these are protected fields that users are not allowed to update themselves
        -- platform admins should be VERY careful about updating them as well.
        if NEW.id <> OLD.id 
        THEN
            RAISE EXCEPTION 'You do not have permission to update this field';
        end if;
    end if;

    RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- trigger to protect account fields
CREATE TRIGGER public_protect_account_fields BEFORE
UPDATE ON public.organization FOR EACH ROW
EXECUTE FUNCTION public.protect_account_fields ();
 
alter table public.organization enable row level security;



INSERT INTO storage.buckets ("id", "name", "public", "allowed_mime_types") VALUES
	('organization-images', 'organization-images', true, '{image/*}');



-- protect the timestamps
CREATE TRIGGER public_set_organization_timestamp BEFORE INSERT
OR
UPDATE ON public.organization FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamps ();

-- set the user tracking
CREATE TRIGGER public_set_organization_user_tracking BEFORE INSERT
OR
UPDATE ON public.organization FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_user_tracking ();

/**
 * Account users are the users that are associated with an account.
 * They can be invited to join the account, and can have different roles.
 * The system does not enforce any permissions for roles, other than restricting
 * billing and account membership to only owners
 */
create table if not exists
  public.organization_user (
    -- id of the user in the account
    user_id uuid references auth.users on delete cascade not null,
    -- id of the account the user is in
    organization_id uuid references public.organization on delete cascade not null,
    -- role of the user in the account
    account_role public.account_role not null,
    constraint organization_user_pkey primary key (user_id, organization_id)
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.organization_user TO authenticated,
service_role;

-- enable RLS for organization_user
alter table public.organization_user enable row level security;

create policy "Admin can add users to organizations" on public.organization_user 
as permissive for insert with check (public.get_is_admin());


/**
 * When an account gets created, we want to insert the current user as the first
 * owner
 */
create
or replace function public.add_current_user_to_new_account () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
    if not public.get_is_admin() then -- And only when it is not a platform admin
        insert into public.organization_user (organization_id, user_id, account_role)
        values (NEW.id, auth.uid(), 'owner');
    end if;
    return NEW;
end;
$$;

-- trigger the function whenever a new account is created
CREATE TRIGGER public_add_current_user_to_new_account
AFTER INSERT ON public.organization FOR EACH ROW
EXECUTE FUNCTION public.add_current_user_to_new_account ();
  
/**
 * -------------------------------------------------------
 * Section - Account permission utility functions
 * -------------------------------------------------------
 * These functions are stored on the public schema, and useful for things like
 * generating RLS policies
 */
/**
 * Returns true if the current user has the pass in role on the passed in account
 * If no role is sent, will return true if the user is a member of the account
 * NOTE: This is an inefficient function when used on large query sets. You should reach for the get_organization_with_role and lookup
 * the account ID in those cases.
 */
create
or replace function public.has_role_on_organization (
  organization_id uuid,
  account_role public.account_role default null
) returns boolean language sql security definer
set search_path = public as $$
select exists(
               select 1
               from public.organization_user wu
               where wu.user_id = auth.uid()
                    and wu.organization_id = has_role_on_organization.organization_id
                    and (wu.account_role = has_role_on_organization.account_role
                       or has_role_on_organization.account_role is null)
          ) 
          or public.get_is_admin();
$$;

grant execute on function public.has_role_on_organization (uuid, public.account_role) to authenticated;

/**
 * Returns organization_ids that the current user is a member of. If you pass in a role,
 * it'll only return organization that the user is a member of with that role.
 */
create
or replace function public.get_organizations_with_role (passed_in_role public.account_role default null) returns setof uuid language sql security definer
set
  search_path = public as $$
select organization_id
from public.organization_user wu
where wu.user_id = auth.uid()
  and (
            wu.account_role = passed_in_role
        or passed_in_role is null
    );
$$;

grant execute on function public.get_organizations_with_role (public.account_role) to authenticated;

/**
 * -------------------------
 * Section - RLS Policies ORGANIZATION USER
 * -------------------------
 * This is where we define access to tables in the public schema
 */
create policy "users can view their own organization_users" on public.organization_user for
select
  to authenticated using (user_id = auth.uid());

create policy "users can view their teammates" on public.organization_user for
select
  to authenticated using (
    public.has_role_on_organization (organization_id) = true
  );

create policy "Account users can be deleted by owners" on public.organization_user 
for delete to authenticated using (
    public.has_role_on_organization (organization_id, 'owner') = true
);


/**
 * -------------------------
 * Section - RLS Policies ORGANIZATION
 * -------------------------
 * This is where we define access to tables in the public schema
 */

create policy "Organizations can be created by any user" 
on public.organization 
for insert 
to authenticated 
with check (true);

create policy "organizations are viewable by members" on public.organization for
select
  to authenticated using (public.has_role_on_organization (id) = true or updated_by = auth.uid()); -- public.has_role_on_organization (id) = true

 
create policy "organizations can be edited by owners" on public.organization
for update
  to authenticated using (
    public.has_role_on_organization (id, 'owner') = true
  );

create policy "Only admins can delete an organizations" on public.organization 
for delete to authenticated 
using (public.get_is_admin() = true);



CREATE POLICY "Give owners access to organization images folder" ON storage.objects 
as permissive
for all
to authenticated
USING (
    bucket_id = 'organization-images'
    AND (public.has_role_on_organization((storage.foldername(name))[0]::uuid, 'owner'::account_role) = true)
); 



/**
 * -------------------------------------------------------
 * Section - Public functions
 * -------------------------------------------------------
 * Each of these functions exists in the public name space because they are accessible
 * via the API.  it is the primary way developers can interact with public organizations
 */

/**
 * Returns the current user's role within a given organization_id
 */
create
or replace function public.current_user_account_role (organization_id uuid) returns jsonb language plpgsql as $$
DECLARE
    response jsonb;
BEGIN

    select jsonb_build_object('account_role', wu.account_role)
    into response
    from public.organization_user wu
             join public.organization a on a.id = wu.organization_id
    where wu.user_id = auth.uid()
      and wu.organization_id = current_user_account_role.organization_id;

    -- if the user is not a member of the account, throw an error
    if response ->> 'account_role' IS NULL then
        raise exception 'Not found';
    end if;

    return response;
END
$$;

grant
execute on function public.current_user_account_role (uuid) to authenticated;

/** Let 's you update a users role within an account if you are an owner of that account
  **/
create or replace function public.update_organization_user_role(organization_id uuid, user_id uuid,
                                                           new_account_role public.account_role)
    returns void
    security definer
    set search_path = public
    language plpgsql
as
$$
declare
    is_account_owner         boolean;
begin
    -- check if the user is an owner, and if they are, allow them to update the role
    select public.has_role_on_organization(update_organization_user_role.organization_id, 'owner') into is_account_owner;

    if not is_account_owner then
        raise exception 'You must be an owner of the account to update a users role';
    end if;


    update public.organization_user au
    set account_role = new_account_role
    where au.organization_id = update_organization_user_role.organization_id
      and au.user_id = update_organization_user_role.user_id;

end;
$$;

grant execute on function public.update_organization_user_role(uuid, uuid, public.account_role) to authenticated;

/**  Returns the current users organizations **/

create
or replace function public.get_organizations () returns json language sql as $$
select coalesce(json_agg(
                        json_build_object(
                                'organization_id', wu.organization_id,
                                'account_role', wu.account_role,
                                'name', a.name,
                                'created_at', a.created_at,
                                'updated_at', a.updated_at
                            )
                    ), '[]'::json)
from public.organization_user wu
         join public.organization a on a.id = wu.organization_id
where wu.user_id = auth.uid();
$$;

grant
execute on function public.get_organizations () to authenticated;

/**
Returns a specific account that the current user has access to -> UNUSED
*/
create
or replace function public.get_organization (organization_id uuid) returns json language plpgsql as $$
BEGIN
    -- check if the user is a member of the account or a service_role user
    if current_user IN ('anon', 'authenticated') and
       (select current_user_account_role(get_organization.organization_id) ->> 'account_role' IS NULL) then
        raise exception 'You must be a member of an account to access it';
    end if;


    return (select json_build_object(
                           'organization_id', a.id,
                           'account_role', wu.account_role,
                           'name', a.name,
                           'created_at', a.created_at,
                           'updated_at', a.updated_at,
                           'metadata', a.public_metadata
                       )
            from public.organization a
                     left join public.organization_user wu on a.id = wu.organization_id and wu.user_id = auth.uid()
            where a.id = get_organization.organization_id);
END;
$$;

grant
execute on function public.get_organization (uuid) to authenticated,
service_role;

/**
 * Create an account
 */
create
or replace function public.create_organization(name text default null) returns json language plpgsql as $$
DECLARE
    new_organization_id uuid;
BEGIN
    insert into public.organization (name)
    values (create_organization.name)
    returning id into new_organization_id;

    return public.get_organization(new_organization_id);
EXCEPTION
    WHEN unique_violation THEN
        raise exception 'An account with that unique ID already exists';
END;
$$;

grant
execute on function public.create_organization (name text) to authenticated;

/**
Update an account with passed in info. None of the info is required except for account ID.
If you don't pass in a value for a field, it will not be updated.
If you set replace_meta to true, the metadata will be replaced with the passed in metadata.
If you set replace_meta to false, the metadata will be merged with the passed in metadata.
*/
create
or replace function public.update_organization (
  organization_id uuid,
  name text default null,
  public_metadata jsonb default null,
  replace_metadata boolean default false
) returns json language plpgsql as $$
BEGIN

    -- check if postgres role is service_role
    if current_user IN ('anon', 'authenticated') and
       not (select current_user_account_role(update_organization.organization_id) ->> 'account_role' = 'owner') then
        raise exception 'Only account owners can update an account';
    end if;

    update public.organization organization
    set name            = coalesce(update_organization.name, organization.name),
        public_metadata = case
                              when update_organization.public_metadata is null then organization.public_metadata -- do nothing
                              when organization.public_metadata IS NULL then update_organization.public_metadata -- set metadata
                              when update_organization.replace_metadata
                                  then update_organization.public_metadata -- replace metadata
                              else organization.public_metadata || update_organization.public_metadata end -- merge metadata
    where organization.id = update_organization.organization_id;

    return public.get_organization(organization_id);
END;
$$;

grant
execute on function public.update_organization (uuid, text, jsonb, boolean) to authenticated,
service_role;

/**
Returns a list of current account members. Only account owners can access this function.
It's a security definer because it requries us to lookup personal_organizations for existing members so we can
get their names.
*/
create
or replace function public.get_organization_members (
  organization_id uuid,
  results_limit integer default 50,
  results_offset integer default 0
) returns json language plpgsql security definer
set
  search_path = public as $$
BEGIN

    -- only account owners can access this function
    if (select public.current_user_account_role(get_organization_members.organization_id) ->> 'account_role' <> 'owner') then
        raise exception 'Only account owners can access this function';
    end if;

    return (select json_agg(
                           json_build_object(
                                   'user_id', wu.user_id,
                                   'account_role', wu.account_role,
                                   'name', a.name,
                                   'email', u.email)
                       )
            from public.organization_user wu
                     join public.organization a on a.id = wu.organization_id
                     join auth.users u on u.id = wu.user_id
            where wu.organization_id = get_organization_members.organization_id
            limit coalesce(get_organization_members.results_limit, 50) offset coalesce(get_organization_members.results_offset, 0));
END;
$$;

grant
execute on function public.get_organization_members (uuid, integer, integer) to authenticated;

/**
Allows an owner of the account to remove any member other than the primary owner
*/
create
or replace function public.remove_organization_member (organization_id uuid, user_id uuid) returns void language plpgsql as $$
BEGIN
    -- only account owners can access this function
    if public.has_role_on_organization(remove_organization_member.organization_id, 'owner') <> true then
        raise exception 'Only account owners can access this function';
    end if;

    delete
    from public.organization_user wu
    where wu.organization_id = remove_organization_member.organization_id
      and wu.user_id = remove_organization_member.user_id;
END;
$$;

grant
execute on function public.remove_organization_member (uuid, uuid) to authenticated;
