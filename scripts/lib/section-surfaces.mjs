// Which sections of a page take the tinted surface, so neighbouring sections read apart (owner 2026-11-12: "模块间的分割
// 好像做的不太好": the hotel home ran five white text sections one under the other, told apart by white space alone,
// where the competitor parts its sections with a photo, a dark or grey band or a panel of grey cards).
//
// A section that parts the page by itself (a photo, a band, a closing call or form, a split row with its photo, the
// testimonials a treatment sets on a band) ends a run; within a run of plain sections every second one is tinted, and
// the last of a run is left white when the section after it is a band of its own (two grey bands would run together).

// The sections that part a page by themselves.
const PARTS = new Set(['figure', 'gallery', 'cta', 'form', 'splitMedia', 'testimonials']);
// Of those, the ones a treatment usually sets on a grey band.
const BANDED = new Set(['testimonials']);
const parts = (block) => PARTS.has(block.type) || String(block.id).startsWith('media-module-');

/** @param {{ id: string, type: string }[]} blocks @returns {Set<string>} the ids of the tinted sections */
export function tintedSections(blocks) {
  const tinted = new Set();
  let run = [];
  const close = (next) => {
    const ids = run.filter((_, index) => index % 2 === 1).map((block) => block.id);
    if (next && BANDED.has(next.type) && ids.at(-1) === run.at(-1)?.id) ids.pop();
    for (const id of ids) tinted.add(id);
    run = [];
  };
  // A section going on in blocks of its own (continues: a long card set in grids of four) is one section: its blocks
  // take the first one's surface and do not count in the alternation.
  const goesOn = (block) => block.continues != null && blocks.some((item) => item.id === block.continues);
  for (const block of blocks) {
    if (goesOn(block)) continue;
    if (parts(block)) close(block);
    else run.push(block);
  }
  close(null);
  for (const block of blocks) if (goesOn(block) && tinted.has(block.continues)) tinted.add(block.id);
  return tinted;
}

// The page's style for its tinted sections: the band across the page, and inside it the cards that were grey on white
// turn white on grey (--surface-secondary inside the band is the page's white).
export function tintStyle(ids) {
  if (!ids.size) return '';
  const selector = [...ids].map((id) => `main [data-block-id="${String(id).replace(/["\\]/g, '')}"]`).join(', ');
  return `main { --section-tint: var(--surface-secondary); } ${selector} { background: var(--section-tint); --surface-secondary: var(--surface-primary); }`;
}
