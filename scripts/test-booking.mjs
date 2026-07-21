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
// Le calendrier valide la date au clic ; l'heure se choisit en liste déroulante.
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
// Le sélecteur de retour s'ouvre automatiquement (chaînage départ → retour)
await page.waitForTimeout(400);
await page.waitForSelector('[data-pk-popup="dt"]:not([hidden])');
await page.click('[data-day="2026-12-26"]');
await page.waitForTimeout(300);
await page.selectOption('#res-time-start', '10:00');
await page.selectOption('#res-time-end', '16:30');
await page.waitForTimeout(300);
await shot('step1-trajet');
await page.click('#res-next');
await page.waitForTimeout(500);

// ── Étape 2 : filtre citadines puis choisir la Fiat 500 (28€ basse / 42€ haute)
await page.click('.res-veh-filter[data-filter="citadine"]');
await page.waitForTimeout(300);
await page.click('.res-veh-card[data-veh-id="fiat-500-lounge"]');
await page.waitForTimeout(400);
await shot('step2-vehicule');
const totalStep2 = await page.textContent('#res-summary-total');
console.log('Total après choix véhicule:', totalStep2?.trim(), '(attendu 246,40€)');
await page.click('#res-next');
await page.waitForTimeout(500);

// ── Étape 3 : protection Confort (3€/jour)
await page.click('.res-protection[data-protection="confort"]');
await page.waitForTimeout(400);
await shot('step3-protection');
const totalStep3 = await page.textContent('#res-summary-total');
const protLine = await page.textContent('#res-summary-protection');
console.log('Total avec protection Confort:', totalStep3?.trim(), '(attendu 270,40€) | ligne protection:', protLine?.trim());
await page.click('#res-next');
await page.waitForTimeout(500);

// ── Étape 4 : GPS (5€/jour) + plein prépayé (65€ une fois)
await page.click('.res-extra[data-extra="gps"]');
await page.click('.res-extra[data-extra="plein-prepaye"]');
await page.waitForTimeout(400);
await shot('step4-options');
const totalStep4 = await page.textContent('#res-summary-total');
console.log('Total avec GPS + plein prépayé:', totalStep4?.trim(), '(attendu 375,40€)');
await page.click('#res-next');
await page.waitForTimeout(500);

// ── Étape 5 : vérification (recap) + coordonnées + conditions
const recapText = (await page.textContent('#res-recap'))?.replace(/\s+/g, ' ').trim();
console.log('Recap contient véhicule:', recapText?.includes('Fiat 500 Lounge') ? 'OK' : 'MANQUANT');
console.log('Recap contient protection:', recapText?.includes('Confort') ? 'OK' : 'MANQUANT');
console.log('Recap contient total:', recapText?.includes('375,40€') ? 'OK' : recapText?.slice(-80));
await page.fill('#res-name', 'Jean Test');
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
const cardPrice = await page.textContent('.fleet-grid-item[data-veh-id="fiat-500-lounge"] .v-card-price-amount');
const reserveHref = await page.getAttribute('.fleet-grid-item[data-veh-id="fiat-500-lounge"] [data-v-reserve]', 'href');
const ctxBanner = await page.textContent('#fleet-context-text');
console.log('Liste avec contexte → prix carte Fiat:', cardPrice?.trim(), '(attendu 246,40€)');
console.log('Bandeau:', ctxBanner?.trim());
console.log('Bouton Réserver → réservation directe:', reserveHref?.startsWith('/reservation?vehicule=fiat-500-lounge') ? 'OK' : reserveHref);

// ── Scénario 4 : hero accueil → recherche → arrivée sur la flotte avec contexte
await page.goto(`${base}/`, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.click('#hero-booking [data-pk-date="date-start"]');
await page.waitForSelector('#hero-booking [data-pk-popup="dt"]:not([hidden])');
for (let i = 0; i < 12; i++) {
  const title = (await page.textContent('#hero-booking [data-pk-cal-title]'))?.trim().toLowerCase();
  if (title === 'décembre 2026') break;
  await page.click('#hero-booking [data-pk-next]');
  await page.waitForTimeout(80);
}
await page.click('#hero-booking [data-day="2026-12-18"]');
await page.waitForTimeout(400);
await page.click('#hero-booking [data-day="2026-12-26"]');
await page.waitForTimeout(300);
await page.selectOption('#time-start', '10:00');
await page.selectOption('#time-end', '16:30');
await shot('hero-rempli');
await page.click('#hero-booking .hb-submit');
await page.waitForURL('**/nos-vehicules**', { timeout: 10000 });
await page.waitForTimeout(800);
const heroFlowBanner = await page.textContent('#fleet-context-text').catch(() => null);
console.log('Hero → flotte avec contexte:', heroFlowBanner?.trim() || 'ÉCHEC');

if (errors.length) {
  console.log('ERREURS JS:', errors.join('\n'));
} else {
  console.log('Aucune erreur JS détectée.');
}

await browser.close();
