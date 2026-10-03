(() => {
 const base=document.querySelector('meta[name="storefront-base"]').content;
 const path=url=>url.startsWith('/')&&!url.startsWith('//')&&!url.startsWith(base+'/')?base+url:url;
 const rewriteHTML=html=>html.replace(/(href|src)="(\/[^"\s]*)"/g,(all,attr,url)=>`${attr}="${path(url)}"`);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
 const image=u=>path(new URL(u,'https://dimohe.com').pathname.replace(/^\/s\/files\/[^]+\/(files|products)\//,'/cdn/shop/$1/'));
 let catalogPromise;
 const catalog=()=>catalogPromise??=fetch(path('/api/products.json')).then(r=>{if(!r.ok)throw Error('Unable to load products. Please refresh.');return r.json();}).then(d=>d.products).catch(e=>{catalogPromise=null;throw e;});
 const key='dimohe-pages-shopping-bag';
 function savedLines(){try{const data=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(data)?data.filter(i=>i&&Number.isInteger(i.quantity)&&i.quantity>0&&i.quantity<=99):[];}catch{return [];}}
 async function api(route,data){
  const products=await catalog();if(route==='/api/products')return {products};
  if(!route.startsWith('/cart'))throw Error('This feature needs a Shopify connection.');
  const variants=new Map(products.flatMap(p=>p.variants.map(v=>[String(v.id),{p,v}])));
  let lines=savedLines().filter(i=>variants.has(String(i.id)));
  if(route==='/cart/add.js'){
   const found=variants.get(String(data.id));const qty=Number(data.quantity??1);if(!found?.v.available)throw Error('This variant is sold out.');if(!Number.isInteger(qty)||qty<1||qty>99)throw Error('Please choose a quantity from 1 to 99.');
   const line=lines.find(i=>String(i.id)===String(data.id));if((line?.quantity||0)+qty>99)throw Error('A maximum of 99 pieces can be added per variant.');if(line)line.quantity+=qty;else lines.push({id:String(data.id),quantity:qty});
  }
  if(route==='/cart/change.js'){
   const qty=Number(data.quantity);if(!Number.isInteger(qty)||qty<0||qty>99)throw Error('Please choose a quantity from 0 to 99.');lines=lines.map(i=>String(i.id)===String(data.id)?{...i,quantity:qty}:i).filter(i=>i.quantity>0);
  }
  if(route==='/cart/clear.js')lines=[];
  if(data)try{localStorage.setItem(key,JSON.stringify(lines));}catch{throw Error('Please allow browser storage to keep your shopping bag.');}
  const items=lines.map(i=>{const {p,v}=variants.get(String(i.id));const price=Math.round(Number(v.price)*100);return {id:v.id,title:p.title,variant_title:v.title,url:path('/products/'+p.handle)+'/?variant='+v.id,image:image(p.images[0].src),price,line_price:price*i.quantity,quantity:i.quantity};});
  return {items,item_count:items.reduce((n,i)=>n+i.quantity,0),total_price:items.reduce((n,i)=>n+i.line_price,0)};
 }
 window.DimoheStatic={api,path,rewriteHTML};
 function card(p){return `<article class="product-card" data-product-handle="${p.handle}"><a class="product-image" href="${path('/products/'+p.handle)}"><img src="${image(p.images[0].src)}" alt="${esc(p.title)}" loading="lazy" width="600" height="750">${p.images[1]?`<img class="alternate" src="${image(p.images[1].src)}" alt="" loading="lazy" width="600" height="750">`:''}</a><button class="quick-view" type="button" data-quick-view="${p.handle}" aria-label="Quick view ${esc(p.title)}"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M5 8h14l1 13H4L5 8Z"/><path d="M8 9V6a4 4 0 0 1 8 0v3"/></svg></button><div class="product-caption"><p class="product-kind">${esc(p.merch.typeName)}</p><a href="${path('/products/'+p.handle)}"><h3>${esc(p.title)}</h3></a><p class="product-subtitle">${esc(p.merch.subtitle)}</p><p class="price">${p.merch.minPrice!==p.merch.maxPrice?'From ':''}${money(p.merch.minPrice)}</p></div></article>`;}
 const collection=document.getElementById('collection-data');
 if(collection){
  const config=JSON.parse(collection.textContent);const form=document.querySelector('.catalog-filters');let request=0;
  async function refresh(){const current=++request;try{const products=await catalog();if(current!==request)return;const params=new URLSearchParams(location.search);let list=products.filter(p=>config.handles.includes(p.handle));const q=(params.get('q')||'').trim().slice(0,200);
   if(config.search){list=q?list.filter(p=>(p.title+' '+p.merch.text+' '+p.merch.typeName+' '+p.merch.groupName).toLowerCase().includes(q.toLowerCase())):[];document.querySelector('.collection-intro h1').textContent=q?`Results for “${q}”`:'Find your next lovely thing';document.querySelector('.collection-intro [name=q]').value=q;form.querySelector('[name=q]').value=q;document.title=(q?`Results for “${q}”`:'Search')+' · Dimohe';}
   for(const el of form.elements){if(!el.name)continue;if(el.type==='checkbox')el.checked=params.has(el.name);else el.value=params.get(el.name)||(el.name==='sort_by'?'featured':'');}
   list=list.filter(p=>(!params.get('type')||p.merch.type===params.get('type'))&&(!params.get('material')||p.merch.materials.includes(params.get('material')))&&(!params.get('color')||p.merch.colors.includes(params.get('color')))&&(!params.get('size')||p.merch.sizes.includes(params.get('size')))&&(!params.has('available')||p.merch.available)&&(!params.get('filter.v.price.gte')||p.merch.maxPrice>=Number(params.get('filter.v.price.gte')))&&(!params.get('filter.v.price.lte')||p.merch.minPrice<=Number(params.get('filter.v.price.lte'))));
   const sort=params.get('sort_by')||'featured';if(sort.startsWith('price-'))list.sort((a,b)=>(a.merch.minPrice-b.merch.minPrice)*(sort.endsWith('descending')?-1:1));if(sort.startsWith('title-'))list.sort((a,b)=>a.title.localeCompare(b.title)*(sort.endsWith('descending')?-1:1));if(sort.startsWith('created-'))list.sort((a,b)=>(Date.parse(a.created_at)-Date.parse(b.created_at))*(sort.endsWith('descending')?-1:1));
   document.getElementById('product-card-grid').innerHTML=list.map(card).join('');document.getElementById('facet-product-count').textContent=`${list.length} ${list.length===1?'product':'products'}`;
   const filters=['type','material','color','size','available','filter.v.price.gte','filter.v.price.lte'].filter(k=>params.get(k));const details=document.querySelector('.filter-details');details.open=filters.length>0;details.querySelector('summary').innerHTML=`Filter collection ${filters.length?'('+filters.length+')':''}<span>+</span>`;
   form.querySelector('.filter-actions a').href=path(config.search?'/search?q='+encodeURIComponent(q):location.pathname.slice(base.length));
   let empty=document.querySelector('[data-static-empty]');if(empty)empty.remove();if(!list.length){empty=document.createElement('div');empty.className='empty-state';empty.dataset.staticEmpty='';empty.innerHTML='<h2>Room for a little discovery.</h2><p>Try another search or clear a filter to find more.</p>';document.getElementById('product-card-grid').after(empty);}
  }catch(error){document.getElementById('facet-product-count').textContent=error.message;}}
  form.addEventListener('submit',event=>{event.preventDefault();const params=new URLSearchParams(new FormData(form));history.pushState({},'',location.pathname+'?'+params);refresh();});window.addEventListener('popstate',refresh);refresh();
 }
 const productData=document.getElementById('product-data');
 if(productData){const p=JSON.parse(productData.textContent);const id=new URLSearchParams(location.search).get('variant');const v=p.variants.find(v=>String(v.id)===id);if(v){const form=document.querySelector('[data-product-form]');form.querySelector('[name=id]').value=v.id;p.options.forEach(o=>{for(const radio of form.querySelectorAll(`[name=option${o.position}]`))radio.checked=radio.value===v['option'+o.position];const label=document.querySelector(`[data-selected-option="${o.position}"]`);if(label)label.textContent=v['option'+o.position];});document.querySelector('[data-product-actual-price]').textContent=money(Number(v.price));const button=form.querySelector('[data-add-button]');button.disabled=!v.available;button.textContent=v.available?'Add to bag':'Sold out';const stock=document.querySelector('[data-stock]');stock.textContent=v.available?'In stock':'Sold out';stock.classList.toggle('sold-out',!v.available);}}
})();
