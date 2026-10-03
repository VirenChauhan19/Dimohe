import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { load } from 'cheerio';
const routes = JSON.parse(await fs.readFile('data/routes.json', 'utf8'));
const assets = new Map();
for (const r of routes) {
  const html = await fs.readFile('public' + r.file, 'utf8');
  const doc = load(html);
  doc('[src]').each((i, e) => {
    const source = doc(e).attr('src');
    if (/^(https?:|\/\/)/.test(source)) {
      const u = new URL(source, 'https://dimohe.com');
      if (u.hostname !== 'anahataorganic.com') throw new Error('Unexpected asset host');
      assets.set(source, '/external/' + crypto.createHash('sha256').update(u.origin + u.pathname).digest('hex').slice(0, 16) + '/' + u.pathname.split('/').pop());
    }
  });
}
for (const [source, file] of assets) {
  const response = await fetch(new URL(source, 'https://dimohe.com'), { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error('Asset download failed: ' + response.status);
  await fs.mkdir(path.dirname('public' + file), { recursive: true });
  await fs.writeFile('public' + file, Buffer.from(await response.arrayBuffer()));
  console.log('Saved', file);
}
for (const r of routes) {
  let html = await fs.readFile('public' + r.file, 'utf8');
  for (const [source, file] of assets) html = html.split(source).join(file);
  await fs.writeFile('public' + r.file, html);
}
// The source references a missing decorative arrow; provide its local equivalent.
const styles = await fs.readdir('public/cdn/shop/t/6/assets');
for (const name of styles.filter(s => s.endsWith('.css'))) {
  const css = await fs.readFile('public/cdn/shop/t/6/assets/' + name, 'utf8');
  for (const match of css.matchAll(/url\(["']?(\/external\/[^)'"\s]*down-arrow\.svg)["']?\)/g)) {
    await fs.mkdir(path.dirname('public' + match[1]), { recursive: true });
    await fs.writeFile('public' + match[1], '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 8"><path d="m1 1 5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>');
  }
}
