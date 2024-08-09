/**
____                 _
|  _ \               (_)
| |_) | __ _ ___  ___ _ _   _ _ __ ___  _ __
|  _ < / _` / __|/ _ \ | | | | '_ ` _ \| '_ \
| |_) | (_| \__ \  __/ | |_| | | | | | | |_) |
|____/ \__,_|___/\___| |\__,_|_| |_| |_| .__/
_/ |               | |
|__/                |_|

Basejump is a starter kit for building SaaS products on top of Supabase.
Learn more at https://usebasejump.com
*/
/**
 * -------------------------------------------------------
 * Section - Basejump schema setup and utility functions
 * -------------------------------------------------------
 */
-- revoke execution by default from public
-- ALTER DEFAULT PRIVILEGES
-- REVOKE
-- EXECUTE ON FUNCTIONS
-- FROM
--   PUBLIC;

-- ALTER DEFAULT PRIVILEGES IN SCHEMA PUBLIC
-- REVOKE
-- EXECUTE ON FUNCTIONS
-- FROM
--   anon,
--   authenticated;

-- Create basejump schema
-- CREATE SCHEMA IF NOT EXISTS basejump;

-- GRANT USAGE ON SCHEMA basejump to authenticated;

-- GRANT USAGE ON SCHEMA basejump to service_role;

/**
 * -------------------------------------------------------
 * Section - Enums
 * -------------------------------------------------------
 */
/**
 * Invitation types are either email or link. Email invitations are sent to
 * a single user and can only be claimed once.  Link invitations can be used multiple times
 * Both expire after 24 hours
 */
DO $$
    BEGIN
        -- check it account_role already exists on public schema
        IF NOT EXISTS(SELECT 1
                      FROM pg_type t
                               JOIN pg_namespace n ON n.oid = t.typnamespace
                      WHERE t.typname = 'invitation_type'
                        AND n.nspname = 'public') THEN
            CREATE TYPE public.invitation_type AS ENUM ('one_time', '24_hour');
        end if;
    end;
$$;

/**
 * -------------------------------------------------------
 * Section - Basejump utility functions
 * -------------------------------------------------------
 */
/**
 * Automatic handling for maintaining created_at and updated_at timestamps
 * on tables
 */
CREATE
OR REPLACE FUNCTION public.trigger_set_timestamps () RETURNS TRIGGER AS $$
BEGIN
    if TG_OP = 'INSERT' then
        NEW.created_at = now();
        NEW.updated_at = now();
    else
        NEW.updated_at = now();
        NEW.created_at = OLD.created_at;
    end if;
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

/**
 * Automatic handling for maintaining created_by and updated_by timestamps
 * on tables
 */
CREATE
OR REPLACE FUNCTION public.trigger_set_user_tracking () RETURNS TRIGGER AS $$
BEGIN
    if TG_OP = 'INSERT' then
        NEW.created_by = auth.uid();
        NEW.updated_by = auth.uid();
    else
        NEW.updated_by = auth.uid();
        NEW.created_by = OLD.created_by;
    end if;
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

/**
public.generate_token(length)
Generates a secure token - used internally for invitation tokens
but could be used elsewhere.  Check out the invitations table for more info on
how it's used
*/
CREATE
OR REPLACE FUNCTION public.generate_token (length int) RETURNS text AS $$
select regexp_replace(replace(
                              replace(replace(replace(encode(extensions.gen_random_bytes(length)::bytea, 'base64'), '/', ''), '+',
                                              ''), '\', ''),
                              '=',
                              ''), E'[\\n\\r]+', '', 'g');
$$ LANGUAGE sql;

grant
execute on function public.generate_token (int) to authenticated;
