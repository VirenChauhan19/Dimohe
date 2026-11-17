import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source=await fs.readFile('public/storefront.js','utf8');
const start=source.indexOf('  const navGroups=');
const end=source.indexOf("  document.querySelectorAll('a[href]')",start);
assert.ok(start>=0&&end>start,'Navigation controller is present');

function preview({reduced=false,hover=true}={}){
  let now=0,id=0;
  const timers=new Map();
  const target=()=>({listeners:{},addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);},emit(name,event={}){this.listeners[name]?.forEach(fn=>fn(event));}});
  const preference=Object.assign(target(),{matches:reduced});
  const pointer=Object.assign(target(),{matches:hover});
  const desktopLayout=target();
  const document=Object.assign(target(),{activeElement:null});
  const surfaceClasses=new Set();
  const surface={style:{},setAttribute(){},classList:{add:c=>surfaceClasses.add(c),remove:c=>surfaceClasses.delete(c)},getBoundingClientRect(){return {height:parseFloat(this.style.height)||0};}};
  const header={append(){},classList:{add(){}}};
  document.createElement=()=>surface;
  document.querySelector=()=>header;
  const groups=Array.from({length:3},()=>{
    const classes=new Set();
    const group=Object.assign(target(),{open:false,classList:{contains:c=>classes.has(c),toggle(c,on){if(on)classes.add(c);else classes.delete(c);},remove:c=>classes.delete(c)}});
    const summary=Object.assign(target(),{focus(){document.activeElement=summary;}});
    const panel={inert:false,animation:null,height:240,get offsetHeight(){return group.open?this.height:0;},animate(frames,options){
      const animation={frames,options,cancel(){this.cancelled=true;},finish(){if(!this.cancelled)this.onfinish?.();}};
      this.animation=animation;return animation;
    }};
    group.contains=node=>node===summary||node===panel;
    group.querySelector=selector=>selector==='summary'?summary:panel;
    return Object.assign(group,{summary,panel});
  });
  document.querySelectorAll=()=>groups;
  vm.runInNewContext(source.slice(start,end),{
    document,desktopLayout,window:{matchMedia:query=>query.includes('reduced-motion')?preference:pointer},
    getComputedStyle:panel=>panel.style||{opacity:'1',transform:'none'},
    setTimeout:(fn,delay)=>{timers.set(++id,{at:now+delay,fn});return id;},clearTimeout:key=>timers.delete(key)
  });
  function advance(ms){
    const end=now+ms;
    for(;;){const next=[...timers].filter(([,t])=>t.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!next)break;now=next[1].at;timers.delete(next[0]);next[1].fn();}
    now=end;
  }
  const click=(group,detail=1)=>group.summary.emit('click',{detail,preventDefault(){}});
  return {groups,document,preference,pointer,desktopLayout,advance,click,surface};
}

const flow=preview();
const [kids,bags]=flow.groups;
kids.emit('pointerenter');flow.advance(100);kids.emit('pointerleave');flow.advance(500);
assert.equal(kids.open,false,'Passing over a category does not flash its menu');
kids.emit('pointerenter');flow.advance(140);
assert.equal(kids.open,true);assert.equal(kids.panel.inert,false);
assert.equal(flow.surface.style.height,'240px');
assert.equal(kids.panel.animation.frames[0].clipPath,'inset(0px 0px 240px 0px)','The first menu reveals gradually from the header');
kids.panel.animation.finish();
kids.emit('pointerleave');flow.advance(279);assert.equal(kids.classList.contains('is-closing'),false);
flow.advance(1);assert.equal(kids.open,true,'The details element remains open for the exit animation');
assert.equal(kids.panel.inert,true,'Exiting links cannot take focus');
kids.panel.style={opacity:'.45',transform:'matrix(1, 0, 0, 1, 0, -3)'};
const exit=kids.panel.animation;
kids.emit('pointerenter');flow.advance(140);
assert.equal(exit.cancelled,true);
assert.equal(kids.panel.animation.frames[0].opacity,'.45','Re-entry starts at the interrupted frame');
assert.equal(kids.panel.inert,false);kids.panel.animation.finish();
bags.panel.height=360;bags.emit('pointerenter');flow.advance(140);
assert.equal(bags.open,true);assert.equal(kids.open,true,'Category changes keep the outgoing panel during its fade');
assert.equal(flow.surface.style.height,'360px','The shared background transitions to the new menu height');
assert.equal(bags.panel.animation.frames[0].clipPath,'inset(0px 0px 120px 0px)','The next menu starts within the previous background height');
assert.equal(kids.panel.inert,true);kids.panel.animation.finish();assert.equal(kids.open,false);
bags.panel.animation.finish();
flow.document.activeElement=bags.panel;
flow.document.emit('keydown',{key:'Escape'});
assert.equal(flow.document.activeElement,bags.summary,'Escape restores focus to the active category');
bags.panel.animation.finish();assert.equal(bags.open,false);
assert.equal(flow.surface.style.height,'0px');

const keyboard=preview({hover:false});
keyboard.click(keyboard.groups[0],0);assert.equal(keyboard.groups[0].open,true);
keyboard.click(keyboard.groups[0],0);keyboard.groups[0].panel.animation.finish();assert.equal(keyboard.groups[0].open,false);

const reduced=preview({reduced:true});
reduced.click(reduced.groups[0]);assert.equal(reduced.groups[0].open,true);
assert.equal(reduced.groups[0].panel.animation,null);
reduced.document.emit('click',{target:{closest:()=>null}});assert.equal(reduced.groups[0].open,false);

flow.click(bags);flow.preference.matches=true;flow.preference.emit('change');
assert.equal(bags.open,true);assert.equal(bags.panel.animation.cancelled,true);
flow.desktopLayout.emit('change');assert.equal(bags.open,false);
console.log('Passed: shared menu heights, clipped entrances, hover intent, animated exits, interrupted re-entry, category switching, Escape focus, keyboard toggles, reduced motion and responsive cleanup.');
