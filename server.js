import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
export const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  } catch { res.writeHead(404).end('Arquivo não encontrado'); }
});
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(Number(process.env.PORT) || 3000, '0.0.0.0', () => console.log(`Monitoramento disponível na porta ${server.address().port}`));
}
