// Browser runtime for the static GitHub Pages build (scripts/build-pages.mjs). There is no server there,
// so the shopping bag lives in localStorage and filtered collection and search views render in the browser
// with the same storefront code the server uses. It then loads storefront.js, which is unchanged.
import { createStorefront, imagePath } from './storefront.mjs';
import { withBase } from './base-path.mjs';

const base = document.documentElement.dataset.base || '';
const nativeFetch = window.fetch.bind(window);
const bagKey = 'dimohe-bag';
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
let catalogPromise;
const catalog = () => catalogPromise ??= nativeFetch(base + '/api/products.json').then(r => r.json()).then(d => d.products);

function readBag() {
  try { const items = JSON.parse(localStorage.getItem(bagKey)); return Array.isArray(items) ? items.filter(i => i && typeof i.id === 'string' && Number.isInteger(i.quantity)) : []; } catch { return []; }
}
function writeBag(items) { try { localStorage.setItem(bagKey, JSON.stringify(items)); } catch {} }
async function variants() {
  return new Map((await catalog()).flatMap(p => p.variants.map(v => [String(v.id), { product: p, variant: v }])));
}
async function cartJSON(items) {
  const lookup = await variants();
  const lines = items.filter(i => lookup.has(i.id)).map(i => {
    const { product: p, variant: v } = lookup.get(i.id);
    const price = Math.round(Number(v.price) * 100);
    return { id: Number(i.id), key: i.id, variant_id: Number(i.id), product_id: p.id, title: p.title, product_title: p.title, variant_title: v.title, quantity: i.quantity, price, final_price: price, line_price: price * i.quantity, url: `${base}/products/${p.handle}?variant=${i.id}`, image: p.images[0] ? base + imagePath(p.images[0].src) : '' };
  });
  const total = lines.reduce((n, i) => n + i.line_price, 0);
  return { token: 'local', items: lines, item_count: lines.reduce((n, i) => n + i.quantity, 0), total_price: total, original_total_price: total, total_discount: 0, currency: 'USD', requires_shipping: true };
}
// Mirrors the validation of the server's /cart/add and /cart/change endpoints.
async function cartRequest(action, data) {
  const lookup = await variants();
  let items = readBag();
  if (action === 'clear') items = [];
  if (action === 'add') {
    const additions = data.items ?? [{ id: data.id, quantity: data.quantity ?? 1 }];
    if (!Array.isArray(additions) || !additions.length || additions.some(item => !item || typeof item !== 'object')) return json({ status: 422, description: 'Choose at least one available product.' }, 422);
    const quantities = new Map();
    for (const item of additions) {
      const id = String(item.id), record = lookup.get(id), qty = Number(item.quantity ?? 1);
      if (!record || !record.variant.available || !Number.isInteger(qty) || qty < 1 || qty > 99) return json({ status: 422, description: 'Choose an available product and a quantity between 1 and 99.' }, 422);
      quantities.set(id, (quantities.get(id) ?? items.find(i => i.id === id)?.quantity ?? 0) + qty);
      if (quantities.get(id) > 99) return json({ status: 422, description: 'The maximum quantity per product is 99.' }, 422);
    }
    for (const [id, quantity] of quantities) { const existing = items.find(i => i.id === id); if (existing) existing.quantity = quantity; else items.push({ id, quantity }); }
  }
  if (action === 'change') {
    const item = data.line ? items[Number(data.line) - 1] : items.find(i => i.id === String(data.id).split(':')[0]);
    if (!item) return json({ status: 422, description: 'Item not found.' }, 422);
    const quantity = Number(data.quantity);
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) return json({ status: 422, description: 'Invalid quantity.' }, 422);
    item.quantity = quantity;
  }
  items = items.filter(i => i.quantity > 0);
  writeBag(items);
  return json(await cartJSON(items));
}
window.fetch = async (input, init = {}) => {
  const url = new URL(input instanceof Request ? input.url : input, location.href);
  if (url.origin === location.origin && url.pathname.startsWith(base + '/')) {
    const route = url.pathname.slice(base.length);
    const method = (init.method || 'GET').toUpperCase();
    const action = route.match(/^\/cart\/(add|change|clear)(?:\.js)?$/)?.[1];
    try {
      if (route === '/cart.js') return json(await cartJSON(readBag()));
      if (action && method === 'POST') return await cartRequest(action, JSON.parse(init.body || '{}'));
      if (route === '/api/products') return json({ products: await catalog() });
    } catch { return json({ description: 'We couldn’t update your shopping bag. Please try again.' }, 500); }
  }
  return nativeFetch(input, init);
};

const count = readBag().reduce((n, i) => n + i.quantity, 0);
document.querySelectorAll('[data-bag-count]').forEach(el => { el.textContent = count; });

const route = location.pathname.slice(base.length).replace(/\/$/, '') || '/';
const params = new URLSearchParams(location.search);
if ([...params.keys()].length && (route === '/search' || route === '/collections' || route.startsWith('/collections/'))) {
  try {
    const [products, members] = await Promise.all([catalog(), nativeFetch(base + '/api/memberships.json').then(r => r.json())]);
    const storefront = createStorefront(products, new Map(Object.entries(members).map(([k, v]) => [k, new Set(v)])), null);
    const html = await storefront.render(new URL(route + location.search, location.origin), { item_count: count });
    if (html) {
      const doc = new DOMParser().parseFromString(withBase(html, base), 'text/html');
      document.querySelector('#MainContent').replaceWith(doc.querySelector('#MainContent'));
      document.title = doc.title;
    }
  } catch (error) { console.error('Unable to apply filters', error); }
}

await new Promise((resolve, reject) => {
  const script = Object.assign(document.createElement('script'), { src: base + '/storefront.js', onload: resolve, onerror: reject });
  document.head.append(script);
});

// Product pages are pre-rendered with the default variant; select the one named in ?variant=.
const productData = document.getElementById('product-data');
const form = document.querySelector('[data-product-form]');
if (params.has('variant') && productData && form) {
  const product = JSON.parse(productData.textContent);
  const variant = product.variants.find(v => String(v.id) === params.get('variant'));
  let changed;
  for (const o of variant ? product.options : []) {
    const input = [...form.querySelectorAll(`input[name="option${o.position}"]`)].find(i => i.value === variant['option' + o.position]);
    if (input) { input.checked = true; changed = input; }
  }
  changed?.dispatchEvent(new Event('change', { bubbles: true }));
}
