import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const RAIZ = path.resolve(process.cwd(), '..');
const srv = http.createServer((req, res) => {
  res.setHeader('access-control-allow-origin', '*');
  if (req.method !== 'POST') { res.writeHead(200); return res.end('ok'); }
  let b = '';
  req.on('data', (c) => (b += c));
  req.on('end', () => {
    fs.writeFileSync(path.join(RAIZ, 'entrada', 'instagram', 'coleta-logada.json'), b);
    console.log('recebido:', Math.round(b.length / 1024), 'KB');
    res.writeHead(200); res.end('ok');
    setTimeout(() => process.exit(0), 300);
  });
});
srv.listen(4500, () => console.log('aguardando em 4500...'));
setTimeout(() => { console.log('tempo esgotado'); process.exit(1); }, 120000);
