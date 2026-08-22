## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Deployment

Static output deployed to Cloudflare Workers assets (`wrangler.jsonc`) by
`.github/workflows/deploy.yml`, which builds every push to `main` on
`ubuntu-latest` and then runs `wrangler deploy`. Cloudflare's own git
integration is disconnected on purpose — do not reconnect it.

`rehype-mermaid` renders diagrams through Playwright at build time, and a build
image where Chromium cannot launch produces posts with empty bodies *while the
build still exits 0* — frontmatter, title and tags all render, so the pages look
structurally fine. `scripts/verify-post-bodies.mjs` turns that into a hard build
failure. Reproduce the failure with
`PLAYWRIGHT_BROWSERS_PATH=/nonexistent npx astro build --force`.

That is why the deploy moved off hosted Cloudflare Workers Builds. Its image
refuses the `--with-deps` half of the Chromium install
(`su: Authentication failure`), and `--with-deps` is the half that installs the
shared libraries Chromium needs. The bare `playwright install chromium` fallback
downloads a binary that cannot launch, so every post with a mermaid fence
rendered empty and every hosted build failed at the verify step. There is no
root in that container, so the libraries cannot be installed there; the GitHub
runner has passwordless sudo and completes the same command.

`astro build --force` is deliberate, not leftover debugging. The content layer
keys rendered HTML on the markdown digest alone, so a body that rendered empty
— because Chromium was missing, or because the markdown pipeline changed —
stays empty on later builds even once the cause is fixed. Any builder that
restores a cache between runs makes that poisoned state persist across
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
