# Studio AI

A world-class AI image and video generation platform — dark, cinematic, and premium. Generate images with style presets, organize them into collections, and browse your full gallery with detailed prompt notes on every creation.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/studio-ai run dev` — run the frontend (port 23604)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `AI_INTEGRATIONS_OPENAI_BASE_URL`, `AI_INTEGRATIONS_OPENAI_API_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Wouter + TanStack Query + Framer Motion
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Image generation: OpenAI gpt-image-1 via Replit AI Integrations
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — single source of truth for all API contracts
- `lib/db/src/schema/generations.ts` — generations table schema
- `lib/db/src/schema/collections.ts` — collections + collection_items schemas
- `artifacts/api-server/src/routes/` — Express route handlers (generations, collections, dashboard, images)
- `artifacts/api-server/src/lib/image-gen.ts` — AI image generation logic
- `artifacts/api-server/public/generations/` — generated images served at `/api/images/:filename`
- `artifacts/studio-ai/src/` — React frontend (pages: Dashboard, Studio, Gallery, ImageDetail, Collections)

## Architecture decisions

- Images are generated server-side using `gpt-image-1` via the Replit OpenAI integration. The route returns immediately with status "generating" and the image is generated in the background; frontend polls until complete.
- Generated images are saved as PNG files in `artifacts/api-server/public/generations/` and served via `/api/images/:filename`.
- Every generation stores the full prompt, enhanced prompt, style, aspect ratio, model, and custom notes — so no prompt is ever lost.
- Collections are many-to-many with generations via the `collection_items` join table.
- The frontend is always dark mode (applied on mount via `document.documentElement.classList`).

## Product

- **Dashboard** — welcome banner, real-time stats (total images/videos/favorites/collections), recent generations grid, activity feed
- **Studio** — main workspace with prompt input, style presets (Photorealistic/Cinematic/Anime/Abstract/Fantasy/Neon Noir/Oil Painting), aspect ratio selector, image/video toggle, generate button with live polling
- **Gallery** — masonry grid of all generations with search and type filters
- **Image Detail** — full view with prompt note card, all metadata, favorite toggle, variation creation, add to collection
- **Collections** — organize generations into named themed collections

## User preferences

_Populate as needed._

## Gotchas

- After schema changes: run `pnpm --filter @workspace/db run push` then restart the API server workflow
- After OpenAPI spec changes: run `pnpm --filter @workspace/api-spec run codegen` before restarting anything
- Image filenames must match `/^gen_[a-z0-9_]+\.png$/` to be served by the images route
- The `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` are auto-provisioned by Replit — do not modify them

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
