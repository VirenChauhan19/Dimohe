// Department and product-type taxonomy. Dependency-free so browsers can import it.
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
