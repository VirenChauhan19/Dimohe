/* Native Shopify commerce. No static product database or localStorage cart. */
(() => {
  const routes=window.Dimohe, reduced=matchMedia('(prefers-reduced-motion: reduce)'), fine=matchMedia('(hover: hover) and (pointer: fine)');
  const initialized=new WeakSet(),cleanups=new Map();let focusBeforeDialog=null,cartBusy=false;
  const url=(path)=>new URL(path,location.origin);
  function notice(message){const el=document.getElementById('status');if(!el)return;el.textContent=message;el.hidden=false;clearTimeout(el.timer);el.timer=setTimeout(()=>el.hidden=true,5000);}
  function openDialog(id){const el=document.getElementById(id);if(!el)return;focusBeforeDialog=document.activeElement;document.querySelectorAll('dialog[open]').forEach(d=>d.close());el.showModal();el.querySelector('input,button,a')?.focus();}
  function mobile(open){const nav=document.querySelector('.mobile-nav'),toggle=document.querySelector('[data-menu-toggle]');if(!nav)return;document.documentElement.classList.toggle('dimohe-menu-open',open);nav.hidden=!open;toggle?.setAttribute('aria-expanded',String(open));toggle?.setAttribute('aria-label',open?'Close menu':'Open menu');document.querySelectorAll('main,.site-footer').forEach(el=>el.inert=open);if(open){nav.querySelectorAll('details').forEach(d=>d.open=false);nav.scrollTop=0;}}
  function initialize(root=document){
    root.querySelectorAll('dialog').forEach(d=>{if(initialized.has(d))return;initialized.add(d);d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});d.addEventListener('close',()=>focusBeforeDialog?.focus());});
    root.querySelectorAll('.mobile-nav>details').forEach(d=>{if(initialized.has(d))return;initialized.add(d);d.addEventListener('toggle',()=>{if(d.open)d.parentElement.querySelectorAll(':scope>details').forEach(other=>{if(other!==d)other.open=false;});});});
    root.querySelectorAll('.desktop-nav .nav-group').forEach(d=>{if(initialized.has(d))return;initialized.add(d);let enter,leave;const show=()=>{document.querySelectorAll('.desktop-nav .nav-group').forEach(other=>other.open=other===d);};d.addEventListener('pointerenter',()=>{clearTimeout(leave);if(fine.matches)enter=setTimeout(show,180);});d.addEventListener('pointerleave',()=>{clearTimeout(enter);leave=setTimeout(()=>{if(!d.contains(document.activeElement))d.open=false;},240);});d.querySelector('summary')?.addEventListener('click',e=>{clearTimeout(enter);clearTimeout(leave);if(fine.matches&&e.detail>0){e.preventDefault();show();}});d.addEventListener('focusout',e=>{if(!d.contains(e.relatedTarget))d.open=false;});});
    root.querySelectorAll('[data-hero-slideshow]').forEach(hero=>{if(initialized.has(hero))return;initialized.add(hero);const slides=[...hero.querySelectorAll('[data-hero-slide]')],dots=[...hero.querySelectorAll('[data-hero-dot]')];let current=0,timer;const show=i=>{current=i;slides.forEach((s,n)=>{s.classList.toggle('is-active',n===i);s.setAttribute('aria-hidden',String(n!==i));s.tabIndex=n===i?0:-1;dots[n]?.setAttribute('aria-pressed',String(n===i));});};const schedule=()=>{clearInterval(timer);if(slides.length>1&&!reduced.matches&&!document.hidden&&!window.Shopify?.designMode)timer=setInterval(()=>show((current+1)%slides.length),5500);};dots.forEach((d,i)=>d.addEventListener('click',()=>{show(i);schedule();}));const cleanup=()=>{clearInterval(timer);document.removeEventListener('visibilitychange',schedule);reduced.removeEventListener('change',schedule);};document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);cleanups.set(hero,cleanup);schedule();});
    root.querySelectorAll('.embroidery-panels').forEach(g=>{if(initialized.has(g))return;initialized.add(g);g.querySelectorAll('.embroidery-panel').forEach(panel=>{const activate=()=>g.querySelectorAll('.embroidery-panel').forEach(p=>p.classList.toggle('is-active',p===panel));panel.addEventListener('pointerenter',()=>{if(fine.matches)activate();});panel.addEventListener('focusin',activate);});});
    root.querySelectorAll('.making-film').forEach(panel=>{if(initialized.has(panel))return;initialized.add(panel);panel.addEventListener('toggle',()=>{if(!panel.open)panel.querySelectorAll('video').forEach(video=>video.pause());});});
    root.querySelectorAll('video[data-autoplay]').forEach(v=>{if(initialized.has(v))return;initialized.add(v);let visible=false,userPaused=false,automaticPause=false;const pauseAutomatically=()=>{if(!v.paused){automaticPause=true;v.pause();}};const sync=()=>{if(visible&&!reduced.matches&&!document.hidden&&!userPaused)v.play().catch(()=>{});else pauseAutomatically();};const onPause=()=>{if(automaticPause){automaticPause=false;return;}userPaused=true;};const onPlay=()=>{userPaused=false;};v.addEventListener('pause',onPause);v.addEventListener('play',onPlay);const observer=new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync();},{threshold:.25});observer.observe(v);document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);cleanups.set(v,()=>{observer.disconnect();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);v.removeEventListener('pause',onPause);v.removeEventListener('play',onPlay);});});
    root.querySelectorAll('[data-recommendations-url]').forEach(el=>{if(initialized.has(el))return;initialized.add(el);fetch(el.dataset.recommendationsUrl).then(r=>{if(!r.ok)throw Error();return r.text();}).then(html=>{const doc=new DOMParser().parseFromString(html,'text/html'),content=doc.querySelector('[data-recommendations-url]');if(content?.querySelector('.product-card')){el.innerHTML=content.innerHTML;initialize(el);}}).catch(()=>{});});
    root.querySelectorAll('[data-save-piece]').forEach(b=>{const saved=readSaved();b.setAttribute('aria-pressed',String(saved.some(s=>s.handle===b.dataset.savePiece)));});
    root.querySelectorAll('[data-saved-pieces]').forEach(el=>{if(initialized.has(el))return;initialized.add(el);const saved=readSaved();if(!saved.length){el.textContent='No saved pieces yet. Browse the collection to start your list.';return;}Promise.all(saved.map(s=>{const target=url(s.url);if(target.origin!==location.origin)return '';target.searchParams.set('section_id','product-card');return fetch(target).then(r=>r.ok?r.text():'');})).then(pages=>{el.innerHTML=pages.join('');initialize(el);});});
  }
  function readSaved(){try{const data=JSON.parse(localStorage.getItem('dimohe-saved-pieces')||'[]');return Array.isArray(data)?data.filter(s=>s&&typeof s.url==='string'&&typeof s.handle==='string').slice(0,40):[];}catch{return [];}}
  async function refreshCart(){const target=url(routes.root);target.searchParams.set('section_id','cart-content');const response=await fetch(target,{headers:{Accept:'text/html'}});if(!response.ok)throw Error('Your bag could not be refreshed. Please open the bag page.');const html=await response.text(),doc=new DOMParser().parseFromString(html,'text/html'),content=doc.querySelector('.shopify-section');document.querySelectorAll('[data-cart-content]').forEach(el=>{const note=el.querySelector('textarea[name=note]')?.value;el.innerHTML=content?content.innerHTML:html;if(note!==undefined&&el.querySelector('textarea[name=note]'))el.querySelector('textarea[name=note]').value=note;});const json=await fetch(routes.cart+'.js').then(r=>r.json());document.querySelectorAll('[data-bag-count]').forEach(el=>el.textContent=json.item_count);}
  async function changeCart(key,quantity){if(cartBusy)return;if(!Number.isInteger(quantity)||quantity<0){notice('Enter a whole quantity of zero or more.');return;}cartBusy=true;try{const r=await fetch(routes.change+'.js',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({id:key,quantity})}),data=await r.json();if(!r.ok)throw Error(data.description||'Your bag could not be updated.');await refreshCart();}catch(e){notice(e.message);await refreshCart().catch(()=>{});}finally{cartBusy=false;}}
  document.addEventListener('click',async e=>{
    if(e.target.closest('[data-menu-toggle]')){mobile(document.querySelector('.mobile-nav')?.hidden);return;}
    if(e.target.closest('.mobile-nav a'))mobile(false);
    if(!e.target.closest('.desktop-nav'))document.querySelectorAll('.desktop-nav details').forEach(d=>d.open=false);
    if(e.target.closest('[data-search-open]')){openDialog('search-dialog');return;}
    if(e.target.closest('[data-close-dialog]')){e.target.closest('dialog')?.close();return;}
    if(e.target.closest('[data-bag-open]')){e.preventDefault();try{await refreshCart();openDialog('bag-dialog');}catch(error){location.href=routes.cart;}return;}
    const quick=e.target.closest('[data-quick-url]');if(quick){quick.disabled=true;try{const target=url(quick.dataset.quickUrl);target.searchParams.set('section_id','quick-product');const response=await fetch(target);if(!response.ok)throw Error('Could not load this product.');const doc=new DOMParser().parseFromString(await response.text(),'text/html'),content=doc.querySelector('.quick-content');if(!content)throw Error('Please open the product to see its details.');document.querySelector('[data-quick-content]').replaceChildren(content);initialize(content);openDialog('quick-dialog');}catch(error){notice(error.message);}finally{quick.disabled=false;}return;}
    const remove=e.target.closest('[data-cart-remove]');if(remove){e.preventDefault();await changeCart(remove.dataset.cartRemove,0);return;}
    const thumb=e.target.closest('[data-image]');if(thumb){const img=document.getElementById('main-product-image');if(img){img.src=thumb.dataset.image;img.removeAttribute('srcset');}document.querySelectorAll('.thumbnails button').forEach(b=>b.setAttribute('aria-pressed',String(b===thumb)));return;}
    if(e.target.closest('[data-zoom]')){const img=document.querySelector('#zoom-dialog img'),main=document.getElementById('main-product-image');if(img&&main){img.src=main.src;img.removeAttribute('srcset');openDialog('zoom-dialog');}return;}
    const pick=e.target.closest('[data-picks-category]');if(pick){const group=pick.closest('.edit-section');group.querySelectorAll('[data-picks-category]').forEach(b=>b.setAttribute('aria-pressed',String(b===pick)));group.querySelectorAll('[data-pick-group]').forEach(g=>g.hidden=g.dataset.pickGroup!==pick.dataset.picksCategory);return;}
    const save=e.target.closest('[data-save-piece]');if(save){try{let saved=readSaved(),exists=saved.some(s=>s.handle===save.dataset.savePiece);saved=saved.filter(s=>s.handle!==save.dataset.savePiece);if(!exists)saved.push({handle:save.dataset.savePiece,url:save.dataset.saveUrl});localStorage.setItem('dimohe-saved-pieces',JSON.stringify(saved));save.setAttribute('aria-pressed',String(!exists));notice(exists?'Removed from saved pieces.':'Saved to your wishlist.');}catch{notice('Your browser could not save this piece.');}}
  });
  document.addEventListener('submit',async e=>{const form=e.target;if(!form.matches('[data-product-form]'))return;e.preventDefault();if(cartBusy)return;cartBusy=true;const button=form.querySelector('[data-add-button]'),error=form.querySelector('.form-error');if(error)error.textContent='';if(button)button.disabled=true;try{const response=await fetch(routes.add+'.js',{method:'POST',headers:{Accept:'application/json'},body:new FormData(form)}),data=await response.json();if(!response.ok)throw Error(data.description||'This item could not be added.');await refreshCart();openDialog('bag-dialog');notice('Added to your bag.');}catch(err){if(error)error.textContent=err.message;notice(err.message);}finally{cartBusy=false;const option=form.querySelector('[data-variant-select]')?.selectedOptions[0];if(button)button.disabled=option?.dataset.available==='false';}});
  document.addEventListener('change',e=>{const el=e.target;if(el.matches('[data-sort]')){el.form.requestSubmit();return;}if(el.matches('[data-cart-key]')){changeCart(el.dataset.cartKey,Number(el.value));return;}if(el.matches('[data-variant-select]')){const option=el.selectedOptions[0],container=el.closest('.product-info,.quick-content'),button=el.form.querySelector('[data-add-button]');const quantity=el.form.querySelector('input[name=quantity]');if(quantity&&quantity.type!=='hidden'){quantity.min=option.dataset.min||'1';quantity.step=option.dataset.step||'1';if(option.dataset.max)quantity.max=option.dataset.max;else quantity.removeAttribute('max');if(Number(quantity.value)<Number(quantity.min))quantity.value=quantity.min;}if(button){button.disabled=option.dataset.available!=='true';button.textContent=button.disabled?'Sold out':'Add to bag';}container?.querySelectorAll('[data-product-price]').forEach(p=>p.textContent=option.dataset.price);const stock=container?.querySelector('[data-stock]');if(stock)stock.textContent=option.dataset.stockLabel || (option.dataset.available==='true'?'Available':'Sold out');if(option.dataset.image){const img=document.getElementById('main-product-image');if(img){img.src=option.dataset.image;img.removeAttribute('srcset');}}if(!el.closest('#quick-dialog')){const target=new URL(location.href);target.searchParams.set('variant',el.value);history.replaceState({},'',target);}}});
  document.addEventListener('keydown',e=>{if(e.key==='Tab'&&document.documentElement.classList.contains('dimohe-menu-open')&&!document.querySelector('dialog[open]')){const focusable=[...document.querySelectorAll('.site-header a[href],.site-header button:not([disabled]),.mobile-nav a[href],.mobile-nav summary')].filter(el=>el.getClientRects().length);const first=focusable[0],last=focusable[focusable.length-1];if(first&&((e.shiftKey&&document.activeElement===first)||(!e.shiftKey&&document.activeElement===last)||!focusable.includes(document.activeElement))){e.preventDefault();(e.shiftKey?last:first).focus();}}if(e.key==='Escape'){if(!document.querySelector('.mobile-nav')?.hidden){mobile(false);document.querySelector('[data-menu-toggle]')?.focus();}document.querySelectorAll('.desktop-nav details[open]').forEach(d=>{d.open=false;d.querySelector('summary')?.focus();});}});
  matchMedia('(min-width: 900px)').addEventListener('change',e=>{if(e.matches)mobile(false);});
  document.addEventListener('shopify:section:load',e=>initialize(e.target));document.addEventListener('shopify:section:unload',e=>{for(const [el,dispose]of cleanups)if(e.target.contains(el)){dispose();cleanups.delete(el);}});document.addEventListener('shopify:block:select',e=>{const slide=e.target.closest('[data-hero-slide]');if(slide){const slides=[...slide.parentElement.querySelectorAll('[data-hero-slide]')];slide.parentElement.querySelector(`[data-hero-dot="${slides.indexOf(slide)}"]`)?.click();}});
  initialize();
})();

