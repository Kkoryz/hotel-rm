import assert from 'node:assert/strict';
import test from 'node:test';
import { protectedOverrides, siteLayoutNote } from '../lib/protected-rules.mjs';

test('a site rule that undoes a template layout decision is found; others are left', () => {
  // The hotel site's style-board repair: the competitor's fixed photo and top alignment, and a button pinned to a band's foot.
  const css = `
.block--split[data-variant="single"] .split__media { aspect-ratio: 1.27; }
@media (min-width: 900px) {
  main .block--split[data-variant="single"] .split[data-layout="split"] > .split__media-set { align-self: start; }
  .block--split[data-variant="single"] .split { grid-template-columns: minmax(0, 1fr) minmax(0, 462px); align-items: start; }
}
.block--cta[data-variant="image-band"] .cta__content > .button--primary { position: absolute; bottom: 0; }
.page-hero .button { position: relative; }
.split__copy { color: red; }`;
  assert.deepEqual(protectedOverrides(css).map((item) => item.property), ['aspect-ratio', 'align-self', 'align-items', 'position']);
  assert.deepEqual(protectedOverrides('.button { position: relative; }'), [], 'a button placed relative keeps its flow');
});

test('every review and repair hears the site\'s own layout rules (owner 2026-11-14: "从源头解决")', async () => {
  const { siteRules } = await import('../lib/protected-rules.mjs');
  const { readFile } = await import('node:fs/promises');
  const rules = siteRules({ headingAlign: 'start' });
  assert.match(rules, /^- every section heading starts on the content's left edge/);
  assert.match(rules, /\n- a split row's photo runs its copy's height/);
  assert.match(rules, /\n- a title and every heading are sized by the template to their own words/);
  assert.match(rules, /widths, heights, column counts and line lengths are not copied as fixed values/);
  assert.doesNotMatch(siteRules({}), /starts on the content's left edge/);
  assert.match(siteLayoutNote({}), /^the site's own layout rules, not to be copied from the competitor: a split row's photo/);
  // The review and both repairs are given them, and none is told to make our module look like the competitor's.
  for (const prompt of ['design-review', 'repair-design', 'repair-audits']) {
    const text = await readFile(new URL(`../../config/agent-steps/${prompt}.md`, import.meta.url), 'utf8');
    assert.match(text, /\{\{siteRules\}\}/, `${prompt} hears the site rules`);
    assert.doesNotMatch(text, /make our module look like the competitor's|development placeholders/, prompt);
  }
});

test("a repair's declarations that undo a template decision are taken out by code; the rest of the sheet stays", async () => {
  const { stripProtected } = await import('../lib/protected-rules.mjs');
  const { css, removed } = stripProtected('.a{color:red}\n@media (min-width:1024px){ .block .split__media { align-self: start; color: blue } }\n.cta .button { position: absolute; top: 0 }\n.split { align-items: start }\n.x .button{position:relative}\n');
  assert.deepEqual(removed.map((item) => item.property), ['align-self', 'position', 'align-items']);
  assert.equal(css, '.a{color:red}\n@media (min-width:1024px){ .block .split__media { color: blue } }\n.cta .button { top: 0 }\n\n.x .button{position:relative}\n');
  assert.deepEqual(stripProtected('.a{color:red}').removed, []);
});

test("the owner's waivers keep their answer when a review is written anew: a waived finding holds nothing", async () => {
  const { applyWaivers, judgeReviews, openFindings } = await import('../design-review.mjs');
  const findings = [{ block: 'split-1', review: 'home', severity: 'P1', issue: 'Photo is not top-aligned like the competitor' }, { block: 'cta', review: 'home', severity: 'P1', issue: 'Button colour' }];
  const waived = applyWaivers(findings, [{ block: 'split-1', issue: 'top-aligned', why: 'our split rows centre short copy', by: 'owner', at: '2026-11-12' }]);
  assert.match(waived[0].resolution, /^waived: our split rows centre short copy/);
  assert.equal(waived[1].resolution, undefined);
  assert.deepEqual(openFindings(waived).map((finding) => finding.block), ['cta']);
  const review = { shots: 's', rules: 'r', source: 'x', findings: [findings[0]] };
  const page = { key: 'home', pageType: 'home', route: '/', shots: 's', rules: 'r', source: 'x' };
  const judged = judgeReviews({ pages: [page] }, { home: review }, [{ block: 'split-1', why: 'w', by: 'o', at: 'd' }]);
  assert.equal(judged.findings[0].resolution?.startsWith('waived'), true);
});

test("a title's fitted size is the template's: a site rule setting it or the hero title's font size is taken out", async () => {
  const { stripProtected } = await import('../lib/protected-rules.mjs');
  const { css, removed } = stripProtected('main .page-hero__copy { --heading-fit: 4rem; --hero-copy-max: 56rem; }\nmain .post-header__title { --heading-fit: 4rem; font-size: 4rem; font-weight: 700 }\n.page-hero h1 { font-size: 72px; color: red }\n.feature-card h3 { font-size: 20px }\n');
  assert.deepEqual(removed.map((item) => item.property), ['--heading-fit', '--heading-fit', 'font-size', 'font-size']);
  assert.equal(css, 'main .page-hero__copy { --hero-copy-max: 56rem; }\nmain .post-header__title { font-weight: 700 }\n.page-hero h1 { color: red }\n.feature-card h3 { font-size: 20px }\n');
});

test("every input of a title's fit is the template's: a site rule raising its floor is taken out", async () => {
  const { stripProtected } = await import('../lib/protected-rules.mjs');
  const { css, removed } = stripProtected('@media (min-width: 1024px) { main .post-header__inner[data-heading-fit] { --fit-above: 2.8125rem; } .x { --fit-min-desktop: 40px; color: red } }');
  assert.deepEqual(removed.map((item) => item.property), ['--fit-above', '--fit-min-desktop']);
  assert.equal(css, '@media (min-width: 1024px) {  .x { color: red } }');
});
