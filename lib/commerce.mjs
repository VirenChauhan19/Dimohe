// Commerce content uses catalog evidence; unknown provenance and policies are omitted.
import { crafts } from './editorial.mjs';
export const brandFilm={originalSrc:'https://dimohe.com/cdn/shop/videos/c/vp/0a52ccdb76ef4418b309d0227019a0f0/0a52ccdb76ef4418b309d0227019a0f0.HD-1080p-7.2Mbps-91394844.mp4',src:'/cdn/shop/videos/c/vp/0a52ccdb76ef4418b309d0227019a0f0/0a52ccdb76ef4418b309d0227019a0f0.HD-1080p-7.2Mbps-91394844.mp4',duration:96,width:606,height:1080};
export const editHandles=['the-altair-bijou-clutch','gulnaar-floral-linen-cushion-cover-earth-brown','the-noor-bagh-heirloom-minaudi','cypress-row-lumbar-cushion-cover','cypress-grove-round-tote','rosemary-hair-masque-150gm','nava-pre-shower-body-glow-oil-rose-almond-100ml','boy-dhola-maru-embroidery-bundy-set-beige'];
export const chapters=[
 {slug:'lucknow',name:'Lucknow',title:'Chikankari hand embroidery.',intro:'In Lucknow, India, Chikankari is a tradition of stitching delicate flowers and vines by hand. On our raw silk bags, you can see the texture of each stitch up close.',note:'A bag for dinner, with room for another way to wear it. Altair’s short strap can be swapped for the longer crossbody strap.',image:'/cdn/shop/files/AVAHSG_1.png',collection:'chikankari',label:'Shop hand-embroidered bags',match:p=>p.merch.crafts.includes('chikankari')},
 {slug:'jaipur',name:'Jaipur',title:'Block printing for the table.',intro:'Artisans dip carved wooden blocks in color and press them onto cloth, one impression at a time. This hand-block printing tradition from Rajasthan, India, runs through our linens, cushions, and waffle towels.',note:'Start with a block-printed runner and plain plates. Add napkins in a smaller pattern, or repeat one of the colours already on the table.',image:'/cdn/shop/files/PJTRCCSD1_1.png',collection:'hand-block-printing',label:'Shop block-printed linens',match:p=>p.merch.crafts.includes('block-printing')},
 {slug:'ritual',name:'The Ritual Edit',title:'By the basin. In the bathroom.',intro:'Hair masks, shampoo, and body oils. A small selection for the routines you already have.',note:'Choose by product type and read the blend notes. A product’s label is the reference for directions and its full ingredient list.',image:'/cdn/shop/files/Hair-Oil.jpg',collection:'wellness',label:'Shop wellness',match:p=>p.merch.group==='wellness'},
 {slug:'little-celebrations',name:'Little Celebrations',title:'Ready for the family photo.',intro:'Kurtas, bundi jackets, skirts, and embroidered sets for weddings, festivals, and family gatherings.',note:'Choose from the available age sizes on each product page. The set details tell you which garments are included.',image:'/cdn/shop/files/3.png',collection:'kids-clothing',label:'Shop occasionwear',match:p=>p.merch.group==='kids'},
];
export const curatedCollections=[
 {handle:'the-dimohe-edit',name:'Our Picks',description:'Eight pieces across the collection. Hand-embroidered raw silk, block-printed cotton, a woven tote, and everyday care.',match:p=>editHandles.includes(p.handle)},
 {handle:'collector-bags',name:'Collector bags',description:'Structured evening bags with detailed hand embroidery, decorative frames, and raw silk.',match:p=>p.merch.group==='bags'&&p.merch.minPrice>=500},
 {handle:'gifts-under-100',name:'Gifts under $100',description:'Browse pieces priced below $100. Check individual product notes and available sizes before choosing.',match:p=>p.merch.minPrice<100},
 {handle:'for-the-host',name:'For the host',description:'Runners, tablecloths, placemats, and napkins for a table you use.',match:p=>/table|cock-tail/.test(p.merch.type)},
 {handle:'hair-care',name:'Hair care',description:'Shampoo, conditioners, masks, and hair oil blends.',match:p=>p.merch.group==='wellness'&&/shampoo|conditioner|hair-oil/.test(p.merch.type)},
 {handle:'bath-body',name:'Bath & body',description:'Body oil and ubtan bathing powder.',match:p=>p.merch.group==='wellness'&&/massage-oil|bathing-powder/.test(p.merch.type)},
];
export const wellnessNotes={
 'himalayan-hair-repair-shampoo-deodhar-hibiscus-250ml':['Himalayan Shampoo · Deodhar & Hibiscus','A shampoo with hibiscus and deodhar, in a 250 ml size.'],
 'rosemary-hair-masque-150gm':['Rosemary Hair Masque · 150 g','A hair conditioner with rosemary and vitamin E.'],
 'nava-pre-shower-body-glow-oil-rose-almond-100ml':['Nava Body Oil · Rose & Almond','A rose and almond blend for a pre-shower body massage, in a 100 ml size.'],
 'protein-building-hair-mask-150gm':['Protein Hair Mask · 150 g','A conditioning hair mask, in a 150 g size.'],
 'lavender-smoothening-conditioner-150gm-glass-jar':['Lavender Conditioner · 150 g','A conditioner with lavender, shea butter, and olive oil, packaged in a glass jar.'],
 'keshamrit-anti-dandruff-shampoo-lemon-250ml':['Keshamrit Lemon Shampoo · 250 ml','A shampoo blend with lemon, aloe vera, vitamin E, and almond oil.'],
 'keshamrit-conditioning-cleansing-shampoo-coconut-milk-250ml':['Keshamrit Coconut Milk Shampoo · 250 ml','A shampoo with coconut milk, aloe vera, sandalwood, and rose water.'],
 'mystic-hair-oil-100ml':['Mystic Hair Oil · 100 ml','A botanical hair oil blend with neem, amla, hibiscus, and marjoram.'],
 'hibiscus-hair-oil-100ml':['Hibiscus Hair Oil · 100 ml','A hair oil with a hibiscus herbal infusion, in a 100 ml size.'],
 'snanamrit-ubtan-natural-bathing-powder-250gm':['Snanamrit Ubtan Bathing Powder · 250 g','A bathing powder and scrub with herbs, pulses, and flowers.'],
};
export function craftPassport(p,text){
 const ids=p.merch.crafts;const rows=[];
 if(ids.length)rows.push(['Craft',[ids.includes('block-printing')&&'Patterns pressed onto cloth by hand with carved wooden blocks',ids.includes('chikankari')&&'Fine floral needlework stitched by hand',ids.includes('zardozi')&&'Ornate, raised embroidery stitched by hand'].filter(Boolean).join('; ')]);
 const technique=ids.includes('block-printing')?'Hand-block printing':ids.some(id=>['chikankari','zardozi'].includes(id))?'Hand embroidery':p.merch.craft;
 if(technique)rows.push(['Technique',technique]);
 if(/mukaish/i.test(text))rows.push(['Additional detail','Small metallic accents worked into the embroidery']);
 // A tradition's location is not evidence of this product's workshop location.
 const place=text.match(/(?:artisans|handcrafted|crafted|made|printed)\s+(?:in|by[^.]{0,40}in)\s+(Jaipur(?:,? Rajasthan)?|Rajasthan(?:,? India)?|Lucknow(?:,? India)?)/i)?.[1];
 if(place)rows.push(['Place of making',place]);
 if(p.merch.primaryMaterial)rows.push(['Material',p.merch.primaryMaterial]);
 if(/(?:made|crafted|printed)[^.]{0,50}(?:in|from)\s+India\b/i.test(text)||place&&/Jaipur|Rajasthan|Lucknow/i.test(place))rows.push(['Made in','India']);
 const makingTime=text.match(/(?:takes|requires|time to make|making time)\s*:?\s*((?:about |approximately )?\d+(?:\s*[-–]\s*\d+)?\s*(?:hours|days|weeks))/i)?.[1];
 if(makingTime)rows.push(['Time to make',makingTime]);
 return rows;
}
export function productEvidence(p,text){
 const find=pattern=>text.match(pattern)?.[1]?.trim();
 const care=find(/(?:Care|Wash Care)\s*:\s*([^]+?)(?=\s+(?:Fabric|Craft|Color|Includes|Specifications|Packaging)\s*:|$)/i)||(/dry clean only/i.test(text)?'Dry clean only':'');
 const closure=/drawstring closure/i.test(text)?'Drawstring':/clasp closure/i.test(text)?'Clasp':/invisible zipper/i.test(text)?'Invisible zipper':'';
 const carry=[/circular handle/i.test(text)&&'Circular handle',/crossbody strap/i.test(text)&&'Crossbody strap',/short[^.]{0,35}strap/i.test(text)&&'Short hand-carry strap'].filter(Boolean).join(', ');
 return {care:care.split(/(?<=[.!?])\s/).slice(0,2).join(' ').slice(0,280),closure,carry};
}
const absolute=(siteURL,path)=>new URL(siteURL.replace(/\/$/,'')+path).href;
export function pageMetadata(html,url,products,siteURL){
 if(!html)return html;
 const path=url.pathname.replace(/\/$/,'')||'/';const canonical=absolute(siteURL,path==='/'?'/':path+'/');
 const product=products.find(p=>path.endsWith('/products/'+p.handle));
 const graph=[{'@type':'Organization','@id':absolute(siteURL,'/#organization'),name:'Dimohe',url:absolute(siteURL,'/'),email:'support@dimohe.com'}];
 const clean=s=>String(s||'').replace(/[<>&"']/g,'');
 const title=clean(html.match(/<title>([^]+?)<\/title>/)?.[1]);
 const description=product?.merch.editorialDescription||clean(html.match(/<meta name="description" content="([^"]*)/)?.[1]);
 if(product){graph.push({'@type':'Product',name:product.title,image:product.images.map(i=>i.src),description:description||product.title,productID:String(product.id),brand:{'@type':'Brand',name:'Dimohe'},offers:product.variants.map(v=>({'@type':'Offer',url:absolute(siteURL,'/products/'+product.handle+'/?variant='+v.id),...(v.sku?{sku:v.sku}:{}),price:Number(v.price),priceCurrency:'USD',availability:'https://schema.org/'+(v.available?'InStock':'OutOfStock') }))});}
 const crumbs=[{name:'Home',item:absolute(siteURL,'/')}];
 if(product){crumbs.push({name:product.merch.groupName,item:absolute(siteURL,'/collections/'+({home:'home-furnishing',bags:'bags',wellness:'wellness',kids:'kids-clothing'}[product.merch.group])+'/')},{name:product.title,item:canonical});}
 else if(path!=='/')crumbs.push({name:title.replace(/ · Dimohe$/,''),item:canonical});
 graph.push({'@type':'BreadcrumbList',itemListElement:crumbs.map((c,i)=>({'@type':'ListItem',position:i+1,...c}))});
 const image=product?.images[0]?.src||absolute(siteURL,'/cdn/shop/files/pllow.png');
 const schema=JSON.stringify({'@context':'https://schema.org','@graph':graph}).replaceAll('<','\\u003c');
 return html.replace('</head>',`<link rel="canonical" href="${canonical}"><meta property="og:type" content="${product?'product':'website'}"><meta property="og:title" content="${title}"><meta property="og:description" content="${clean(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${image}"><script type="application/ld+json">${schema}</script></head>`);
}

