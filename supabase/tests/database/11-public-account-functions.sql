BEGIN;
CREATE EXTENSION IF NOT EXISTS "basejump-supabase_test_helpers";

select plan(15);
 
--- we insert a user into auth.users and return the id into user_id to use
select tests.create_supabase_user('test1');
select tests.create_supabase_user('test2');
select tests.create_supabase_user('test_member');

select tests.authenticate_as('test1');
select create_organization('My account');
select create_organization('My Account 2');



select is(
               (select json_array_length(get_organizations())),
               2,
               'get_organizations returns 2 organizations'
           );


-- insert known account id into organizations table for testing later
insert into public.organization (id, name)
values ('00000000-0000-0000-0000-000000000000', 'My Known Account');



select is(
               (select (public.get_organization('00000000-0000-0000-0000-000000000000') ->> 'organization_id')::uuid),
               '00000000-0000-0000-0000-000000000000'::uuid,
               'get_organization should be able to return a known account'
           );


select update_organization('00000000-0000-0000-0000-000000000000', name => 'My Updated Account Name');

select is(
               (select name from public.organization where id = '00000000-0000-0000-0000-000000000000'),
               'My Updated Account Name',
               'Updating team name should have been successful for the owner'
           );

select update_organization('00000000-0000-0000-0000-000000000000', public_metadata => jsonb_build_object('foo', 'bar'));

select is(
               (select public_metadata from public.organization where id = '00000000-0000-0000-0000-000000000000'),
               '{
                 "foo": "bar"
               }'::jsonb,
               'Updating meta should have been successful for the owner'
           );

select update_organization('00000000-0000-0000-0000-000000000000', public_metadata => jsonb_build_object('foo', 'bar2'));

select is(
               (select public_metadata from public.organization where id = '00000000-0000-0000-0000-000000000000'),
               '{
                 "foo": "bar2"
               }'::jsonb,
               'Updating meta should have been successful for the owner'
           );

select update_organization('00000000-0000-0000-0000-000000000000', public_metadata => jsonb_build_object('foo2', 'bar'));

select is(
               (select public_metadata from public.organization where id = '00000000-0000-0000-0000-000000000000'),
               '{
                 "foo": "bar2",
                 "foo2": "bar"
               }'::jsonb,
               'Updating meta should have merged by default'
           );

select update_organization('00000000-0000-0000-0000-000000000000', public_metadata => jsonb_build_object('foo3', 'bar'),
                      replace_metadata => true);

select is(
               (select public_metadata from public.organization where id = '00000000-0000-0000-0000-000000000000'),
               '{
                 "foo3": "bar"
               }'::jsonb,
               'Updating meta should support replacing when you want'
           );

-- get_organization should return public metadata
select is(
               (select (get_organization('00000000-0000-0000-0000-000000000000') ->> 'metadata')::jsonb),
               '{
                 "foo3": "bar"
               }'::jsonb,
               'get_account should return public metadata'
           );

select update_organization('00000000-0000-0000-0000-000000000000', name => 'My Updated Account Name 2');

select is(
               (select public_metadata from public.organization where id = '00000000-0000-0000-0000-000000000000'),
               '{
                 "foo3": "bar"
               }'::jsonb,
               'Updating other fields should not affect public metadata'
           );

--- test that we cannot update organizations we belong to but don't own

select tests.clear_authentication();
set role postgres;

insert into public.organization_user (organization_id, account_role, user_id)
values ('00000000-0000-0000-0000-000000000000', 'member', tests.get_supabase_uid('test_member'));

select tests.authenticate_as('test_member');

select throws_ok(
               $$select update_organization('00000000-0000-0000-0000-000000000000', name => 'my new name')$$,
               'Only account owners can update an account'
           );
-------
--- Second user
-------

select tests.authenticate_as('test2');

select throws_ok(
               $$select get_organization('00000000-0000-0000-0000-000000000000')$$,
               'Not found'
           );


select throws_ok(
               $$select current_user_account_role('00000000-0000-0000-0000-000000000000')$$,
               'Not found'
           );

select is(
               (select json_array_length(get_organizations())),
               0,
               'get_organizations returns 0 organizations'
           );



select create_organization('My AccOunt & 3');


select is(
               (select json_array_length(get_organizations())),
               1,
               'get_organizations returns 1 organization'
           );



 

---- some functions should work for service_role users
select tests.authenticate_as_service_role();

select is(
               (select (get_organization('00000000-0000-0000-0000-000000000000') ->> 'organization_id')::uuid),
               '00000000-0000-0000-0000-000000000000'::uuid,
               'get_organization should return the correct organization_id'
           );


SELECT *
FROM finish();

ROLLBACK;