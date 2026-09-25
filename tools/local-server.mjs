import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
const port = Number(process.env.PORT || 8000);
const host = process.env.HOST || '127.0.0.1';
const types = {
  '.css': 'text/css; charset=utf-8', '.csv': 'text/csv; charset=utf-8',
  '.html': 'text/html; charset=utf-8', '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg', '.jpg': 'image/jpeg', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.map': 'application/json; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.pdf': 'application/pdf',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp', '.woff': 'font/woff', '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }
  let target = resolve(root, `.${pathname}`);
  if (target !== root && !target.startsWith(root + sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const details = await stat(target);
    if (details.isDirectory()) target = resolve(target, 'index.html');
    await access(target);
    const headers = {
      'Content-Type': types[extname(target).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache',
    };
    if (req.method === 'HEAD') {
      res.writeHead(200, headers).end();
      return;
    }
    res.writeHead(200, headers);
    createReadStream(target).on('error', () => {
      if (!res.headersSent) res.writeHead(500);
      res.end('Server error');
    }).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});

server.on('error', (error) => {
  console.error(error.code === 'EADDRINUSE'
    ? `A porta ${port} já está em uso. Feche o servidor antigo ou defina PORT para outra porta.`
    : `Não foi possível iniciar o servidor: ${error.message}`);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`Painel MMS disponível em http://localhost:${port}/admin/`);
  console.log('Mantenha este servidor aberto durante o uso do painel.');
});
