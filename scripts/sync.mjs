import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const origin = 'https://dimohe.com';
const root = path.resolve('public');
await fs.mkdir(root, { recursive: true });
const pages = new Map();
const assets = new Map();
const failures = [];
const unescape = s => s.replaceAll('&amp;', '&').replaceAll('&#39;', "'");
const assetFile = u => u.hostname === 'dimohe.com' ? u.pathname : '/external/' + crypto.createHash('sha256').update(u.origin + u.pathname).digest('hex').slice(0, 16) + '/' + u.pathname.split('/').pop();
const isAsset = u => /\.(css|js|mjs|png|jpe?g|webp|avif|gif|svg|woff2?|ttf|otf|mp4|webm|ico)$/i.test(u.pathname);
function localURL(raw, base = origin) {
  if (raw.startsWith('#')) return raw;
  if (/^\/replica(?:-bootstrap)?\.(js|css)$/.test(raw)) return raw;
  try {
    const u = new URL(unescape(raw), base);
    if (!['https:', 'http:'].includes(u.protocol)) return raw;
    if (isAsset(u) && (u.hostname === 'dimohe.com' || u.hostname === 'anahataorganic.com' || /shopifycdn\.com$|cdn\.shopify\.com$/.test(u.hostname))) {
      const dest = assetFile(u);
      if (!assets.has(dest)) {
        if (/\/cdn\/shop\/files\//.test(u.pathname) && /\.(png|jpe?g|webp|avif)$/i.test(u.pathname)) {
          u.searchParams.delete('height'); u.searchParams.delete('crop'); u.searchParams.set('width', '2000');
        }
        assets.set(dest, u.href);
      }
      return dest;
    }
    if (u.hostname === 'dimohe.com') return u.pathname + u.search + u.hash;
  } catch {}
  return raw;
}
async function download(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(45000), headers: { 'User-Agent': 'Dimohe-local-replica/1.0', 'Accept-Language': 'en-US,en;q=0.9' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r;
    } catch (e) {
      if (attempt === 3) throw e;
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}
function transform(html, pageURL) {
  // Shopify's injected hosted-service scripts are replaced with a local bootstrap.
  html = html.replace(/<script>window\.performance[^]*?shopify\.content_for_header\.start[^]*?<script id="shopify-cfh-end">[^]*?<\/script>/, `<script src="/replica-bootstrap.js"></script>`);
  html = html.replace(/<script\b([^>]*)>([^]*?)<\/script>/gi, (full, attrs, body) => {
    const src = attrs.match(/src=["']([^"']+)/i)?.[1];
    if (src) return /\/cdn\/shop\/t\/\d+\/assets\//.test(src) || src === '/replica-bootstrap.js' ? full : '';
    if (/jdgm|Judge\.me|ShopifyAnalytics|webPixels|monorail|shopify-perf|Shopify\.PaymentButton\.init|initShopCartSync|shop-follow-button/.test(body)) return '';
    return full;
  });
  html = html.replace(/\s(integrity|nonce)=("[^"]*"|'[^']*')/gi, '');
  html = html.replace(/\b(src|href|action|poster)=("|')([^"']*)\2/gi, (full, key, quote, value) => `${key}=${quote}${localURL(value, pageURL)}${quote}`);
  html = html.replace(/\bsrcset=("|')([^"']*)\1/gi, (full, quote, value) => `srcset=${quote}${value.split(',').map(part => { const [url, ...size] = part.trim().split(/\s+/); return [localURL(url, pageURL), ...size].join(' '); }).join(', ')}${quote}`);
  html = html.replace(/url\((['"]?)([^)'"\s]+)\1\)/gi, (full, q, value) => `url(${q}${localURL(value, pageURL)}${q})`);
  html = html.replaceAll('https://dimohe.com/cdn/', '/cdn/').replaceAll('http://dimohe.com/cdn/', '/cdn/').replaceAll('//dimohe.com/cdn/', '/cdn/');
  html = html.replace('</head>', '<link rel="stylesheet" href="/replica.css?v=4"><script src="/replica.js?v=4" defer></script></head>');
  return html;
}
const sitemap = await (await download(origin + '/sitemap.xml')).text();
const sitemaps = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => unescape(m[1])).filter(u => !u.includes('agentic'));
for (const url of sitemaps) {
  const xml = await (await download(url)).text();
  for (const m of xml.matchAll(/<loc>(.*?)<\/loc>/g)) {
    const u = new URL(unescape(m[1])); pages.set(u.pathname, u.href);
  }
}
for (const route of ['/', '/cart', '/search', '/collections', '/collections/all', '/policies/privacy-policy', '/policies/refund-policy', '/policies/shipping-policy', '/policies/terms-of-service']) pages.set(route, origin + route);
const catalog = await (await download(origin + '/products.json?limit=250')).json();
await fs.mkdir('data', { recursive: true });
await fs.writeFile('data/products.json', JSON.stringify(catalog, null, 2));
let completed = 0;
const pageRecords = [];
const seen = new Set();
async function pool(entries, workers, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: workers }, async () => { while (i < entries.length) { const entry = entries[i++]; await fn(entry); } }));
}
while ([...pages.keys()].some(key => !seen.has(key))) {
  const pending = [...pages].filter(([key]) => !seen.has(key));
  await pool(pending, 5, async ([route, url]) => {
    seen.add(route);
    try {
      const raw = await (await download(url)).text();
      for (const m of raw.matchAll(/href=["']([^"']+)["']/g)) {
        try {
          const u = new URL(unescape(m[1]), url);
          if (u.hostname !== 'dimohe.com') continue;
          if (/^\/(products|collections|pages|blogs|policies)(\/|$)/.test(u.pathname) && !/\.(atom|oembed)$/.test(u.pathname)) {
            // Collection-scoped product paths are served by the canonical product snapshot.
            if (/\/products\//.test(u.pathname) && u.pathname.startsWith('/collections/')) continue;
            const pagination = u.searchParams.get('page');
            const key = u.pathname + (pagination ? '?page=' + pagination : '');
            if (!pages.has(key)) pages.set(key, origin + key);
          }
        } catch {}
      }
      const html = transform(raw, url);
      const file = route === '/' ? '/index.html' : route.replace(/\?page=(\d+)/, '/page-$1') + '/index.html';
      await fs.mkdir(path.dirname(root + file), { recursive: true });
      await fs.writeFile(root + file, html);
      pageRecords.push({ route, file, title: raw.match(/<title>([^]*?)<\/title>/i)?.[1].trim() ?? route });
      if (++completed % 10 === 0) console.log(`Pages: ${completed}/${pages.size}; assets found: ${assets.size}`);
    } catch(e) { failures.push({ url, error: e.message }); }
  });
}
console.log(`Saved ${completed} pages. Downloading ${assets.size} assets.`);
const assetSeen = new Set();
let assetCount = 0;
while ([...assets.keys()].some(key => !assetSeen.has(key))) {
  const pending = [...assets].filter(([key]) => !assetSeen.has(key));
  await pool(pending, 8, async ([dest, url]) => {
    assetSeen.add(dest);
    try {
      const r = await download(url);
      let buffer = Buffer.from(await r.arrayBuffer());
      if (/\.(css|js|mjs)$/i.test(dest)) {
        let text = buffer.toString('utf8');
        if (dest.endsWith('/header.js')) text = text.replace('function(subMenu){subMenuWrapper.classList.remove("open")}', 'function(subMenu){subMenu.classList.remove("open")}');
        if (dest.endsWith('.css')) text = text.replace(/url\((['"]?)([^)'"\s]+)\1\)/gi, (full, q, value) => value.startsWith('data:') ? full : `url(${q}${localURL(value, url)}${q})`);
        // Preserve relative module imports and download the dependencies.
        for (const m of text.matchAll(/(?:from\s*|import\s*\()['"](\.[^'"]+\.js(?:\?[^'"]*)?)['"]/g)) localURL(m[1], url);
        buffer = Buffer.from(text);
      }
      await fs.mkdir(path.dirname(root + dest), { recursive: true });
      await fs.writeFile(root + dest, buffer);
      if (++assetCount % 100 === 0) console.log(`Assets: ${assetCount}/${assets.size}`);
    } catch (e) { failures.push({ url, error: e.message }); }
  });
}
await fs.writeFile('data/routes.json', JSON.stringify(pageRecords.sort((a, b) => a.route.localeCompare(b.route)), null, 2));
await fs.writeFile('data/sync-report.json', JSON.stringify({ source: origin, syncedAt: new Date().toISOString(), pages: pageRecords.length, assets: assetCount, products: catalog.products.length, failures }, null, 2));
console.log(`Done: ${pageRecords.length} pages, ${assetCount} assets, ${failures.length} failures.`);
if (failures.length) console.log(JSON.stringify(failures, null, 2));