/* October refinement: native scrolling and truthful merchandising. */
(() => {
  const ready = new WeakSet();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function init(root = document) {
    root.querySelectorAll('[data-product-carousel]').forEach(el => {
      if (ready.has(el)) return; ready.add(el);
      const rail = el.querySelector('.product-rail'), prev = el.querySelector('[data-rail-prev]'), next = el.querySelector('[data-rail-next]');
      const update = () => { prev.disabled = rail.scrollLeft <= 2; next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2; };
      [prev, next].forEach((b, i) => b.addEventListener('click', () => rail.scrollBy({left: (i ? 1 : -1) * (rail.clientWidth * .85), behavior: reduced.matches ? 'instant' : 'smooth'})));
      rail.addEventListener('scroll', update, {passive:true});
      rail.addEventListener('keydown', e => {if(e.target !== rail) return; if(['ArrowLeft','ArrowRight'].includes(e.key)){ e.preventDefault(); (e.key === 'ArrowLeft' ? prev : next).click(); }});
      const pause = el.querySelector('[data-rail-pause]');
      let timer, visible=false, manualPause=false, hovering=false, touching=false, interactionUntil=0;
      const stop=()=>{clearInterval(timer);timer=null;};
      const sync=()=>{stop();if(!pause)return;pause.textContent=manualPause||reduced.matches?'Play':'Pause';pause.setAttribute('aria-pressed',String(manualPause));pause.setAttribute('aria-label',manualPause?'Play slideshow':'Pause slideshow');if(!visible||manualPause||reduced.matches||document.hidden||hovering||touching||el.contains(document.activeElement)||window.Shopify?.designMode)return;
        timer=setInterval(()=>{if(Date.now()<interactionUntil)return;const step=rail.querySelector('.product-card')?.getBoundingClientRect().width+parseFloat(getComputedStyle(rail).columnGap)||rail.clientWidth*.8;const end=rail.scrollWidth-rail.clientWidth;rail.scrollTo({left:rail.scrollLeft>=end-3?0:Math.min(end,rail.scrollLeft+step),behavior:'smooth'});},4500);
      };
      pause?.addEventListener('click',()=>{manualPause=!manualPause;sync();});
      rail.querySelectorAll('.product-image').forEach(photo=>{photo.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){hovering=true;sync();}});photo.addEventListener('pointerleave',()=>{hovering=false;sync();});});
      el.addEventListener('focusin',sync);el.addEventListener('focusout',()=>setTimeout(sync,0));
      rail.addEventListener('touchstart',()=>{touching=true;sync();},{passive:true});rail.addEventListener('touchend',()=>{touching=false;interactionUntil=Date.now()+10000;sync();},{passive:true});
      rail.addEventListener('wheel',()=>{interactionUntil=Date.now()+10000;},{passive:true});
      const visibility=new IntersectionObserver(es=>{visible=es[0].isIntersecting;sync();},{threshold:.2});visibility.observe(el);
      document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
      const observer = new ResizeObserver(update); observer.observe(rail);
      el.addEventListener('dimohe:dispose', () => {observer.disconnect();visibility.disconnect();stop();document.removeEventListener('visibilitychange',sync);reduced.removeEventListener('change',sync);}, {once:true}); update();sync();
    });
    root.querySelectorAll('[data-welcome-offer]').forEach(dialog => {
      if (ready.has(dialog)) return; ready.add(dialog);
      let timer;
      const seen = () => {try {return sessionStorage.getItem('dimohe-welcome-session-dismissed')==='true';} catch {return false;}};
      const open = () => {
        if(!dialog.isConnected) return;
        if(document.hidden || document.querySelector('dialog[open]') || document.querySelector('.mobile-nav:not([hidden])') || document.activeElement?.matches('input,textarea,select,[contenteditable=true]')) { timer = setTimeout(open, 3000); return; }
        dialog.showModal();
      };
      const successful = dialog.querySelector('[data-offer-success]');
      if(successful || dialog.querySelector('[role=alert]')) open();
      else if(!seen() && dialog.dataset.designMode !== 'true') timer = setTimeout(open, Number(dialog.dataset.delay));
      dialog.addEventListener('close', () => {try {sessionStorage.setItem('dimohe-welcome-session-dismissed', 'true');} catch {} });
      const escapeOffer=e=>{if(e.key==='Escape'&&dialog.open)dialog.close();};document.addEventListener('keydown',escapeOffer);
      dialog.addEventListener('dimohe:dispose', () => {clearTimeout(timer);document.removeEventListener('keydown',escapeOffer);}, {once:true});
    });
  }
  document.addEventListener('click', async e => {
    const button = e.target.closest('[data-share-platform],[data-copy-url]'); if(!button) return;
    const message = button.closest('.product-share')?.querySelector('.share-message');
    const shareUrl = button.dataset.shareUrl || button.dataset.copyUrl;
    const platform = button.dataset.sharePlatform;
    try {
      if(platform && navigator.share) {await navigator.share({title:button.dataset.shareTitle,url:shareUrl}); if(message) message.textContent=''; return;}
      await navigator.clipboard.writeText(shareUrl);
      if(message) message.textContent = platform ? `Link copied. Paste it into ${platform} to share this piece.` : 'Link copied.';
    } catch(err) {if(err.name !== 'AbortError' && message) message.textContent=`Copy this link to share: ${shareUrl}`;}
  });
  document.addEventListener('shopify:section:select', e => {const dialog=e.target.querySelector('[data-welcome-offer]');if(dialog&&!dialog.open)dialog.showModal();});
  document.addEventListener('shopify:section:load', e => init(e.target));
  document.addEventListener('shopify:section:unload', e => e.target.querySelectorAll('[data-product-carousel],[data-welcome-offer]').forEach(el => el.dispatchEvent(new Event('dimohe:dispose'))));
  init();
})();


// Keep overlapping film audio out of the shopping experience.
document.addEventListener('play',event=>{if(event.target.tagName!=='VIDEO')return;document.querySelectorAll('video').forEach(video=>{if(video!==event.target)video.pause();});},true);
