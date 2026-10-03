import { load } from 'cheerio';

export const groups = [
  {id:'home',name:'Home & Living',handle:'home-furnishing',description:'Hand-block prints, botanical motifs, and beautiful texture. Thoughtful pieces for the rooms you live in.',image:'/cdn/shop/files/pllow.png'},
  {id:'bags',name:'Bags',handle:'bags',description:'From embroidered evening bags to everyday cotton totes. Find the right companion for your day.',image:'/cdn/shop/files/AVRBBB_1_3.jpg'},
  {id:'wellness',name:'Wellness',handle:'wellness',description:'Hair and body essentials for a slower, more considered everyday ritual.',image:'/cdn/shop/files/Hair-Oil.jpg'},
  {id:'kids',name:'Kids',handle:'kids-clothing',description:'Beautifully detailed outfits for little celebrations. Explore by style, then choose their size.',image:'/cdn/shop/files/3.png'},
];
export const types = [
  ['cushion-cover','Cushion covers','home',/cushion/],['throw','Throws','home',/throw/],
  ['table-runner','Table runners','home',/table.runner/],['table-cover','Tablecloths','home',/table.cover/],
  ['table-mats-dinner-napkins','Placemats & dinner napkins','home',/table.mat/],['cock-tail-napkin-set-of-12','Cocktail napkins','home',/cocktail.napkin/],
  ['bathtowel','Bath towels','home',/bath.towel/],['bathsheet','Bath sheets','home',/bath.sheet/],
  ['handtowel-set-of-2','Hand towels','home',/hand.towel/],['facetowel-set-of-4','Face towels','home',/face.towel/],
  ['tote-bag','Everyday totes','bags',/tote/],['shampoo','Shampoo','wellness',/shampoo/],
  ['conditioner','Conditioners & masks','wellness',/conditioner|hair.mask|hair.masque/],['hair-oil','Hair oils','wellness',/hair.oil/],
  ['massage-oil','Body oils','wellness',/body.glow.oil/],['bathing-powder','Bathing powder','wellness',/bathing.powder/],
  ['boys','Boys’ occasionwear','kids',/^boy/],['girls','Girls’ occasionwear','kids',/^girl/],
  ['antique-handle-handbags','Antique-handle bags','bags',/bijou/],['potli','Potli bags','bags',/pochette/],
  ['round-bags','Round evening bags','bags',/heirloom/],['jute-clutches','Jute clutches','bags',/envelope/],
  ['clutches-full-flap','Embroidered clutches','bags',/clutch/],
].map(([handle,name,group,match])=>({handle,name,group,match}));

