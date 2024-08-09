BEGIN;
CREATE EXTENSION IF NOT EXISTS "basejump-supabase_test_helpers";

select plan(6);

----------
-- ARRANGE
----------
SET session_replication_role = replica;

SELECT tests.create_supabase_user('non_admin_user');
SELECT tests.create_supabase_user('admin');
 
  

-- Insert more organizations
INSERT INTO public.organization (id, name) VALUES
    ('00000000-0000-0000-0000-999999999994', 'Swiss Team 4'),
    ('00000000-0000-0000-0000-999999999995', 'Swiss Team 5');

INSERT INTO public.organization_user (user_id, organization_id, account_role) VALUES
	(tests.get_supabase_uid('non_admin_user'), '00000000-0000-0000-0000-999999999994', 'owner'),
	(tests.get_supabase_uid('admin'), '00000000-0000-0000-0000-999999999995', 'owner');
	



-- Assign admin privileges
INSERT INTO public.admin_users (user_profile_id, admin) VALUES
	(tests.get_supabase_uid('admin'), true);


reset all;

----------
-- ACT & ASSERT
----------


-- Act as admin
select tests.authenticate_as('admin');
 
-- Update verification status as admin
insert into public.organization_verified (organization_id, verified) values ('00000000-0000-0000-0000-999999999994', true);


-- Test admin user can update verification status
select is(
    (
        select verified
        from public.organization_verified
        where organization_id = '00000000-0000-0000-0000-999999999994'
    ),
    true,
    'Admin should be able to insert verification status'
);


-- Test all users should see verification status
select is(
    (select public.is_verified_organization('00000000-0000-0000-0000-999999999994')),
    true,
    'Admin should be able to insert verification status'
);
 
 
update public.organization_verified set verified = false where organization_id = '00000000-0000-0000-0000-999999999994';

select is(
    (
        select verified
        from public.organization_verified
        where organization_id = '00000000-0000-0000-0000-999999999994'
    ),
    false,
    'Admin should be able to update verification status'
);

-- Clear current authentication to test non-admin access
select tests.clear_authentication();
select tests.authenticate_as('non_admin_user');

-- Test non-admin user cannot update verification status


-- Test non-admin user cannot insert into organization_verified
select throws_ok(
    $$ insert into public.organization_verified (organization_id, verified) values ('00000000-0000-0000-0000-999999999995', true) $$,
    'new row violates row-level security policy for table "organization_verified"'
);


-- Act as admin again to successfully verify organization
select tests.clear_authentication();
select tests.authenticate_as('admin');

insert into public.organization_verified (organization_id, verified) values ('00000000-0000-0000-0000-999999999995', false);
select is(
    (
        select verified
        from public.organization_verified
        where organization_id = '00000000-0000-0000-0000-999999999995'
    ),
    false,
    'Admin should be able to insert verification status'
);

-- Clear current authentication to test non-admin access
select tests.clear_authentication();
select tests.authenticate_as('non_admin_user');


-- Try updating verification status as non-admin
UPDATE public.organization_verified
SET verified = true
WHERE organization_id = '00000000-0000-0000-0000-999999999995';

-- Test non-admin user cannot update verification status
select is(
    (
        select verified
        from public.organization_verified
        where organization_id = '00000000-0000-0000-0000-999999999995'
    ),
    false,
    'Non-admin should not be able to update verification status'
);

-- Clear current authentication to clean up test environment
select tests.clear_authentication();

-- Finalize the test
SELECT *
FROM finish();

ROLLBACK;
