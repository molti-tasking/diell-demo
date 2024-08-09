create table IF NOT EXISTS public.product (
    id                          uuid unique NOT NULL DEFAULT extensions.uuid_generate_v4 (),
    created_at                  timestamp with time zone not null default now(),
    
    title                       text,
    slug                        text unique,
    organization_id             uuid references public.organization(id) on delete cascade,  

    constraint product_pkey primary key (id)
  );


-- Open up access to product
GRANT
SELECT, INSERT, UPDATE,
DELETE ON TABLE public.product TO authenticated,
service_role;

alter table public.product enable row level security;

create policy "Enable read access for all users" on public.product 
as permissive for select to public 
using (
  public.is_verified_organization(organization_id) 
  or has_role_on_organization(organization_id, 'owner'::account_role) = true
);

create policy "Enable create for all owners of organization" on public.product 
for insert to authenticated 
with check (
  has_role_on_organization(organization_id, 'owner'::account_role) = true
);

create policy "Enable update for all owners of organization" on public.product 
for update to authenticated 
using (
  has_role_on_organization(organization_id, 'owner'::account_role) = true
);

create policy "Only admins can delete a product" on public.product 
for delete to authenticated 
using  (
  has_role_on_organization(organization_id, 'owner'::account_role) = true
);

 


-- convert any character in the slug that's not a letter, number, or dash to a dash on insert/update for organizations
CREATE
OR REPLACE FUNCTION public.slugify_product_slug () RETURNS TRIGGER AS $$
BEGIN
    if NEW.slug is not null then
        NEW.slug = lower(regexp_replace(NEW.slug, '[^a-zA-Z0-9-]+', '-', 'g'));
    end if;
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- trigger to slugify the product slug
CREATE TRIGGER public_slugify_product_slug BEFORE INSERT
OR
UPDATE ON public.product FOR EACH ROW
EXECUTE FUNCTION public.slugify_product_slug ();

/**
 * Returns true if the current user has access to the organization of the product.
 */
create
or replace function public.has_role_for_product (
  product_id uuid,
  account_role public.account_role default null
) returns boolean language sql security definer
set
  search_path = public as $$
select exists(
              select 1
              from public.organization_user wu
              left join public.product li on li.organization_id = wu.organization_id
              where li.id = product_id 
              and public.has_role_on_organization(wu.organization_id, has_role_for_product.account_role)
           ) or public.get_is_admin();
$$;

grant execute on function public.has_role_for_product (uuid, public.account_role) to authenticated;


 