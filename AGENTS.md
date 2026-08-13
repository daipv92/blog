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
`--with-deps` fails, since that flag needs apt/sudo which some build images
forbid. If a hosted build fails at the verify step, Chromium launched but
rendered nothing — check the install output at the top of the build log.

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
