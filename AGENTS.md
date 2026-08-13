## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Deployment

Static output deployed to Cloudflare Workers assets (`wrangler.jsonc`), built from
`main` by hosted Cloudflare Workers Builds, which redeploys roughly a minute after
each push. The build command there is dashboard config, not tracked in this repo,
so `build` installs its own Chromium rather than depending on that setting;
`build:ci` is kept only as an alias for whichever command the dashboard already
points at.

`rehype-mermaid` renders diagrams through Playwright at build time, and a build
image without Chromium produces posts with empty bodies *while the build still
exits 0* — frontmatter, title and tags all render, so the pages look structurally
fine. `scripts/verify-post-bodies.mjs` turns that into a hard build failure.
Reproduce the failure with
`PLAYWRIGHT_BROWSERS_PATH=/nonexistent npx astro build --force`.

The Chromium install falls back to `playwright install chromium` when
`--with-deps` fails. Cloudflare's image refuses the `--with-deps` half
(`su: Authentication failure`), so the fallback is the path that actually runs
there, not a rare edge case.

`astro build --force` is deliberate, not leftover debugging. The content layer
keys rendered HTML on the markdown digest alone, so a body that rendered empty
— because Chromium was missing, or because the markdown pipeline changed —
stays empty on later builds even once the cause is fixed. Cloudflare restores
its build cache between runs, which makes that poisoned state persist across
deploys. Forcing costs about 0.2s on this site; leaving it off cost a day of
posts serving blank. If a build finishes suspiciously fast (~3s) and the verify
step fails, this is what happened.

Manual deploy of a locally built `dist/`: `pnpm build && npx wrangler deploy`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
