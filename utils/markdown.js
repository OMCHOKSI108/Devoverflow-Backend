import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

/**
 * Convert Markdown text to sanitized HTML.
 * Keeps basic formatting and code blocks, strips scripts/styles.
 */
export function markdownToHtml(markdown) {
    if (!markdown || typeof markdown !== 'string') return '';
    // Convert markdown to HTML
    const rawHtml = marked.parse(markdown);
    // Sanitize the HTML to remove dangerous tags/attributes
    const clean = sanitizeHtml(rawHtml, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'title']
        }
    });
    return clean;
}
