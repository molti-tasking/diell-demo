CREATE TABLE public.organization_verified (
    organization_id     uuid REFERENCES public.organization(id) on delete cascade,
    verified            boolean NOT NULL DEFAULT false,
    CONSTRAINT organization_verified_pkey PRIMARY KEY (organization_id)
);
ALTER TABLE public.organization_verified ENABLE ROW LEVEL SECURITY;

-- RLS policy for the organization_verified table
create policy "Admin can change verification of an organization" on public.organization_verified 
as permissive for all to authenticated
using (public.get_is_admin());

create policy "Enable read access for all users" on public.organization_verified 
as PERMISSIVE for SELECT to public using (true);




/**
 * Returns true if the organization is verified
 */
create
or replace function public.is_verified_organization (
  organization_id uuid
) returns boolean language sql security definer
set search_path = public as $$
select exists(
               select 1
               from public.organization_verified ov
               where ov.organization_id = is_verified_organization.organization_id
                    and (ov.verified = true)
          ) 
          or public.get_is_admin();
$$;

grant execute on function public.is_verified_organization (uuid) to authenticated;
