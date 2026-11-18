// How questions and answers show. Every FAQ folds, as the competitors' FAQ pages and sections do (owner 2026-11-18: "FAQ
// 也没折叠"), long FAQ blocks included: the four-site audit's open lists (2026-11-17, G3) ran the service pages' FAQs
// open. A question stays the summary's own text (Modern Web Guidance, html.md: a heading inside a <summary> loses its
// heading role); the answers stay in the page's HTML, closed or open, and Site Factory's FAQPage structured data is
// unchanged. Only the open variants (open-list, cards) show every answer, their questions as h3 headings.
// (Hand port of the FAQ part of template integ fa7cbf1 / 65603f1.)

// Questions from which the photo plan measured an FAQ block as an open list (the 2026-11-17 rule). The site's photos
// were placed with that measure; the hand fix of 2026-11-18 folds the FAQs but keeps the measure (faqPlannedOpen), so
// no photo wall or photo moves (owner: only the /our-process/ hero changes).
export const FAQ_OPEN_LIST_ITEMS = 6;

// The site's FAQ page: its page type, its id (site:faq) or its route.
export const isFaqPage = (page) => Boolean(page) && (page.pageType === 'faq' || /(^|:)faq$/.test(String(page.id ?? '')) || /^\/faqs?\/$/.test(String(page.route ?? '')));

// Variants that show every answer already (their questions are headings, never a summary).
const OPEN_VARIANTS = new Set(['open-list', 'cards']);

// Whether the block renders as an open list (FaqBlock.astro): the open variants only.
/** @param {{ items?: unknown[] }} _block @param {string | undefined} variant @param {any} [_page] */
export function faqOpenList(_block, variant, _page = null) {
  return OPEN_VARIANTS.has(String(variant));
}

// Whether the photo plan measures the block as an open list (lib/media-slots.mjs modelVariant): the measure the site's
// photos were placed with, kept.
/** @param {{ items?: unknown[] }} block @param {string | undefined} variant @param {any} [page] */
export function faqPlannedOpen(block, variant, page = null) {
  if (OPEN_VARIANTS.has(String(variant))) return true;
  return isFaqPage(page) || (block.items?.length ?? 0) >= FAQ_OPEN_LIST_ITEMS;
}
