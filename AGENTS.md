## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Deployment

Static output deployed to Cloudflare Workers assets (`wrangler.jsonc`), built from
`main`. The hosted build command must be `pnpm run build:ci`, not `pnpm build`:
`rehype-mermaid` renders diagrams through Playwright at build time, and a build
image without Chromium silently produces posts with empty bodies. Use
`playwright install chromium` (no `--with-deps`) if the build image forbids apt.

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
