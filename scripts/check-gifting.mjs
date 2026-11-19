import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { load } from 'cheerio';
import { gifting, giftingPage, bundlePrice, giftOrderPrice } from '../lib/gifting.mjs';
import { merchandise } from '../lib/merchandising.mjs';
import { createStorefront } from '../lib/storefront.mjs';
import { withBase } from '../lib/base-path.mjs';
const products=merchandise(JSON.parse(await fs.readFile('data/products.json','utf8')).products);
const html=giftingPage(products),$=load(html);
assert.equal($('#gifting-title').text(),'Gifts');
assert.equal($('.gift-collaboration').length,2);
assert.equal($('.gift-bundle').length,8);
assert.equal($('.gift-category-section').length,4);
assert.deepEqual(gifting.tiers.map(t=>[t.minCents,t.percent]),[[0,25],[25000,30],[35000,35],[55000,40]]);
for(const [cents,percent] of [[0,0],[1,25],[24999,25],[25000,30],[34999,30],[35000,35],[54999,35],[55000,40],[100000,40]])assert.equal(giftOrderPrice(cents).discountPercent,percent);
assert.throws(()=>giftOrderPrice(-1));assert.throws(()=>giftOrderPrice(1.1));
assert.equal($('[data-gift-list-add]').length,8);assert.equal($('#gift-order').length,1);
// Combined orders use a single tier on the undiscounted total.
assert.deepEqual(giftOrderPrice(25800+16600),{totalCents:42400,priceCents:27560,savingCents:14840,discountPercent:35});
assert.deepEqual($('.gift-set-price').map((i,e)=>$(e).text()).get(),['$59.50','$59.50']);
assert.equal(/etsy/i.test(html),false);
assert.equal($('.gift-bundle form,.gift-bundle [data-card-cart]').length,0);
assert.equal($('.gift-enquire').length,2);
const expected={'willow-table':{2:18060,4:19810,6:21490},'dinner-table':{fixed:29640},'rose-table':{2:4350,4:6225,6:8025},'bath-routine':{fixed:12450},'daily-pause':{fixed:8100},'hair-routine':{fixed:6450},'living-room':{fixed:24505},'living-collection':{fixed:38700}};
for(const bundle of gifting.bundles){
 const counts=bundle.napkinCounts.length?bundle.napkinCounts:['fixed'];
 for(const count of counts){
  const price=bundlePrice(bundle,count);
  assert.equal(price.priceCents,expected[bundle.id][count]);
  assert.equal(price.priceCents,Math.round(price.totalCents*(100-price.discountPercent)/100));
  assert.equal(price.savingCents,price.totalCents-price.priceCents);
 }
 for(const item of bundle.items){
  const p=products.find(p=>p.handle===item.handle);assert.ok(p,`Missing ${item.handle}`);
  const displayedPrice=Math.round(Number(p.variants[0].price)*100);
  assert.equal(displayedPrice,item.prices?item.prices[6]:item.priceCents,`Product page price differs for ${item.handle}`);
 }
 assert.equal(bundle.purchaseURL,null);
}
assert.throws(()=>bundlePrice(gifting.bundles[0],12),/Missing verified component price/);
for(const image of $('img').toArray()){
 const src=$(image).attr('src');assert.ok(src.startsWith('/'));await fs.access('public'+src);assert.ok($(image).attr('alt'));
}
// Similar sets must not reuse the same selected product photographs.
for(const [first,second] of [['willow-table','dinner-table'],['living-room','living-collection']]){
 const sources=id=>$(`[data-gift-bundle="${id}"] .gift-pairing-photo img`).map((i,e)=>$(e).attr('src')).get();
 const left=sources(first),right=sources(second);assert.ok(left.length&&right.length);
 assert.equal(left.some(src=>right.includes(src)),false,'Duplicate photography in neighbouring sets');
}
const giftSets=[...gifting.bundles,...gifting.collaborations];
assert.equal(new Set(giftSets.map(g=>g.image)).size,10,'Each gift set has its own supplied photograph');
assert.equal($('.gift-box-photo img').length,8);
assert.equal($('.gift-hero-photo img').attr('src'),gifting.collaborations[0].image);
for(const gift of giftSets){
 assert.match(gift.image,/^\/media\/gifts\/[\w-]+\.jpg$/);
 const bytes=await fs.readFile('public'+gift.image);
 assert.equal(bytes.readUInt16BE(0),0xffd8,'Gift photograph must be a JPEG');
 assert.ok(gift.width>0&&gift.height>0);
}
for(const bundle of gifting.bundles){
 assert.ok(bundle.description.split(/\s+/).length<=25,'Gift description should stay concise');
}
for(const link of $('a').toArray())assert.ok(!$(link).attr('href').includes('undefined'));
assert.match(withBase(html,'/Dimohe'),/href="\/Dimohe\/collections\/gifts-under-100"/);
assert.equal(/[—–]|--/.test($('body').text()),false);
const store=createStorefront(products,new Map(),async()=>null,{load});
const shell=load(store.shell('Gifts',html,{items:[],item_count:0,total_price:0}));
for(const root of ['.desktop-nav','#mobile-navigation']){
 assert.equal(shell(root+' .nav-primary[href="/pages/gifting"]').text(),'Gifts');
 assert.equal(shell(root+' > a[href="/collections/gifts-under-100"]').length,0);
 assert.equal(shell(root+' > a[href="/pages/gifting"]').length,0);
 assert.equal(shell(root+' .nav-room a[href="/collections/gifts-under-100"]').length,1);
}
console.log('Passed: eight curated bundles, tier boundaries and rounding, one combined order discount, current component prices, gift enquiry controls, no Etsy checkout, unified Gifts menu and local images.');
