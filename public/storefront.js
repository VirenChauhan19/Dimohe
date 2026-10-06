(() => {
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
  const imagePath=u=>new URL(u,'https://dimohe.com').pathname.replace(/^\/s\/files\/[^]+\/(files|products)\//,'/cdn/shop/$1/');
  const dialogs=[...document.querySelectorAll('dialog')];
  let focusBeforeDialog=null,noticeTimer,cartBusy=false;
  function notice(message){const el=document.getElementById('status');el.textContent=message;el.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{el.hidden=true;},5000);}
  function openDialog(id){const dialog=document.getElementById(id);if(dialog.open)return;focusBeforeDialog=document.activeElement;dialogs.filter(d=>d.open).forEach(d=>d.close());dialog.showModal();}
  for(const d of dialogs){d.addEventListener('click',event=>{if(event.target===d){const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)d.close();}});d.addEventListener('close',()=>focusBeforeDialog?.focus());}
  document.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  document.querySelector('[data-menu-toggle]')?.addEventListener('click',event=>{const nav=document.querySelector('.mobile-nav');nav.hidden=!nav.hidden;event.currentTarget.setAttribute('aria-expanded',String(!nav.hidden));event.currentTarget.setAttribute('aria-label',nav.hidden?'Open menu':'Close menu');});
  const navGroups=[...document.querySelectorAll('.desktop-nav .nav-group')];
  const hoverNavigation=window.matchMedia('(hover: hover) and (pointer: fine)');
  let navCloseTimer;
  function closeNavigation(){clearTimeout(navCloseTimer);navGroups.forEach(group=>group.open=false);}
  function openNavigation(group){clearTimeout(navCloseTimer);navGroups.forEach(other=>{other.open=other===group;});}
  navGroups.forEach(group=>{
    group.addEventListener('pointerenter',()=>{if(hoverNavigation.matches)openNavigation(group);});
    group.addEventListener('pointerleave',()=>{if(hoverNavigation.matches){clearTimeout(navCloseTimer);navCloseTimer=setTimeout(()=>{if(!group.contains(document.activeElement))group.open=false;},180);}});
    group.addEventListener('focusin',()=>clearTimeout(navCloseTimer));
    group.addEventListener('focusout',event=>{if(!group.contains(event.relatedTarget))group.open=false;});
    group.querySelector('summary').addEventListener('click',()=>{clearTimeout(navCloseTimer);navGroups.forEach(other=>{if(other!==group)other.open=false;});});
  });
  document.querySelector('.desktop-nav .founder-nav')?.addEventListener('pointerenter',closeNavigation);
  document.addEventListener('click',event=>{if(!event.target.closest('.desktop-nav'))closeNavigation();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){const openGroup=navGroups.find(group=>group.open);if(openGroup){closeNavigation();if(openGroup.contains(document.activeElement))openGroup.querySelector('summary').focus();}}});
  hoverNavigation.addEventListener('change',closeNavigation);
  document.querySelector('[data-sort]')?.addEventListener('change',event=>event.target.form.requestSubmit());
  async function api(path,data){const response=await fetch(path,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined});const value=await response.json();if(!response.ok)throw new Error(value.description||value.error||'We couldn’t complete that request. Please try again.');return value;}
  function renderCart(cart){document.querySelectorAll('[data-bag-count]').forEach(el=>el.textContent=cart.item_count);const html=cart.items.length?`${cart.items.map(i=>`<article class="cart-item"><a href="${esc(i.url)}"><img src="${esc(i.image)}" alt="${esc(i.title)}" width="90" height="110"></a><div><a href="${esc(i.url)}"><h3>${esc(i.title)}</h3></a>${i.variant_title!=='Default Title'?`<p>${esc(i.variant_title)}</p>`:''}<p>${money(i.price/100)} <span>· ${money(i.line_price/100)} total</span></p><div class="cart-quantity"><button aria-label="Decrease ${esc(i.title)}" data-cart-id="${i.id}" data-cart-quantity="${i.quantity-1}">−</button><span>${i.quantity}</span><button aria-label="Increase ${esc(i.title)}" data-cart-id="${i.id}" data-cart-quantity="${i.quantity+1}"${i.quantity>=99?' disabled':''}>+</button><button class="remove" data-cart-id="${i.id}" data-cart-quantity="0">Remove</button></div></div></article>`).join('')}<div class="cart-footer"><div class="cart-subtotal"><span>Subtotal</span><span>${money(cart.total_price/100)}</span></div><p>Prices in USD.</p><a class="text-link" href="/pages/shipping-returns">Shipping & return policy →</a><a class="button" href="/checkout">Continue to checkout ↗</a><a class="text-link" href="/cart">View shopping bag →</a></div>`:`<div class="empty-state"><h2>Your bag is empty.</h2><a class="button" href="/collections/all">Explore the collection ↗</a></div>`;document.querySelectorAll('[data-cart-content]').forEach(el=>el.innerHTML=html);}
  async function loadCart(){try{renderCart(await api('/cart.js'));}catch(error){notice(error.message);}}
  document.querySelector('[data-bag-open]')?.addEventListener('click',()=>{openDialog('bag-dialog');loadCart();});
  if(document.querySelector('[data-cart-page]'))loadCart();
  document.addEventListener('click',async event=>{const b=event.target.closest('[data-cart-id]');if(!b||cartBusy)return;cartBusy=true;document.querySelectorAll('[data-cart-id]').forEach(x=>x.disabled=true);try{renderCart(await api('/cart/change.js',{id:b.dataset.cartId,quantity:Number(b.dataset.cartQuantity)}));}catch(error){notice(error.message);await loadCart();}finally{cartBusy=false;}});
  let catalogPromise;function catalog(){return catalogPromise??=api('/api/products').then(data=>data.products).catch(error=>{catalogPromise=null;throw error;});}
  document.querySelector('[data-search-open]')?.addEventListener('click',()=>{openDialog('search-dialog');document.querySelector('#search-input').focus();});
  let searchTimer,searchRequest=0;
  document.querySelector('#search-input')?.addEventListener('input',event=>{const query=event.target.value.trim().toLowerCase();const request=++searchRequest;clearTimeout(searchTimer);const el=document.querySelector('#search-suggestions');if(!query){el.innerHTML='';return;}searchTimer=setTimeout(async()=>{try{const products=await catalog();if(request!==searchRequest)return;const matches=products.filter(p=>(p.title+' '+p.merch.typeName+' '+p.merch.groupName+' '+p.merch.crafts.join(' ')+' '+(p.merch.crafts.includes('chikankari')?'Lucknow':'')+' '+(p.merch.crafts.includes('block-printing')?'Jaipur Rajasthan':'')).toLowerCase().includes(query)).slice(0,5);el.innerHTML=matches.length?matches.map(p=>`<a class="search-result" href="/products/${p.handle}"><img src="${imagePath(p.images[0].src)}" alt="" width="48" height="60"><span>${esc(p.title)}<small>${esc(p.merch.typeName)} · ${money(p.merch.minPrice)}</small></span></a>`).join('')+`<a class="search-result" href="/search?q=${encodeURIComponent(query)}">View all results →</a>`:'<p>No matches yet. Try a category or another product name.</p>';}catch(error){if(request===searchRequest)el.textContent=error.message;}},200);});
  async function addToBag(form){const button=form.querySelector('[type=submit]');const status=form.querySelector('[data-form-status]');if(form.dataset.busy==='true'||button.disabled)return;form.dataset.busy='true';button.disabled=true;form.dispatchEvent(new Event('purchase-state')); status.textContent='Adding to your bag…';try{const data=new FormData(form);const cart=await api('/cart/add.js',{id:data.get('id'),quantity:Number(data.get('quantity')||1)});renderCart(cart);status.textContent='Added to your bag.';openDialog('bag-dialog');}catch(error){status.textContent=error.message;}finally{form.dataset.busy='false';const selected=form.dataset.available;button.disabled=selected==='false';form.dispatchEvent(new Event('purchase-state'));}}
  document.addEventListener('submit',event=>{const form=event.target;if(form.matches('[data-product-form]')){event.preventDefault();addToBag(form);}});
  document.addEventListener('click',event=>{const button=event.target.closest('[data-quantity]');if(!button)return;const input=button.closest('form').querySelector('[name=quantity]');input.value=Math.max(1,Math.min(99,Number(input.value||1)+Number(button.dataset.quantity)));});
  const productScript=document.getElementById('product-data');
  if(productScript){const product=JSON.parse(productScript.textContent);const form=document.querySelector('[data-product-form]');const initial=product.variants.find(v=>String(v.id)===form.querySelector('[name=id]').value);form.dataset.available=String(initial.available);form.addEventListener('change',event=>{if(!event.target.matches('[type=radio]'))return;const values=product.options.map(o=>form.querySelector(`input[name="option${o.position}"]:checked`)?.value);const v=product.variants.find(v=>values.every((value,i)=>!value||v['option'+(i+1)]===value));const button=form.querySelector('[data-add-button]');form.dataset.available=String(Boolean(v?.available));button.disabled=!v?.available;button.innerHTML=v?.available?'Add to bag <span aria-hidden="true">↗</span>':v?'Sold out':'Unavailable';form.querySelector('[name=id]').value=v?.id||'';document.querySelector('[data-product-actual-price]').textContent=v?money(Number(v.price)):'Unavailable';const stock=document.querySelector('[data-stock]');stock.textContent=v?.available?'In stock':v?'Sold out':'Unavailable';stock.classList.toggle('sold-out',!v?.available);product.options.forEach((o,i)=>{const label=form.querySelector(`[data-selected-option="${o.position}"]`);if(label)label.textContent=values[i]||'';});form.querySelector('[data-form-status]').textContent='';if(v){const url=new URL(location.href);url.searchParams.set('variant',v.id);history.replaceState({},'',url);if(v.featured_image?.src)document.querySelector('#main-product-image').src=imagePath(v.featured_image.src);}});
    const sticky=document.querySelector('.mobile-purchase');
    const syncMobile=()=>{if(!sticky)return;const add=form.querySelector('[data-add-button]');sticky.querySelector('[data-mobile-price]').textContent=document.querySelector('[data-product-actual-price]').textContent;const mobile=sticky.querySelector('[data-mobile-add]');mobile.disabled=add.disabled;mobile.textContent=add.disabled?add.textContent.trim():'Add to bag';};
    syncMobile();form.addEventListener('change',syncMobile);form.addEventListener('purchase-state',syncMobile);
    if(sticky){const updateSticky=()=>{sticky.hidden=form.getBoundingClientRect().bottom>0;};let stickyFrame;window.addEventListener('scroll',()=>{cancelAnimationFrame(stickyFrame);stickyFrame=requestAnimationFrame(updateSticky);},{passive:true});window.addEventListener('resize',updateSticky);updateSticky();sticky.querySelector('[data-mobile-add]').addEventListener('click',()=>form.requestSubmit());}
    document.querySelectorAll('[data-image]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#main-product-image').src=b.dataset.image;document.querySelectorAll('[data-image]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
    document.querySelector('[data-zoom]')?.addEventListener('click',()=>{document.querySelector('#zoom-dialog img').src=document.querySelector('#main-product-image').src;openDialog('zoom-dialog');});
  }
  document.querySelectorAll('[data-quick-view]').forEach(b=>b.addEventListener('click',async()=>{b.disabled=true;try{const products=await catalog();const p=products.find(p=>p.handle===b.dataset.quickView);const v=p.variants.find(v=>v.available)||p.variants[0];document.querySelector('[data-quick-content]').innerHTML=`<div class="quick-content"><img src="${imagePath(p.images[0].src)}" alt="${esc(p.title)}" width="500" height="625"><div><p class="eyebrow">${esc(p.merch.typeName)}</p><h2>${esc(p.title)}</h2><p class="product-subtitle">${esc(p.merch.subtitle)}</p><p class="price" data-quick-price>${money(Number(v.price))}</p><form data-product-form data-available="${v.available}"><input type="hidden" name="id" value="${v.id}"><input type="hidden" name="quantity" value="1">${p.variants.length>1?`<label>Choose ${esc(p.options.map(o=>p.merch.optionLabels[o.position]).join(' / ').toLowerCase())}<select data-quick-variant>${p.variants.map(variant=>`<option value="${variant.id}"${variant.id===v.id?' selected':''}>${esc(variant.title)}${variant.available?'':' (Sold out)'}</option>`).join('')}</select></label>`:v.title!=='Default Title'?`<p>${esc(p.merch.optionLabels[p.options[0].position])}: ${esc(v.title)}</p>`:''}<button class="button" type="submit"${v.available?'':' disabled'}>${v.available?'Add to bag':'Sold out'} ↗</button><p data-form-status class="form-status" role="status"></p></form><a class="text-link" href="/products/${p.handle}">View all details →</a></div></div>`;document.querySelector('[data-quick-variant]')?.addEventListener('change',event=>{const selected=p.variants.find(v=>String(v.id)===event.target.value);const form=event.target.form;form.querySelector('[name=id]').value=selected.id;form.dataset.available=String(selected.available);form.querySelector('[type=submit]').disabled=!selected.available;form.querySelector('[type=submit]').textContent=selected.available?'Add to bag ↗':'Sold out';document.querySelector('[data-quick-price]').textContent=money(Number(selected.price));});openDialog('quick-dialog');}catch(error){notice(error.message);}finally{b.disabled=false;}}));
  const savedKey='dimohe-saved-pieces';
  function savedPieces(){try{const list=JSON.parse(localStorage.getItem(savedKey)||'[]');return Array.isArray(list)?list.filter(x=>typeof x==='string'):[];}catch{return [];}}
  function syncSaved(){document.querySelectorAll('[data-save-piece]').forEach(b=>{const saved=savedPieces().includes(b.dataset.savePiece);b.setAttribute('aria-pressed',String(saved));b.textContent=saved?'Saved to wishlist':'Save to wishlist';});}
  syncSaved();
  document.addEventListener('click',event=>{const b=event.target.closest('[data-save-piece]');if(!b)return;const handles=savedPieces();const next=handles.includes(b.dataset.savePiece)?handles.filter(h=>h!==b.dataset.savePiece):[...handles,b.dataset.savePiece];try{localStorage.setItem(savedKey,JSON.stringify(next));syncSaved();}catch{notice('Your browser could not save this piece.');}});
  const savedGrid=document.querySelector('[data-saved-pieces]');
  if(savedGrid)catalog().then(products=>{const selected=products.filter(p=>savedPieces().includes(p.handle));if(selected.length)savedGrid.innerHTML=selected.map(p=>`<article class="product-card"><a href="/products/${p.handle}"><img src="${imagePath(p.images[0].src)}" alt="${esc(p.title)}" width="500" height="625"><h3>${esc(p.merch.cardName||p.title)}</h3></a><p>${money(p.merch.minPrice)}</p></article>`).join('');}).catch(()=>{savedGrid.textContent='We couldn’t load your list. Please refresh to try again.';});
  document.querySelectorAll('[data-picks-category]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-picks-category]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelectorAll('[data-pick-group]').forEach(card=>card.hidden=card.dataset.pickGroup!==button.dataset.picksCategory);animatePickedProducts();}));
  // Scroll motion stays inside image frames so layouts and click targets remain steady.
  const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const photoFrames=[...document.querySelectorAll('.hero-photo,.chapter-photo,.category-photo,.product-image,.main-photo,.craft-tile>a:first-child')];
  const revealItems=[...document.querySelectorAll('.section-title,.product-card,.category-tile,.chapter-copy,.film-copy,.founder-note,.craft-tile')];
  const movingFrames=new Map();let motionFrame=0,motionMeasure=true,motionTime=0,photoObserver,revealObserver;
  function scheduleMotion(){if(motionPreference.matches||document.hidden||motionFrame)return;motionFrame=requestAnimationFrame(animatePhotos);}
  function animatePhotos(time){
    motionFrame=0;if(motionPreference.matches||document.hidden)return;
    const ease=1-Math.exp(-Math.min(48,time-(motionTime||time-16))/120);motionTime=time;
    if(motionMeasure){
      const height=window.innerHeight;const mobile=window.innerWidth<768;
      const measures=[...movingFrames].map(([element,state])=>({element,state,rect:element.getBoundingClientRect()}));
      for(const {state,rect} of measures){const distance=Math.max(-1,Math.min(1,(rect.top+rect.height/2-height/2)/((height+rect.height)/2)));state.targetScale=1.012+(mobile?.018:.028)*(1-Math.abs(distance));state.targetY=distance*(mobile?3:6);state.targetCardScale=1-(mobile?.018:.03)*Math.abs(distance);state.targetCardY=distance*(mobile?3:5);}
      motionMeasure=false;
    }
    let settling=false;
    for(const [element,state] of movingFrames){
      state.scale+=(state.targetScale-state.scale)*ease;state.y+=(state.targetY-state.y)*ease;state.cardScale+=(state.targetCardScale-state.cardScale)*ease;state.cardY+=(state.targetCardY-state.cardY)*ease;
      element.style.setProperty('--scroll-scale',state.scale.toFixed(5));element.style.setProperty('--scroll-y',state.y.toFixed(2)+'px');
      const card=element.closest('.product-card');if(card){card.classList.add('scroll-product');card.style.setProperty('--product-scale',state.cardScale.toFixed(5));card.style.setProperty('--product-y',state.cardY.toFixed(2)+'px');}
      if(Math.abs(state.targetCardScale-state.cardScale)>.0001||Math.abs(state.targetCardY-state.cardY)>.02||Math.abs(state.targetScale-state.scale)>.0001||Math.abs(state.targetY-state.y)>.02)settling=true;
    }
    if(settling)scheduleMotion();else motionTime=0;
  }
  function configureMotion(){
    photoObserver?.disconnect();revealObserver?.disconnect();cancelAnimationFrame(motionFrame);motionFrame=0;motionTime=0;movingFrames.clear();
    if(motionPreference.matches){photoFrames.forEach(element=>{element.classList.remove('scroll-photo');element.style.removeProperty('--scroll-scale');element.style.removeProperty('--scroll-y');});revealItems.forEach(element=>{element.classList.remove('motion-reveal','is-revealed','scroll-product');element.style.removeProperty('--product-scale');element.style.removeProperty('--product-y');element.getAnimations().forEach(animation=>animation.cancel());});return;}
    if(!('IntersectionObserver' in window))return;
    photoObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('scroll-photo');movingFrames.set(entry.target,{scale:1.012,y:0,targetScale:1.012,targetY:0,cardScale:.98,cardY:0,targetCardScale:1,targetCardY:0});}else movingFrames.delete(entry.target);}motionMeasure=true;scheduleMotion();},{rootMargin:'80px'});
    photoFrames.forEach(element=>photoObserver.observe(element));
    revealObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-revealed');revealObserver.unobserve(entry.target);}},{threshold:.08,rootMargin:'0px 0px -24px 0px'});
    revealItems.forEach(element=>{if(element.matches('.product-card')){const column=[...element.parentElement.children].indexOf(element)% (innerWidth<768?2:4);element.style.setProperty('--reveal-delay',column*65+'ms');}element.classList.add('motion-reveal');if(element.getBoundingClientRect().top<innerHeight)element.classList.add('is-revealed');else revealObserver.observe(element);});
  }
  window.addEventListener('scroll',()=>{motionMeasure=true;scheduleMotion();},{passive:true});
  window.addEventListener('resize',()=>{motionMeasure=true;scheduleMotion();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(motionFrame);motionFrame=0;motionTime=0;}else{motionMeasure=true;scheduleMotion();}});
  motionPreference.addEventListener('change',configureMotion);
  configureMotion();
  function animatePickedProducts(){
    const cards=[...document.querySelectorAll('[data-pick-group]:not([hidden])')];
    if(motionPreference.matches)return;
    cards.forEach((card,index)=>{card.getAnimations().forEach(animation=>animation.cancel());card.animate([{opacity:.72,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:620,delay:index*65,easing:'cubic-bezier(.2,.65,.25,1)'});});
    motionMeasure=true;scheduleMotion();
  }
  const brandVideo=document.querySelector('[data-brand-film]');
  if(brandVideo){
    const toggle=document.querySelector('[data-film-toggle]');let filmVisible=false,userPaused=false,systemPause=false;
    const syncFilm=()=>{toggle.hidden=false;toggle.textContent=brandVideo.ended?'Replay film':brandVideo.paused?'Play film':'Pause film';};
    const pauseFilm=()=>{if(!brandVideo.paused){systemPause=true;brandVideo.pause();}};
    const updateFilm=()=>{if(document.hidden||!filmVisible){pauseFilm();return;}if(!motionPreference.matches&&!userPaused&&!brandVideo.ended)brandVideo.play().then(syncFilm).catch(syncFilm);};
    brandVideo.muted=true;
    brandVideo.addEventListener('play',()=>{userPaused=false;syncFilm();});
    brandVideo.addEventListener('pause',()=>{if(systemPause)systemPause=false;else if(!brandVideo.ended)userPaused=true;syncFilm();});
    brandVideo.addEventListener('ended',syncFilm);
    toggle.addEventListener('click',()=>{if(brandVideo.paused){userPaused=false;brandVideo.play().then(syncFilm).catch(syncFilm);}else{userPaused=true;brandVideo.pause();}});
    brandVideo.addEventListener('error',()=>{document.querySelector('[data-film-status]').hidden=false;syncFilm();});
    brandVideo.querySelector('source')?.addEventListener('error',()=>{document.querySelector('[data-film-status]').hidden=false;syncFilm();});
    if('IntersectionObserver' in window)new IntersectionObserver(entries=>{filmVisible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.2;updateFilm();},{threshold:[0,.2]}).observe(brandVideo);else syncFilm();
    document.addEventListener('visibilitychange',updateFilm);
    motionPreference.addEventListener('change',()=>{if(motionPreference.matches)pauseFilm();else updateFilm();});

  }
})();
