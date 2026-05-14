# AGENTS.md

Vendure plugin that adds dynamic promotional banners with translatable, multi-section content. Published to npm as `vendure-banner-plugin`. See [README.md](./README.md) for installation and end-user docs.

> **v2 only.** This branch targets Vendure 3.x with the React Dashboard. The v1 line (Angular UI, `compileUiExtensions`) lives on the [`v1` branch](https://github.com/arthur-nesterenko/vendure-plugin-banner/tree/v1) and receives security fixes only. Do **not** reintroduce `AdminUiPlugin` or `compileUiExtensions` here — v2 deliberately removed them.

## Development workflow

1. `npm install` — Node `>=22` is required (see `engines`).
2. `npm run start` — boots Vendure on `http://localhost:4000` with the dashboard at `/dashboard`. Login is `superadmin` / `superadmin`. The DB is a local `banner-vendure.sqlite`; delete the file to reset state.
3. `npm run codegen` after any change to `src/api/api-extensions.ts` — spins up an ephemeral Vendure on port 3123 and rewrites `src/generated-{admin,shop}-types.ts`.
4. `npm run build` before publishing — chains `rimraf dist → codegen → tsc → copy-assets`.

`npm run watch` runs the server only (no worker) with ts-node-dev auto-reload.

## Testing

Vitest with two projects, configured in `vitest.config.ts`:

| Project | Pattern | Environment |
|---|---|---|
| `unit` | `src/dashboard/**/*.spec.{ts,tsx}` | jsdom + React Testing Library |
| `e2e`  | `e2e/**/*.e2e.spec.ts`            | real Vendure test server (sqljs) |

```bash
npm test                  # both projects
npm run test:unit         # dashboard components
npm run e2e               # backend resolvers + service

# A single file
npx vitest run --project unit  src/dashboard/components/banner-detail/banner-sections-manager.spec.tsx
npx vitest run --project e2e   e2e/banner.e2e.spec.ts
```

E2e tests seed from `e2e/fixtures/` and cache compiled data under `e2e/__data__/`. **Delete `e2e/__data__/` after schema or entity changes** or the cached DB will be out of step with the new schema.

## Architecture — the non-obvious bits

- **Two-sided build.** The backend (`src/`) is compiled to `dist/` by `tsc`. The dashboard (`src/dashboard/`) is **shipped as TypeScript source** — `scripts/copy-assets.ts` mirrors it into `dist/dashboard/` and the consumer's Vite compiles it at *their* build time. Do not try to pre-compile the dashboard with `tsc`.

- **Two `tsconfig`s.** `tsconfig.json` excludes `src/dashboard/**` and `src/gql/**`. The dashboard has its own composite `tsconfig.dashboard.json` (ESNext, `jsx: react-jsx`, `@/gql` and `@/vdb/*` path aliases). `npm run tsc` checks the backend only — type-check the dashboard with `tsc -p tsconfig.dashboard.json --noEmit`.

- **`BannerService.upsertSection` saves twice on purpose.** `TranslatableSaver.update` only persists translatable columns. Non-translatable fields (`externalLink`, `position`, `asset`, `product`, `collection`) need a second `save()` after `getEntityOrThrow` lookups. Don't collapse the two paths into one — it silently drops updates.

- **`vite.config.mts` `pathAdapter` quirk.** `sourceRoot` is set to the project root, not `dev-server/`, so both `dev-server/` and `src/` are mirrored into the dashboard compiler's temp output and the relative `require("../src")` in the compiled config resolves. Tempting to simplify; don't.

- **Shop vs admin visibility.** `findByName` and `findOne` default to `enabled: true`. The admin resolver passes `onlyEnabled = false` so authors can edit disabled drafts. Don't pipe user-controlled input through to that flag.

- **Mutations publish `BannerEvent`.** Consumers depend on it for CDN/edge cache invalidation. Any new mutation on `BannerService` must publish a matching event with the right `type`.

## When you change…

| Change                                            | Then                                                                                          |
|---|---|
| `src/api/api-extensions.ts` (GraphQL schema)      | `npm run codegen`                                                                             |
| `src/entities/**` (columns or relations)          | `npm run codegen`; consumers will need a migration — this repo uses `synchronize: true` in dev only |
| Dashboard strings (`<Trans>`, `t\`…\``)            | `npm run i18n:extract` (rewrites `src/dashboard/i18n/{en,uk,pl}.po`)                          |
| `BannerService` (new mutation)                    | Publish a matching `BannerEvent`                                                              |
| `dev-server/vendure-config.ts`                    | Keep `headlessConfig` aligned — the e2e suite imports it                                      |

## Commits & releases

- Conventional commits enforced by commitlint + husky. Use `npm run commit` (commitizen) if unsure of the prefix.
- [`release-please`](https://github.com/googleapis/release-please) opens release PRs automatically. Only `feat` / `fix` / `perf` / `deps` / `docs` / `revert` appear in the CHANGELOG; `chore` / `test` / `ci` / `build` / `style` / `refactor` are hidden.
- `main` is the default PR target. Don't push to `v1` unless backporting a security fix.

## Gotchas

- **Generated types drift silently.** A schema change without `codegen` compiles fine but the resolver `args` will mismatch `generated-admin-types.ts` at runtime. Always run codegen after schema edits.
- **`banner-vendure.sqlite` is committed.** That's intentional — it makes first-time `npm run start` instant. Delete the file to reset; don't commit dev-server DB drift back to the repo.
- **ESLint disables several rules on purpose** (`no-unused-vars`, `@typescript-eslint/no-explicit-any`, …). Re-enabling them is welcome, but it should be its own PR — not a drive-by inside a feature change.
- **Lingui PO files**: `lineNumbers: false` is set in `lingui.config.js`. Don't reintroduce line numbers — every extract would otherwise produce noisy diffs.

## Where to look

| Concern                  | File                                            |
|---|---|
| Plugin definition        | `src/banner.plugin.ts`                          |
| Business logic           | `src/service/banner.service.ts`                 |
| Resolvers                | `src/api/banner-{admin,shop}.resolver.ts`       |
| GraphQL schema extensions| `src/api/api-extensions.ts`                     |
| Entities                 | `src/entities/banner{,-section,-section-translation}.entity.ts` |
| Permissions              | `src/banner-permissions.ts`                     |
| Event                    | `src/events/banner.event.ts`                    |
| Dashboard entry          | `src/dashboard/index.tsx`                       |
| Dashboard fragments      | `src/dashboard/types/fragments.ts`              |
