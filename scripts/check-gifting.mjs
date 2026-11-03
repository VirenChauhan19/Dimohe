import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { load } from 'cheerio';
import { gifting, giftingPage } from '../lib/gifting.mjs';
import { merchandise } from '../lib/merchandising.mjs';
import { withBase } from '../lib/base-path.mjs';

const products=merchandise(JSON.parse(await fs.readFile('data/products.json','utf8')).products);
const html=giftingPage(products),$=load(html);
$('#gifting-title br').replaceWith(' ');
assert.equal($('#gifting-title').text().replace(/\s+/g,' ').trim(),'The Art of Giving');
assert.equal($('.gift-collaboration').length,2);
assert.equal($('.gift-bundle').length,3);
assert.equal($('.gift-launch-status').filter((i,e)=>$(e).text()==='Coming soon').length,3);
assert.equal($('.gift-bundle [data-add-button],.gift-bundle form,.gift-bundle [data-card-cart]').length,0);
assert.equal($('.gift-launch-status').text().includes('$'),false);
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
// A price alone, or approval without a real product URL and SKU, cannot create an offer.
const bundle=gifting.bundles[0],original={...bundle};
try{
  Object.assign(bundle,{price:84,approved:true,sku:null,purchaseURL:null});
  assert.equal(load(giftingPage(products))('.gift-launch-status').first().text(),'Coming soon');
  Object.assign(bundle,{sku:'real-bundle',purchaseURL:'/products/daily-pause',price:104});
  assert.equal(load(giftingPage(products))('.gift-launch-status').first().text(),'Coming soon');
}finally{Object.assign(bundle,original);}
console.log('Passed: two sourced collaborations, three gated previews, eligible 2/4/6 napkin options, local photography, safe external links and no unapproved offers.');
