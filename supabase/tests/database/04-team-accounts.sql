BEGIN;
CREATE EXTENSION IF NOT EXISTS "basejump-supabase_test_helpers";

select plan(28);



-- Create the users we plan on using for testing
select tests.create_supabase_user('test1');
select tests.create_supabase_user('test2');
select tests.create_supabase_user('test_member');
select tests.create_supabase_user('test_owner');
select tests.create_supabase_user('test_random_owner');

--- start acting as an authenticated user
select tests.authenticate_as('test_random_owner');

-- setup inaccessible tests for a known organization ID
insert into public.organization (id, name)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'nobody in test can access me');

------------
--- Primary Owner
------------
select tests.authenticate_as('test1');

-- should be able to create a team organization when they're enabled
SELECT row_eq(
               $$ insert into public.organization (id, name) values ('8fcec130-27cd-4374-9e47-3303f9529479', 'test team') returning 1$$,
               ROW (1),
               'Should be able to create a new team organization'
           );


-- should add that user to the organization as an owner
SELECT row_eq(
               $$ select user_id, account_role from public.organization_user where organization_id = '8fcec130-27cd-4374-9e47-3303f9529479'::uuid $$,
               ROW (tests.get_supabase_uid('test1'), 'owner'::public.account_role),
               'Inserting an organization should also add an organization_user for the current user'
           );

-- should be able to get your own role for the organization
SELECT row_eq(
               $$ select public.current_user_account_role('8fcec130-27cd-4374-9e47-3303f9529479') $$,
               ROW (jsonb_build_object('account_role', 'owner')),
               'Primary owner should be able to get their own role'
           );


-- owners should be able to add invitations
SELECT row_eq(
               $$ insert into public.invitations (organization_id, account_role, token, invitation_type) values ('8fcec130-27cd-4374-9e47-3303f9529479', 'member', 'test_member_single_use_token', 'one_time') returning 1 $$,
               ROW (1),
               'Owners should be able to add invitations for new members'
           );

SELECT row_eq(
               $$ insert into public.invitations (organization_id, account_role, token, invitation_type) values ('8fcec130-27cd-4374-9e47-3303f9529479', 'owner', 'test_owner_single_use_token', 'one_time') returning 1 $$,
               ROW (1),
               'Owners should be able to add invitations for new owners'
           );

-- should not be able to add new users directly into team organizations
SELECT throws_ok(
               $$ insert into public.organization_user (organization_id, account_role, user_id) values ('8fcec130-27cd-4374-9e47-3303f9529479', 'owner', tests.get_supabase_uid('test2')) $$,
               'new row violates row-level security policy for table "organization_user"'
           );

-- owner can update their team name
SELECT results_eq(
               $$ update public.organization set name = 'test' where id = '8fcec130-27cd-4374-9e47-3303f9529479' returning name $$,
               $$ values('test') $$,
               'Owner can update their team name'
           );

-- all organizations (personal and team) should be returned by get_organizations_with_role test
SELECT ok(
               (select '8fcec130-27cd-4374-9e47-3303f9529479' IN
                       (select public.get_organizations_with_role())),
               'Team organization should be returned by the public.get_organizations_with_role function'
           );

-- shouoldn't return any organizations if you're not a member of
SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' NOT IN
                       (select public.get_organizations_with_role())),
               'Team organizations not a member of should NOT be returned by the public.get_organizations_with_role function'
           );

-- should return true for public.has_role_on_organization
SELECT ok(
               (select public.has_role_on_organization('8fcec130-27cd-4374-9e47-3303f9529479', 'owner')),
               'Should return true for public.has_role_on_organization'
           );

SELECT ok(
               (select public.has_role_on_organization('8fcec130-27cd-4374-9e47-3303f9529479')),
               'Should return true for public.has_role_on_organization'
           );

-- should return FALSE when not on the organization
SELECT ok(
               (select NOT public.has_role_on_organization('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f')),
               'Should return false for public.has_role_on_organization'
           );

-----------
--- organization User Setup
-----------
select tests.clear_authentication();
set role postgres;

-- insert organization_user for the member test
insert into public.organization_user (organization_id, account_role, user_id)
values ('8fcec130-27cd-4374-9e47-3303f9529479', 'member', tests.get_supabase_uid('test_member'));
-- insert organization_user for the owner test
insert into public.organization_user (organization_id, account_role, user_id)
values ('8fcec130-27cd-4374-9e47-3303f9529479', 'owner', tests.get_supabase_uid('test_owner'));

