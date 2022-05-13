-- Deploy fresh DB tables. \i executes sql scripts
\i '/docker-entrypoint-initdb.d/tables/users.sql'
\i '/docker-entrypoint-initdb.d/tables/login.sql'

-- _ Add seed data
\i '/docker-entrypoint-initdb.d/seed/seed.sql'
