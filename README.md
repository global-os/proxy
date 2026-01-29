See .env for db config
Run this to migrate:

drizzle-kit generate
drizzle-kit push

For local dev
DATABASE_URL=postgresql://yourusername@localhost:5432/postgres

To regenerate routes
cd src/frontend
yarn regenerate