// Current component prices are recorded in cents. A bundle costs 85% of their sum.
// Pricing is approved; checkout still requires real bundle SKUs and product URLs.
export const gifting = {
  checkedOn: '2026-11-04', discountPercent: 15, pricingApproved: true,
  collaborations: [
    {
      id: 'rose-ritual', name: 'The Rose Ritual', subtitle: 'Self-Love Gift Set',
      image: '/media/gifting-rose.svg', alt: 'Rose-quartz heart necklace, Nava Body Oil, keepsake box and intention card',
      description: 'A rose-quartz heart necklace with Nava Body Oil. Packed with an intention card in a keepsake box, for a birthday, a thank-you or a little encouragement.',
      contents: ['Rose-quartz heart necklace', 'Nava Body Oil · Rose & Almond, 100 ml', 'Keepsake box and intention card'],
      observedPrice: 59.50, priceApprovedForDisplay: false,
      url: 'https://www.etsy.com/listing/4604070017/rose-quartz-necklace-gift-set-for-her',
    },
    {
      id: 'unwind', name: 'Unwind', subtitle: 'Amethyst & Lavender Gift Set',
      image: '/media/gifting-amethyst.svg', alt: 'Amethyst heart necklace, Lavender Smoothening Conditioner, keepsake box and intention card',
      description: 'An amethyst heart necklace with Lavender Smoothening Conditioner. A gift for their evening routine, with something to keep long after.',
      contents: ['Amethyst heart necklace', 'Lavender Smoothening Conditioner, 150 g', 'Keepsake box and intention card'],
      observedPrice: 59.50, priceApprovedForDisplay: false,
      url: 'https://www.etsy.com/listing/4608107804/amethyst-gift-set-for-her-relaxation',
    },
  ],
  bundles: [
    {
      id: 'daily-pause', name: 'Ubtan & Waffle Cotton',
      description: 'For someone who likes a slower morning. Ubtan bathing powder with four soft cotton face towels, hand-block printed with floral motifs.',
      wellness: { handle: 'snanamrit-ubtan-natural-bathing-powder-250gm', name: 'Snanamrit Ubtan Bathing Powder · 250 g' },
      textile: { handle: 'crimson-botanica-waffle-face-towels-set-of-4', name: 'Crimson Botanica Waffle Face Towels', count: 4 },
      componentPrices: { wellness: 2465, textiles: { 4: 6715 } },
      napkinCounts: [], price: null, approved: false, sku: null, purchaseURL: null,
    },
    {
      id: 'rose-table', name: 'Rose & Raspberry',
      description: 'A thank-you for your favourite host: floral napkins for their table and rose-and-almond oil for their bath routine.',
      wellness: { handle: 'nava-pre-shower-body-glow-oil-rose-almond-100ml', name: 'Nava Body Oil · Rose & Almond, 100 ml' },
      textile: { handle: 'raspberry-bloom-cocktail-napkins-set-of-6', liveHandle: 'raspberry-bloom-cocktail-napkins', name: 'Raspberry Bloom Cocktail Napkins', format: '8 × 8 in' },
      componentPrices: { wellness: 2380, textiles: { 2: 2550, 4: 4675, 6: 6715 } },
      napkinCounts: [2,4,6], price: null, approved: false, sku: null, purchaseURL: null,
      configurations: [2,4,6].map(napkins=>({napkins,price:null,approved:false,sku:null,purchaseURL:null})),
    },
    {
      id: 'hosts-thank-you', name: 'Willow & Hair Oil',
      description: 'Hand-block printed napkins in olive tones, paired with neem-and-amla hair oil for their wash-day routine.',
      wellness: { handle: 'mystic-hair-oil-100ml', name: 'Mystic Hair Oil · 100 ml' },
      textile: { handle: 'olive-willow-cocktail-napkins-set-of-6', liveHandle: 'olive-willow-cocktail-napkins', name: 'Olive Willow Cocktail Napkins', format: '8 × 8 in' },
      componentPrices: { wellness: 2380, textiles: { 2: 2550, 4: 4675, 6: 6715 } },
      napkinCounts: [2,4,6], price: null, approved: false, sku: null, purchaseURL: null,
      configurations: [2,4,6].map(napkins=>({napkins,price:null,approved:false,sku:null,purchaseURL:null})),
    },
  ],
};

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const localImage=src=>new URL(src,'https://dimohe.com').pathname.replace(/^\/s\/files\/[^]+\/(files|products)\//,'/cdn/shop/$1/');
const external=(url,label)=>`<a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label}<span class="sr-only"> on Etsy, opens in a new tab</span></a>`;

export function bundlePrice(bundle, count = bundle.napkinCounts[0] || bundle.textile.count) {
  const textile = bundle.componentPrices.textiles[count];
  const wellness = bundle.componentPrices.wellness;
  if (!Number.isSafeInteger(textile) || !Number.isSafeInteger(wellness) || textile <= 0 || wellness <= 0) throw new Error('Missing verified component price');
  const totalCents = wellness + textile;
  const priceCents = Math.round(totalCents * (100 - gifting.discountPercent) / 100);
  return { totalCents, priceCents, savingCents: totalCents - priceCents, discountPercent: gifting.discountPercent };
}

export function giftingPage(products) {
  const byHandle=new Map(products.map(p=>[p.handle,p]));
  const productPhoto=item=>{
    const product=byHandle.get(item.handle);
    const image=product?.images?.[item.handle==='snanamrit-ubtan-natural-bathing-powder-250gm'?1:0] || product?.images?.[0];
    return image?.src?`<img src="${esc(localImage(image.src))}" alt="${esc(item.name)}" loading="lazy" width="600" height="750">`:'';
  };
  return `<div class="gifting-page gifting-refined">
    <section class="gift-hero" aria-labelledby="gifting-title">
      <div class="gift-hero-copy"><p class="eyebrow">DIMOHE</p><h1 id="gifting-title">Gifting</h1><p class="gift-deck">Indian textiles, Ayurvedic care and jewellery, paired for gifting.</p><p>Choose a bundle for their everyday routine, or a jewellery and care set from our collaboration with HeartsLinked.</p><div class="gift-hero-links"><a class="button" href="#gift-edit">Dimohe bundles</a><a class="text-link" href="#gift-sets">Jewellery & care sets</a></div></div>
      <figure class="gift-hero-photo"><img src="/media/gifting-rose.svg" alt="Rose Ritual, a HeartsLinked necklace with Dimohe Nava Body Oil" width="900" height="1350" fetchpriority="high"><figcaption>Rose Ritual, with HeartsLinked</figcaption></figure>
    </section>
    <section class="section gift-edit" id="gift-edit" aria-labelledby="gift-edit-title"><div class="gift-section-heading"><h2 id="gift-edit-title">Dimohe bundles</h2><p>Hand-block printed cotton and Ayurvedic care. Save 15% compared with buying the contents separately.</p><p class="gift-preview-note">Bundle preview. Checkout will open when the sets launch.</p></div>
      <div class="gift-edit-grid">${gifting.bundles.map(g=>{
        const counts=g.napkinCounts.length?g.napkinCounts:[g.textile.count];
        const offers=Object.fromEntries(counts.map(count=>[count,bundlePrice(g,count)]));
        const count=counts[0],price=offers[count];
        const sku=g.napkinCounts.length?g.configurations?.find(c=>c.napkins===count):g;
        const ready=g.approved&&sku?.approved&&sku.sku&&/^\/products\/[\w-]+(?:\?variant=\d+)?$/.test(sku.purchaseURL||'');
        return `<article class="gift-bundle" data-gift-bundle="${g.id}" data-gift-textile="${esc(g.textile.name)}" data-gift-offers="${esc(JSON.stringify(offers))}"><div class="gift-pairing-photo">${productPhoto(g.textile)}${productPhoto(g.wellness)}</div><div class="gift-bundle-copy"><h3>${esc(g.name)}</h3><p>${esc(g.description)}</p><ul class="gift-contents"><li>${esc(g.wellness.name)}</li><li>${g.napkinCounts.length?`<span data-gift-count-label>${count} ${esc(g.textile.name)} (${esc(g.textile.format)})</span>`:`${esc(g.textile.name)} · Set of ${g.textile.count}`}</li></ul>${g.napkinCounts.length?`<fieldset class="gift-options"><legend>Cocktail napkins · 8 × 8 in</legend><div>${counts.map((n,i)=>`<button type="button" data-gift-count="${n}" aria-pressed="${i===0}" aria-label="Choose ${n} cocktail napkins in ${esc(g.name)}">Set of ${n}</button>`).join('')}</div></fieldset>`:'<p class="gift-fixed-pairing">Includes four face towels.</p>'}<div class="gift-pricing" aria-live="polite" aria-atomic="true"><p><strong data-gift-price>${money(price.priceCents/100)}</strong> <s data-gift-total aria-label="Individual items total">${money(price.totalCents/100)}</s></p><p class="gift-price-note" data-gift-saving>Save ${money(price.savingCents/100)} · 15% bundle saving</p></div><p class="gift-bundle-availability">${ready?'':'Available at launch'}</p>${ready?`<a class="text-link gift-bundle-discover" href="${sku.purchaseURL}">View bundle</a>`:''}</div></article>`;
      }).join('')}</div><p class="gift-shopping-note">Savings are calculated from the combined current item prices. Photos show the individual products; final packaging will be confirmed at launch.</p>
    </section>
    <section class="section gift-collaborations" id="gift-sets" aria-labelledby="collaborations-title"><div class="gift-section-heading"><h2 id="collaborations-title">With HeartsLinked</h2><p>Our care products, paired with heart-shaped stone necklaces. These sets are available from HeartsLinked by Exorti on Etsy.</p></div>
      <div class="gift-collaboration-grid">${gifting.collaborations.map(g=>`<article class="gift-collaboration"><a class="gift-set-photo" href="${esc(g.url)}" target="_blank" rel="noopener noreferrer" aria-label="View ${esc(g.name)} on Etsy, opens in a new tab"><img src="${g.image}" alt="${esc(g.alt)}" width="900" height="1350" loading="lazy"></a><div class="gift-set-copy"><h3>${esc(g.name)}</h3><p>${esc(g.description)}</p><details class="gift-included"><summary>What’s included</summary><ul class="gift-contents">${g.contents.map(c=>`<li>${esc(c)}</li>`).join('')}</ul></details><div class="gift-set-action"><span>Price and checkout on Etsy</span>${external(g.url,'View gift set')}</div></div></article>`).join('')}</div>
    </section>
    <section class="section gift-ending"><div><h2>Prefer choosing one piece?</h2><p>Browse individual gifts for the home, their wardrobe or their daily routine.</p><a class="text-link" href="/collections/gifts-under-100">Shop gifts under $100</a></div><div><h3>A note on packaging</h3><p>HeartsLinked sets include a keepsake box and intention card. Details of Dimohe bundle packaging will be shared at launch.</p></div></section>
  </div>`;
}