-----------
--- Member
-----------
select tests.authenticate_as('test_member');

-- should now have access to the organization
SELECT is(
               (select count(*)::int from public.organization where id = '8fcec130-27cd-4374-9e47-3303f9529479'),
               1,
               'Should now have access to the organization'
           );

-- members cannot update organization info
SELECT results_ne(
               $$ update public.organization set name = 'test' where id = '8fcec130-27cd-4374-9e47-3303f9529479' returning 1 $$,
               $$ values(1) $$,
               'Member cannot can update their team name'
           );

-- organization_user should have a role of member
SELECT row_eq(
               $$ select account_role from public.organization_user where organization_id = '8fcec130-27cd-4374-9e47-3303f9529479' and user_id = tests.get_supabase_uid('test_member')$$,
               ROW ('member'::public.account_role),
               'Should have the correct organization role after accepting an invitation'
           );

-- should be able to get your own role for the organization
SELECT row_eq(
               $$ select public.current_user_account_role('8fcec130-27cd-4374-9e47-3303f9529479') $$,
               ROW (jsonb_build_object('account_role', 'member')),
               'Member should be able to get their own role'
           );

-- Should NOT show up as an owner in the permissions check
SELECT ok(
               (select '8fcec130-27cd-4374-9e47-3303f9529479' NOT IN
                       (select public.get_organizations_with_role('owner'))),
               'Newly added organization ID should not be in the list of organizations returned by public.get_organizations_with_role("owner")'
           );

-- Should be able ot get a full list of organizations when no permission passed in
SELECT ok(
               (select '8fcec130-27cd-4374-9e47-3303f9529479' IN
                       (select public.get_organizations_with_role())),
               'Newly added organization ID should be in the list of organizations returned by public.get_organizations_with_role()'
           );

-- should return true for public.has_role_on_organization
SELECT ok(
               (select public.has_role_on_organization('8fcec130-27cd-4374-9e47-3303f9529479')),
               'Should return true for public.has_role_on_organization'
           );

-- should return false for the owner lookup
SELECT ok(
               (select NOT public.has_role_on_organization('8fcec130-27cd-4374-9e47-3303f9529479', 'owner')),
               'Should return false for public.has_role_on_organization'
           );

-----------
--- Non-Primary Owner
-----------
select tests.authenticate_as('test_owner');

-- should now have access to the organization
SELECT is(
               (select count(*)::int from public.organization where id = '8fcec130-27cd-4374-9e47-3303f9529479'),
               1,
               'Should now have access to the organization'
           );

-- organization_user should have a role of member
SELECT row_eq(
               $$ select account_role from public.organization_user where organization_id = '8fcec130-27cd-4374-9e47-3303f9529479' and user_id = tests.get_supabase_uid('test_owner')$$,
               ROW ('owner'::public.account_role),
               'Should have the expected organization role'
           );

-- should be able to get your own role for the organization
SELECT row_eq(
               $$ select public.current_user_account_role('8fcec130-27cd-4374-9e47-3303f9529479') $$,
               ROW (jsonb_build_object('account_role', 'owner')),
               'Owner should be able to get their own role'
           );

-- Should NOT show up as an owner in the permissions check
SELECT ok(
               (select '8fcec130-27cd-4374-9e47-3303f9529479' IN
                       (select public.get_organizations_with_role('owner'))),
               'Newly added organization ID should not be in the list of organizations returned by public.get_organizations_with_role("owner")'
           );

-- Should be able ot get a full list of organizations when no permission passed in
SELECT ok(
               (select '8fcec130-27cd-4374-9e47-3303f9529479' IN
                       (select public.get_organizations_with_role())),
               'Newly added organization ID should be in the list of organizations returned by public.get_organizations_with_role()'
           );

SELECT results_eq(
               $$ update public.organization set name = 'test2' where id = '8fcec130-27cd-4374-9e47-3303f9529479' returning name $$,
               $$ values('test2') $$,
               'New owners can update their team name'
           );

-----------
-- Strangers
----------

select tests.authenticate_as('test2');

-- non members / owner cannot update team name
SELECT results_ne(
               $$ update public.organization set name = 'test3' where id = '8fcec130-27cd-4374-9e47-3303f9529479' returning 1$$,
               $$ select 1 $$
           );
-- non member / owner should receive no results from organization
SELECT is(
               (select count(*)::int from public.organization),
               0,
               'Non members / owner should receive no results from organization'
           );


SELECT *
FROM finish();

ROLLBACK;