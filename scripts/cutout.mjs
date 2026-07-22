/**
 * Détourage des photos véhicules (fond transparent) pour les cartes "studio".
 * Outil ponctuel : les PNG détourés sont déjà versionnés dans public/images/vehicles/.
 * Pour le relancer : npm i -D @imgly/background-removal-node
 */
import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';

const jobs = [
  ['public/images/vehicles/suzuki-swift.jpg', 'public/images/vehicles/cutout-suzuki-swift.png'],
  ['public/images/vehicles/fiat-500.jpg', 'public/images/vehicles/cutout-fiat-500.png'],
  ['public/images/vehicles/kia-stonic.jpg', 'public/images/vehicles/cutout-kia-stonic.png'],
];

for (const [src, out] of jobs) {
  const abs = path.resolve(src);
  console.log('détourage:', src);
  const blob = await removeBackground(`file://${abs.replace(/\\/g, '/')}`);
  fs.writeFileSync(out, Buffer.from(await blob.arrayBuffer()));
  console.log('  ->', out, fs.statSync(out).size, 'octets');
}
console.log('terminé');
