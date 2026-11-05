import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { load } from 'cheerio';
import { gifting, giftingPage, bundlePrice } from '../lib/gifting.mjs';
import { merchandise } from '../lib/merchandising.mjs';
import { withBase } from '../lib/base-path.mjs';

const products=merchandise(JSON.parse(await fs.readFile('data/products.json','utf8')).products);
const html=giftingPage(products),$=load(html);
$('#gifting-title br').replaceWith(' ');
assert.equal($('#gifting-title').text().replace(/\s+/g,' ').trim(),'Gifting');
assert.equal($('.gift-collaboration').length,2);
assert.equal($('.gift-bundle').length,3);
assert.equal($('.gift-bundle-availability').filter((i,e)=>$(e).text()==='Available at launch').length,3);
assert.equal($('.gift-pricing').length,3);
assert.deepEqual($('[data-gift-price]').map((i,e)=>$(e).text()).get(),['$78.03','$41.91','$41.91']);
assert.equal($('.gift-bundle [data-add-button],.gift-bundle form,.gift-bundle [data-card-cart]').length,0);
assert.equal($('.gift-bundle-discover').length,0);
assert.equal($('.gift-collaboration .gift-set-action').text().includes('$'),false);
assert.equal($('.gift-options').length,2);
$('.gift-options').each((i,e)=>assert.deepEqual($(e).find('[data-gift-count]').map((i,b)=>Number($(b).attr('data-gift-count'))).get(),[2,4,6]));
for(const bundle of gifting.bundles){
  assert.ok(products.some(p=>p.handle===bundle.wellness.handle));
  assert.ok(products.some(p=>p.handle===bundle.textile.handle));
  if(bundle.napkinCounts.length)assert.ok(bundle.textile.handle.endsWith('-set-of-6'));
}
for(const image of $('img').toArray()){
  const src=$(image).attr('src');assert.ok(src.startsWith('/'));await fs.access('public'+src);assert.ok($(image).attr('alt'));
}
for(const link of $('a[target="_blank"]').toArray()){
  assert.equal(new URL($(link).attr('href')).protocol,'https:');assert.match($(link).attr('rel'),/noopener/);assert.match($(link).attr('rel'),/noreferrer/);
}
assert.equal($('[href^="https://i.etsystatic.com"]').length,0);
assert.match(withBase(html,'/Dimohe'),/href="\/Dimohe\/collections\/gifts-under-100"/);
assert.equal(/[—–]|--/.test($('body').text()),false);
// Pricing approval does not manufacture a purchasable SKU.
for(const bundle of gifting.bundles){
  const counts=bundle.napkinCounts.length?bundle.napkinCounts:[4];
  for(const count of counts){
    const price=bundlePrice(bundle,count);
    assert.equal(price.priceCents,Math.round(price.totalCents*0.85));
    assert.equal(price.savingCents,price.totalCents-price.priceCents);
    assert.ok(price.priceCents<10000);
    if(bundle.napkinCounts.length)assert.equal(price.priceCents,{2:4191,4:5997,6:7731}[count]);
  }
  assert.equal(bundle.sku,null);
}
assert.throws(()=>bundlePrice(gifting.bundles[1],12),/Missing verified component price/);
console.log('Passed: current-price 15% bundle calculations, all 2/4/6 options, accurate savings and no checkout without real SKUs; sourced photos and safe links.');
