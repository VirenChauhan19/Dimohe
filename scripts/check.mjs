import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
import { merchandise, groups, types } from '../lib/merchandising.mjs';
import { crafts } from '../lib/editorial.mjs';
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
const renderedAssets=new Set();
await Promise.all(Array.from({ length: 5 }, async () => {
  while (cursor < routes.length) {
    const route = routes[cursor++];
    const response = await fetch(base + route.route);
    assert.equal(response.status, 200, route.route);
    const rendered=await response.text();
    assert.match(rendered, route.kind === 'section' ? /quickview-body-content/ : /id="MainContent"/, route.route);
    const doc=load(rendered);
    doc('img[src],script[src],link[rel="stylesheet"][href]').each((i,el)=>{const asset=doc(el).attr('src')||doc(el).attr('href');if(asset?.startsWith('/'))renderedAssets.add(asset.split('?')[0]);});
  }
}));
console.log(`Passed: ${routes.length} pages and ${localLinks.size} local asset references.`);
for(const asset of renderedAssets) await fs.access(path.resolve('public','.'+asset));
console.log(`Passed: ${renderedAssets.size} rendered image/script/style assets exist locally.`);
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
assert.match(await search.text(), /Results for/);
const filtered = load(await (await fetch(base + '/collections/home-furnishing?sort_by=price-ascending&filter.v.price.lte=120')).text());
const values = filtered('#product-card-grid [data-product-handle]').map((i, el) => {
  const handle = filtered(el).attr('data-product-handle');
  return Math.min(...products.find(p => p.handle === handle).variants.map(v=>Number(v.price)));
}).get();
assert.ok(values.length > 0);
assert.ok(values.every(n => n <= 120));
assert.deepEqual(values, [...values].sort((a, b) => a - b));
assert.equal(filtered('input[name="filter.v.price.lte"]').val(), '120', 'The applied price filter must be retained');
console.log('Passed: cart add/change/remove, invalid variant handling, cart totals, search, sorting, and price filtering.');
const variable = products.find(p => new Set(p.variants.map(v => v.price)).size > 1);
const selected = variable.variants.at(-1);
const variantHTML = load(await (await fetch(base + '/products/' + variable.handle + '?variant=' + selected.id)).text());
assert.equal(variantHTML('#MainContent [data-product-actual-price]').first().text().trim(), '$' + Number(selected.price).toFixed(2));
assert.equal(variantHTML('#MainContent input[name="id"]').first().val(), String(selected.id));
for (const product of products.filter(p => p.variants.some(v => !v.available))) {
  const soldOut = product.variants.find(v => !v.available);
  const doc = load(await (await fetch(base + '/products/' + product.handle + '?variant=' + soldOut.id)).text());
  assert.ok(doc('#MainContent [data-add-button]').first().is('[disabled]'));
  assert.match(doc('#MainContent [data-add-button]').first().text().trim(), /^Sold out/);
  assert.equal((await api('/cart/add.js', { id: soldOut.id, quantity: 1 })).status, 422);
}
console.log('Passed: selected product variant updates the displayed price and form variant ID.');
const enriched=merchandise(products);
assert.equal(enriched.find(p=>p.handle==='sage-botanica-3-layer-throw').merch.primaryMaterial,'muslin cotton','Packaging prose must not be mistaken for product material');
assert.equal(enriched.find(p=>p.handle==='lavender-bloom-3-layer-throw').merch.primaryMaterial,'','Missing material specifications must not be invented');
assert.equal(enriched.find(p=>p.handle==='cypress-grove-round-tote').merch.group,'bags','Everyday totes belong with bags');
assert.equal(enriched.find(p=>p.handle==='cypress-grove-round-tote').merch.optionLabels[1],'Shape','A bag shape is not a size');
assert.deepEqual(enriched.find(p=>p.handle==='gulnaar-floral-linen-cushion-cover-earth-brown').merch.materials,['linen']);
const groupCounts={};
for(const group of groups){
  const doc=load(await (await fetch(base+'/collections/'+group.handle)).text());
  const expected=enriched.filter(p=>p.merch.group===group.id).map(p=>p.handle).sort();
  const actual=doc('#product-card-grid [data-product-handle]').map((i,el)=>doc(el).attr('data-product-handle')).get().sort();
  assert.deepEqual(actual,expected,group.name);
  groupCounts[group.name]=expected.length;
}
assert.equal(Object.values(groupCounts).reduce((a,b)=>a+b,0),88);
for(const type of types){
  const doc=load(await (await fetch(base+'/collections/'+type.handle)).text());
  assert.equal(doc('#product-card-grid [data-product-handle]').length,enriched.filter(p=>p.merch.type===type.handle).length,type.name);
}
for(const field of ['material','color','size']){
  const values=enriched.flatMap(p=>p.merch[field==='material'?'materials':field==='color'?'colors':'sizes']);
  const value=values[0];
  const doc=load(await (await fetch(base+'/collections/all?'+new URLSearchParams({[field]:value}))).text());
  const expected=enriched.filter(p=>p.merch[field==='material'?'materials':field==='color'?'colors':'sizes'].includes(value)).map(p=>p.handle).sort();
  assert.deepEqual(doc('#product-card-grid [data-product-handle]').map((i,el)=>doc(el).attr('data-product-handle')).get().sort(),expected,field);
  assert.equal(doc('select[name="'+field+'"]').val(),value);
}
console.log('Passed: all 88 products categorized once, all 23 subcategories, and material/color/size filters.',groupCounts);
for(const craft of crafts){
  const response=await fetch(base+'/collections/'+craft.handle);
  assert.equal(response.status,200);
  const doc=load(await response.text());
  const actual=doc('#product-card-grid [data-product-handle]').map((i,el)=>doc(el).attr('data-product-handle')).get().sort();
  const expected=enriched.filter(p=>p.merch.crafts.includes(craft.id)).map(p=>p.handle).sort();
  assert.ok(expected.length>0);
  assert.deepEqual(actual,expected,craft.name);
}
assert.ok(!enriched.find(p=>p.handle==='the-desert-pearl-pochette').merch.crafts.includes('chikankari'),'Zardozi alone must not imply Chikankari');
assert.ok(enriched.find(p=>p.handle==='the-moonlight-pearl-pochette').merch.crafts.includes('chikankari'));
const renamed=enriched.find(p=>p.handle==='boy-dhola-maru-embroidery-bundy-set-beige');
assert.notEqual(renamed.title,renamed.merch.originalTitle);
const line=(await api('/cart/add.js',{id:renamed.variants.find(v=>v.available).id,quantity:1})).value.items[0];
assert.equal(line.title,renamed.title,'Editorial names must be consistent in the cart');
await api('/cart/clear.js',{});
const craftPage=await fetch(base+'/pages/our-craft');assert.equal(craftPage.status,200);assert.match(await craftPage.text(),/Our craft traditions/);
console.log('Passed: all three craft collections, evidence-based craft assignments, consistent editorial cart names, and craft story page.');
const {chapters,curatedCollections,editHandles}=await import('../lib/commerce.mjs');
for(const chapter of chapters){const response=await fetch(base+'/pages/chapter-'+chapter.slug);assert.equal(response.status,200);const doc=load(await response.text());assert.ok(doc('h1').text().includes(chapter.title));assert.equal(doc('[data-product-handle]').length,Math.min(8,enriched.filter(chapter.match).length));}
for(const collection of curatedCollections){const doc=load(await(await fetch(base+'/collections/'+collection.handle)).text());assert.deepEqual(doc('#product-card-grid [data-product-handle]').map((i,e)=>doc(e).attr('data-product-handle')).get().sort(),enriched.filter(collection.match).map(p=>p.handle).sort());}
const home=load(await(await fetch(base+'/')).text());assert.equal(home('[data-product-handle]').length,8);assert.deepEqual(home('[data-product-handle]').map((i,e)=>home(e).attr('data-product-handle')).get().sort(),[...editHandles].sort());
for(const p of enriched){const doc=load(await(await fetch(base+'/products/'+p.handle)).text());const graph=JSON.parse(doc('script[type="application/ld+json"]').text())['@graph'];const schema=graph.find(x=>x['@type']==='Product');assert.equal(schema.name,p.title);assert.deepEqual(schema.offers.map(v=>v.price),p.variants.map(v=>Number(v.price)));assert.equal(doc('.craft-passport').length,1);if(p.merch.group==='wellness'){assert.doesNotMatch(doc('#MainContent').text(),/hair growth|hair loss|anti.dandruff|treats|cures/i);}if(p.merch.group==='bags'){assert.doesNotMatch(doc('.prose').text(),/wooden block|hand.chiseled/i);}}
const altair=enriched.find(p=>p.handle==='the-altair-bijou-clutch');assert.ok(!altair.merch.passport.some(([key])=>key==='Place of making'),'Tradition is not workshop evidence');
const chips=load(await(await fetch(base+'/collections/hand-block-printing?craft=block-printing&filter.v.price.gte=20')).text());assert.ok(chips('.selected-filters a').length>=2);
assert.equal((await fetch(base+'/pages/saved-pieces')).status,200);
console.log('Passed: four chapters, six curated collections, eight-piece edit, all product schemas and passports, wellness claims, craft boilerplate cleanup, selected filters, and wishlist page.');

