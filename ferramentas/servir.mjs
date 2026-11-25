// Servidor do export estático, com gzip — como qualquer CDN serve.
// Sem compressão o Lighthouse mede os bytes crus e infla LCP e TBT em cerca de 3x.
import http from 'node:http';
import zlib from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.woff2': 'font/woff2',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

const COMPRIMIVEL = new Set(['.html', '.js', '.css', '.json', '.txt', '.svg', '.xml']);

export function servir(raizOut, porta) {
  const srv = http.createServer((req, res) => {
    const pedido = decodeURIComponent((req.url || '/').split('?')[0]);
    let arq = path.join(raizOut, pedido);
    if (fs.existsSync(arq) && fs.statSync(arq).isDirectory()) arq = path.join(arq, 'index.html');
    if (!fs.existsSync(arq)) arq = path.join(raizOut, pedido.replace(/\/$/, '') + '.html');
    if (!fs.existsSync(arq)) {
      arq = path.join(raizOut, '404.html');
      res.statusCode = 404;
    }
    if (!fs.existsSync(arq)) { res.writeHead(404); return res.end('404'); }

    const ext = path.extname(arq);
    res.setHeader('content-type', TIPOS[ext] || 'application/octet-stream');
    res.setHeader('cache-control', 'public, max-age=31536000');

    const aceitaGzip = (req.headers['accept-encoding'] || '').includes('gzip');
    if (COMPRIMIVEL.has(ext) && aceitaGzip) {
      res.setHeader('content-encoding', 'gzip');
      fs.createReadStream(arq).pipe(zlib.createGzip({ level: 6 })).pipe(res);
    } else {
      fs.createReadStream(arq).pipe(res);
    }
  });
  return new Promise((r) => srv.listen(porta, () => r(srv)));
}
