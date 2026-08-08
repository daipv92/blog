import {
  defineConfig,
  envField,
  fontProviders,
  svgoOptimizer,
} from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import rehypeCallouts from "rehype-callouts";
import rehypeMermaid from "rehype-mermaid";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { transformerFileName } from "./src/utils/transformers/fileName";
import { rehypeScrollWrap } from "./src/utils/rehype-scroll-wrap";
import config from "./astro-paper.config";

export default defineConfig({
  site: config.site.url,
  integrations: [
    mdx(),
    sitemap({
      filter: page =>
        config.features?.showArchives !== false || !page.endsWith("/archives/"),
    }),
  ],
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkToc,
        [remarkCollapse, { test: "Table of contents" }],
      ],
      rehypePlugins: [
        rehypeCallouts,
        [
          rehypeMermaid,
          {
            // Build-time rendering via Playwright; ships zero mermaid JS to the client.
            strategy: "inline-svg",
            mermaidConfig: {
              // Light-theme colors baked into the SVG; dark mode is handled by
              // CSS overrides in src/styles/typography.css (the theme toggle
              // sets data-theme, so prefers-color-scheme strategies don't work).
              theme: "base",
              // Keep node padding above default so labels never touch borders
              // when the viewer's font metrics differ slightly from build-time.
              flowchart: { padding: 12 },
              themeVariables: {
                // Arial: metrically stable between build-time Chromium and
                // visitors' browsers — avoids clipped node labels.
                fontFamily: "arial, sans-serif",
                primaryColor: "#f2f2f2",
                primaryTextColor: "#242424",
                primaryBorderColor: "#6b6b6b",
                lineColor: "#6b6b6b",
                secondaryColor: "#e8f5e9",
                tertiaryColor: "#ffffff",
                edgeLabelBackground: "#f2f2f2",
              },
            },
          },
        ],
        rehypeScrollWrap,
      ],
    }),
    // Keep Shiki off mermaid fences so rehype-mermaid receives them intact.
    syntaxHighlight: { type: "shiki", excludeLangs: ["mermaid"] },
    shikiConfig: {
      themes: { light: "min-light", dark: "night-owl" },
      defaultColor: false,
      wrap: false,
      transformers: [
        transformerFileName({ style: "v2", hideDot: false }),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationDiff({ matchAlgorithm: "v3" }),
      ],
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  fonts: [
    {
      name: "Google Sans Code",
      cssVariable: "--font-google-sans-code",
      provider: fontProviders.google(),
      fallbacks: ["monospace"],
      weights: [300, 400, 500, 600, 700],
      styles: ["normal", "italic"],
      formats: ["woff", "ttf"],
    },
  ],
  env: {
    schema: {
      PUBLIC_GOOGLE_SITE_VERIFICATION: envField.string({
        access: "public",
        context: "client",
        optional: true,
      }),
    },
  },
  experimental: {
    svgOptimizer: svgoOptimizer(),
  },
});