const {brandFilm}=await import('../lib/commerce.mjs');
assert.equal(home('video[data-brand-film]').length,1);
assert.equal(home('video source').attr('src'),brandFilm.src);
assert.equal(home('video').attr('preload'),'metadata');
assert.ok(home('video').is('[controls][playsinline]'));
assert.ok(home('video').is('[muted][data-autoplay]'));assert.equal(home('[data-film-toggle]').length,1);
assert.ok(home('.film-section').index()>home('.edit-section').index());
assert.ok(home('.film-section').index()<home('.chapter-panel').first().index());
assert.ok(home('.desktop-nav a[href="/blogs/news"]').length);
console.log('Passed: original film source, accessible inline controls, muted viewport autoplay configuration, editorial placement, and journal navigation.');

const filmSize=(await fs.stat('public'+brandFilm.src)).size;
const filmHead=await fetch(base+brandFilm.src,{method:'HEAD'});assert.equal(filmHead.status,200);assert.equal(Number(filmHead.headers.get('content-length')),filmSize);assert.equal(filmHead.headers.get('content-type'),'video/mp4');assert.equal(filmHead.headers.get('set-cookie'),null);
for(const [range,length] of [['bytes=0-511',512],['bytes=-32',32]]){const response=await fetch(base+brandFilm.src,{headers:{Range:range}});assert.equal(response.status,206);assert.equal((await response.arrayBuffer()).byteLength,length);assert.ok(response.headers.get('content-range').endsWith('/'+filmSize));}
assert.equal((await fetch(base+brandFilm.src,{headers:{Range:'bytes='+filmSize+'-'}})).status,416);
console.log('Passed: film metadata, byte-range seeking, suffix requests, invalid ranges, and no cart cookie for video requests.');
