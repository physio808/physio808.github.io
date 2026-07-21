import { chromium } from 'playwright';

const outDir = process.argv[2] || '.';

const browser = await chromium.launch();

for (const [name, width, height] of [['home-popup-loc', 1440, 900], ['home-popup-loc-mobile', 390, 844]]) {
  const ctx = await browser.newContext({ viewport: { width, height }, locale: 'fr-FR' });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.click('#booking-widget [data-pk-open="loc"]');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${outDir}/${name}.png` });
  console.log(`captured ${name}`);
  await ctx.close();
}

await browser.close();
