import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { createStorefront } from '../lib/storefront.mjs';
import { types, groups } from '../lib/merchandising.mjs';
const output=path.resolve('dist');
const base=('/'+(process.env.PAGES_BASE_PATH??'Dimohe').replace(/^\/+|\/+$/g,'')).replace(/^\/$/,'');
const products=JSON.parse(await fs.readFile('data/products.json','utf8')).products;
const routes=JSON.parse(await fs.readFile('data/routes.json','utf8'));
const routeMap=new Map(routes.map(r=>[r.route,r.file]));
const snapshot=async route=>routeMap.has(route)?fs.readFile('public'+routeMap.get(route),'utf8'):null;
const memberships=new Map();
for(const r of routes.filter(r=>/^\/collections\/[^/?]+(?:\?page=\d+)?$/.test(r.route))){
 const $=load(await snapshot(r.route));const handle=r.route.split('/')[2].split('?')[0];
 if(!memberships.has(handle))memberships.set(handle,new Set());
 $('#products-container product-card-item').each((i,el)=>{const p=$(el).find('a[href*="/products/"]').first().attr('href')?.split('/products/')[1]?.split('?')[0];if(p)memberships.get(handle).add(p);});
}
const shop=createStorefront(products,memberships,snapshot);
const destinations=new Set(['/', '/search','/cart','/checkout','/account','/collections',...routes.filter(r=>r.kind!=='section').map(r=>r.route.split('?')[0]),...types.map(t=>'/collections/'+t.handle),...groups.map(g=>'/collections/'+g.handle),'/collections/table-linen','/collections/bath-linen']);
await fs.rm(output,{recursive:true,force:true});await fs.mkdir(output,{recursive:true});
const assets=new Set(['/storefront.css','/storefront.js','/static-storefront.js','/cdn/shop/files/dimohe-favicon.png']);
let count=0;
for(const route of destinations){
 let html=await shop.render(new URL(route==='/search'?'/collections/all':route,'https://preview.invalid'),{items:[],item_count:0,total_price:0});
 if(!html)continue;
 const $=load(html);
 $('head').append(`<meta name="storefront-base" content="${base}"><script src="/static-storefront.js" defer></script>`);
 $('head script[src="/storefront.js"]').remove();$('head').append('<script src="/storefront.js" defer></script>');
 if(route.startsWith('/collections')||route==='/search'){
  const handles=$('#product-card-grid [data-product-handle]').map((i,el)=>$(el).attr('data-product-handle')).get();
  $('body').append(`<script id="collection-data" type="application/json">${JSON.stringify({handles,search:route==='/search'})}</script>`);
  if(route==='/search'){
   $('.collection-intro h1').text('Find your next lovely thing');$('.collection-intro>p').not('.breadcrumbs,.eyebrow').text('Search the Dimohe collection.');$('.collection-intro').append('<form class="search-form" action="/search"><input aria-label="Search products" name="q" type="search" placeholder="What are you looking for?"><button class="button">Search ↗</button></form>');$('.catalog-filters').attr('action','/search').prepend('<input name="q" type="hidden">');$('.filter-actions a').attr('href','/search');$('#product-card-grid').empty();
  }
 }
 $('[href],[src],[action],[poster],[data-image]').each((i,el)=>{for(const attr of ['href','src','action','poster','data-image']){const value=$(el).attr(attr);if(!value?.startsWith('/')||value.startsWith('//'))continue;if(['src','poster','data-image'].includes(attr)||attr==='href'&&(/\.(css|woff2?|png|svg)(\?|$)/.test(value))) assets.add(value.split('?')[0]);$(el).attr(attr,base+value);}});
 $('[srcset]').removeAttr('srcset');
 const file=path.join(output,route==='/'?'index.html':route.slice(1)+'/index.html');await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,$.html());count++;
}
const css=await fs.readFile('public/storefront.css','utf8');for(const m of css.matchAll(/url\(['"]?(\/[^)'"\s]+)['"]?\)/g))assets.add(m[1]);
for(const asset of assets){const file=path.join(output,asset.slice(1));await fs.mkdir(path.dirname(file),{recursive:true});if(asset==='/storefront.css')await fs.writeFile(file,css.replace(/url\(['"]?(\/[^)'"\s]+)['"]?\)/g,(match,url)=>`url('${base}${url}')`));else await fs.copyFile('public'+asset,file);}
await fs.mkdir(path.join(output,'api'),{recursive:true});await fs.writeFile(path.join(output,'api/products.json'),JSON.stringify({products:shop.products}));await fs.writeFile(path.join(output,'.nojekyll'),'');const notFound=load(await fs.readFile(path.join(output,'index.html'),'utf8'));notFound('title').text('Page not found · Dimohe');notFound('#MainContent').html(`<section class="section empty-state"><h1>A little lost?</h1><p>This page could not be found.</p><a class="button" href="${base}/">Explore Dimohe ↗</a></section>`);await fs.writeFile(path.join(output,'404.html'),notFound.html());
await fs.writeFile(path.join(output,'build-report.json'),JSON.stringify({base,pages:count,assets:assets.size,products:products.length},null,2));console.log(`GitHub Pages build: ${count} pages, ${assets.size} local assets, ${products.length} products; base path ${base||'/'}`);
