export function sanitizeText(raw: string): string {
  return raw
    // Escape HTML angle brackets → prevent XSS if frontend renders as HTML
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Strip zero-width characters (U+200B, U+FEFF, etc.)
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    // Collapse 3+ consecutive newlines to 2 — prevent wall-of-text spam
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
