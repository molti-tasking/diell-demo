BEGIN;
CREATE EXTENSION IF NOT EXISTS "basejump-supabase_test_helpers";

select plan(6);

select has_schema('public', 'Public schema should exist');

select has_table('public', 'organization', 'Public organization table should exist');
select has_table('public', 'organization_user', 'Public organization_users table should exist');
select has_table('public', 'invitations', 'Public invitations table should exist');


select function_returns('public', 'generate_token', Array ['integer'], 'text',
                        'Public generate_token function should exist');
select function_returns('public', 'trigger_set_timestamps', 'trigger',
                        'Public trigger_set_timestamps function should exist');
 

SELECT *
FROM finish();

ROLLBACK;