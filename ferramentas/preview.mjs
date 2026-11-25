// Servidor de preview do site, com gzip — o mesmo comportamento de uma CDN.
// Serve site/out/ na porta 4321.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { servir } from './servir.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(AQUI, '..', 'site', 'out');

await servir(OUT, 4321);
console.log(`Preview em http://localhost:4321  (servindo ${OUT})`);
