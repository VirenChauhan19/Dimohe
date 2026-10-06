// Department and product-type taxonomy. Dependency-free so browsers can import it.
export const groups = [
  {id:'home',name:'Home & Living',handle:'home-furnishing',description:'Block-printed cushions, throws, table linens, and bath textiles.',image:'/cdn/shop/files/pllow.png'},
  {id:'bags',name:'Bags',handle:'bags',description:'Hand-embroidered evening bags, potlis, clutches, and everyday totes.',image:'/cdn/shop/files/AVRBBB_1_3.jpg'},
  {id:'wellness',name:'Wellness',handle:'wellness',description:'Hair oils, shampoo, masks, and body care.',image:'/cdn/shop/files/Hair-Oil.jpg'},
  {id:'kids',name:'Kids',handle:'kids-clothing',description:'Children’s occasionwear for weddings, festivals, and family gatherings.',image:'/cdn/shop/files/3.png'},
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
