import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { load } from 'cheerio';
let pages=0,references=0;
async function walk(dir){
 for(const entry of await fs.readdir(dir,{withFileTypes:true})){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory()){await walk(file);continue;}
  if(!file.endsWith('.html'))continue;
  const html=await fs.readFile(file,'utf8');assert.doesNotMatch(html,/^(?:<<<<<<<|=======|>>>>>>>)/m,file);
  const $=load(html);const base=$('html').attr('data-base')||'';
  assert.equal($('#MainContent').length,1,file);pages++;
  for(const el of $('img[src],script[src],link[rel="stylesheet"][href],video source[src]').toArray()){
   const url=$(el).attr('src')||$(el).attr('href');
   if(!url.startsWith('/'))continue;
   assert.ok(!base||url.startsWith(base+'/'),file+': '+url);
   await fs.access(path.join('dist',decodeURI(url.slice(base.length)).split('?')[0]));references++;
  }
 }
}
await walk('dist');
const catalog=JSON.parse(await fs.readFile('dist/api/products.json','utf8'));
assert.equal(catalog.products.length,88);
const home=load(await fs.readFile('dist/index.html','utf8'));
assert.equal(home('.hero-copy>.eyebrow').length,0);
assert.match(home('.hero h1').text(),/Ayurveda/);
assert.equal(home('.embroidery-panel').first().find('a').first().attr('href').split('/').filter(Boolean).at(-1),'round-bags');
console.log(`Passed: ${pages} static pages, ${references} local asset references, all 88 products, original wordmark, Ayurveda headline, and Round bags first.`);
