import fs from 'node:fs/promises';
import path from 'node:path';
const products = JSON.parse(await fs.readFile('data/products.json', 'utf8')).products;
const routes = JSON.parse(await fs.readFile('data/routes.json', 'utf8'));
let cursor = 0;
await Promise.all(Array.from({ length: 2 }, async () => {
  while (cursor < products.length) {
    const p = products[cursor++];
    const route = '/products/' + p.handle + '?section_id=quick-view';
    const file = '/products/' + p.handle + '/quick-view/index.html';
    let html;
    try { html = await fs.readFile('public' + file, 'utf8'); } catch {}
    if (!html) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const response = await fetch('https://dimohe.com' + route, { signal: AbortSignal.timeout(45000) });
        if (response.ok) { html = await response.text(); break; }
        if (response.status !== 429 || attempt === 4) throw new Error(p.handle + ': ' + response.status);
        const retryAfter = Number(response.headers.get('retry-after')) || 5;
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      }
      await new Promise(resolve => setTimeout(resolve, 250));
    }
    html = html.replaceAll('https://dimohe.com/cdn/', '/cdn/').replaceAll('//dimohe.com/cdn/', '/cdn/');
    html = html.replace(/(href|action)=(['"])https:\/\/dimohe.com([^'"]*)\2/g, '$1=$2$3$2');
    await fs.mkdir(path.dirname('public' + file), { recursive: true });
    await fs.writeFile('public' + file, html);
    if (!routes.some(r => r.route === route)) routes.push({ route, file, title: p.title + ' quick view', kind: 'section' });
    if (cursor % 20 === 0) console.log('Quick views:', cursor);
  }
}));
await fs.writeFile('data/routes.json', JSON.stringify(routes, null, 2));
console.log('Saved all', products.length, 'product quick views.');
