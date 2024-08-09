BEGIN;
CREATE EXTENSION IF NOT EXISTS "basejump-supabase_test_helpers";

select plan(5);

--- we insert a user into auth.users and return the id into user_id to use
select tests.create_supabase_user('test1');
select tests.create_supabase_user('test_member');

------------
--- Primary Owner
------------
select tests.authenticate_as('test1');

insert into public.organization (id, name)
values ('00000000-0000-0000-0000-000000000000', 'test');

insert into public.organization (id, name)
values ('00000000-0000-0000-0000-000000000001', 'test');

select is(
               (select created_by from public.organization where id = '00000000-0000-0000-0000-000000000000'),
               tests.get_supabase_uid('test1'),
               'created_by is set to the user that created the account'
           );
select is(
               (select updated_by from public.organization where id = '00000000-0000-0000-0000-000000000000'),
               tests.get_supabase_uid('test1'),
               'created_by is set to the user that created the account'
           );

--- test updating organizations
select tests.clear_authentication();
set role postgres;

insert into public.organization_user (organization_id, account_role, user_id)
values ('00000000-0000-0000-0000-000000000000', 'owner', tests.get_supabase_uid('test_member'));

update public.organization
set name = 'test update'
where id = '00000000-0000-0000-0000-000000000001';

select is(
               (select updated_by from public.organization where id = '00000000-0000-0000-0000-000000000001'),
               NULL,
               'Updtaes from postgres / service_role users set updated_by field to null'
           );

select tests.authenticate_as('test_member');

select update_organization('00000000-0000-0000-0000-000000000000', name => 'updated name');

select is(
               (select updated_by from public.organization where id = '00000000-0000-0000-0000-000000000000'),
               tests.get_supabase_uid('test_member'),
               'updated_by is set to the user that updated the account'
           );

select is(
               (select created_by from public.organization where id = '00000000-0000-0000-0000-000000000000'),
               tests.get_supabase_uid('test1'),
               'created_by is set to the user that created the account'
           );

SELECT *
FROM finish();

ROLLBACK;