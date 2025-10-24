This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Configuration

The application loads configuration from `config.yaml` in the project root. This YAML file contains the following settings:

- `port`: The port number for the development server (default: 3000)
- `jwtSecret`: Secret used to sign JWTs
- `dbPath`: Path to the SQLite database file

These values are automatically loaded at startup and set as environment variables. You can edit `config.yaml` to customize them, or override with environment variables if preferred.

### Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `PORT` | Port for the development server. | 3000 (from config.yaml) |
| `FOCUSFLOW_DB_PATH` | Absolute/relative path to the SQLite database file. | `<project>/data/focusflow.db` (from config.yaml) |
| `FOCUSFLOW_JWT_SECRET` | Secret used to sign JWTs. | `focusflow-dev-secret-change-me` (from config.yaml, override in production) |
| `FOCUSFLOW_JWT_EXPIRES_IN` | Expiry passed to `jsonwebtoken` (`1h`, `30m`, etc.). | `1h` |

The database directory is created automatically; database files are git-ignored.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## sqlite commands
```bash
# connect SQLite
sqlite3 data/focusflow.db
# for tables list
.tables
# query sql
SELECT * FROM users LIMIT 10;
# exe sql file
.read data/querySQLite.sql
# exit SQLite
.exit
```