/**
 * -------------------------------------------------------
 * Section - Invitations
 * -------------------------------------------------------
 */
/**
 * Invitations are sent to users to join a account
 * They pre-define the role the user should have once they join
 */
create table if not exists
  public.invitations (
    -- the id of the invitation
    id uuid unique not null default extensions.uuid_generate_v4 (),
    -- what role should invitation accepters be given in this account
    account_role public.account_role not null,
    -- the account the invitation is for
    organization_id uuid references public.organization (id) on delete cascade not null,
    -- unique token used to accept the invitation
    token text unique not null default public.generate_token (30),
    -- who created the invitation
    invited_by_user_id uuid references auth.users not null,
    -- account name. filled in by a trigger
    account_name text,
    -- when the invitation was last updated
    updated_at timestamp with time zone,
    -- when the invitation was created
    created_at timestamp with time zone,
    -- what type of invitation is this
    invitation_type public.invitation_type not null,
    primary key (id)
  );

-- Open up access to invitations
GRANT SELECT, INSERT, UPDATE,
DELETE ON TABLE public.invitations TO authenticated,
service_role;

-- manage timestamps
CREATE TRIGGER public_set_invitations_timestamp BEFORE INSERT
OR
UPDATE ON public.invitations FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamps ();

/**
 * This funciton fills in account info and inviting user email
 * so that the recipient can get more info about the invitation prior to
 * accepting.  It allows us to avoid complex permissions on organizations
 */
CREATE
OR REPLACE FUNCTION public.trigger_set_invitation_details () RETURNS TRIGGER AS $$
BEGIN
    NEW.invited_by_user_id = auth.uid();
    NEW.account_name = (select name from public.organization where id = NEW.organization_id);
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER public_trigger_set_invitation_details BEFORE INSERT ON public.invitations FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_invitation_details ();

-- enable RLS on invitations
alter table public.invitations enable row level security;

/**
 * -------------------------
 * Section - RLS Policies
 * -------------------------
 * This is where we define access to tables in the public schema
 */
create policy "Invitations viewable by account owners" on public.invitations for
select
  to authenticated using (
    created_at > (now() - interval '24 hours')
    and public.has_role_on_organization (organization_id, 'owner') = true
  );

create policy "Invitations can be created by account owners" on public.invitations for insert to authenticated
with
  check (
    -- team organizations should be enabled
    -- public.is_set('enable_team_accounts') = true
    -- -- this should not be a personal account
    -- and (SELECT personal_account
    --      FROM public.organization
    --      WHERE id = organization_id) = false
    -- or user_profile for organization_id is admin
    -- the inserting user should be an owner of the account
    -- and
    public.has_role_on_organization (organization_id, 'owner') = true
  );

create policy "Invitations can be deleted by account owners" on public.invitations for delete to authenticated using (
  public.has_role_on_organization (organization_id, 'owner') = true
);

/**
 * -------------------------------------------------------
 * Section - Public functions
 * -------------------------------------------------------
 * Each of these functions exists in the public name space because they are accessible
 * via the API.  it is the primary way developers can interact with public organizations
 */
/**
Returns a list of currently active invitations for a given account
*/
create
or replace function public.get_organization_invitations (
  organization_id uuid,
  results_limit integer default 25,
  results_offset integer default 0
) returns json language plpgsql as $$
BEGIN
    -- only account owners can access this function
    -- Adapt role_for_organization check instead :)
    -- if (select public.current_user_account_role(get_organization_invitations.organization_id) ->> 'account_role' <> 'owner') then
    if (not has_role_on_organization(get_organization_invitations.organization_id, 'owner'::account_role)) then
        raise exception 'Only account owners can access this function';
    end if;

    return (select json_agg(
                           json_build_object(
                                   'account_role', i.account_role,
                                   'created_at', i.created_at,
                                   'invitation_type', i.invitation_type,
                                   'invitation_id', i.id
                               )
                       )
            from public.invitations i
            where i.organization_id = get_organization_invitations.organization_id
              and i.created_at > now() - interval '24 hours'
            limit coalesce(get_organization_invitations.results_limit, 25) offset coalesce(get_organization_invitations.results_offset, 0));
END;
$$;

grant
execute on function public.get_organization_invitations (uuid, integer, integer) to authenticated;

/**
 * Allows a user to accept an existing invitation and join a account
 * This one exists in the public schema because we want it to be called
 * using the supabase rpc method
 */
create
or replace function public.accept_invitation (lookup_invitation_token text) returns jsonb language plpgsql security definer
set
  search_path = public,
  public as $$
declare
    lookup_organization_id       uuid;
    declare new_member_role public.account_role;
begin
    select i.organization_id, i.account_role
    into lookup_organization_id, new_member_role
    from public.invitations i
             join public.organization a on a.id = i.organization_id
    where i.token = lookup_invitation_token
      and i.created_at > now() - interval '24 hours';

    if lookup_organization_id IS NULL then
        raise exception 'Invitation not found';
    end if;

    if lookup_organization_id is not null then
        -- we've validated the token is real, so grant the user access
        insert into public.organization_user (organization_id, user_id, account_role)
        values (lookup_organization_id, auth.uid(), new_member_role);
        -- email types of invitations are only good for one usage
        delete from public.invitations where token = lookup_invitation_token and invitation_type = 'one_time';
    end if;
    return json_build_object('organization_id', lookup_organization_id, 'account_role', new_member_role);
EXCEPTION
    WHEN unique_violation THEN
        raise exception 'You are already a member of this account';
end;
$$;

grant
execute on function public.accept_invitation (text) to authenticated;

/**
 * Allows a user to lookup an existing invitation and join a account
 * This one exists in the public schema because we want it to be called
 * using the supabase rpc method
 */
create
or replace function public.lookup_invitation (lookup_invitation_token text) returns json language plpgsql security definer
set
  search_path = public,
  public as $$
declare
    name              text;
    invitation_active boolean;
begin
    select account_name,
           case when id IS NOT NULL then true else false end as active
    into name, invitation_active
    from public.invitations
    where token = lookup_invitation_token
      and created_at > now() - interval '24 hours'
    limit 1;
    return json_build_object('active', coalesce(invitation_active, false), 'account_name', name);
end;
$$;

grant
execute on function public.lookup_invitation (text) to authenticated;

/**
Allows a user to create a new invitation if they are an owner of an account
*/
create
or replace function public.create_invitation (
  organization_id uuid,
  account_role public.account_role,
  invitation_type public.invitation_type
) returns json language plpgsql as $$
declare
    new_invitation public.invitations;
begin
    insert into public.invitations (organization_id, account_role, invitation_type, invited_by_user_id)
    values (organization_id, account_role, invitation_type, auth.uid())
    returning * into new_invitation;

    return json_build_object('token', new_invitation.token);
end
$$;

grant
execute on function public.create_invitation (
  uuid,
  public.account_role,
  public.invitation_type
) to authenticated;

/**
Allows an owner to delete an existing invitation
*/
create
or replace function public.delete_invitation (invitation_id uuid) returns void language plpgsql as $$
begin
    -- verify account owner for the invitation
    if public.has_role_on_organization(
               (select organization_id from public.invitations where id = delete_invitation.invitation_id), 'owner') <>
       true then
        raise exception 'Only account owners can delete invitations';
    end if;

    delete from public.invitations where id = delete_invitation.invitation_id;
end
$$;

grant
execute on function public.delete_invitation (uuid) to authenticated;
