// Current selling prices in cents, verified against Dimohe's November 7 promotion.
// Bundle checkout links are enabled only after actual Shopify products are supplied.
const item=(handle,name,priceCents,extra={})=>({handle,name,priceCents,...extra});
const nava=item('nava-pre-shower-body-glow-oil-rose-almond-100ml','Nava Rose & Almond Body Oil · 100 ml',2380);
const ubtan=item('snanamrit-ubtan-natural-bathing-powder-250gm','Snanamrit Ubtan Bathing Powder · 250 g',2465);
const coconut=item('keshamrit-conditioning-cleansing-shampoo-coconut-milk-250ml','Coconut Milk Shampoo · 250 ml',2550);
const lavender=item('lavender-smoothening-conditioner-150gm-glass-jar','Lavender Conditioner · 150 g',2380);
const mystic=item('mystic-hair-oil-100ml','Mystic Hair Oil · 100 ml',2380);
const napkins=(handle,name)=>item(handle,name,2550,{format:'8 × 8 in',prices:{2:2550,4:4675,6:6715}});
export const gifting={
  checkedOn:'2026-11-07',discountPercent:10,
  categories:[
    {id:'hosting',name:'For the host',description:'Table linens for the next gathering, or a thank-you to bring along.'},
    {id:'bathing',name:'Bath & body',description:'Ayurvedic care for oiling, cleansing and bathing.'},
    {id:'hair',name:'Hair care',description:'Three steps for wash day, from the first oiling to conditioning.'},
    {id:'living',name:'For their home',description:'Soft cotton layers, with hand-block printed florals.'},
  ],
  collaborations:[
    {id:'rose-ritual',name:'The Rose Ritual',image:'/media/gifting-rose.svg',alt:'Rose-quartz heart necklace, Nava Body Oil, keepsake box and intention card',description:'A rose-quartz heart necklace paired with rose-and-almond body oil. A small thank-you, or a birthday gift with something to keep.',contents:['Rose-quartz heart necklace','Nava Rose & Almond Body Oil · 100 ml','Keepsake box and intention card'],priceCents:5950,purchaseURL:null},
    {id:'unwind',name:'Unwind',image:'/media/gifting-amethyst.svg',alt:'Amethyst heart necklace, Lavender Conditioner, keepsake box and intention card',description:'An amethyst heart necklace with Lavender Conditioner, packed together in a keepsake box.',contents:['Amethyst heart necklace','Lavender Conditioner · 150 g','Keepsake box and intention card'],priceCents:5950,purchaseURL:null},
  ],
  bundles:[
    {id:'willow-table',category:'hosting',name:'The Willow Table',description:'A reversible runner and olive-green cocktail napkins. Both hand-block printed on cotton, for a table that feels considered without being formal.',items:[item('sage-vine-reversible-table-runner','Sage Vine Reversible Table Runner · 18 × 90 in',8415),napkins('olive-willow-cocktail-napkins-set-of-6','Olive Willow Cocktail Napkins')],napkinCounts:[2,4,6],purchaseURL:null},
    {id:'rose-table',category:'hosting',name:'Rose & Raspberry',description:'Floral cocktail napkins for their table, and rose-and-almond body oil for afterwards. A personal thank-you for someone who loves to host.',items:[nava,napkins('raspberry-bloom-cocktail-napkins-set-of-6','Raspberry Bloom Cocktail Napkins')],napkinCounts:[2,4,6],purchaseURL:null},
    {id:'bath-routine',category:'bathing',name:'The Bathing Set',description:'Pre-shower oil, coconut milk shampoo and traditional ubtan bathing powder. Three everyday essentials, brought together in one gift.',items:[nava,coconut,ubtan],napkinCounts:[],purchaseURL:null},
    {id:'daily-pause',category:'bathing',name:'Ubtan & Waffle Cotton',description:'Ubtan bathing powder with four cotton face towels, hand-block printed with floral motifs. For someone who enjoys their morning routine.',items:[item('crimson-botanica-waffle-face-towels-set-of-4','Crimson Botanica Face Towels · Set of 4, 12 × 12 in',6715),ubtan],napkinCounts:[],purchaseURL:null},
    {id:'hair-routine',category:'hair',name:'The Wash Day Set',description:'Massage in the hair oil before washing. Follow with coconut milk shampoo and lavender conditioner. A complete three-piece hair-care gift.',items:[mystic,coconut,lavender],napkinCounts:[],purchaseURL:null},
    {id:'living-room',category:'living',name:'Blush & Terracotta',description:'A three-layer muslin throw with a quilted cushion cover. Blush pink and terracotta florals bring a little warmth to their favourite chair.',items:[item('blush-garden-3-layer-throw','Blush Garden Three-layer Muslin Throw · 60 × 90 in',13515),item('terracotta-bloom-quilted-cushion-cover','Terracotta Bloom Cushion Cover · 18 × 18 in',9265)],note:'Cushion cover only. Insert not included.',napkinCounts:[],purchaseURL:null},
  ],
};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(cents/100);
const localImage=src=>new URL(src,'https://dimohe.com').pathname.replace(/^\/s\/files\/[^]+\/(files|products)\//,'/cdn/shop/$1/');
export function bundlePrice(bundle,count=bundle.napkinCounts[0]){
  const prices=bundle.items.map(item=>item.prices?item.prices[count]:item.priceCents);
  if(prices.some(p=>!Number.isSafeInteger(p)||p<=0))throw new Error('Missing verified component price');
  const totalCents=prices.reduce((a,b)=>a+b,0),priceCents=Math.round(totalCents*(100-gifting.discountPercent)/100);
  return {totalCents,priceCents,savingCents:totalCents-priceCents,discountPercent:gifting.discountPercent};
}
const enquire=name=>`<a class="text-link gift-enquire" href="mailto:support@dimohe.com?subject=${encodeURIComponent('Gift enquiry: '+name)}">Enquire with Dimohe<span class="sr-only"> about ${esc(name)}</span></a>`;
const purchase=g=>g.purchaseURL&&/^\/products\/[\w-]+(?:\?variant=\d+)?$/.test(g.purchaseURL)?`<a class="button" href="${esc(g.purchaseURL)}">View gift set</a>`:enquire(g.name);
export function giftingPage(products){
  const byHandle=new Map(products.map(p=>[p.handle,p]));
  const productPhoto=item=>{
    const product=byHandle.get(item.handle),image=product?.images?.[0];
    return image?.src?`<img src="${esc(localImage(image.src))}" alt="${esc(item.name)}" loading="lazy" width="600" height="750">`:'';
  };
  const card=g=>{
    const textile=g.items.find(i=>i.prices),counts=g.napkinCounts.length?g.napkinCounts:['fixed'];
    const offers=Object.fromEntries(counts.map(count=>[count,bundlePrice(g,count)])),price=offers[counts[0]];
    return `<article class="gift-bundle" data-gift-bundle="${g.id}" data-gift-textile="${esc(textile?.name||'')}" data-gift-offers="${esc(JSON.stringify(offers))}"><div class="gift-pairing-photo gift-photo-count-${g.items.length}">${g.items.map(productPhoto).join('')}</div><div class="gift-bundle-copy"><h3>${esc(g.name)}</h3><p>${esc(g.description)}</p><ul class="gift-contents">${g.items.map(i=>`<li>${i.prices?`<span data-gift-count-label>${counts[0]} ${esc(i.name)} (${esc(i.format)})</span>`:esc(i.name)}</li>`).join('')}</ul>${g.napkinCounts.length?`<fieldset class="gift-options"><legend>Cocktail napkins · 8 × 8 in</legend><div>${counts.map((n,i)=>`<button type="button" data-gift-count="${n}" aria-pressed="${i===0}" aria-label="Choose ${n} cocktail napkins in ${esc(g.name)}">Set of ${n}</button>`).join('')}</div></fieldset>`:''}${g.note?`<p class="gift-component-note">${esc(g.note)}</p>`:''}<div class="gift-pricing" aria-live="polite" aria-atomic="true"><p><strong data-gift-price>${money(price.priceCents)}</strong><s data-gift-total aria-label="Individual items total">${money(price.totalCents)}</s></p><p class="gift-price-note" data-gift-saving>Save ${money(price.savingCents)} · ${gifting.discountPercent}% bundle saving</p></div>${purchase(g)}</div></article>`;
  };
  return `<div class="gifting-page gifting-refined gifts-current">
    <section class="gift-hero" aria-labelledby="gifting-title"><div class="gift-hero-copy"><p class="eyebrow">DIMOHE</p><h1 id="gifting-title">Gifts</h1><p class="gift-deck">For their home. For their everyday.</p><p>Hand-block printed cotton, Ayurvedic care and jewellery, chosen for the people you know best.</p><div class="gift-hero-links"><a class="button" href="#gift-edit">Explore bundles</a><a class="text-link" href="/collections/gifts-under-100">Gifts under $100</a></div></div><figure class="gift-hero-photo"><img src="/media/gifting-rose.svg" alt="The Rose Ritual, with a rose-quartz necklace and Nava Body Oil" width="900" height="1350" fetchpriority="high"><figcaption>The Rose Ritual · Packed with a keepsake box</figcaption></figure></section>
    <div class="gift-catalogue" id="gift-edit"><div class="section gift-catalogue-intro"><h2>Dimohe bundles</h2><p>Save ${gifting.discountPercent}% on the current combined price of the items in each bundle.</p><nav class="gift-category-links" aria-label="Choose a gift category">${gifting.categories.map(c=>`<a href="#${c.id}">${esc(c.name)}</a>`).join('')}<a href="#gift-sets">Jewellery & care</a></nav></div>
    ${gifting.categories.map(c=>{const bundles=gifting.bundles.filter(g=>g.category===c.id);return `<section class="section gift-category-section" id="${c.id}" aria-labelledby="gifts-${c.id}"><div class="gift-section-heading"><h2 id="gifts-${c.id}">${esc(c.name)}</h2><p>${esc(c.description)}</p></div><div class="gift-edit-grid${bundles.length===1?' gift-single':''}">${bundles.map(card).join('')}</div></section>`;}).join('')}</div>
    <section class="section gift-collaborations" id="gift-sets" aria-labelledby="collaborations-title"><div class="gift-section-heading"><h2 id="collaborations-title">Jewellery & care</h2><p>Heart-shaped stone necklaces by HeartsLinked, paired with Dimohe care. These sets are fulfilled by Dimohe.</p></div><div class="gift-collaboration-grid">${gifting.collaborations.map(g=>`<article class="gift-collaboration"><div class="gift-set-photo"><img src="${g.image}" alt="${esc(g.alt)}" width="900" height="1350" loading="lazy"></div><div class="gift-set-copy"><h3>${esc(g.name)}</h3><p>${esc(g.description)}</p><details class="gift-included"><summary>What’s included</summary><ul class="gift-contents">${g.contents.map(c=>`<li>${esc(c)}</li>`).join('')}</ul></details><div class="gift-set-action"><strong class="gift-set-price">${money(g.priceCents)}</strong>${purchase(g)}</div></div></article>`).join('')}</div></section>
    <section class="section gift-ending"><div><h2>A little something</h2><p>Looking for one piece? Find home textiles and everyday care in our selection under $100.</p><a class="text-link" href="/collections/gifts-under-100">Explore gifts under $100</a></div><div><h3>Ordering a gift</h3><p>For bundle orders and availability, contact our team. We’ll help you choose a set and confirm the details before you order.</p><a class="text-link" href="mailto:support@dimohe.com">support@dimohe.com</a><p class="gift-shopping-note">Bundle prices use current promotional item prices. Jewellery & care sets are priced separately. Bundle photographs show the individual products; packaging may vary.</p></div></section>
  </div>`;
}
