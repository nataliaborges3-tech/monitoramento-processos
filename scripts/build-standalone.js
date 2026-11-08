import { readFile, mkdir, writeFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const html = await read('public/index.html');
const css = await read('public/style.css');
const modules = await Promise.all(['model', 'excel', 'report', 'app'].map(name => read(`public/${name}.js`)));
const script = modules.map(source => source.replace(/^import .*?;\s*$/gm, '').replace(/^export /gm, '')).join('\n');
const standalone = html.replace('<link rel="stylesheet" href="/style.css">', `<style>${css}</style>`)
  .replace('<script type="module" src="/app.js"></script>', () => `<script type="module">${script}</script>`)
  .replace('href="/" aria-label="Página inicial"', 'href="#" aria-label="Página inicial"');
await mkdir(new URL('dist/', root), { recursive: true });
await writeFile(new URL('dist/monitora.html', root), standalone);
console.log('Versão independente gerada em dist/monitora.html. Abra esse arquivo no navegador; não requer servidor.');
