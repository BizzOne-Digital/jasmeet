import sanitizeHtml from "sanitize-html";

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "strong", "em", "u", "s",
      "ul", "ol", "li", "a", "blockquote",
      "span", "div",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      span: ["class"],
      div: ["class"],
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
}

export function stripHtml(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} });
}
