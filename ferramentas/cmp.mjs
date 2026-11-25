import sharp from 'sharp';
const o = process.argv[2], g = process.argv[3], out = process.argv[4];
const A = await sharp(o).resize(620).jpeg({ quality: 88 }).toBuffer();
const B = await sharp(g).resize(620).jpeg({ quality: 88 }).toBuffer();
const m = await sharp(A).metadata();
const rot = (t, x) => ({ input: Buffer.from(`<svg width="620" height="34"><rect width="620" height="34" fill="#0D1A14"/><text x="10" y="24" font-family="monospace" font-size="18" fill="#DEA96A">${t}</text></svg>`), left: x, top: 0 });
await sharp({ create: { width: 1248, height: m.height + 34, channels: 3, background: '#0D1A14' } })
  .composite([{ input: A, left: 0, top: 34 }, { input: B, left: 628, top: 34 }, rot('ORIGINAL', 0), rot('COM GRADACAO', 628)])
  .jpeg({ quality: 88 }).toFile(out);
console.log('ok');
