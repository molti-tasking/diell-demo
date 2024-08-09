# Project

## Supabase

### Services

Different services are included in supabase.

#### Inbucket Mail Service

This is running under http://localhost:54324/ It does not really send out mails with the default local setup. But you can monitor the emails that are meant to send out.

#### Auth

For an OAuth setup you need a Client ID and Client Secret to be configured for each provider.

Errors that can occur: The domain to redirect after coming back from OAuth provider was not listed in config.toml in `additional_redirect_urls`

### Helpful commands for development

#### Start & stop local db

`npx supabase start`
`npx supabase stop`

#### Dump differences

This command is helpful when you changed some stuff in the supabase studio ui and with this command you can generate the sql code with the differences.

`npx supabase db diff`

#### Dump plain data

Note: Supabase has to be started already
`npx supabase db dump --local --data-only`

#### Generate types

Note: Supabase has to be started already
`npx supabase gen types typescript --local > src/lib/supabase/types.ts`

#### Lint database

In order to pre check the schema, run the following:
`npx supabase db lint -s public` which will only check the public schema.

#### Run tests

Note: Supabase has to be started already. Also for the testing you have to reset the db sometimes in order for the changes to be respected.

`npx supabase db reset --local`

`npx supabase test db`

### Update cloud project

1. Dump remote data: `npx supabase db dump --data-only -f dump.sql --db-url postgres://[...CONNECTION_STRING].supabase.com:5432/postgres`
2. Reset local db without seed data `npx supabase db reset --local`
3. Copy & paste the dumped data in the sql editor on local-supabase and check if it works
4. If it works run `npx supabase db reset --linked` to erase all stuff from the remote db and apply local migrations.
5. Copy & paste the dumped data in the sql editor on cloud-supabase and check if it works

Typical Error: The following SQL might be needed after resetting the DB `insert into auth.schema_migrations values ('20221208132122');`.
