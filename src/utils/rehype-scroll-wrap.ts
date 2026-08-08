import { visit, SKIP } from "unist-util-visit";
import type { Root, Element } from "hast";

/**
 * Wraps wide block elements in scroll containers so they scroll horizontally
 * on small screens instead of shrinking (mermaid SVGs) or stretching the page
 * (tables). Keeping `<table>` at `display: table` preserves its semantics in
 * the accessibility tree; the wrapper div carries the overflow behavior
 * (see the companion styles in typography.css).
 */
export function rehypeScrollWrap() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (!parent || index === undefined) return;

      let wrapperClass: string | undefined;
      if (
        node.tagName === "svg" &&
        String(node.properties?.id ?? "").startsWith("mermaid")
      ) {
        wrapperClass = "mermaid-scroll";
      } else if (node.tagName === "table") {
        wrapperClass = "table-scroll";
      }
      if (!wrapperClass) return;

      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: { className: [wrapperClass] },
        children: [node],
      };
      parent.children[index] = wrapper;
      return SKIP;
    });
  };
}
