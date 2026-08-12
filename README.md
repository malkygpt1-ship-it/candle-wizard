# Candle Wizard

Candle Wizard is a production operating system for a UK candle business. It brings inventory, purchasing, production planning, batches, costings, waste, lot traceability and an append-only audit trail into one Next.js application.

The live database is the **Candle Wizard** Supabase project in London (`eu-west-2`), project ref `sjqxpmevwnivweqtdcrs`.

## Supplier catalogue

The inventory includes 14 materials from Candle Shack Ltd, selected as a practical UK candle-supplies distributor. Each catalogue row includes:

- supplier SKU and product-page link;
- pack size and base-unit cost;
- supplier price excluding VAT;
- supplier price including VAT;
- price-check date; and
- exactly zero starting stock.

The original workbook records remain available alongside the sourced catalogue. Supplier prices are reference data and should be checked again before ordering.

## Stack

- Next.js 16 App Router and React 19
- Supabase Postgres 17 in `eu-west-2`
- `postgres` with the Supabase transaction pooler
- Tailwind CSS 4
- Vercel-ready server-side API routes

The database credential is only read inside the Node.js server runtime. No Supabase key or connection string is sent to the browser.

## Deploy on Vercel

1. Import [malkygpt1-ship-it/candle-wizard](https://github.com/malkygpt1-ship-it/candle-wizard) into Vercel.
2. Leave the detected framework as **Next.js** and use the standard `npm run build` command.
3. Add the Supabase integration from the Vercel Marketplace and select the existing **Candle Wizard** project.
4. Confirm that Vercel has added the pooled database URI as `POSTGRES_URL` for Production (and Preview if required).
5. Deploy, then open `/api/snapshot` once to confirm the server can read Supabase.

If the integration does not create `POSTGRES_URL`, open **Connect → Transaction pooler → URI** in the Supabase dashboard and add that URI manually in Vercel. Use transaction mode on port `6543`, keep SSL enabled, and never name the variable `NEXT_PUBLIC_POSTGRES_URL`.

The remote database is already migrated and seeded. The first app request also runs the same idempotent seed path, so a fresh database can initialise itself safely.

> This is an operational write-enabled application. Before sharing the production URL, enable Vercel Deployment Protection or add application authentication.

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Replace the placeholder in `.env.local` with the Supabase transaction-pooler URI. The app also accepts `DATABASE_URL` or `SUPABASE_DB_URL`, but `POSTGRES_URL` is preferred for Vercel.

## Database workflow

The committed files in `supabase/migrations/` match the migration history applied to the hosted project. To work with the CLI:

```bash
npx supabase login
npx supabase link --project-ref sjqxpmevwnivweqtdcrs
npx supabase migration list
npx supabase db push
```

To regenerate the replayable seed from the same TypeScript source used by the app:

```bash
npm run db:seed:generate
```

Database controls include:

- row-level security on all 15 application tables;
- explicit deny policies and no table grants for browser roles;
- atomic writes and idempotency records;
- advisory-lock triggers that stop negative material stock and over-posted receipts;
- native date/timestamp types, check constraints and indexed foreign keys; and
- a one-to-one deferred link between waste events and stock movements.

## Quality checks

```bash
npm run lint
npm test
```

`npm test` runs the domain and catalogue checks, followed by a production Next.js build.
