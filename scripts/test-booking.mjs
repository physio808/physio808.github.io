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

// ── Étape 1 : trajet + dates à cheval sur les deux saisons (18 → 26 déc)
// Calendrier double mois : on sélectionne la plage départ → retour dans la même vue.
await page.click('#res-app [data-pk-open="range"]');
await page.waitForSelector('#res-app [data-pk-popup="range"]:not([hidden])');
for (let i = 0; i < 12; i++) {
  const title = (await page.textContent('#res-app [data-pk-month-title]'))?.trim().toLowerCase();
  if (title?.startsWith('décembre 2026')) break;
  await page.click('#res-app [data-pk-next]');
  await page.waitForTimeout(80);
}
await page.click('[data-day="2026-12-18"]');
await page.waitForTimeout(150);
await shot('popup-calendrier');
await page.click('[data-day="2026-12-26"]');
await page.waitForTimeout(500);
await page.selectOption('#res-time-start', '10:00');
await page.selectOption('#res-time-end', '16:30');
await page.waitForTimeout(300);
await shot('step1-trajet');
await page.click('#res-next');
await page.waitForTimeout(500);

// ── Étape 2 : filtre citadines, clic Fiat 500 → panneau détail → Suivant
await page.click('.res-veh-filter[data-filter="citadine"]');
await page.waitForTimeout(300);
await page.click('.res-veh-card[data-veh-id="fiat-500-lounge"]');
await page.waitForTimeout(400);
const panelVisible = await page.isVisible('#veh-panel:not([hidden])');
const panelPrice = await page.textContent('#veh-panel-price');
await shot('step2-vehicule-panneau');
console.log('Panneau véhicule ouvert:', panelVisible, '| prix panneau:', panelPrice?.replace(/\s+/g, ' ').trim());
const totalStep2 = await page.textContent('#res-summary-total');
console.log('Total après choix véhicule:', totalStep2?.trim(), '(attendu 246,40€)');
await page.click('#veh-panel-next');
await page.waitForTimeout(500);

// ── Étape 3 : protection Intermédiaire (8€/jour → 64€)
await page.click('.res-protection[data-protection="confort"]');
await page.waitForTimeout(400);
await shot('step3-protection');
const totalStep3 = await page.textContent('#res-summary-total');
const protLine = await page.textContent('#res-summary-protection');
console.log('Total avec protection Intermédiaire:', totalStep3?.trim(), '(attendu 310,40€) | ligne protection:', protLine?.trim());
await page.click('#res-next');
await page.waitForTimeout(500);

// ── Étape 4 : GPS (5€/jour → 40€) + plein prépayé (65€ une fois)
await page.click('.res-extra[data-extra="gps"]');
await page.click('.res-extra[data-extra="plein-prepaye"]');
await page.waitForTimeout(400);
await shot('step4-options');
const totalStep4 = await page.textContent('#res-summary-total');
console.log('Total avec GPS + plein prépayé:', totalStep4?.trim(), '(attendu 415,40€)');
await page.click('#res-next');
await page.waitForTimeout(500);

// ── Étape 5 : Revoir (recap) + coordonnées + conditions
const recapText = (await page.textContent('#res-recap'))?.replace(/\s+/g, ' ').trim();
console.log('Recap contient véhicule:', recapText?.includes('Fiat 500 Lounge') ? 'OK' : 'MANQUANT');
console.log('Recap contient protection:', recapText?.includes('Intermédiaire') ? 'OK' : 'MANQUANT');
console.log('Recap contient total:', recapText?.includes('415,40€') ? 'OK' : recapText?.slice(-80));
await page.fill('#res-firstname', 'Jean');
await page.fill('#res-name', 'Test');
await page.fill('#res-email', 'jean.test@example.com');
await page.fill('#res-phone', '0690123456');
await page.check('#res-terms-check');
await page.waitForTimeout(300);
await shot('step5-verification');

