
BEGIN;
CREATE EXTENSION IF NOT EXISTS "basejump-supabase_test_helpers";

select plan(1);

----------
-- ARRANGE
----------

CREATE OR REPLACE FUNCTION get_organization_id() RETURNS uuid LANGUAGE SQL as
$$ 
    SELECT id FROM public.organization WHERE name = 'Org' LIMIT 1;
$$;

grant execute on function get_organization_id() to authenticated, service_role;

select tests.create_supabase_user('test_owner');

--- start acting as an authenticated user
select tests.authenticate_as('test_owner');

-- -- create an organization
select create_organization('Org');
-- create a product

INSERT INTO public.product (id, title, slug, organization_id) VALUES
	('00000000-0000-0000-0000-00000a9fb46f', 'First product', 'product-slug', (SELECT get_organization_id())),
	('00000000-0000-0000-0000-00000a12346f', 'Second product', 'product-slug-2', (SELECT get_organization_id()));

----------
-- ACT & ASSERT
----------

SELECT is(
               (select count(*)::int from public.product),
               2,
               'Should have 2 products by now'
           );

 
select tests.clear_authentication();
 

ROLLBACK;