(() => {
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const staticStore=window.DimoheStatic;
  const decorate=html=>staticStore?staticStore.rewriteHTML(html):html;
  const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
  const imagePath=u=>{const path=new URL(u,'https://dimohe.com').pathname.replace(/^\/s\/files\/[^]+\/(files|products)\//,'/cdn/shop/$1/');return staticStore?staticStore.path(path):path;};
  const dialogs=[...document.querySelectorAll('dialog')];
  let focusBeforeDialog=null,noticeTimer,cartBusy=false;
  function notice(message){const el=document.getElementById('status');el.textContent=message;el.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{el.hidden=true;},5000);}
  function openDialog(id){closeMobileNavigation({immediate:true});const dialog=document.getElementById(id);if(dialog.open)return;focusBeforeDialog=document.activeElement;dialogs.filter(d=>d.open).forEach(d=>d.close());dialog.showModal();}
  for(const d of dialogs){d.addEventListener('click',event=>{if(event.target===d){const r=d.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)d.close();}});d.addEventListener('close',()=>focusBeforeDialog?.focus());}
  document.querySelectorAll('[data-close-dialog]').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
  const mobileNav=document.querySelector('.mobile-nav'),menuToggle=document.querySelector('[data-menu-toggle]');
  let menuCloseTimer;
  function closeMobileNavigation({immediate=false}={}){
    if(!mobileNav||menuToggle.getAttribute('aria-expanded')!=='true')return false;
    clearTimeout(menuCloseTimer);
    mobileNav.classList.remove('is-open');mobileNav.inert=true;
    menuToggle.setAttribute('aria-expanded','false');menuToggle.setAttribute('aria-label','Open menu');
    document.querySelectorAll('main,.site-footer').forEach(el=>el.inert=false);
    const finish=()=>{if(menuToggle.getAttribute('aria-expanded')==='false')mobileNav.hidden=true;};
    if(immediate||matchMedia('(prefers-reduced-motion: reduce)').matches)finish();else menuCloseTimer=setTimeout(finish,240);
    return true;
  }
  menuToggle?.addEventListener('click',()=>{
    if(menuToggle.getAttribute('aria-expanded')==='true'){closeMobileNavigation();return;}
    clearTimeout(menuCloseTimer);mobileNav.hidden=false;mobileNav.inert=false;mobileNav.scrollTop=0;
    mobileNav.querySelectorAll('details').forEach(group=>group.open=false);
    document.querySelectorAll('main,.site-footer').forEach(el=>el.inert=true);
    menuToggle.setAttribute('aria-expanded','true');menuToggle.setAttribute('aria-label','Close menu');
    requestAnimationFrame(()=>requestAnimationFrame(()=>{if(menuToggle.getAttribute('aria-expanded')==='true')mobileNav.classList.add('is-open');}));
  });
  mobileNav?.addEventListener('click',event=>{if(event.target.closest('a'))closeMobileNavigation({immediate:true});});
  const desktopLayout=window.matchMedia('(min-width: 900px)');
  desktopLayout.addEventListener('change',event=>{if(event.matches)closeMobileNavigation({immediate:true});});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&closeMobileNavigation())menuToggle.focus();});
  const mobileGroups=[...document.querySelectorAll('.mobile-nav>details')];
  mobileGroups.forEach(group=>group.addEventListener('toggle',()=>{
    if(group.open){
      mobileGroups.forEach(other=>{if(other!==group)other.open=false;});
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches)[...group.children].filter(el=>el.tagName!=='SUMMARY').forEach(el=>el.animate([{opacity:0,transform:'translateY(-4px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'}));
    }
  }));
  const navGroups=[...document.querySelectorAll('.desktop-nav .nav-group')];
  const hoverNavigation=window.matchMedia('(hover: hover) and (pointer: fine)');
  let navCloseTimer,navOpenTimer;
  function closeNavigation(){clearTimeout(navOpenTimer);clearTimeout(navCloseTimer);navGroups.forEach(group=>group.open=false);}
  function openNavigation(group){clearTimeout(navOpenTimer);clearTimeout(navCloseTimer);navGroups.forEach(other=>{other.open=other===group;});}
  navGroups.forEach(group=>{
    group.addEventListener('pointerenter',()=>{clearTimeout(navCloseTimer);clearTimeout(navOpenTimer);if(hoverNavigation.matches)navOpenTimer=setTimeout(()=>openNavigation(group),180);});
    group.addEventListener('pointerleave',()=>{clearTimeout(navOpenTimer);if(hoverNavigation.matches){clearTimeout(navCloseTimer);navCloseTimer=setTimeout(()=>{if(!group.contains(document.activeElement))group.open=false;},240);}});
    group.addEventListener('focusin',()=>clearTimeout(navCloseTimer));
    group.addEventListener('focusout',event=>{if(!group.contains(event.relatedTarget))group.open=false;});
    group.querySelector('summary').addEventListener('click',event=>{clearTimeout(navCloseTimer);if(hoverNavigation.matches&&event.detail>0){event.preventDefault();openNavigation(group);}else navGroups.forEach(other=>{if(other!==group)other.open=false;});});
  });
  document.addEventListener('click',event=>{if(!event.target.closest('.desktop-nav'))closeNavigation();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){const openGroup=navGroups.find(group=>group.open);if(openGroup){closeNavigation();if(openGroup.contains(document.activeElement))openGroup.querySelector('summary').focus();}}});
  hoverNavigation.addEventListener('change',closeNavigation);
  document.querySelectorAll('a[href]').forEach(link=>{const url=new URL(link.href,location.href);if(url.pathname!==location.pathname||!['#shipping-returns','#product-story'].includes(url.hash))return;link.addEventListener('click',()=>{const panel=document.querySelector(url.hash);if(panel)panel.open=true;});});
  document.querySelector('[data-sort]')?.addEventListener('change',event=>event.target.form.requestSubmit());
  async function api(path,data){if(staticStore)return staticStore.api(path,data);const response=await fetch(path,{method:data?'POST':'GET',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined});const value=await response.json();if(!response.ok)throw new Error(value.description||value.error||'We couldn’t complete that request. Please try again.');return value;}
  let currentCart=null,cartLoadPromise=null;
  function renderCart(cart){currentCart=cart;syncCardCart();renderMiniLines();document.querySelectorAll('[data-bag-count]').forEach(el=>el.textContent=cart.item_count);const html=cart.items.length?`${cart.items.map(i=>`<article class="cart-item"><a href="${esc(i.url)}"><img src="${esc(i.image)}" alt="${esc(i.title)}" width="90" height="110"></a><div><a href="${esc(i.url)}"><h3>${esc(i.title)}</h3></a>${i.variant_title!=='Default Title'?`<p>${esc(i.variant_title)}</p>`:''}<p>${money(i.price/100)} <span>· ${money(i.line_price/100)} total</span></p><div class="cart-quantity"><button aria-label="Decrease ${esc(i.title)}" data-cart-id="${i.id}" data-cart-quantity="${i.quantity-1}">−</button><span>${i.quantity}</span><button aria-label="Increase ${esc(i.title)}" data-cart-id="${i.id}" data-cart-quantity="${i.quantity+1}"${i.quantity>=99?' disabled':''}>+</button><button class="remove" data-cart-id="${i.id}" data-cart-quantity="0">Remove</button></div></div></article>`).join('')}<div class="cart-footer"><div class="cart-subtotal"><span>Subtotal</span><span>${money(cart.total_price/100)}</span></div><p>Taxes and shipping calculated at checkout. Prices in USD.</p><a class="button" href="/checkout">Continue to checkout</a><a class="text-link" href="/cart">View shopping bag</a></div>`:`<div class="empty-state"><h2>Room for something lovely.</h2><p>Your shopping bag is empty.</p><a class="button" href="/collections/all">Explore the collection</a></div>`;document.querySelectorAll('[data-cart-content]').forEach(el=>el.innerHTML=decorate(html));}
  function loadCart(){return cartLoadPromise??=(async()=>{try{renderCart(await api('/cart.js'));}catch(error){notice(error.message);}})().finally(()=>cartLoadPromise=null);}
  document.querySelector('[data-bag-open]')?.addEventListener('click',()=>{openDialog('bag-dialog');loadCart();});
  if(staticStore||document.querySelector('[data-cart-page]')||document.querySelector('[data-card-cart]'))loadCart();
  document.addEventListener('click',async event=>{const b=event.target.closest('[data-cart-id]');if(!b||cartBusy)return;cartBusy=true;document.querySelectorAll('[data-cart-id]').forEach(x=>x.disabled=true);try{renderCart(await api('/cart/change.js',{id:b.dataset.cartId,quantity:Number(b.dataset.cartQuantity)}));}catch(error){notice(error.message);await loadCart();}finally{cartBusy=false;syncCardCart();renderMiniLines();}});
  window.addEventListener('storage',event=>{if(event.key==='dimohe-bag'&&!cartBusy)loadCart();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!cartBusy)loadCart();});
  let catalogPromise;function catalog(){return catalogPromise??=api('/api/products').then(data=>data.products).catch(error=>{catalogPromise=null;throw error;});}
  document.querySelector('[data-search-open]')?.addEventListener('click',()=>{openDialog('search-dialog');document.querySelector('#search-input').focus();});
  let searchTimer,searchRequest=0;
  document.querySelector('#search-input')?.addEventListener('input',event=>{const query=event.target.value.trim().toLowerCase();const request=++searchRequest;clearTimeout(searchTimer);const el=document.querySelector('#search-suggestions');if(!query){el.innerHTML='';return;}searchTimer=setTimeout(async()=>{try{const products=await catalog();if(request!==searchRequest)return;const matches=products.filter(p=>(p.title+' '+p.merch.typeName+' '+p.merch.groupName+' '+p.merch.crafts.join(' ')+' '+(p.merch.crafts.includes('chikankari')?'Lucknow':'')+' '+(p.merch.crafts.includes('block-printing')?'Jaipur Rajasthan':'')).toLowerCase().includes(query)).slice(0,5);el.innerHTML=decorate(matches.length?matches.map(p=>`<a class="search-result" href="/products/${p.handle}"><img src="${imagePath(p.images[0].src)}" alt="" width="48" height="60"><span>${esc(p.title)}<small>${esc(p.merch.typeName)} · ${money(p.merch.minPrice)}</small></span></a>`).join('')+`<a class="search-result" href="/search?q=${encodeURIComponent(query)}">View all results</a>`:'<p>No matches yet. Try a category or another product name.</p>');}catch(error){if(request===searchRequest)el.textContent=error.message;}},200);});
  async function addToBag(form){if(cartBusy)return;cartBusy=true;syncCardCart();const button=form.querySelector('[type=submit]');const status=form.querySelector('[data-form-status]');button.disabled=true;status.textContent='Adding to your bag…';try{const data=new FormData(form);const cart=await api('/cart/add.js',{id:data.get('id'),quantity:Number(data.get('quantity')||1)});renderCart(cart);status.textContent='Added to your bag.';if(form.hasAttribute('data-mini-add')){document.querySelector('#quick-dialog').close();notice('Added to your bag.');}else openDialog('bag-dialog');}catch(error){status.textContent=error.message;}finally{cartBusy=false;syncCardCart();const selected=form.dataset.available;button.disabled=selected==='false';}}
  document.addEventListener('submit',event=>{const form=event.target;if(form.matches('[data-product-form]')){event.preventDefault();addToBag(form);}});
  document.addEventListener('click',event=>{const button=event.target.closest('[data-quantity]');if(!button)return;const input=button.closest('form').querySelector('[name=quantity]');input.value=Math.max(1,Math.min(99,Number(input.value||1)+Number(button.dataset.quantity)));});
  const productScript=document.getElementById('product-data');
  if(productScript){const product=JSON.parse(productScript.textContent);const form=document.querySelector('[data-product-form]');const initial=product.variants.find(v=>String(v.id)===form.querySelector('[name=id]').value);form.dataset.available=String(initial.available);form.addEventListener('change',event=>{if(!event.target.matches('[type=radio]'))return;const values=product.options.map(o=>form.querySelector(`input[name="option${o.position}"]:checked`)?.value);const v=product.variants.find(v=>values.every((value,i)=>!value||v['option'+(i+1)]===value));const button=form.querySelector('[data-add-button]');form.dataset.available=String(Boolean(v?.available));button.disabled=!v?.available;button.innerHTML=v?.available?'Add to bag':v?'Sold out':'Unavailable';form.querySelector('[name=id]').value=v?.id||'';document.querySelector('[data-product-actual-price]').textContent=v?money(Number(v.price)):'Unavailable';const stock=document.querySelector('[data-stock]');stock.textContent=v?.available?'Low stock':v?'Sold out':'Unavailable';stock.classList.toggle('sold-out',!v?.available);product.options.forEach((o,i)=>{const label=form.querySelector(`[data-selected-option="${o.position}"]`);if(label)label.textContent=values[i]||'';});form.querySelector('[data-form-status]').textContent='';if(v){const url=new URL(location.href);url.searchParams.set('variant',v.id);history.replaceState({},'',url);if(v.featured_image?.src)document.querySelector('#main-product-image').src=imagePath(v.featured_image.src);}});
    const sticky=document.querySelector('.mobile-purchase');
    const syncMobile=()=>{if(!sticky)return;const add=form.querySelector('[data-add-button]');sticky.querySelector('[data-mobile-price]').textContent=document.querySelector('[data-product-actual-price]').textContent;const mobile=sticky.querySelector('[data-mobile-add]');mobile.disabled=add.disabled;mobile.textContent=add.disabled?add.textContent.trim():'Add to bag';};
    syncMobile();form.addEventListener('change',syncMobile);form.addEventListener('purchase-state',syncMobile);
    if(sticky){const updateSticky=()=>{sticky.hidden=form.getBoundingClientRect().bottom>0;};let stickyFrame;window.addEventListener('scroll',()=>{cancelAnimationFrame(stickyFrame);stickyFrame=requestAnimationFrame(updateSticky);},{passive:true});window.addEventListener('resize',updateSticky);updateSticky();sticky.querySelector('[data-mobile-add]').addEventListener('click',()=>form.requestSubmit());}
    document.querySelectorAll('[data-image]').forEach(b=>b.addEventListener('click',()=>{document.querySelector('#main-product-image').src=b.dataset.image;document.querySelectorAll('[data-image]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
    document.querySelector('[data-zoom]')?.addEventListener('click',()=>{document.querySelector('#zoom-dialog img').src=document.querySelector('#main-product-image').src;openDialog('zoom-dialog');});
  }
  async function showQuickProduct(handle,{mini=false}={}){
    const products=await catalog(),p=products.find(p=>p.handle===handle);
    if(!p)throw new Error('This product is unavailable.');
    const v=p.variants.find(v=>v.available)||p.variants[0],choose=mini&&p.variants.length>1,instant=choose&&p.options.length===1,available=!choose&&v.available;
    document.querySelector('[data-quick-content]').innerHTML=decorate(`<div class="quick-content"><img src="${imagePath(p.images[0].src)}" alt="${esc(p.title)}" width="500" height="625"><div><p class="eyebrow">${esc(p.merch.typeName)}</p><h2>${esc(p.title)}</h2><p class="product-subtitle">${esc(p.merch.subtitle)}</p><p class="price" data-quick-price>${money(Number(v.price))}</p><form data-product-form ${mini?'data-mini-add':''} data-available="${available}"><input type="hidden" name="id" value="${choose?'':v.id}"><input type="hidden" name="quantity" value="1">${instant?`<fieldset class="mini-size-picker"><legend>Choose ${esc(p.merch.optionLabels[p.options[0].position]).toLowerCase()} to add to your bag</legend><div>${p.variants.map(variant=>`<button type="button" data-mini-variant="${variant.id}" aria-label="Add ${esc(variant.title)} to bag"${variant.available?'':' disabled'}>${esc(variant.title)}${Number(variant.price)!==Number(v.price)?`<small>${money(Number(variant.price))}</small>`:''}</button>`).join('')}</div></fieldset>`:p.variants.length>1?`<label>Choose ${esc(p.options.map(o=>p.merch.optionLabels[o.position]).join(' / ').toLowerCase())}<select data-quick-variant required>${choose?'<option value="" selected disabled>Choose an option</option>':''}${p.variants.map(variant=>`<option value="${variant.id}"${!choose&&variant.id===v.id?' selected':''}${variant.available?'':' disabled'}>${esc(variant.title)}${variant.available?'':' (Sold out)'}</option>`).join('')}</select></label>`:v.title!=='Default Title'?`<p>${esc(p.merch.optionLabels[p.options[0].position])}: ${esc(v.title)}</p>`:''}<button class="button" type="submit"${instant?' hidden':''}${available?'':' disabled'}>${choose?'Choose an option':v.available?'Add to bag':'Sold out'}</button><p data-form-status class="form-status" role="status"></p></form><a class="text-link" href="/products/${p.handle}">View all details</a></div></div>`);
    document.querySelector('[data-quick-variant]')?.addEventListener('change',event=>{
      const selected=p.variants.find(v=>String(v.id)===event.target.value),form=event.target.form;
      form.querySelector('[name=id]').value=selected?.id||'';form.dataset.available=String(Boolean(selected?.available));
      form.querySelector('[type=submit]').disabled=!selected?.available;form.querySelector('[type=submit]').textContent=selected?.available?'Add to bag':'Sold out';
      if(selected)document.querySelector('[data-quick-price]').textContent=money(Number(selected.price));
    });
    document.querySelectorAll('[data-mini-variant]').forEach(button=>button.addEventListener('click',async()=>{
      if(cartBusy)return;
      const selected=p.variants.find(variant=>String(variant.id)===button.dataset.miniVariant);
      if(!selected?.available)return;
      const form=button.closest('form');form.querySelector('[name=id]').value=selected.id;form.dataset.available='true';
      document.querySelector('[data-quick-price]').textContent=money(Number(selected.price));
      form.querySelectorAll('[data-mini-variant]').forEach(option=>option.disabled=true);
      await addToBag(form);
      form.querySelectorAll('[data-mini-variant]').forEach(option=>option.disabled=!p.variants.find(variant=>String(variant.id)===option.dataset.miniVariant)?.available);
    }));
    document.querySelector('#quick-dialog').classList.toggle('is-mini-choice',instant);
    openDialog('quick-dialog');
  }
  document.querySelectorAll('[data-quick-view]').forEach(b=>b.addEventListener('click',async()=>{b.disabled=true;try{await showQuickProduct(b.dataset.quickView);}catch(error){notice(error.message);}finally{b.disabled=false;}}));
  function cardLines(control){return (currentCart?.items||[]).filter(item=>String(item.product_id)===control.dataset.cardProduct);}
  function syncCardCart(){
    if(!currentCart)return;
    document.querySelectorAll('[data-card-cart]').forEach(control=>{
      const lines=cardLines(control),quantity=lines.reduce((sum,item)=>sum+item.quantity,0),name=esc(control.dataset.cardLabel),available=control.dataset.cardAvailable==='true',disabled=cartBusy||!available;
      control.classList.toggle('has-quantity',quantity>0);control.setAttribute('aria-busy',String(cartBusy));
      if(!quantity){control.innerHTML=`<button type="button" data-card-action="add" aria-label="${available?'Add '+name+' to bag':'Sold out: '+name}"${disabled?' disabled':''}>+</button>`;return;}
      control.innerHTML=`<button type="button" data-card-action="remove" aria-label="Remove one ${name} from bag"${cartBusy?' disabled':''}>−</button><button type="button" class="card-cart-count" data-card-action="options" aria-label="${quantity} ${name} in bag. Manage options."${cartBusy?' disabled':''}>${quantity}</button><button type="button" data-card-action="add" aria-label="Add another ${name} to bag"${disabled||(lines.length===1&&lines[0].quantity>=99)?' disabled':''}>+</button>`;
    });
  }
  function renderMiniLines(){
    const el=document.querySelector('[data-mini-lines]');if(!el||!currentCart)return;
    const lines=currentCart.items.filter(item=>String(item.product_id)===el.dataset.miniLines);
    if(!lines.length){document.querySelector('#quick-dialog').close();el.remove();return;}
    el.innerHTML=lines.map(item=>`<div class="mini-variant-row"><span>${esc(item.variant_title==='Default Title'?item.product_title:item.variant_title)}</span><div><button type="button" data-cart-id="${item.id}" data-cart-quantity="${item.quantity-1}" aria-label="Decrease ${esc(item.variant_title)}"${cartBusy?' disabled':''}>−</button><span>${item.quantity}</span><button type="button" data-cart-id="${item.id}" data-cart-quantity="${item.quantity+1}" aria-label="Increase ${esc(item.variant_title)}"${cartBusy||item.quantity>=99?' disabled':''}>+</button></div></div>`).join('');
  }
  function showMiniLines(control){document.querySelector('#quick-dialog').classList.remove('is-mini-choice');document.querySelector('[data-quick-content]').innerHTML=`<h2>${esc(control.dataset.cardLabel)}</h2><p class="mini-options-intro">Adjust the options in your bag.</p><div data-mini-lines="${control.dataset.cardProduct}"></div>${Number(control.dataset.cardVariants)>1?`<button class="text-link" type="button" data-more-card-options="${esc(control.dataset.cardCart)}">Choose another option</button>`:''}`;renderMiniLines();openDialog('quick-dialog');}
  document.addEventListener('click',async event=>{
    const more=event.target.closest('[data-more-card-options]');if(more){try{await showQuickProduct(more.dataset.moreCardOptions,{mini:true});}catch(error){notice(error.message);}return;}
    const button=event.target.closest('[data-card-action]');if(!button||cartBusy)return;
    const control=button.closest('[data-card-cart]'),action=button.dataset.cardAction;
    if(!currentCart){await loadCart();if(cartBusy)return;}
    const lines=cardLines(control),multiple=Number(control.dataset.cardVariants)>1;
    if(action==='options'||(action==='remove'&&lines.length>1)||(action==='add'&&multiple&&lines.length!==1)){
      try{if(lines.length)showMiniLines(control);else await showQuickProduct(control.dataset.cardCart,{mini:true});}catch(error){notice(error.message);}return;
    }
    cartBusy=true;syncCardCart();
    try{
      const id=lines[0]?.id||control.dataset.cardVariant;
      const cart=action==='remove'?await api('/cart/change.js',{id,quantity:Math.max(0,lines[0].quantity-1)}):await api('/cart/add.js',{id,quantity:1});
      renderCart(cart);
    }catch(error){notice(error.message);await loadCart();}
    finally{cartBusy=false;syncCardCart();if(!document.querySelector('dialog[open]'))(control.querySelector(`[data-card-action="${action}"]`)||control.querySelector('button'))?.focus({preventScroll:true});}
  });
  const savedKey='dimohe-saved-pieces';
  function savedPieces(){try{const list=JSON.parse(localStorage.getItem(savedKey)||'[]');return Array.isArray(list)?list.filter(x=>typeof x==='string'):[];}catch{return [];}}
  function syncSaved(){document.querySelectorAll('[data-save-piece]').forEach(b=>{const saved=savedPieces().includes(b.dataset.savePiece);b.setAttribute('aria-pressed',String(saved));b.textContent=saved?'Saved to wishlist':'Save to wishlist';});}
  syncSaved();
  document.addEventListener('click',event=>{const b=event.target.closest('[data-save-piece]');if(!b)return;const handles=savedPieces();const next=handles.includes(b.dataset.savePiece)?handles.filter(h=>h!==b.dataset.savePiece):[...handles,b.dataset.savePiece];try{localStorage.setItem(savedKey,JSON.stringify(next));syncSaved();}catch{notice('Your browser could not save this piece.');}});
  const savedGrid=document.querySelector('[data-saved-pieces]');
  if(savedGrid)catalog().then(products=>{const selected=products.filter(p=>savedPieces().includes(p.handle));if(selected.length)savedGrid.innerHTML=decorate(selected.map(p=>`<article class="product-card"><a href="/products/${p.handle}"><img src="${imagePath(p.images[0].src)}" alt="${esc(p.title)}" width="500" height="625"><h3>${esc(p.merch.cardName||p.title)}</h3></a><p>${money(p.merch.minPrice)}</p></article>`).join(''));}).catch(()=>{savedGrid.textContent='We couldn’t load your list. Please refresh to try again.';});
  document.querySelectorAll('[data-picks-category]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-picks-category]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));document.querySelectorAll('[data-pick-group]').forEach(card=>card.hidden=card.dataset.pickGroup!==button.dataset.picksCategory);animatePickedProducts();}));
  // Scroll motion stays inside image frames so layouts and click targets remain steady.
  const motionPreference=window.matchMedia('(prefers-reduced-motion: reduce)');
  const stableProductPhotos=window.matchMedia('(max-width: 899px), (hover: none), (pointer: coarse)');
  const photoFrames=[...document.querySelectorAll('.hero-photo,.chapter-photo,.category-photo,.product-image,.main-photo,.craft-tile>a:first-child')].filter(element=>!element.closest('.mixed-explore'));
  const revealItems=[...document.querySelectorAll('.section-title,.product-card,.category-tile,.chapter-copy,.film-copy,.founder-note,.craft-tile')].filter(element=>!element.closest('.mixed-explore'));
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
    photoFrames.forEach(element=>{if(stableProductPhotos.matches&&element.matches('.product-image,.main-photo')){element.classList.remove('scroll-photo');element.style.removeProperty('--scroll-scale');element.style.removeProperty('--scroll-y');}else photoObserver.observe(element);});
    revealObserver=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-revealed');revealObserver.unobserve(entry.target);}},{threshold:.08,rootMargin:'0px 0px -24px 0px'});
    revealItems.forEach(element=>{if(element.matches('.product-card')){const column=[...element.parentElement.children].indexOf(element)% (innerWidth<768?2:4);element.style.setProperty('--reveal-delay',column*65+'ms');}element.classList.add('motion-reveal');if(element.getBoundingClientRect().top<innerHeight)element.classList.add('is-revealed');else revealObserver.observe(element);});
  }
  window.addEventListener('scroll',()=>{motionMeasure=true;scheduleMotion();},{passive:true});
  window.addEventListener('resize',()=>{motionMeasure=true;scheduleMotion();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(motionFrame);motionFrame=0;motionTime=0;}else{motionMeasure=true;scheduleMotion();}});
  motionPreference.addEventListener('change',configureMotion);
  stableProductPhotos.addEventListener('change',configureMotion);
  configureMotion();
  function animatePickedProducts(){
    const cards=[...document.querySelectorAll('[data-pick-group]:not([hidden])')];
    if(motionPreference.matches)return;
    cards.forEach((card,index)=>{card.getAnimations().forEach(animation=>animation.cancel());card.animate([{opacity:.72,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:620,delay:index*65,easing:'cubic-bezier(.2,.65,.25,1)'});});
    motionMeasure=true;scheduleMotion();
  }
  const embroideryPanels=[...document.querySelectorAll('.embroidery-panel')];
  function highlightEmbroidery(panel){embroideryPanels.forEach(item=>item.classList.toggle('is-active',item===panel));}
  let embroideryPointer;
  embroideryPanels.forEach(panel=>{
    panel.addEventListener('pointerenter',event=>{
      if(!hoverNavigation.matches||document.activeElement?.closest('.embroidery-panel')&&document.activeElement.matches(':focus-visible'))return;
      if(embroideryPointer&&Math.abs(event.clientX-embroideryPointer.x)+Math.abs(event.clientY-embroideryPointer.y)<2)return;
      embroideryPointer={x:event.clientX,y:event.clientY};highlightEmbroidery(panel);
    });
    panel.addEventListener('focusin',()=>highlightEmbroidery(panel));
  });
  const hero=document.querySelector('[data-hero-slideshow]');
  if(hero){
    const slides=[...hero.querySelectorAll('[data-hero-slide]')],dots=[...hero.querySelectorAll('[data-hero-dot]')];
    let current=0,timer;
    const show=i=>{current=i;slides.forEach((slide,n)=>{const active=n===i;slide.classList.toggle('is-active',active);slide.setAttribute('aria-hidden',String(!active));slide.tabIndex=active?0:-1;dots[n].setAttribute('aria-pressed',String(active));});};
    const schedule=()=>{clearInterval(timer);if(!motionPreference.matches&&!document.hidden)timer=setInterval(()=>show((current+1)%slides.length),5500);};
    dots.forEach((dot,i)=>dot.addEventListener('click',()=>{show(i);schedule();}));
    document.addEventListener('visibilitychange',schedule);motionPreference.addEventListener('change',schedule);schedule();
  }
  const brandVideo=document.querySelector('[data-brand-film]');
  if(brandVideo){
    const autoplay=brandVideo.hasAttribute('data-autoplay');let filmVisible=false,userPaused=false,systemPause=false;
    const pauseFilm=()=>{if(!brandVideo.paused){systemPause=true;brandVideo.pause();}};
    const updateFilm=()=>{if(document.hidden||!filmVisible){pauseFilm();return;}if(autoplay&&!motionPreference.matches&&!userPaused&&!brandVideo.ended)brandVideo.play().catch(()=>{});};
    brandVideo.addEventListener('play',()=>{userPaused=false;});
    brandVideo.addEventListener('pause',()=>{if(systemPause)systemPause=false;else if(!brandVideo.ended)userPaused=true;});
    const filmError=()=>{document.querySelector('[data-film-status]').hidden=false;};
    brandVideo.addEventListener('error',filmError);
    brandVideo.querySelector('source')?.addEventListener('error',filmError);
    if('IntersectionObserver' in window)new IntersectionObserver(entries=>{filmVisible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.2;updateFilm();},{threshold:[0,.2]}).observe(brandVideo);
    document.addEventListener('visibilitychange',updateFilm);
    motionPreference.addEventListener('change',()=>{if(motionPreference.matches&&autoplay)pauseFilm();else updateFilm();});

  }
})();

// Approved features use their own controls so the original storefront remains intact.
(() => {
  const offer=document.querySelector('[data-welcome-offer]');
  if(offer){
    const subscribedKey='dimohe-newsletter-subscribed';
    const isSubscribed=()=>{try{return localStorage.getItem(subscribedKey)==='confirmed';}catch{return false;}};
    offer.addEventListener('click',event=>{if(event.target===offer){const rect=offer.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)offer.close();}});
    let shown=false;
    const tryOpen=()=>{if(shown||isSubscribed())return;if(document.hidden||document.querySelector('dialog[open]')||document.querySelector('[data-menu-toggle][aria-expanded="true"]')){setTimeout(tryOpen,800);return;}shown=true;offer.showModal();};
    setTimeout(tryOpen,1000);
    window.addEventListener('storage',event=>{if(event.key===subscribedKey&&isSubscribed()&&offer.open)offer.close();});
    offer.querySelector('form').addEventListener('submit',async event=>{
      event.preventDefault();
      const form=event.currentTarget,status=offer.querySelector('[data-welcome-status]'),button=form.querySelector('[type=submit]');
      if(button.disabled)return;
      status.hidden=false;status.textContent='Joining…';button.disabled=true;
      try{
        const configResponse=await fetch('/welcome-signup.json',{cache:'no-store'});
        if(!configResponse.ok)throw new Error('unavailable');
        const config=await configResponse.json();
        if(!config.endpoint)throw new Error('unavailable');
        const endpoint=new URL(config.endpoint,location.href);
        if(endpoint.protocol!=='https:'&&endpoint.origin!==location.origin)throw new Error('unavailable');
        const response=await fetch(endpoint.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:form.elements.email.value.trim(),consent:true,source:'dimohe-welcome'})});
        const result=await response.json();
        if(!response.ok)throw new Error('unavailable');
        if(result.subscribed!==true){
          if(result.pending===true){status.textContent='Please check your inbox to confirm your subscription.';return;}
          throw new Error('unavailable');
        }
        try{localStorage.setItem(subscribedKey,'confirmed');}catch{}
        status.textContent='You’re on the list. Look out for your welcome email.';
        form.querySelector('input[type=email]').disabled=true;
        button.textContent='You’re signed up';
      }catch{status.textContent='Signup is temporarily unavailable. Please try again later.';}
      finally{if(!isSubscribed())button.disabled=false;}
    });
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-review-carousel]').forEach(section=>{
    const rail=section.querySelector('.product-rail'),prev=section.querySelector('[data-rail-prev]'),next=section.querySelector('[data-rail-next]'),pause=section.querySelector('[data-rail-pause]');
    const originals=[...rail.children],loop=section.hasAttribute('data-loop')&&originals.length>1;
    let span=0,paused=false,hovered=false,focused=false,visible=false,lastInteraction=0,wrapTimer;
    if(loop){
      const copies=()=>originals.map(card=>{const clone=card.cloneNode(true);clone.setAttribute('aria-hidden','true');clone.querySelectorAll('a,button,[tabindex]').forEach(element=>element.tabIndex=-1);clone.dataset.loopCopy='';return clone;});
      rail.prepend(...copies());rail.append(...copies());
    }
    const step=()=>originals[0].getBoundingClientRect().width+parseFloat(getComputedStyle(rail).gap||0);
    const update=()=>{prev.disabled=!loop&&rail.scrollLeft<2;next.disabled=!loop&&rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-2;};
    const wrap=()=>{
      if(!loop||!span)return;
      const x=rail.scrollLeft;
      // Identical copies allow a forward transition across the last/first boundary.
      if(x<span-1)rail.scrollTo({left:x+span,behavior:'instant'});
      else if(x>=span*2-1)rail.scrollTo({left:x-span,behavior:'instant'});
    };
    const resize=()=>{if(loop){span=step()*originals.length;rail.scrollTo({left:span,behavior:'instant'});}update();};
    const move=dir=>rail.scrollBy({left:dir*step(),behavior:reduced.matches?'instant':'smooth'});
    prev.addEventListener('click',()=>{lastInteraction=Date.now();move(-1);});next.addEventListener('click',()=>{lastInteraction=Date.now();move(1);});
    rail.addEventListener('scroll',()=>{update();clearTimeout(wrapTimer);wrapTimer=setTimeout(wrap,160);},{passive:true});
    rail.addEventListener('scrollend',wrap);
    rail.addEventListener('pointerdown',()=>lastInteraction=Date.now(),{passive:true});
    rail.addEventListener('wheel',()=>lastInteraction=Date.now(),{passive:true});
    rail.addEventListener('keydown',event=>{lastInteraction=Date.now();if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);}});
    section.addEventListener('pointerenter',()=>hovered=true);section.addEventListener('pointerleave',()=>hovered=false);
    section.addEventListener('focusin',()=>focused=true);section.addEventListener('focusout',event=>{focused=section.contains(event.relatedTarget);});
    if(pause){
      pause.addEventListener('click',()=>{paused=!paused;pause.textContent=paused?'Resume':'Pause';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Resume collection slideshow':'Pause collection slideshow');});
      pause.setAttribute('aria-label','Pause collection slideshow');
      new IntersectionObserver(entries=>visible=entries[0].isIntersecting,{threshold:.3}).observe(section);
      setInterval(()=>{if(paused||hovered||focused||!visible||document.hidden||reduced.matches||document.querySelector('dialog[open]')||Date.now()-lastInteraction<8000)return;move(1);},4500);
    }
    new ResizeObserver(resize).observe(rail);resize();
  });
  document.querySelectorAll('[data-share-product],[data-copy-product]').forEach(button=>button.addEventListener('click',async()=>{
    const url=button.dataset.shareUrl||button.dataset.copyProduct,status=button.closest('.product-share').querySelector('.share-status');
    try{if(button.dataset.shareProduct&&navigator.share){await navigator.share({title:document.title,url});status.textContent='';}else{await navigator.clipboard.writeText(url);status.textContent=button.dataset.shareProduct?`Link copied. Paste it into ${button.dataset.shareProduct} to share this piece.`:'Product link copied.';}}
    catch(error){if(error.name!=='AbortError')status.textContent='Product link: '+url;}
  }));
  document.querySelectorAll('video').forEach(video=>{
    const pauseWhenHidden=()=>{if(document.hidden||video.closest('details:not([open])'))video.pause();};
    document.addEventListener('visibilitychange',pauseWhenHidden);video.closest('details')?.addEventListener('toggle',pauseWhenHidden);
  });
})();
