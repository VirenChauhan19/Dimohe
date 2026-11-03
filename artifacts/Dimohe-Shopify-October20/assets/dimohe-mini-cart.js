/* Product-card quantities use Shopify's native cart and variant endpoints. */
(() => {
  const routes=window.Dimohe;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const money=cents=>new Intl.NumberFormat(document.documentElement.lang||'en',{style:'currency',currency:window.Shopify?.currency?.active||'USD'}).format(cents/100);
  let cart=null,busy=false;
  const lines=control=>(cart?.items||[]).filter(item=>String(item.product_id)===control.dataset.productId);
  function sync(){
    if(!cart)return;
    document.querySelectorAll('[data-shopify-card-cart]').forEach(control=>{
      const qty=lines(control).reduce((n,item)=>n+item.quantity,0),name=esc(control.dataset.cardLabel),disabled=busy?' disabled':'';
      control.classList.toggle('has-quantity',qty>0);control.setAttribute('aria-busy',String(busy));
      control.innerHTML=qty?`<button type="button" data-mini-action="remove" aria-label="Remove one ${name} from bag"${disabled}>−</button><button type="button" class="card-cart-count" data-mini-action="options" aria-label="${qty} ${name} in bag. Manage options."${disabled}>${qty}</button><button type="button" data-mini-action="add" aria-label="Add another ${name} to bag"${disabled}>+</button>`:`<button type="button" data-mini-action="add" aria-label="Add ${name} to bag"${disabled||control.dataset.available!=='true'?' disabled':''}>+</button>`;
    });
  }
  async function read(){const response=await fetch(routes.cart+'.js');if(!response.ok)throw Error('Please open your bag to refresh it.');cart=await response.json();sync();return cart;}
  function status(message){const el=document.getElementById('status');el.textContent=message;el.hidden=false;clearTimeout(el.timer);el.timer=setTimeout(()=>el.hidden=true,5000);}
  async function mutate(path,data){
    if(busy)return false;busy=true;sync();
    try{const response=await fetch(path+'.js',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(data)}),result=await response.json();if(!response.ok)throw Error(result.description||'This item could not be added.');cart=await routes.refreshCart();return true;}
    catch(error){status(error.message);await read().catch(()=>{});return false;}
    finally{busy=false;sync();}
  }
  function open(content,compact=false){
    const dialog=document.getElementById('quick-dialog');document.querySelectorAll('dialog[open]').forEach(d=>d.close());dialog.classList.toggle('is-mini-choice',compact);dialog.querySelector('[data-quick-content]').innerHTML=content;dialog.showModal();dialog.querySelector('button:not([disabled]),a')?.focus();
  }
  function manage(control){
    open(`<h2>${esc(control.dataset.cardLabel)}</h2><p class="mini-options-intro">Adjust the options in your bag.</p>${lines(control).map(item=>`<div class="mini-variant-row"><span>${esc(item.variant_title||item.product_title)}</span><div><button type="button" data-mini-line="${esc(item.key)}" data-mini-quantity="${item.quantity-1}" aria-label="Decrease ${esc(item.variant_title||item.title)}">−</button><span>${item.quantity}</span><button type="button" data-mini-line="${esc(item.key)}" data-mini-quantity="${item.quantity+1}" aria-label="Increase ${esc(item.variant_title||item.title)}">+</button></div></div>`).join('')}<a class="text-link" href="${esc(control.dataset.productUrl)}">View full details</a>`);
  }
  async function choose(control){
    if(control.dataset.sellingPlan==='true'){location.href=control.dataset.productUrl;return;}
    const response=await fetch(control.dataset.productUrl+'.js');if(!response.ok)throw Error('Please open the product to choose its options.');const product=await response.json();
    const option=typeof product.options?.[0]==='object'?product.options[0].name:product.options?.[0]||'option';
    open(`<div class="quick-content">${product.featured_image?`<img src="${esc(product.featured_image)}" alt="${esc(product.title)}" width="64" height="80">`:''}<div><h2>${esc(control.dataset.cardLabel)}</h2><p class="price">${money(product.price)}</p><fieldset class="mini-size-picker"><legend>Choose ${esc(option.toLowerCase())} to add to your bag</legend><div>${product.variants.map(v=>`<button type="button" data-mini-add-variant="${v.id}" aria-label="Add ${esc(v.title)} to bag"${v.available?'':' disabled'}>${esc(v.title)}<small>${money(v.price)}</small></button>`).join('')}</div></fieldset><p class="form-error" role="status"></p><a class="text-link" href="${esc(control.dataset.productUrl)}">View full details</a></div></div>`,true);
  }
  document.addEventListener('dimohe:cart-updated',event=>{cart=event.detail;sync();});
  document.addEventListener('click',async event=>{
    const option=event.target.closest('[data-mini-add-variant]'),line=event.target.closest('[data-mini-line]'),button=event.target.closest('[data-mini-action]');
    if(!option&&!line&&!button||busy)return;
    event.preventDefault();
    try{
      if(option||line){const dialog=document.getElementById('quick-dialog');const disabled=new Map([...dialog.querySelectorAll('button')].map(b=>[b,b.disabled]));disabled.forEach((_,b)=>b.disabled=true);const ok=option?await mutate(routes.add,{id:option.dataset.miniAddVariant,quantity:1}):await mutate(routes.change,{id:line.dataset.miniLine,quantity:Number(line.dataset.miniQuantity)});if(ok)dialog.close();else disabled.forEach((wasDisabled,b)=>b.disabled=wasDisabled);return;}
      const control=button.closest('[data-shopify-card-cart]');if(!cart)await read();const selected=lines(control),action=button.dataset.miniAction;
      if(action==='options'||action==='remove'&&selected.length>1){manage(control);return;}
      if(action==='add'&&(control.dataset.sellingPlan==='true'||!selected.length&&!control.dataset.variantId||selected.length>1)){await choose(control);return;}
      const id=selected[0]?.variant_id||control.dataset.variantId;
      await mutate(action==='remove'?routes.change:routes.add,action==='remove'?{id:selected[0].key,quantity:selected[0].quantity-1}:{id,quantity:1});
      control.querySelector(`[data-mini-action="${action}"]`)?.focus();
    }catch(error){status(error.message);}
  });
  document.addEventListener('shopify:section:load',()=>read().catch(()=>{}));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!busy)read().catch(()=>{});});
  document.querySelectorAll('video[data-preview-end]').forEach(video=>video.addEventListener('timeupdate',()=>{if(video.currentTime>=Number(video.dataset.previewEnd))video.currentTime=0;}));
  read().catch(()=>{});
})();

/* The category rail keeps moving forward through identical end copies. */
(() => {
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
      setInterval(()=>{if(paused||hovered||focused||!visible||document.hidden||reduced.matches||window.Shopify?.designMode||document.querySelector('dialog[open]')||Date.now()-lastInteraction<8000)return;move(1);},4500);
    }
    new ResizeObserver(resize).observe(rail);resize();
  });
})();
