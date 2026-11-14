import assert from 'node:assert/strict';
import test from 'node:test';

import { measureDensity } from '../lib/density.mjs';

// 1x1 PNG for the photos.
const PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

test('a photo under the header counts for the part of it below the header, not for nothing', async () => {
  // hotel-rm's home and hhmhotels.com's: the header lies over the hero photo, which starts above the header's foot. The
  // measure counted only photos wholly below it, so the hero (a third of the home's pictures) counted for nothing.
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
    await page.setContent(`<!doctype html><body style="margin:0">
      <header style="position:absolute;top:0;left:0;right:0;height:100px">Site</header>
      <main>
        <img src="${PIXEL}" style="display:block;width:1000px;height:800px">
        <div style="height:1100px"><p style="margin:0">Text under the hero.</p></div>
      </main>
      <footer style="height:100px">Footer</footer>
    </body>`);
    const density = await measureDensity(page);
    assert.equal(density.contentHeight, 1800);
    // 700px of the 800px photo lie between the header's foot (100) and the footer (1900): 700 / 1800.
    assert.equal(density.photoAreaPct, 39);
    assert.equal(density.images, 1);
  } finally {
    await browser.close();
  }
});