// Confirmer
await page.click('#res-next');
await page.waitForTimeout(800);
const successVisible = await page.isVisible('#res-success');
const ref = await page.textContent('#res-ref').catch(() => null);
await shot('step6-success');

console.log('Écran de succès affiché:', successVisible);
console.log('Référence dossier:', ref?.trim());
console.log('Attendu: véhicule 308€ − 61,60€ = 246,40€ ; + Confort 24€ ; + GPS 40€ + plein 65€ = 375,40€');

// ── Scénario 2 : entonnoir rapide — arrivée avec contexte complet → étape 3 (Protection) directe
const ctxQuery = 'vehicule=fiat-500-lounge&pickup=le-gosier&dropoff=aeroport-pole-caraibes&date-start=2026-12-18&time-start=10%3A00&date-end=2026-12-26&time-end=16%3A30';
await page.goto(`${base}/reservation?${ctxQuery}`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const step3Active = await page.isVisible('.res-step[data-step="3"].is-active');
const fastTotal = await page.textContent('#res-summary-total');
const fastAgence = await page.textContent('#res-summary-agence');
const fastDiscount = await page.textContent('#res-summary-discount');
console.log('Entonnoir rapide → étape Protection active:', step3Active, '| total:', fastTotal?.trim(), '(attendu 246,40€) | remise:', fastDiscount?.trim(), '| agence:', fastAgence?.trim());

// ── Scénario 3 : liste véhicules avec contexte → prix totaux + lien direct réservation
await page.goto(`${base}/nos-vehicules?pickup=le-gosier&dropoff=le-gosier&date-start=2026-12-18&time-start=10%3A00&date-end=2026-12-26&time-end=16%3A30`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
const cardQuote = (await page.textContent('.fleet-grid-item[data-veh-id="fiat-500-lounge"] .v-card-quote'))?.replace(/\s+/g, ' ').trim();
const reserveHref = await page.getAttribute('.fleet-grid-item[data-veh-id="fiat-500-lounge"] [data-v-reserve]', 'href');
const ctxBanner = await page.textContent('#fleet-context-text');
console.log('Liste avec dates → devis carte Fiat:', cardQuote, '(doit contenir 246,40€)');
console.log('Bandeau:', ctxBanner?.trim());
console.log('Bouton Réserver → réservation directe:', reserveHref?.startsWith('/reservation?vehicule=fiat-500-lounge') ? 'OK' : reserveHref);

// ── Scénario 4 : hero accueil → recherche → arrivée sur le tunnel étape Véhicule
await page.goto(`${base}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.click('#hero-booking [data-pk-open="range"]');
await page.waitForSelector('#hero-booking [data-pk-popup="range"]:not([hidden])');
for (let i = 0; i < 12; i++) {
  const title = (await page.textContent('#hero-booking [data-pk-month-title]'))?.trim().toLowerCase();
  if (title?.startsWith('décembre 2026')) break;
  await page.click('#hero-booking [data-pk-next]');
  await page.waitForTimeout(80);
}
await page.click('#hero-booking [data-day="2026-12-18"]');
await page.waitForTimeout(200);
await page.click('#hero-booking [data-day="2026-12-26"]');
await page.waitForTimeout(500);
await page.selectOption('#time-start', '10:00');
await page.selectOption('#time-end', '16:30');
await shot('hero-rempli');
await page.click('#hero-booking .hb-submit');
await page.waitForURL('**/reservation**', { timeout: 10000 });
await page.waitForTimeout(1000);
const heroStep2 = await page.isVisible('.res-step[data-step="2"].is-active');
const heroCards = await page.locator('.res-veh-card').count();
console.log('Hero → tunnel étape Véhicule active:', heroStep2, '| cartes affichées:', heroCards);

if (errors.length) {
  console.log('ERREURS JS:', errors.join('\n'));
} else {
  console.log('Aucune erreur JS détectée.');
}

await browser.close();
