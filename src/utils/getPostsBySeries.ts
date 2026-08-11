import type { CollectionEntry } from "astro:content";
import { postFilter } from "./postFilter";

/**
 * Returns the publishable posts of a series, ordered by `seriesOrder`
 * (ascending), falling back to publication date for posts without an
 * explicit order. Drafts and scheduled posts are excluded via `postFilter()`.
 */
export function getPostsBySeries(
  posts: CollectionEntry<"posts">[],
  seriesSlug: string
) {
  return posts
    .filter(postFilter)
    .filter(post => post.data.series === seriesSlug)
    .sort((a, b) => {
      const orderA = a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      if (orderA !== orderB) return orderA - orderB;
      return a.data.pubDatetime.getTime() - b.data.pubDatetime.getTime();
    });
}
