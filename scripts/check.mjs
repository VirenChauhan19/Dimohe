import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
const base = process.env.CHECK_URL || 'http://localhost:3000';
const routes = JSON.parse(await fs.readFile('data/routes.json', 'utf8'));
const products = JSON.parse(await fs.readFile('data/products.json', 'utf8')).products;
const missing = new Set();
const localLinks = new Set();
const external = new Set();
for (const route of routes) {
  const doc = load(await fs.readFile('public' + route.file, 'utf8'));
  doc('[src],[href],[poster]').each((i, element) => {
    for (const attr of ['src', 'href', 'poster']) {
      const u = doc(element).attr(attr);
      if (!u) continue;
      if (/^\/(cdn|external)\//.test(u)) localLinks.add(u.split('?')[0]);
      if (attr === 'src' && /^(https?:|\/\/)/.test(u)) external.add(u);
    }
  });
}
for (const file of localLinks) { try { await fs.access(path.resolve('public', '.' + file)); } catch { missing.add(file); } }
console.log('Missing assets:', [...missing]);
console.log('External assets:', [...external]);
assert.equal(missing.size, 0, 'All referenced images, scripts, and styles must exist locally');
assert.equal(external.size, 0, 'Page scripts and images must load locally');
let cursor = 0;
await Promise.all(Array.from({ length: 5 }, async () => {
  while (cursor < routes.length) {
    const route = routes[cursor++];
    const response = await fetch(base + route.route);
    assert.equal(response.status, 200, route.route);
    assert.match(await response.text(), route.kind === 'section' ? /quickview-body-content/ : /id="MainContent"/, route.route);
  }
}));
console.log(`Passed: ${routes.length} pages and ${localLinks.size} local asset references.`);
let cookie = '';
async function api(route, data) {
  const response = await fetch(base + route, { method: data ? 'POST' : 'GET', headers: { ...(data ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
  cookie = response.headers.get('set-cookie')?.split(';')[0] || cookie;
  return { status: response.status, value: await response.json() };
}
const available = products.find(p => p.variants.some(v => v.available));
const variant = available.variants.find(v => v.available);
const cart = await api('/cart/add.js', { id: variant.id, quantity: 2, sections: 'cart-drawer' });
assert.equal(cart.status, 200);
assert.equal(cart.value.item_count, 2);
assert.equal(cart.value.total_price, Math.round(Number(variant.price) * 100) * 2);
assert.match(cart.value.sections['cart-drawer'], /Shopping bag/);
assert.doesNotMatch(cart.value.sections['cart-drawer'], /What are you looking for/);
assert.equal((await api('/cart.js')).value.item_count, 2);
assert.equal((await api('/cart/change.js', { id: variant.id, quantity: 1 })).value.item_count, 1);
assert.equal((await api('/cart/change.js', { id: variant.id, quantity: 0 })).value.item_count, 0);
assert.equal((await api('/cart/add.js', { id: 'invalid', quantity: 1 })).status, 422);
for (const quantity of [0, -1, 1.5, 100]) assert.equal((await api('/cart/add.js', { id: variant.id, quantity })).status, 422);
assert.equal((await api('/cart/add.js', { items: [{ id: variant.id }] })).value.item_count, 1);
assert.equal((await api('/cart/add.js', { items: [{ id: variant.id, quantity: 99 }] })).status, 422);
assert.equal((await api('/cart.js')).value.item_count, 1, 'Rejected additions must not change the cart');
await api('/cart/clear.js', {});
const imageUrls = new Set();
for (const product of products) {
  const added = await api('/cart/add.js', { id: product.variants.find(v => v.available).id, quantity: 1 });
  assert.equal(added.status, 200);
  imageUrls.add(added.value.items.at(-1).image);
}
for (const image of imageUrls) {
  const response = await fetch(base + image);
  assert.equal(response.status, 200, image);
  assert.match(response.headers.get('content-type'), /^image\//, image);
}
await api('/cart/clear.js', {});
console.log(`Passed: all ${products.length} product cart images and cart quantity validation.`);
const search = await fetch(base + '/search?q=cushion');
assert.match(await search.text(), /results for/);
const filtered = load(await (await fetch(base + '/collections/home-furnishing?sort_by=price-ascending&filter.v.price.lte=120')).text());
const values = filtered('#product-card-grid product-card-item').map((i, el) => {
  const handle = filtered(el).find('a[href*="/products/"]').first().attr('href').split('/products/')[1].split('?')[0];
  return Number(products.find(p => p.handle === handle).variants[0].price);
}).get();
assert.ok(values.length > 0);
assert.ok(values.every(n => n <= 120));
assert.deepEqual(values, [...values].sort((a, b) => a - b));
assert.equal(filtered('.range-slider').attr('data-max-value'), '120', 'Slider initialization must preserve the applied price filter');
console.log('Passed: cart add/change/remove, invalid variant handling, cart totals, search, sorting, and price filtering.');
const variable = products.find(p => new Set(p.variants.map(v => v.price)).size > 1);
const selected = variable.variants.at(-1);
const variantHTML = load(await (await fetch(base + '/products/' + variable.handle + '?variant=' + selected.id)).text());
assert.equal(variantHTML('#MainContent [data-product-actual-price]').first().text().trim(), '$' + Number(selected.price).toFixed(2));
assert.equal(variantHTML('#MainContent input[name="id"]').first().val(), String(selected.id));
for (const product of products.filter(p => p.variants.some(v => !v.available))) {
  const soldOut = product.variants.find(v => !v.available);
  const doc = load(await (await fetch(base + '/products/' + product.handle + '?variant=' + soldOut.id)).text());
  assert.ok(doc('#MainContent [data-addtocart-main]').first().is('[disabled]'));
  assert.equal(doc('#MainContent [data-addtocart-text]').first().text().trim(), 'Sold out');
  assert.equal((await api('/cart/add.js', { id: soldOut.id, quantity: 1 })).status, 422);
}
console.log('Passed: selected product variant updates the displayed price and form variant ID.');
