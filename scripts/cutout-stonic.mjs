import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';

const abs = path.resolve('public/images/vehicles/kia-stonic.jpg');
const blob = await removeBackground(`file://${abs.replace(/\\/g, '/')}`);
fs.writeFileSync('public/images/vehicles/cutout-kia-stonic.png', Buffer.from(await blob.arrayBuffer()));
console.log('régénéré', fs.statSync('public/images/vehicles/cutout-kia-stonic.png').size, 'octets');
