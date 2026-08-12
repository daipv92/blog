/**
 * Fails the build when a rendered post has an empty or near-empty article body.
 *
 * The content layer caches renders keyed on the markdown digest alone, so a
 * pipeline or schema change can leave a post whose frontmatter still resolves
 * (title, date, tags all render) while `<Content />` emits nothing. That
 * produces a page which looks structurally fine and is trivial to miss by eye,
 * so it is checked here against the emitted HTML rather than trusted.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const POSTS_DIR = join("dist", "posts");
// Long enough to catch a body-less render, short enough that a genuinely
// brief post still passes.
const MIN_BODY_LENGTH = 200;
const ARTICLE_OPEN = /<article[^>]*id="article"[^>]*>/;

/** Collects every index.html under a directory tree. */
function findPages(dir) {
  const pages = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      pages.push(...findPages(path));
    } else if (entry === "index.html") {
      pages.push(path);
    }
  }
  return pages;
}

/** Returns the article body length, or null when the page has no article. */
function bodyLength(html) {
  const open = ARTICLE_OPEN.exec(html);
  if (!open) return null;
  const end = html.indexOf("</article>", open.index + open[0].length);
  if (end === -1) return null;
  return end - (open.index + open[0].length);
}

let pages;
try {
  pages = findPages(POSTS_DIR);
} catch {
  console.error(`verify-post-bodies: no build output at ${POSTS_DIR}`);
  process.exit(1);
}

const failures = [];
let checked = 0;

for (const page of pages) {
  const length = bodyLength(readFileSync(page, "utf8"));
  // Pages without an article element are the paginated post listings, not
  // post detail pages, so they are outside this check.
  if (length === null) continue;
  checked++;
  if (length < MIN_BODY_LENGTH) failures.push({ page, length });
}

if (failures.length > 0) {
  console.error("verify-post-bodies: empty article body in built output:");
  for (const { page, length } of failures) {
    console.error(`  ${page} (${length} chars)`);
  }
  console.error(
    "\nThe markdown source is probably fine; the render is not. Rebuild with " +
      "`astro build --force` to discard the stale content-layer cache."
  );
  process.exit(1);
}

console.log(`verify-post-bodies: ${checked} post(s) have a rendered body`);
