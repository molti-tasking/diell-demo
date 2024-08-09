BEGIN;
CREATE EXTENSION IF NOT EXISTS "basejump-supabase_test_helpers";

select plan(4);

-- create the users we need for testing
select tests.create_supabase_user('primary_owner');
select tests.create_supabase_user('invited_owner');
select tests.create_supabase_user('member');
select tests.create_supabase_user('testing_member');

--- Setup the tests
select tests.authenticate_as('primary_owner');
-- select create_organization('Test Account');


insert into public.organization (id, name)
values ('00000000-35f6-4b5d-9f28-d9f00a9fb46f', 'Test Organization');

set role postgres;

insert into public.organization_user (organization_id, account_role, user_id)
values ('00000000-35f6-4b5d-9f28-d9f00a9fb46f', 'member', tests.get_supabase_uid('member'));
insert into public.organization_user (organization_id, account_role, user_id)
values ('00000000-35f6-4b5d-9f28-d9f00a9fb46f', 'owner', tests.get_supabase_uid('invited_owner'));
insert into public.organization_user (organization_id, account_role, user_id)
values ('00000000-35f6-4b5d-9f28-d9f00a9fb46f', 'member', tests.get_supabase_uid('testing_member'));

---  can NOT remove a member unless your an owner
select tests.authenticate_as('member');

SELECT throws_ok(
               $$ select remove_organization_member('00000000-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('testing_member')) $$,
               'Only account owners can access this function'
           );

select tests.authenticate_as('testing_member');

SELECT is(
    (select public.has_role_on_organization('00000000-35f6-4b5d-9f28-d9f00a9fb46f')),
    true,
    'User should not be on the account anymore'
);

--- CAN remove a member if you're an owner
select tests.authenticate_as('invited_owner');

select lives_ok(
               $$select remove_organization_member('00000000-35f6-4b5d-9f28-d9f00a9fb46f', tests.get_supabase_uid('testing_member'))$$,
               'Owners should be able to remove members'
           );



select tests.authenticate_as('testing_member');

SELECT is(
    (select public.has_role_on_organization('00000000-35f6-4b5d-9f28-d9f00a9fb46f')),
    false,
    'Should no longer have access to the account'
);

 
SELECT *
FROM finish();

ROLLBACK;