// Photographs used by the original homepage's Explore Dimohe and Chikankari sections.
export const embroideryShowcase=[
 {name:'Round bags',handle:'round-bags',image:'/cdn/shop/files/round-contain-img.png',alt:'Round hand-embroidered evening bag with a decorative handle',detail:'A circular frame with a decorative handle.'},
 {name:'Antique-handle bags',handle:'antique-handle-handbags',image:'/cdn/shop/files/antique-contain-img.png',alt:'Ivory hand-embroidered bag with an ornate antique-style handle',detail:'Floral stitches framed by an ornate clasp.'},
 {name:'Potli (Pochette) bags',handle:'potli',image:'/cdn/shop/files/poyli-contaim-img.png',alt:'Hand-embroidered potli bag with a gathered drawstring opening',detail:'Softly gathered fabric, finished with a drawstring.'},
 {name:'Full-flap clutches',handle:'clutches-full-flap',image:'/cdn/shop/files/clutch-contain-img.png',alt:'Full-flap clutch with hand-embroidered detailing',detail:'A structured shape with embroidery across the flap.'},
 {name:'Jute clutches',handle:'jute-clutches',image:'/cdn/shop/files/jute-contain-img.png',alt:'Jute envelope clutch with hand-embroidered flowers',detail:'Floral hand embroidery against textured jute.'},
];
