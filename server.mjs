import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { load } from 'cheerio';

const root = path.resolve('public');
const products = JSON.parse(await fs.readFile('data/products.json', 'utf8')).products;
const routes = JSON.parse(await fs.readFile('data/routes.json', 'utf8'));
const routeMap = new Map(routes.map(r => [r.route, r.file]));
const productMap = new Map(products.map(p => [p.handle, p]));
const variants = new Map(products.flatMap(p => p.variants.map(v => [String(v.id), { product: p, variant: v }])));
const sessions = new Map();
const htmlCache = new Map();
const cards = new Map();
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.mp4': 'video/mp4' };
const escape = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const money = n => '$' + (n / 100).toFixed(2);
const localImage = u => {
  if (!u) return '';
  try {
    const pathname = new URL(u, 'https://dimohe.com').pathname;
    // Catalog JSON uses Shopify's /s/files/... URLs; snapshots use /cdn/shop/files/.
    return pathname.replace(/^\/s\/files\/[^]+\/(files|products)\//, '/cdn/shop/$1/');
  } catch { return u; }
};
async function snapshot(route) {
  const file = routeMap.get(route);
  if (!file) return null;
  if (!htmlCache.has(file)) htmlCache.set(file, await fs.readFile(root + file, 'utf8'));
  return htmlCache.get(file);
}
for (const r of routes.filter(r => /^\/collections\/[^/?]+(?:\?page=\d+)?$/.test(r.route))) {
  const $ = load(await snapshot(r.route));
  $('#products-container product-card-item').each((i, el) => {
    const handle = $(el).find('a[href*="/products/"]').first().attr('href')?.split('/products/')[1]?.split('?')[0];
    if (handle && !cards.has(handle)) cards.set(handle, $.html(el));
  });
}
function card(p) {
  return cards.get(p.handle) ?? `<product-card-item class="product-card-item"><a href="/products/${escape(p.handle)}"><img src="${escape(localImage(p.images[0]?.src ?? ''))}" alt="${escape(p.title)}"><h6>${escape(p.title)}</h6></a><span>${money(Math.round(Number(p.variants[0].price) * 100))}</span></product-card-item>`;
}
function session(req, res) {
  let id = req.headers.cookie?.match(/(?:^|;\s*)dimohe_session=([a-f0-9]{32})/)?.[1];
  if (!id || !sessions.has(id)) {
    id = crypto.randomBytes(16).toString('hex');
    sessions.set(id, { items: [], touched: Date.now() });
    res.setHeader('Set-Cookie', `dimohe_session=${id}; HttpOnly; SameSite=Strict; Path=/`);
  }
  const cart = sessions.get(id); cart.touched = Date.now(); return cart;
}
function cartJSON(cart) {
  const items = cart.items.map(item => {
    const { product: p, variant: v } = variants.get(item.id);
    const price = Math.round(Number(v.price) * 100);
    return { id: Number(item.id), key: item.id, variant_id: Number(item.id), product_id: p.id, title: p.title, product_title: p.title, variant_title: v.title, quantity: item.quantity, price, final_price: price, line_price: price * item.quantity, final_line_price: price * item.quantity, original_line_price: price * item.quantity, url: '/products/' + p.handle + '?variant=' + item.id, image: localImage(p.images[0]?.src ?? ''), featured_image: { url: localImage(p.images[0]?.src ?? ''), alt: p.title }, options_with_values: p.options.map((o, i) => ({ name: o.name, value: v['option' + (i + 1)] })), discounts: [], line_level_discount_allocations: [], properties: {} };
  });
  return { token: 'local', items, item_count: items.reduce((n, i) => n + i.quantity, 0), total_price: items.reduce((n, i) => n + i.line_price, 0), original_total_price: items.reduce((n, i) => n + i.line_price, 0), total_discount: 0, currency: 'USD', requires_shipping: true, cart_level_discount_applications: [], note: '' };
}
function cartContent(cart, page = false) {
  const c = cartJSON(cart);
  if (!c.items.length) return `<div class="drawer-empty-wrapper"><div class="drawer-empty text-align-center"><h5 class="drawer-empty-heading">Your cart is currently empty.</h5><a href="/collections/all" class="button">Continue shopping</a></div></div>`;
  return `<div class="replica-cart-items">${c.items.map(i => `<div class="replica-cart-item"><a href="${escape(i.url)}"><img src="${escape(i.image)}" alt="${escape(i.title)}" width="100" height="120"></a><div><a href="${escape(i.url)}">${escape(i.title)}</a>${i.variant_title !== 'Default Title' ? `<p>${escape(i.variant_title)}</p>` : ''}<p>${money(i.price)}</p><div class="replica-cart-quantity"><button type="button" data-cart-quantity="${i.quantity - 1}" data-variant="${i.id}" aria-label="Decrease ${escape(i.title)}">−</button><span>${i.quantity}</span><button type="button" data-cart-quantity="${i.quantity + 1}" data-variant="${i.id}" aria-label="Increase ${escape(i.title)}">+</button><button type="button" class="replica-remove" data-cart-quantity="0" data-variant="${i.id}">Remove</button></div></div><strong>${money(i.line_price)}</strong></div>`).join('')}</div><div class="replica-cart-footer"><div class="replica-cart-total"><strong>Subtotal</strong><strong>${money(c.total_price)}</strong></div><p>Taxes and <a href="/policies/shipping-policy">shipping</a> calculated at checkout.</p><a href="/checkout" class="button">Check out</a>${page ? '' : '<a href="/cart" class="replica-view-cart">View cart</a>'}</div>`;
}
function hydrateCart($, cart) {
  const c = cartJSON(cart);
  if (c.item_count) {
    $('#cart-drawer-body').removeClass('is-empty').attr('data-cart-count', c.item_count).attr('data-cart-price', c.total_price).html(cartContent(cart));
    $('cart-drawer .drawer-heading [data-item-count]').text('(' + c.item_count + ')');
  }
  $('[data-cart-drawer-btn] [data-item-count]').text(c.item_count).toggleClass('hidden', !c.item_count);
}
async function sections(cart, names) {
  const $ = load(await snapshot('/')); hydrateCart($, cart);
  return Object.fromEntries(String(names || 'cart-drawer').split(',').map(name => [name, $.html($('cart-drawer'))]));
}
async function body(req) {
  const chunks = []; let size = 0;
  for await (const chunk of req) { size += chunk.length; if (size > 1_000_000) throw new Error('Request too large'); chunks.push(chunk); }
  const buffer = Buffer.concat(chunks);
  if (req.headers['content-type']?.includes('application/json')) return JSON.parse(buffer.toString() || '{}');
  const form = await new Request('http://localhost', { method: 'POST', headers: { 'content-type': req.headers['content-type'] || 'application/x-www-form-urlencoded' }, body: buffer }).formData();
  return Object.fromEntries(form);
}
function filterProducts(list, params) {
  const min = params.get('filter.v.price.gte'), max = params.get('filter.v.price.lte');
  list = list.filter(p => (min === null || min === '' || Number(p.variants[0].price) >= Number(min)) && (max === null || max === '' || Number(p.variants[0].price) <= Number(max)));
  const sort = params.get('sort_by');
  if (sort?.startsWith('title-')) list.sort((a, b) => a.title.localeCompare(b.title) * (sort.endsWith('descending') ? -1 : 1));
  if (sort?.startsWith('price-')) list.sort((a, b) => (Number(a.variants[0].price) - Number(b.variants[0].price)) * (sort.endsWith('descending') ? -1 : 1));
  if (sort?.startsWith('created-')) list.sort((a, b) => (new Date(a.created_at) - new Date(b.created_at)) * (sort.endsWith('descending') ? -1 : 1));
  return list;
}
async function collection(html, url) {
  const $ = load(html);
  if (url.searchParams.has('sort_by') || [...url.searchParams.keys()].some(k => k.startsWith('filter.'))) {
    const handles = new Set();
    for (const r of routes.filter(r => r.route === url.pathname || r.route.startsWith(url.pathname + '?page='))) {
      const doc = load(await snapshot(r.route));
      doc('#products-container a[href*="/products/"]').each((i, e) => handles.add(doc(e).attr('href').split('/products/')[1]?.split('?')[0]));
    }
    const list = filterProducts([...handles].map(h => productMap.get(h)).filter(Boolean), url.searchParams);
    $('#product-card-grid').html(list.map(card).join(''));
    $('#facet-product-count span').text(list.length + ' products');
    $('.pagination-wrapper, infinite-scroll').remove();
    $('input[name="sort_by"]').each((i, el) => { $(el).prop('checked', $(el).attr('value') === url.searchParams.get('sort_by')); });
    for (const key of ['filter.v.price.gte', 'filter.v.price.lte']) $(`input[name="${key}"]`).attr('value', url.searchParams.get(key) || '');
    $('.range-slider').each((i, el) => {
      const slider = $(el);
      slider.attr('data-min-value', url.searchParams.get('filter.v.price.gte') || slider.attr('data-min'));
      slider.attr('data-max-value', url.searchParams.get('filter.v.price.lte') || slider.attr('data-max'));
    });
  }
  return $;
}
const server = http.createServer(async (req, res) => {
  const json = (value, status = 200) => { res.writeHead(status, { 'Content-Type': mime['.json'], 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
  const html = (value, status = 200) => { res.writeHead(status, { 'Content-Type': mime['.html'], 'Cache-Control': 'no-store' }); res.end(value); };
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname).replace(/\/$/, '') || '/';
    // Assets never create a cart session. Paths are constrained to the public directory.
    if (/^\/(cdn|external)\//.test(pathname) || /^\/replica.*\.(js|css)$/.test(pathname)) {
      const file = path.resolve(root, '.' + pathname);
      if (!file.startsWith(root + path.sep)) return html('Not found', 404);
      try { const bytes = await fs.readFile(file); res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); return res.end(bytes); } catch { return html('Not found', 404); }
    }
    const cart = session(req, res);
    if (pathname === '/cart.js') return json(cartJSON(cart));
    if (/^\/cart\/(add|change|update|clear)(\.js)?$/.test(pathname) && req.method === 'POST') {
      const data = await body(req); const action = pathname.split('/')[2].replace('.js', '');
      if (action === 'clear') cart.items = [];
      if (action === 'add') {
        const additions = data.items ?? [{ id: data.id, quantity: data.quantity ?? 1 }];
        if (!Array.isArray(additions) || !additions.length || additions.some(item => !item || typeof item !== 'object')) return json({ status: 422, description: 'Choose at least one available product.' }, 422);
        const quantities = new Map();
        for (const item of additions) {
          const id = String(item.id), record = variants.get(id); const qty = Number(item.quantity ?? 1);
          if (!record || !record.variant.available || !Number.isInteger(qty) || qty < 1 || qty > 99) return json({ status: 422, message: 'Cart error', description: 'Choose an available product and a quantity between 1 and 99.' }, 422);
          quantities.set(id, (quantities.get(id) ?? cart.items.find(i => i.id === id)?.quantity ?? 0) + qty);
          if (quantities.get(id) > 99) return json({ status: 422, description: 'The maximum quantity per product is 99.' }, 422);
        }
        for (const [id, quantity] of quantities) { const existing = cart.items.find(i => i.id === id); if (existing) existing.quantity = quantity; else cart.items.push({ id, quantity }); }
      }
      if (action === 'change') { const item = data.line ? cart.items[Number(data.line) - 1] : cart.items.find(i => i.id === String(data.id).split(':')[0]); if (!item) return json({ status: 422, description: 'Item not found.' }, 422); const quantity = Number(data.quantity); if (!Number.isInteger(quantity) || quantity < 0 || quantity > 99) return json({ status: 422, description: 'Invalid quantity.' }, 422); item.quantity = quantity; cart.items = cart.items.filter(i => i.quantity); }
      if (action === 'update') for (const [id, quantity] of Object.entries(data.updates || {})) { const i = cart.items.find(i => i.id === id); if (i && Number.isInteger(Number(quantity)) && Number(quantity) >= 0 && Number(quantity) <= 99) i.quantity = Number(quantity); }
      cart.items = cart.items.filter(i => i.quantity > 0);
      return json({ ...cartJSON(cart), ...(data.sections ? { sections: await sections(cart, data.sections) } : {}) });
    }
    if (pathname === '/api/products') return json({ products });
    if (/^\/products\/[^/]+\.(js|json)$/.test(pathname)) {
      const p = productMap.get(pathname.split('/')[2].replace(/\.(js|json)$/, ''));
      if (!p) return json({ error: 'Not found' }, 404);
      return json(pathname.endsWith('.json') ? { product: p } : { ...p, variants: p.variants.map(v => ({ ...v, price: Math.round(Number(v.price) * 100) })) });
    }
    if (url.searchParams.has('sections')) return json(await sections(cart, url.searchParams.get('sections')));
    if (url.searchParams.get('section_id') === 'cart-drawer') return html((await sections(cart))['cart-drawer']);
    if (pathname === '/search/suggest') {
      const q = (url.searchParams.get('q') || '').trim().toLowerCase();
      const list = q ? products.filter(p => p.title.toLowerCase().includes(q)).slice(0, 8) : [];
      return html(`<div data-result-wrapper><div class="replica-predictive-results">${list.map(p => `<a href="/products/${escape(p.handle)}"><img src="${escape(localImage(p.images[0]?.src))}" width="60" height="70" alt="${escape(p.title)}"><span>${escape(p.title)}<small>${money(Math.round(Number(p.variants[0].price) * 100))}</small></span></a>`).join('') || '<p>No products found.</p>'}<a href="/search?q=${encodeURIComponent(q)}">View all results</a></div></div>`);
    }
    if (pathname === '/recommendations/products') return html('<product-recommendations></product-recommendations>');
    if (pathname === '/localization' && req.method === 'POST') { res.writeHead(303, { Location: req.headers.referer ? new URL(req.headers.referer).pathname : '/' }); return res.end(); }
    if (pathname === '/contact' && req.method === 'POST') return json({ error: 'Contact delivery requires an email service connection. Your message has not been sent.' }, 503);
    let route = pathname.replace(/^\/collections\/[^/]+\/products\//, '/products/');
    const pagination = url.searchParams.get('page');
    if (pagination && routeMap.has(route + '?page=' + pagination)) route += '?page=' + pagination;
    let raw = await snapshot(route);
    if (url.searchParams.get('section_id') === 'quick-view') raw = await snapshot(route + '?section_id=quick-view') || raw;
    if (raw && url.searchParams.has('option_values')) {
      const doc = load(raw);
      const values = url.searchParams.get('option_values').split(',');
      const options = values.map(id => doc(`input[data-option-value-id="${id}"]`).first().attr('value'));
      const p = productMap.get(route.split('/products/')[1]);
      const selected = p?.variants.find(v => options.every((value, i) => value === v['option' + (i + 1)]));
      if (selected) url.searchParams.set('variant', String(selected.id));
    }
    if (!raw && (/^\/account/.test(pathname) || pathname.startsWith('/customer_authentication') || pathname === '/checkout')) {
      const $ = load(await snapshot('/search'));
      const checkout = pathname === '/checkout';
      $('#MainContent').html(`<div class="container section-space replica-service-page"><h1>${checkout ? 'Checkout' : 'Customer account'}</h1><p>${checkout ? 'Secure payment processing' : 'Customer sign-in'} requires a connected Shopify store.</p><p>This local preview does not ${checkout ? 'take payments or place orders' : 'collect passwords'}.</p><a class="button" href="${checkout ? '/cart' : '/'}">${checkout ? 'Return to your bag' : 'Continue shopping'}</a></div>`);
      return html($.html());
    }
    if (!raw) { const $ = load(await snapshot('/search')); $('#MainContent').html('<div class="container section-space replica-service-page"><h1>Page not found</h1><a href="/" class="button">Continue shopping</a></div>'); return html($.html(), 404); }
    // Serve unchanged snapshots for ordinary browsing; only dynamic views need parsing.
    const dynamic = cart.items.length || pathname === '/cart' || pathname === '/search' || url.searchParams.has('variant') || url.searchParams.has('sort_by') || [...url.searchParams.keys()].some(k => k.startsWith('filter.'));
    if (!dynamic) return html(raw);
    const $ = pathname.startsWith('/collections/') ? await collection(raw, url) : load(raw);
    hydrateCart($, cart);
    if (pathname === '/cart' && cart.items.length) $('#MainContent').html(`<div class="container section-space replica-cart-page"><h1>Your shopping bag</h1><div id="replica-cart-page">${cartContent(cart, true)}</div></div>`);
    if (pathname === '/search' && url.searchParams.get('q')) {
      const q = url.searchParams.get('q').slice(0, 200);
      const list = filterProducts(products.filter(p => (p.title + ' ' + p.product_type + ' ' + p.tags.join(' ')).toLowerCase().includes(q.toLowerCase())), url.searchParams);
      $('#MainContent input[name="q"]').attr('value', q);
      $('.search-results-section').html(`<div class="container"><p>${list.length} results for “${escape(q)}”</p><div class="replica-search-grid">${list.map(card).join('')}</div>${list.length ? '' : '<p>Try another search.</p>'}</div>`);
    }
    if (url.searchParams.has('variant')) {
      const record = variants.get(url.searchParams.get('variant'));
      if (record && route === '/products/' + record.product.handle) {
        const v = record.variant;
        const scope = url.searchParams.get('section_id') === 'quick-view' ? '.quickview-body-content' : '#MainContent';
        $(`${scope} input[name="id"]`).attr('value', v.id);
        $(`${scope} input[type="radio"]`).each((i, el) => { if ([v.option1, v.option2, v.option3].includes($(el).attr('value'))) $(el).prop('checked', true); else $(el).prop('checked', false); });
        $(`${scope} [data-product-actual-price]`).text(money(Math.round(Number(v.price) * 100)));
        $(`${scope} [data-addtocart-main]`).prop('disabled', !v.available);
        $(`${scope} [data-addtocart-text]`).text(v.available ? 'Add to cart' : 'Sold out');
        $(`${scope} [data-product-soldout]`).toggleClass('hidden', v.available).text(v.available ? '' : 'Sold out');
        $(`${scope} [selected-option-value]`).each((i, el) => $(el).text(v['option' + ((i % record.product.options.length) + 1)] || v.title));
        $(`${scope} script[data-name="main-product"]`).each((i, el) => {
          let previous = {}; try { previous = JSON.parse($(el).text()); } catch {}
          $(el).text(JSON.stringify({ ...previous, ...v, price: Math.round(Number(v.price) * 100), options: [v.option1, v.option2, v.option3].filter(Boolean) }));
        });
      }
    }
    const sectionId = url.searchParams.get('section_id');
    const section = sectionId ? $('[id]').filter((i, el) => $(el).attr('id') === 'shopify-section-' + sectionId) : null;
    return html(section?.length ? $.html(section) : $.html());
  } catch (error) { console.error(error.message); json({ error: 'Unable to complete the request.' }, 500); }
});
const port = Number(process.env.PORT || 3000);
server.listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Dimohe replica: http://localhost:${port} (${routes.length} pages, ${products.length} products)`));
setInterval(() => { for (const [id, cart] of sessions) if (Date.now() - cart.touched > 7 * 86400000) sessions.delete(id); }, 3600000).unref();
