import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { load } from 'cheerio';
import { gifting, giftingPage, bundlePrice } from '../lib/gifting.mjs';
import { merchandise } from '../lib/merchandising.mjs';
import { createStorefront } from '../lib/storefront.mjs';
import { withBase } from '../lib/base-path.mjs';
const products=merchandise(JSON.parse(await fs.readFile('data/products.json','utf8')).products);
const html=giftingPage(products),$=load(html);
assert.equal($('#gifting-title').text(),'Gifts');
assert.equal($('.gift-collaboration').length,2);
assert.equal($('.gift-bundle').length,6);
assert.equal($('.gift-category-section').length,4);
assert.equal(gifting.discountPercent,10);
assert.deepEqual($('.gift-set-price').map((i,e)=>$(e).text()).get(),['$59.50','$59.50']);
assert.equal(/etsy/i.test(html),false);
assert.equal($('.gift-bundle form,.gift-bundle [data-card-cart]').length,0);
assert.equal($('.gift-enquire').length,8);
const expected={'willow-table':{2:9869,4:11781,6:13617},'rose-table':{2:4437,4:6350,6:8186},'bath-routine':{fixed:6656},'daily-pause':{fixed:8262},'hair-routine':{fixed:6579},'living-room':{fixed:20502}};
for(const bundle of gifting.bundles){
 const counts=bundle.napkinCounts.length?bundle.napkinCounts:['fixed'];
 for(const count of counts){
  const price=bundlePrice(bundle,count);
  assert.equal(price.priceCents,expected[bundle.id][count]);
  assert.equal(price.priceCents,Math.round(price.totalCents*.9));
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
for(const link of $('a').toArray())assert.ok(!$(link).attr('href').includes('undefined'));
assert.match(withBase(html,'/Dimohe'),/href="\/Dimohe\/collections\/gifts-under-100"/);
assert.equal(/[—–]|--/.test($('body').text()),false);
const store=createStorefront(products,new Map(),async()=>null,{load});
const shell=load(store.shell('Gifts',html,{items:[],item_count:0,total_price:0}));
for(const root of ['.desktop-nav','#mobile-navigation']){
 assert.equal(shell(root+' details').filter((i,e)=>shell(e).children('summary').text()==='Gifts').length,1);
 assert.equal(shell(root+' > a[href="/collections/gifts-under-100"]').length,0);
 assert.equal(shell(root+' > a[href="/pages/gifting"]').length,0);
 assert.equal(shell(root+' .nav-room a[href="/collections/gifts-under-100"]').length,1);
}
console.log('Passed: six bundles across four categories; exact 10% prices; component product price consistency; Dimohe contact links, two priced jewellery sets, unified Gifts navigation and valid local photography.');
