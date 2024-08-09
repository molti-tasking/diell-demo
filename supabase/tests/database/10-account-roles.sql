BEGIN;
CREATE EXTENSION IF NOT EXISTS "basejump-supabase_test_helpers";

select plan(12);

-- setup users needed for testing
select tests.create_supabase_user('primary');
select tests.create_supabase_user('owner');
select tests.create_supabase_user('member');

--- start acting as an authenticated user
select tests.authenticate_as('primary');

insert into public.organization (id, name)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'test');

-- setup users for tests
set local role postgres;
insert into public.organization_user (organization_id, user_id, account_role)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('owner'), 'owner');
insert into public.organization_user (organization_id, user_id, account_role)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('member'), 'member');

--------
-- Acting as member
--------
select tests.authenticate_as('member');

-- can't update role directly in the organization_user table
SELECT results_ne(
               $$ update public.organization_user set account_role = 'owner' where organization_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') returning 1 $$,
               $$ values(1) $$,
               'Members should not be able to update their own role'
           );

-- members should not be able to update any user roles
SELECT throws_ok(
               $$ select update_organization_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('member'),  'owner') $$,
               'You must be an owner of the account to update a users role'
           );

-- member should still be only a member
SELECT row_eq(
               $$ select account_role from public.organization_user where organization_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') $$,
               ROW ('member'::public.account_role),
               'Member should still be a member'
           );

-------
-- Acting as Non Primary Owner
-------
select tests.authenticate_as('owner');

-- can't update role directly in the organization_user table
SELECT results_ne(
               $$ update public.organization_user set account_role = 'owner' where organization_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') returning 1 $$,
               $$ values(1) $$,
               'Members should not be able to update their own role'
           );


--- primary owner should still be the same
SELECT row_eq(
               $$ select account_role from public.organization_user where organization_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('primary') $$,
               ROW ('owner'::public.account_role),
               'Primary owner should still be the same'
           );

-- non primary owner should be able to update other users roles
SELECT lives_ok(
               $$ select update_organization_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('member'),  'owner') $$,
               'Non primary owner should be able to update other users roles'
           );

-- member should now be an owner
SELECT row_eq(
               $$ select account_role from public.organization_user where organization_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') $$,
               ROW ('owner'::public.account_role),
               'Member should now be an owner'
           );

-------
-- Acting as primary owner
-------
select tests.authenticate_as('primary');

-- can't update role directly in the organization_user table
SELECT results_ne(
               $$ update public.organization_user set account_role = 'member' where organization_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') returning 1 $$,
               $$ values(1) $$,
               'Members should not be able to update their own role'
           );

-- primary owner should be able to change user back to a member
SELECT lives_ok(
               $$ select update_organization_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('member'),  'member') $$,
               'Primary owner should be able to change user back to a member'
           );

-- member should now be a member
SELECT row_eq(
               $$ select account_role from public.organization_user where organization_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') $$,
               ROW ('member'::public.account_role),
               'Member should now be a member'
           );

-- primary owner can change a user into a primary owner
SELECT lives_ok(
               $$ select update_organization_user_role('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('member'),  'owner') $$,
               'Primary owner should be able to change user into a primary owner'
           );

-- member should now be a primary owner
SELECT row_eq(
               $$ select account_role from public.organization_user where organization_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' and user_id = tests.get_supabase_uid('member') $$,
               ROW ('owner'::public.account_role),
               'Member should now be a primary owner'
           );
 
SELECT *
FROM finish();

ROLLBACK;