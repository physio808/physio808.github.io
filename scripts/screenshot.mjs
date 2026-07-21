import { chromium } from 'playwright';

const outDir = process.argv[2] || '.';
const targets = JSON.parse(process.argv[3] || '[]');

const browser = await chromium.launch();

for (const t of targets) {
  const ctx = await browser.newContext({
    viewport: { width: t.width, height: t.height },
    deviceScaleFactor: 1,
    locale: 'fr-FR',
  });
  const page = await ctx.newPage();
  try {
    await page.goto(t.url, { waitUntil: 'networkidle', timeout: 45000 });
  } catch {
    // continue with whatever loaded
  }
  await page.waitForTimeout(1200);

  // Scroll progressively to trigger scroll-reveal animations
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);

  // Force final animation states so full-page capture shows real design
  await page.addStyleTag({
    content: `
      .animate-on-scroll { opacity: 1 !important; transform: none !important; }
      .animate-in { opacity: 1 !important; transform: none !important; }
      *, *::before, *::after { animation-play-state: paused !important; }
    `,
  });
  await page.waitForTimeout(300);

  await page.screenshot({ path: `${outDir}/${t.name}.png`, fullPage: t.fullPage !== false });
  console.log(`captured ${t.name}`);
  await ctx.close();
}

await browser.close();
