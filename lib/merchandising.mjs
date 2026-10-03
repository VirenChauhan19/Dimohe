import { load } from 'cheerio';
import { groups, types } from './taxonomy.mjs';

export { groups, types };

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
