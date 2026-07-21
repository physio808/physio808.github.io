import { chromium } from 'playwright';

const outDir = process.argv[2] || '.';
const base = process.argv[3] || 'http://localhost:4321';

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'fr-FR',
});
const page = await ctx.newPage();

const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});

await page.goto(`${base}/reservation`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

const shot = (name) => page.screenshot({ path: `${outDir}/${name}.png`, fullPage: false });

// ── Étape 1 : trajet + dates à cheval sur les deux saisons (18 → 26 déc), via les popups
await page.click('[data-pk-date="res-date-start"]');
await page.waitForSelector('[data-pk-popup="dt"]:not([hidden])');
for (let i = 0; i < 12; i++) {
  const title = (await page.textContent('[data-pk-cal-title]'))?.trim().toLowerCase();
  if (title === 'décembre 2026') break;
  await page.click('[data-pk-next]');
  await page.waitForTimeout(80);
}
await shot('popup-calendrier');
await page.click('[data-day="2026-12-18"]');
await page.click('[data-time="10:00"]');
// Le sélecteur de retour s'ouvre automatiquement (chaînage départ → retour)
await page.waitForTimeout(400);
await page.waitForSelector('[data-pk-popup="dt"]:not([hidden])');
await page.click('[data-day="2026-12-26"]');
await page.click('[data-time="16:30"]');
await page.waitForTimeout(300);
await shot('step1-trajet');
await page.click('#res-next');
await page.waitForTimeout(500);

// ── Étape 2 : choisir la Fiat 500 (28€ basse / 42€ haute)
await page.click('.res-veh-card[data-veh-id="fiat-500-lounge"]');
await page.waitForTimeout(400);
await shot('step2-vehicule');
const totalStep2 = await page.textContent('#res-summary-total');
console.log('Total après choix véhicule:', totalStep2?.trim());
await page.click('#res-next');
await page.waitForTimeout(500);

// ── Étape 3 : ajouter le GPS (5€/jour)
await page.click('.res-extra[data-extra="gps"]');
await page.waitForTimeout(400);
await shot('step3-options');
const totalStep3 = await page.textContent('#res-summary-total');
console.log('Total avec GPS:', totalStep3?.trim());
await page.click('#res-next');
await page.waitForTimeout(500);

// ── Étape 4 : coordonnées + conditions
await page.fill('#res-name', 'Jean Test');
await page.fill('#res-email', 'jean.test@example.com');
await page.fill('#res-phone', '0690123456');
await page.check('#res-terms-check');
await page.waitForTimeout(300);
await shot('step4-confirmation');

// Confirmer
await page.click('#res-next');
await page.waitForTimeout(800);
const successVisible = await page.isVisible('#res-success');
const ref = await page.textContent('#res-ref').catch(() => null);
await shot('step5-success');

console.log('Écran de succès affiché:', successVisible);
console.log('Référence dossier:', ref?.trim());
console.log('Durée affichée attendue: 8 jours · 10:00 → 16:30');
console.log('Attendu: véhicule 308€ − remise 20% (61,60€) = 246,40€ ; + GPS 40€ = total 286,40€');

// ── Scénario 2 : entonnoir rapide — arrivée avec contexte complet → étape 3 directe
const ctxQuery = 'vehicule=fiat-500-lounge&pickup=le-gosier&dropoff=aeroport-pole-caraibes&date-start=2026-12-18&time-start=10%3A00&date-end=2026-12-26&time-end=16%3A30';
await page.goto(`${base}/reservation?${ctxQuery}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const step3Active = await page.isVisible('.res-step[data-step="3"].is-active');
const fastTotal = await page.textContent('#res-summary-total');
const fastAgence = await page.textContent('#res-summary-agence');
const fastDiscount = await page.textContent('#res-summary-discount');
console.log('Entonnoir rapide → étape 3 active:', step3Active, '| total:', fastTotal?.trim(), '(attendu 246,40€) | remise:', fastDiscount?.trim(), '| agence:', fastAgence?.trim());

// ── Scénario 3 : liste véhicules avec contexte → prix totaux + lien direct réservation
await page.goto(`${base}/nos-vehicules?pickup=le-gosier&dropoff=le-gosier&date-start=2026-12-18&time-start=10%3A00&date-end=2026-12-26&time-end=16%3A30`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const cardPrice = await page.textContent('.fleet-grid-item[data-veh-id="fiat-500-lounge"] .v-card-price-amount');
const cardDeal = await page.textContent('.fleet-grid-item[data-veh-id="fiat-500-lounge"] .v-card-deal');
const reserveHref = await page.getAttribute('.fleet-grid-item[data-veh-id="fiat-500-lounge"] [data-v-reserve]', 'href');
const detailHref = await page.getAttribute('.fleet-grid-item[data-veh-id="fiat-500-lounge"] .v-card-actions [data-v-detail]', 'href');
const ctxBanner = await page.textContent('#fleet-context-text');
console.log('Liste avec contexte → prix carte Fiat:', cardPrice?.trim(), '(attendu 246,40€) | détail:', cardDeal?.trim());
console.log('Bandeau:', ctxBanner?.trim());
console.log('Bouton Réserver → réservation directe:', reserveHref?.startsWith('/reservation?vehicule=fiat-500-lounge') ? 'OK' : reserveHref);
console.log('Bouton Voir le véhicule → fiche avec contexte:', detailHref?.includes('date-start=2026-12-18') ? 'OK' : detailHref);

// ── Scénario 4 : fiche véhicule avec contexte → total affiché + CTA complet
await page.goto(`${base}/nos-vehicules/fiat-500-lounge?pickup=le-gosier&dropoff=le-gosier&date-start=2026-12-18&time-start=10%3A00&date-end=2026-12-26&time-end=16%3A30`, { waitUntil: 'networkidle' });
await page.waitForTimeout(600);
const vdTotal = await page.textContent('#vd-context-total');
const vdCtaHref = await page.getAttribute('.vd-cta', 'href');
console.log('Fiche avec contexte → encart total:', vdTotal?.trim());
console.log('CTA fiche → dates conservées:', vdCtaHref?.includes('date-start=2026-12-18') ? 'OK' : vdCtaHref);

if (errors.length) {
  console.log('ERREURS JS:', errors.join('\n'));
} else {
  console.log('Aucune erreur JS détectée.');
}

await browser.close();