export function merchandise(products) {
  return products.map(p => {
    const text=load(p.body_html||'').text().replace(/\s+/g,' ').trim();
    const type=types.find(t=>t.match.test(p.title.toLowerCase()));
    if(!type) throw new Error(`Uncategorized product: ${p.handle}`);
    const group=groups.find(g=>g.id===type.group);
    const explicitFabric=text.match(/(?:Fabric|Material)\s*:\s*([^]+?)(?=\s+(?:Craft|Design|Color|Colour|Packaging|Net Quantity|Pattern|Includes)\s*:|$)/i)?.[1];
    const materialText=explicitFabric||text.replace(/Packaging\s*:[^]+?(?=Net Quantity|$)/i,'');
    const fabrics=[...new Set((materialText.match(/raw silk|tussar silk|muslin cotton|cotton muslin|cotton percale|cotton cambric|cotton piqu[eé]|organic waffle cotton|cotton.waffle|\blinen\b|\bjute\b|\bsilk\b|\bcotton\b/gi)||[]).map(v=>v.toLowerCase().replace('cotton-waffle','waffle cotton').replace('cotton muslin','muslin cotton')))];
    const materials=[...new Set(fabrics.map(v=>v.includes('cotton')?'cotton':v.includes('silk')?'silk':v))];
    const primaryMaterial=fabrics.find(v=>v!=='cotton'&&v!=='silk') || fabrics[0] || '';
    const craft=/hand.block.print/i.test(text)?'Hand-block printed':/hand.embroid|chikank/i.test(text)?'Hand embroidered':/handmade|hand.craft/i.test(text)?'Handcrafted':'';
    const setMatch=p.title.match(/set of (\d+)/i);
    const volume=p.title.match(/\b(\d+)\s?(ml|gm)\b/i);
    const attributes=[['Category',type.name],primaryMaterial&&['Material',primaryMaterial],craft&&['Craft',craft],setMatch&&['Set quantity',`${setMatch[1]} pieces`],volume&&['Size',`${volume[1]} ${volume[2]==='gm'?'g':'ml'}`],/insert not included|cover only/i.test(text)&&['Includes','Cover only; insert not included'],/dry clean/i.test(text)&&['Care','Dry clean only']].filter(Boolean);
    const optionLabels=Object.fromEntries(p.options.map(o=>[o.position,o.values.every(v=>/^(round|square)$/i.test(v))?'Shape':o.values.every(v=>/^(digital|block print)$/i.test(v))?'Print style':o.name]));
    const sourceColors=p.options.filter(o=>/colou?r/i.test(o.name)).flatMap(o=>o.values);
    const describedColor=text.match(/(?:Color|Colour)\s*:\s*([^]+?)(?=\s+(?:Length|Width|Fabric|Includes|Craft|Detailing)\s*:|$)/i)?.[1]?.trim().replace(/["”]+$/,'');
    if(!sourceColors.length&&describedColor) sourceColors.push(describedColor);
    const palette=[['Green',/green|olive|sage|teal/i],['Blue',/blue|indigo|aqua|teal|navy/i],['Pink',/pink|rose|blush|fuchsia/i],['Red',/red|crimson|burgundy|berry|scarlet/i],['Ivory & cream',/ivory|cream|off.white/i],['White',/\bwhite\b/i],['Beige',/beige|tan/i],['Black',/black|charcoal/i],['Brown',/brown/i],['Orange',/orange|terracotta/i],['Yellow',/yellow|ochre/i],['Purple',/purple|violet|lavender/i]];
    const colors=palette.filter(([,pattern])=>pattern.test(sourceColors.join(' '))).map(([name])=>name);
    const sizes=p.options.filter(o=>/size/i.test(optionLabels[o.position])).flatMap(o=>o.values);
    for(const o of p.options.filter(o=>['Shape','Print style'].includes(optionLabels[o.position]))) attributes.push([optionLabels[o.position],o.values.join(', ')]);
    const dimensions=[...text.matchAll(/\b(Length|Width)\s*:\s*([\d.]+\s*inch)/gi)].map(m=>m[1]+': '+m[2]);
    if(dimensions.length) attributes.push(['Dimensions',dimensions.join(' · ')]);
    const includes=text.match(/Set Includes\s*:\s*([^]+?)(?=\s+(?:Fabric|Material|Color)\s*:|$)/i)?.[1]?.trim();
    if(includes) attributes.push(['Set includes',includes]);
    if(sourceColors.length) attributes.push(['Color',sourceColors.join(', ')]);
    if(sizes.length) attributes.push([group.id==='kids'?'Available sizes':'Size options',sizes.join(' · ')]);
    const prices=p.variants.map(v=>Number(v.price));
    const subtitle=[craft,primaryMaterial,volume&&`${volume[1]} ${volume[2]==='gm'?'g':'ml'}`].filter(Boolean).slice(0,2).join(' · ') || type.name;
    return {...p,merch:{group:group.id,groupName:group.name,type:type.handle,typeName:type.name,materials,primaryMaterial,craft,attributes,colors,sizes,optionLabels,subtitle,text,minPrice:Math.min(...prices),maxPrice:Math.max(...prices),available:p.variants.some(v=>v.available),source:'data/products.json: title, description, options and variants'}};
  });
}
