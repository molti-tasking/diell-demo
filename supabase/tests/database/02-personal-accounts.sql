BEGIN;
CREATE EXTENSION IF NOT EXISTS "basejump-supabase_test_helpers";

select plan(6);

--- we insert a user into auth.users and return the id into user_id to use 

SELECT tests.create_supabase_user('test1', 'test1@test.com');
SELECT tests.create_supabase_user('test2');

SET session_replication_role = replica;

-- Insert into organization table using values selected from the CTE
INSERT INTO public.organization (
    "id", "name", "updated_at", "created_at", "created_by", "updated_by", "private_metadata", "public_metadata"
) SELECT
    '15e5e06b-f2fb-40a6-9496-73a79c127027', 'my-team-2',
    '2024-04-18 17:39:11.847727+00', '2024-04-18 17:39:11.847727+00',
    tests.get_supabase_uid('test1'), tests.get_supabase_uid('test1'), '{}'::json, '{}'::json;

-- Insert into organization_user table using values selected from the CTE
INSERT INTO public.organization_user ("user_id", "organization_id", "account_role")
SELECT tests.get_supabase_uid('test1'), '15e5e06b-f2fb-40a6-9496-73a79c127027', 'owner';

RESET ALL;

------------
--- Primary Owner
------------
select tests.authenticate_as('test1');

-- should add that user to the account as an owner
SELECT row_eq(
               $$ select user_id, organization_id, account_role from public.organization_user $$,
               ROW (tests.get_supabase_uid('test1'), '15e5e06b-f2fb-40a6-9496-73a79c127027'::uuid, 'owner'::public.account_role),
               'Inserting a user should also add an organization_user for the created account'
           );

update public.organization set name = 'test' where id = '15e5e06b-f2fb-40a6-9496-73a79c127027'::uuid;
-- owner can update their team name
SELECT results_eq(
               $$ select name from public.organization where id = '15e5e06b-f2fb-40a6-9496-73a79c127027'::uuid $$,
               $$ select 'test' $$,
               'Owner can update their team name'
           );

-- personal account should be returned by the public.get_organizations_with_role function
SELECT results_eq(
               $$ select public.get_organizations_with_role() $$,
               $$ select id from public.organization $$,
               'Personal account should be returned by the public.get_organizations_with_role function'
           );

delete from public.organization_user where user_id = tests.get_supabase_uid('test1');
-- owner can delete himself from the organization_user table
select is(
        (SELECT count(user_id)::int FROM public.organization_user WHERE user_id = tests.get_supabase_uid('test1')),
        0,
        'Should be able to delete himself from organization_user table'
   );

-----------
-- Strangers
----------
select tests.authenticate_as('test2');

-- non members / owner cannot update team name
SELECT results_ne(
               $$ update public.organization set name = 'test' where id = '15e5e06b-f2fb-40a6-9496-73a79c127027' returning 1$$,
               $$ select 1 $$
           );

-- non member / owner should receive no results from organization
SELECT is(
               (select count(*)::int
                from public.organization
                where id <> '15e5e06b-f2fb-40a6-9496-73a79c127027'),
               0,
               'Non members / owner should receive no results from organization'
           );


 

SELECT *
FROM finish();

ROLLBACK;