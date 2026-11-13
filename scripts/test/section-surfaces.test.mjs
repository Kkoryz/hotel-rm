import assert from 'node:assert/strict';
import test from 'node:test';
import { tintedSections, tintStyle } from '../lib/section-surfaces.mjs';

const block = (id, type) => ({ id, type });

test('neighbouring plain sections alternate white and tinted; a photo, band or split row starts again', () => {
  // The hotel home after its hero: intro, grid, photo, grid, list, steps, photo, logos, cases, testimonials, related, faq, cta.
  const home = [block('intro', 'text'), block('support', 'featureGrid'), block('media-module-1', 'gallery'), block('more', 'featureGrid'), block('count', 'featureGrid'), block('steps', 'process'), block('media-module-2', 'gallery'), block('logos', 'logos'), block('cases', 'caseStudies'), block('quotes', 'testimonials'), block('related', 'relatedPages'), block('faq', 'faq'), block('cta', 'cta')];
  assert.deepEqual([...tintedSections(home)], ['support', 'count', 'faq']);
});

test('the last of a run stays white before a band of its own, so two grey bands never run together', () => {
  assert.deepEqual([...tintedSections([block('a', 'text'), block('b', 'logos'), block('q', 'testimonials')])], []);
  assert.deepEqual([...tintedSections([block('a', 'text'), block('b', 'logos'), block('c', 'faq'), block('q', 'testimonials')])], ['b']);
});

test('the style tints each section across the page and turns its grey cards white', () => {
  assert.equal(tintStyle(new Set()), '');
  assert.match(tintStyle(new Set(['b'])), /main \[data-block-id="b"\] \{ background: var\(--section-tint\); --surface-secondary: var\(--surface-primary\); \}/);
});

test('a section going on in blocks of its own keeps one surface and does not count in the alternation', () => {
  const blocks = [block('intro', 'text'), { id: 'entries', type: 'featureGrid' }, { id: 'entries-2', type: 'featureGrid', continues: 'entries' }, { id: 'more', type: 'featureGrid', continues: 'entries' }, block('faq', 'faq'), block('cta', 'cta')];
  assert.deepEqual([...tintedSections(blocks)].sort(), ['entries', 'entries-2', 'more']);
});
