# MySQL Setup (Local and Vercel)

This document explains how to enable MySQL for the Smart Library app and configure it locally and on Vercel.

## Local setup

1. Install MySQL (or MariaDB) locally. On Windows you can use the official installer or a package manager.
2. Create a database and user:

```sql
CREATE DATABASE smart_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'library_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON smart_library.* TO 'library_user'@'localhost';
FLUSH PRIVILEGES;
```

3. Copy `.env.example` to `.env.local` and set the following values:

- `DB_HOST` (e.g. `localhost`)
- `DB_PORT` (e.g. `3306`)
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME` (e.g. `smart_library`)

4. Run the SQL schema in `database_schema.sql` to create tables.

5. Install dependencies and run the app:

```bash
npm install
npm run dev
```

## Vercel (production) setup

1. Provision a managed MySQL instance (AWS RDS, Google Cloud SQL, DigitalOcean Managed DB, or JawsDB on Heroku).
2. In your Vercel project settings > Environment Variables, add the same variables as in `.env.example` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
3. Deploy — the app detects MySQL presence and will persist imports to MySQL when configured.

## Notes

- The app still supports MongoDB; if both are present, MySQL is used for imports where supported.
- Ensure the MySQL user has permission to `INSERT` on the `users` and `books` tables.
