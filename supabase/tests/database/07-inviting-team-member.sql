BEGIN;
CREATE EXTENSION IF NOT EXISTS "basejump-supabase_test_helpers";

select plan(10);
 

--- Create the users we need for testing
select tests.create_supabase_user('test1');
select tests.create_supabase_user('invited');

--- start acting as an authenticated user
select tests.authenticate_as('test1');

insert into public.organization (id, name)
values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'test');

-- create invitation
SELECT row_eq(
               $$ insert into public.invitations (organization_id, account_role, token, invitation_type) values ('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f', 'member', 'test_member_single_use_token', 'one_time') returning 1 $$,
               ROW (1),
               'Owners should be able to add invitations for new members'
           );

-- auth as new user
select tests.authenticate_as('invited');

-- should NOT be able to lookup invitations directly
SELECT is(
               (select count(*)::int from public.invitations),
               0,
               'Cannot load invitations directly'
           );

-- should be able to lookup an invitation I know the token for
SELECT row_eq(
               $$ select lookup_invitation('test_member_single_use_token')::text $$,
               ROW (json_build_object(
                       'active', true,
                       'account_name', 'test')::text
                   ),
               'Should be able to lookup an invitation I know the token for'
           );

-- should not be able to lookup a fake token
SELECT row_eq(
               $$ select lookup_invitation('not-real-token')::text $$,
               ROW (json_build_object(
                       'active', false,
                       'account_name', null)::text
                   ),
               'Fake tokens should fail lookup gracefully'
           );

-- should not be able to accept a fake invitation
SELECT throws_ok(
               $$ select accept_invitation('not-a-real-token') $$,
               'Invitation not found'
           );

-- should be able to accept an invitation
SELECT lives_ok(
               $$ select accept_invitation('test_member_single_use_token') $$,
               'Should be able to accept an invitation'
           );

-- should be able to get the team from get_organizations_with_role
SELECT ok(
               (select 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f' IN
                       (select public.get_organizations_with_role())),
               'Should now be a part of the team'
           );

-- should have the correct role on the team
SELECT row_eq(
               $$ select account_role from public.organization_user where organization_id = 'd126ecef-35f6-4b5d-9f28-d9f00a9fb46f'::uuid and user_id = tests.get_supabase_uid('invited') $$,
               ROW ('member'::public.account_role),
               'Should have the correct account role after accepting an invitation'
           );

SELECT throws_ok(
               $$ select get_organization_members('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f')$$,
               'Only account owners can access this function'
           );

select tests.authenticate_as('test1');
SELECT row_eq(
               $$ select json_array_length(get_organization_members('d126ecef-35f6-4b5d-9f28-d9f00a9fb46f')) $$,
               ROW (2),
               'Should be able to get account members as owner'
           );

SELECT *
FROM finish();

ROLLBACK;