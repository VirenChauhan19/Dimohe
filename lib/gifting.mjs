// Edit product pairings here. Proposed prices stay in GIFTING-NOTES.md, never in live offers.
export const gifting = {
  checkedOn: '2026-11-02',
  collaborations: [
    {
      id: 'rose-ritual', name: 'The Rose Ritual', subtitle: 'Self-Love Gift Set',
      image: '/media/gifting-rose.svg', alt: 'Rose-quartz heart necklace, Nava Body Oil, keepsake box and intention card',
      description: 'A rose-quartz heart to wear, and rose-and-almond body oil for a slower start to the day. A birthday gift, a thank-you, or a little care sent just because.',
      contents: ['Rose-quartz heart necklace', 'Nava Body Oil · Rose & Almond, 100 ml', 'Keepsake box and intention card'],
      observedPrice: 59.50, priceApprovedForDisplay: false,
      url: 'https://www.etsy.com/listing/4604070017/rose-quartz-necklace-gift-set-for-her',
    },
    {
      id: 'unwind', name: 'Unwind', subtitle: 'Amethyst & Lavender Gift Set',
      image: '/media/gifting-amethyst.svg', alt: 'Amethyst heart necklace, Lavender Smoothening Conditioner, keepsake box and intention card',
      description: 'Lavender conditioner for an unhurried evening, paired with an amethyst heart necklace to keep. For the person who could use a moment to themselves.',
      contents: ['Amethyst heart necklace', 'Lavender Smoothening Conditioner, 150 g', 'Keepsake box and intention card'],
      observedPrice: 59.50, priceApprovedForDisplay: false,
      url: 'https://www.etsy.com/listing/4608107804/amethyst-gift-set-for-her-relaxation',
    },
  ],
  bundles: [
    {
      id: 'daily-pause', name: 'The Daily Pause',
      description: 'A warm shower, a soft towel, a few minutes before the day begins. Ubtan bathing powder and floral waffle cotton, made for the bathroom shelf.',
      wellness: { handle: 'snanamrit-ubtan-natural-bathing-powder-250gm', name: 'Snanamrit Ubtan Bathing Powder · 250 g' },
      textile: { handle: 'crimson-botanica-waffle-face-towels-set-of-4', name: 'Crimson Botanica Waffle Face Towels', count: 4 },
      napkinCounts: [], price: null, approved: false, sku: null, purchaseURL: null,
    },
    {
      id: 'rose-table', name: 'The Rose Table',
      description: 'Something floral for the table, something rose-scented for later. A small thank-you for the friend who always makes room for one more.',
      wellness: { handle: 'nava-pre-shower-body-glow-oil-rose-almond-100ml', name: 'Nava Body Oil · Rose & Almond, 100 ml' },
      textile: { handle: 'raspberry-bloom-cocktail-napkins-set-of-6', liveHandle: 'raspberry-bloom-cocktail-napkins', name: 'Raspberry Bloom Cocktail Napkins', format: '8 × 8 in' },
      napkinCounts: [2,4,6], price: null, approved: false, sku: null, purchaseURL: null,
      configurations: [2,4,6].map(napkins=>({napkins,price:null,approved:false,sku:null,purchaseURL:null})),
    },
    {
      id: 'hosts-thank-you', name: 'The Host’s Thank-you',
      description: 'Block-printed willow motifs for the next gathering, and a botanical hair oil for the evening after. For someone who spends so much time looking after everyone else.',
      wellness: { handle: 'mystic-hair-oil-100ml', name: 'Mystic Hair Oil · 100 ml' },
      textile: { handle: 'olive-willow-cocktail-napkins-set-of-6', liveHandle: 'olive-willow-cocktail-napkins', name: 'Olive Willow Cocktail Napkins', format: '8 × 8 in' },
      napkinCounts: [2,4,6], price: null, approved: false, sku: null, purchaseURL: null,
      configurations: [2,4,6].map(napkins=>({napkins,price:null,approved:false,sku:null,purchaseURL:null})),
    },
  ],
};

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n);
const localImage=src=>new URL(src,'https://dimohe.com').pathname.replace(/^\/s\/files\/[^]+\/(files|products)\//,'/cdn/shop/$1/');
const external=(url,label)=>`<a class="text-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${label}<span class="sr-only"> on Etsy, opens in a new tab</span></a>`;

export function giftingPage(products) {
  const byHandle=new Map(products.map(p=>[p.handle,p]));
  const productPhoto=item=>{
    const product=byHandle.get(item.handle);
    return product?.images?.[0]?.src?`<img src="${esc(localImage(product.images[0].src))}" alt="${esc(item.name)}" loading="lazy" width="600" height="750">`:'';
  };
  return `<div class="gifting-page">
    <section class="gift-hero" aria-labelledby="gifting-title">
      <div class="gift-hero-copy"><p class="eyebrow">DIMOHE GIFTING</p><h1 id="gifting-title">The Art<br>of Giving</h1><p class="gift-deck">Thoughtful pairings, meaningful details, and little rituals worth sharing.</p><p>Some gifts are more than objects. They carry a story, create a ritual, and make everyday moments feel special. Discover thoughtful gifts curated with care by DIMOHE.</p><a class="button" href="#gift-sets">Explore Gift Sets</a></div>
      <figure class="gift-hero-photo"><img src="/media/gifting-rose.svg" alt="The Rose Ritual gift, with a rose-quartz necklace, Nava Body Oil and a keepsake card" width="900" height="1350" fetchpriority="high"><figcaption>A keepsake. A ritual. A reason to give.</figcaption></figure>
    </section>
    <nav class="gift-page-nav" aria-label="On this page"><a href="#gift-sets">The collaborations</a><a href="#gift-edit">The Dimohe Gift Edit</a><a href="#gift-occasions">Every occasion</a></nav>
    <section class="gift-introduction section"><p class="eyebrow">THE DIMOHE WAY</p><h2>More Than a Gift.<br>A Feeling That Stays.</h2><p>At DIMOHE, we believe gifting should feel personal. Our curated sets bring together meaningful keepsakes, beautiful craftsmanship, and everyday rituals, thoughtfully chosen for the people and moments that matter.</p></section>
    <section class="section gift-collaborations" id="gift-sets" aria-labelledby="collaborations-title"><div class="gift-section-heading"><p class="eyebrow">BETTER TOGETHER</p><h2 id="collaborations-title">Thoughtful Collaborations</h2><p>Special pairings that bring together DIMOHE’s rituals of care with meaningful keepsakes.</p></div>
      <div class="gift-collaboration-grid">${gifting.collaborations.map(g=>`<article class="gift-collaboration"><a class="gift-set-photo" href="${esc(g.url)}" target="_blank" rel="noopener noreferrer" aria-label="Discover ${esc(g.name)} on Etsy, opens in a new tab"><img src="${g.image}" alt="${esc(g.alt)}" width="900" height="1350" loading="lazy"></a><div class="gift-set-copy"><p class="eyebrow">DIMOHE × HEARTSLINKED</p><h3>${esc(g.name)}</h3><p class="gift-set-subtitle">${esc(g.subtitle)}</p><p>${esc(g.description)}</p><ul class="gift-contents">${g.contents.map(c=>`<li>${esc(c)}</li>`).join('')}</ul><div class="gift-set-action">${g.priceApprovedForDisplay?`<span>${money(g.observedPrice)}</span>`:'<span>Current price on Etsy</span>'}${external(g.url,'Discover the Gift')}</div></div></article>`).join('')}</div>
      <p class="gift-shopping-note">These two sets are sold by <a href="https://www.etsy.com/shop/HeartsLinkedbyExorti" target="_blank" rel="noopener noreferrer">HeartsLinked by Exorti<span class="sr-only">, opens in a new tab</span></a>. Checkout, current prices and availability are on Etsy.</p>
    </section>
    <section class="section gift-edit" id="gift-edit" aria-labelledby="gift-edit-title"><div class="gift-section-heading"><p class="eyebrow">ON THE WAY</p><h2 id="gift-edit-title">The DIMOHE Gift Edit</h2><p>Little luxuries, thoughtfully paired.</p><p class="gift-preview-note">Three new pairings are in the making. Explore what’s inside while we put the finishing touches to the collection.</p></div>
      <div class="gift-edit-grid">${gifting.bundles.map((g,i)=>{
        const valid=offer=>g.approved&&offer?.approved&&offer.sku&&Number.isFinite(offer.price)&&offer.price>0&&offer.price<100&&/^\/products\/[\w-]+(?:\?variant=\d+)?$/.test(offer.purchaseURL||'');
        const offers=Object.fromEntries((g.configurations||[]).map(offer=>[offer.napkins,valid(offer)?offer:null]));
        const offer=g.napkinCounts.length?offers[g.napkinCounts[0]]:g;
        const ready=valid(offer);
        return `<article class="gift-bundle" data-gift-bundle="${g.id}" data-gift-offers="${esc(JSON.stringify(offers))}"><div class="gift-pairing-photo">${productPhoto(g.textile)}${productPhoto(g.wellness)}</div><div class="gift-bundle-copy"><div class="gift-bundle-topline"><p class="eyebrow">PAIRING 0${i+1}</p><span class="gift-launch-status">${ready?money(offer.price):'Coming soon'}</span></div><h3>${esc(g.name)}</h3><p>${esc(g.description)}</p><ul class="gift-contents"><li>${esc(g.wellness.name)}</li><li>${g.napkinCounts.length?`<span data-gift-count-label>2 hand-block printed cocktail napkins (${esc(g.textile.format)})</span><br><span class="gift-textile-name">${esc(g.textile.name)}</span>`:`${esc(g.textile.name)} · Set of ${g.textile.count}`}</li></ul>${g.napkinCounts.length?`<fieldset class="gift-options"><legend>Choose your napkin pairing</legend><div>${g.napkinCounts.map((count,n)=>`<button type="button" data-gift-count="${count}" aria-pressed="${n===0}" aria-label="Preview ${count} cocktail napkins in ${esc(g.name)}">${count} napkins</button>`).join('')}</div><p>From our six-piece, 8 × 8-inch format.</p></fieldset>`:'<p class="gift-fixed-pairing">Four soft waffle face towels, hand-block printed on cotton.</p>'}<p class="gift-bundle-availability" aria-live="polite">${ready?'':g.napkinCounts.length?'2-napkin pairing preview. Launch details to follow.':'Launch details to follow.'}</p><a class="text-link gift-bundle-discover" href="${ready?offer.purchaseURL:'#gift-edit'}"${ready?'':' hidden'}>Discover the Gift</a></div></article>`;
      }).join('')}</div><p class="gift-shopping-note">Pairing previews use photographs of the individual products. Final presentation and prices will be shared at launch.</p>
    </section>
    <section class="section gift-occasions" id="gift-occasions"><div class="gift-section-heading"><p class="eyebrow">NO DATE REQUIRED</p><h2>For Every Reason to Celebrate</h2><p>From festive gatherings and new beginnings to birthdays, thank-yous, and just-because moments, thoughtful gifting never needs a special occasion.</p></div><div class="gift-occasion-grid">${[['Festivals & celebrations','For the visit home, the shared meal, the evening everyone remembers.'],['A new home','A little colour for their table. A new ritual for their first morning.'],['Birthdays & thank-yous','For knowing just what they like, and letting them know you noticed.'],['Just because','No big occasion. Someone came to mind. That’s reason enough.']].map(([title,copy])=>`<div><h3>${title}</h3><p>${copy}</p></div>`).join('')}</div></section>
    <section class="section gift-finishing"><div><p class="eyebrow">THE FINISHING TOUCH</p><h2>Beautifully Given</h2></div><div><p>Every detail matters. From considered pairings to the finishing touches, our gifts are designed to make the act of giving feel as special as receiving.</p><p>The HeartsLinked collaborations include a keepsake box and intention card. Presentation for the DIMOHE Gift Edit will be shared when the collection launches.</p></div></section>
    <section class="section gift-final"><p class="eyebrow">CHOSEN WITH SOMEONE IN MIND</p><h2>A Little Something,<br>Just for Them.</h2><a class="button" href="/collections/gifts-under-100">Explore All Gifts</a></section>
  </div>`;
}
