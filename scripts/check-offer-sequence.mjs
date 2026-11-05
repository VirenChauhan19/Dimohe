import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=await fs.readFile('public/storefront.js','utf8');
const start=source.indexOf('  // Follow the welcome offer only after');
const code=source.slice(start,source.indexOf('  const reduced=',start));
function preview({seen=false}={}){
  let now=0,id=0;const timers=new Map(),saved=new Map(seen?[['dimohe-bundle-offer-seen','true']]:[]);
  const dialog=open=>({open,listeners:{},addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);},emit(name,event={}){this.listeners[name]?.forEach(fn=>fn(event));},showModal(){this.open=true;this.shows=(this.shows||0)+1;},close(){this.open=false;this.emit('close');}});
  const offer=dialog(true),bundle=dialog(false),other=dialog(false),state={menu:false,typing:false};
  const document={hidden:false,activeElement:{matches:()=>state.typing,isConnected:true,focus(){}},querySelector:s=>s==='[data-bundle-offer]'?bundle:s==='dialog[open]'?([offer,bundle,other].find(d=>d.open)||null):s.includes('data-menu-toggle')&&state.menu?{}:null};
  vm.runInNewContext(code,{offer,document,window:{addEventListener(){}},sessionStorage:{getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)},setTimeout:(fn,delay)=>{timers.set(++id,{at:now+delay,fn});return id;},clearTimeout:key=>timers.delete(key)});
  const advance=ms=>{const end=now+ms;for(;;){const next=[...timers.entries()].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;timers.delete(next[0]);next[1].fn();}now=end;};
  const dismiss=()=>{offer.emit('click',{target:{closest:()=>({})}});offer.close();};
  return{offer,bundle,other,document,state,advance,dismiss,saved};
}
const normal=preview();normal.dismiss();normal.advance(999);assert.equal(normal.bundle.open,false);normal.advance(1);assert.equal(normal.bundle.open,true);assert.equal(normal.offer.open,false);normal.bundle.close();normal.offer.open=true;normal.dismiss();normal.advance(5000);assert.equal(normal.bundle.shows,1);
const repeat=preview({seen:true});repeat.dismiss();repeat.advance(5000);assert.equal(repeat.bundle.open,false);
const automatic=preview();automatic.offer.close();automatic.advance(5000);assert.equal(automatic.bundle.open,false);
for(const blocker of ['dialog','menu','hidden','typing']){
  const flow=preview();flow.dismiss();
  if(blocker==='dialog')flow.other.open=true;if(blocker==='menu')flow.state.menu=true;if(blocker==='hidden')flow.document.hidden=true;if(blocker==='typing')flow.state.typing=true;
  flow.advance(1000);assert.equal(flow.bundle.open,false);
  flow.other.open=false;flow.state.menu=false;flow.document.hidden=false;flow.state.typing=false;
  flow.advance(800);assert.equal(flow.bundle.open,true);
}
const escape=preview();escape.offer.emit('cancel');escape.offer.close();escape.advance(1000);assert.equal(escape.bundle.open,true);
console.log('Passed: 1-second offer sequence, one follow-up per session, no overlapping dialogs, no programmatic-close trigger, and deferral during typing/menu/background use.');
