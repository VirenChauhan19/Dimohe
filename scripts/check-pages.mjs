import fs from 'node:fs/promises';import path from 'node:path';import vm from 'node:vm';import assert from 'node:assert/strict';import {load} from 'cheerio';
const report=JSON.parse(await fs.readFile('dist/build-report.json','utf8'));const catalog=JSON.parse(await fs.readFile('dist/api/products.json','utf8'));
let pages=0,assets=0;
async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())await walk(file);else if(entry.name==='index.html'){
 const $=load(await fs.readFile(file,'utf8'));pages++;assert.equal($('meta[name="storefront-base"]').attr('content'),report.base);
 $('img[src],script[src],link[rel="stylesheet"]').each((i,el)=>{const url=$(el).attr('src')||$(el).attr('href');assert.ok(url.startsWith(report.base+'/'),url);});
 for(const el of $('img[src],script[src],link[rel="stylesheet"]').toArray()){const url=$(el).attr('src')||$(el).attr('href');await fs.access(path.join('dist',url.slice(report.base.length)));assets++;}
 for(const el of $('[href],[action]').toArray()){const url=$(el).attr('href')||$(el).attr('action');if(url?.startsWith('/')&&!url.startsWith('//'))assert.ok(url.startsWith(report.base+'/'),url);}
}}}
await walk('dist');assert.equal(pages,report.pages);assert.equal(catalog.products.length,88);
let saved='[]';const context={window:{},document:{querySelector:()=>({content:report.base}),getElementById:()=>null},localStorage:{getItem:()=>saved,setItem:(k,v)=>saved=v},fetch:async url=>{assert.equal(url,report.base+'/api/products.json');return {ok:true,json:async()=>catalog};},URL,URLSearchParams,Intl,Error,Map,Set};vm.createContext(context);vm.runInContext(await fs.readFile('public/static-storefront.js','utf8'),context);
const {api,path:prefix,rewriteHTML}=context.window.DimoheStatic;
assert.equal(prefix('/products/example'),report.base+'/products/example');assert.equal(prefix(report.base+'/products/example'),report.base+'/products/example');assert.equal(rewriteHTML('<a href="/cart"><img src="'+report.base+'/cdn/a.jpg"></a>'),'<a href="'+report.base+'/cart"><img src="'+report.base+'/cdn/a.jpg"></a>');
const p=catalog.products.find(p=>p.variants.some(v=>v.available));const v=p.variants.find(v=>v.available);
for(const qty of [0,-1,1.5,100])await assert.rejects(api('/cart/add.js',{id:v.id,quantity:qty}));
const cart=await api('/cart/add.js',{id:v.id,quantity:2});assert.equal(cart.item_count,2);assert.equal(cart.total_price,Math.round(Number(v.price)*100)*2);assert.ok(cart.items[0].image.startsWith(report.base+'/cdn/'));assert.equal((await api('/cart.js')).item_count,2);
await assert.rejects(api('/cart/add.js',{id:v.id,quantity:99}));assert.equal((await api('/cart.js')).item_count,2);assert.equal((await api('/cart/change.js',{id:v.id,quantity:1})).item_count,1);assert.equal((await api('/cart/change.js',{id:v.id,quantity:0})).item_count,0);
const sold=catalog.products.flatMap(p=>p.variants).find(v=>!v.available);if(sold)await assert.rejects(api('/cart/add.js',{id:sold.id,quantity:1}));
console.log(`Passed: ${pages} GitHub Pages routes, ${assets} asset references, repository-prefixed URLs, browser-persistent cart totals and validation.`);
