// Builds a static copy of the storefront into dist/ for GitHub Pages.
// PAGES_BASE_PATH is the sub-path the site is served from, for example "/Dimohe".
import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { createStorefront, imagePath } from '../lib/storefront.mjs';
import { merchandise, groups, types } from '../lib/merchandising.mjs';
import { withBase, scriptWithBase } from '../lib/base-path.mjs';

const base = (process.env.PAGES_BASE_PATH || '').replace(/\/+$/, '');
if (base && !/^\/[\w.-]+(\/[\w.-]+)*$/.test(base)) throw new Error(`Invalid PAGES_BASE_PATH: ${base}`);
const out = path.resolve('dist');
const routes = JSON.parse(await fs.readFile('data/routes.json', 'utf8'));
const routeMap = new Map(routes.map(r => [r.route, r.file]));
const products = merchandise(JSON.parse(await fs.readFile('data/products.json', 'utf8')).products);
const snapshot = async route => routeMap.has(route) ? fs.readFile('public' + routeMap.get(route), 'utf8') : null;

// Same collection memberships the server derives from the captured collection pages.
const memberships = new Map();
for (const r of routes.filter(r => /^\/collections\/[^/?]+(?:\?page=\d+)?$/.test(r.route))) {
  const $ = load(await snapshot(r.route));
  const collection = r.route.split('/')[2].split('?')[0];
  if (!memberships.has(collection)) memberships.set(collection, new Set());
  $('#products-container product-card-item').each((i, el) => {
    const handle = $(el).find('a[href*="/products/"]').first().attr('href')?.split('/products/')[1]?.split('?')[0];
    if (handle) memberships.get(collection).add(handle);
  });
}

const storefront = createStorefront(products, memberships, snapshot, { load });
const emptyCart = { items: [], item_count: 0, total_price: 0 };
const collections = new Set(['all', 'table-linen', 'bath-linen', 'hand-bags', ...groups.map(g => g.handle), ...types.map(t => t.handle), ...memberships.keys()]);
const pageRoutes = [
  '/', '/collections', '/search', '/cart', '/checkout', '/account', '/pages/contact',
  ...[...collections].map(h => '/collections/' + h),
  ...products.map(p => '/products/' + p.handle),
  ...routes.map(r => r.route).filter(r => /^\/(pages|policies|blogs)\/[^?]+$/.test(r) && r !== '/pages/contact'),
];

await fs.rm(out, { recursive: true, force: true });
const assets = new Set();
const collectAssets = html => {
  for (const [, url] of html.matchAll(/(?:src|href|data-image|poster)=["'](\/(?:cdn|external)\/[^"'?#]+)/g)) assets.add(url);
  for (const [, set] of html.matchAll(/srcset=["']([^"']+)/g)) for (const part of set.split(',')) { const url = part.trim().split(/\s+/)[0]; if (/^\/(cdn|external)\//.test(url)) assets.add(url.split('?')[0]); }
};
async function writePage(file, html) {
  collectAssets(html);
  html = html
    .replace('<html lang="en">', `<html lang="en" data-base="${base}">`)
    .replace('<script src="/storefront.js" defer></script>', '<script src="/lib/pages-runtime.js" type="module"></script>');
  const target = path.join(out, file);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, withBase(html, base));
}

for (const route of pageRoutes) {
  const html = await storefront.render(new URL(route, 'http://localhost'), emptyCart);
  if (!html) throw new Error(`No page rendered for ${route}`);
  await writePage(route === '/' ? 'index.html' : route.slice(1) + '/index.html', html);
}
const arrow = '<span aria-hidden="true">↗</span>';
await writePage('404.html', storefront.shell('Page not found', `<section class="section empty-state"><p class="eyebrow">DIMOHE</p><h1>Page not found</h1><p>We couldn’t find that page. It may have moved.</p><a class="button" href="/">Continue exploring ${arrow}</a></section>`, emptyCart));

// Catalog data used by search, quick view, the shopping bag, and in-browser filtering.
await fs.mkdir(path.join(out, 'api'), { recursive: true });
await fs.writeFile(path.join(out, 'api/products.json'), JSON.stringify({ products }));
await fs.writeFile(path.join(out, 'api/memberships.json'), JSON.stringify(Object.fromEntries([...memberships].map(([k, v]) => [k, [...v]]))));
for (const p of products) for (const src of [...p.images.map(i => i.src), ...p.variants.map(v => v.featured_image?.src)]) if (src) assets.add(imagePath(src));

// Scripts and styles. Browser modules are published as .js so every host serves a JavaScript MIME type.
for (const name of ['storefront.mjs', 'taxonomy.mjs', 'base-path.mjs', 'pages-runtime.mjs']) {
  const source = await fs.readFile(path.join('lib', name), 'utf8');
  await fs.mkdir(path.join(out, 'lib'), { recursive: true });
  await fs.writeFile(path.join(out, 'lib', name.replace(/\.mjs$/, '.js')), source.replace(/(from '\.\/[\w-]+)\.mjs'/g, "$1.js'"));
}
await fs.writeFile(path.join(out, 'storefront.js'), scriptWithBase(await fs.readFile('public/storefront.js', 'utf8'), base));
const css = await fs.readFile('public/storefront.css', 'utf8');
for (const [, url] of css.matchAll(/url\(['"]?(\/[^'")]+)/g)) assets.add(url.split('?')[0]);
await fs.writeFile(path.join(out, 'storefront.css'), withBase(css, base));

const missing = [];
for (const asset of assets) {
  const relative = '.' + decodeURI(asset), source = path.resolve('public', relative), target = path.resolve(out, relative);
  if (!source.startsWith(path.resolve('public') + path.sep)) continue;
  try { await fs.mkdir(path.dirname(target), { recursive: true }); await fs.copyFile(source, target); }
  catch { missing.push(asset); }
}
if (missing.length) console.warn(`Missing ${missing.length} assets:\n  ${missing.join('\n  ')}`);
console.log(`Built ${pageRoutes.length + 1} pages and ${assets.size - missing.length} assets into dist/ (base path "${base || '/'}")`);
