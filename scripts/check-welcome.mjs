import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=await fs.readFile('public/storefront.js','utf8');
const code=source.slice(source.indexOf("  const offer=document.querySelector('[data-welcome-offer]');"),source.indexOf('  const reduced='));
function preview({home=true,subscribed=false,saved=new Map(),sessionSaved=new Map(),storageBlocked=false,endpoint='https://mail.example.test/join',response={subscribed:true},ok=true}={}){
 if(subscribed)saved.set('dimohe-newsletter-subscribed','confirmed');
 const timers=[],listeners={},requests=[],offerListeners={},windowListeners={};
 const button={disabled:false,textContent:''},input={disabled:false},status={hidden:true,textContent:''};
 const form={elements:{email:{value:'visitor@example.test'}},querySelector:selector=>selector==='[type=submit]'?button:input,addEventListener:(event,fn)=>listeners[event]=fn};
 const offer={open:false,hasAttribute:name=>home&&name==='data-welcome-auto',addEventListener:(event,fn)=>(offerListeners[event]??=[]).push(fn),showModal(){this.open=true;},close(){this.open=false;offerListeners.close?.forEach(fn=>fn());},getBoundingClientRect:()=>({left:0,top:0,right:100,bottom:100}),querySelector:selector=>selector==='form'?form:status};
 const signupTrigger=(isAnnouncement,hidden)=>({
  hidden,disabled:false,
  hasAttribute:name=>isAnnouncement&&name==='data-announcement-message',
  addEventListener(event,fn){this[event]=fn;},
  dispatchEvent(){},
 });
 const trigger=signupTrigger(false,false),headerTrigger=signupTrigger(true,true);
 const storage={getItem:key=>{if(storageBlocked)throw new Error('blocked');return saved.get(key);},setItem:(key,value)=>{if(storageBlocked)throw new Error('blocked');saved.set(key,value);}};
 const session={getItem:key=>sessionSaved.get(key),setItem:(key,value)=>sessionSaved.set(key,value)};
 const document={hidden:false,querySelector:selector=>selector==='[data-welcome-offer]'?offer:null,querySelectorAll:()=>[trigger,headerTrigger]};
 vm.runInNewContext(code,{document,localStorage:storage,sessionStorage:session,window:{addEventListener:(event,fn)=>windowListeners[event]=fn},location:{href:'https://shop.example.test/',origin:'https://shop.example.test'},URL,Event,setTimeout:(callback,delay)=>timers.push({callback,delay}),fetch:async(url,options)=>{requests.push({url,options});return requests.length===1?{ok:true,json:async()=>({endpoint})}:{ok,json:async()=>response};}});
 return{offer,trigger,headerTrigger,status,saved,sessionSaved,button,requests,document,timers,windowListeners,offerListeners,open:()=>timers[0]?.callback(),delay:timers[0]?.delay,submit:()=>listeners.submit({preventDefault(){},currentTarget:form})};
}
const success=preview();assert.equal(success.delay,1000);success.open();assert.equal(success.offer.open,true);await success.submit();assert.equal(success.saved.get('dimohe-newsletter-subscribed'),'confirmed');assert.equal(success.button.disabled,true);assert.equal(success.trigger.hidden,true);
const returning=preview({subscribed:true});returning.open();assert.equal(returning.offer.open,false);assert.equal(returning.trigger.hidden,true);
assert.equal(returning.headerTrigger.disabled,true);
assert.equal(success.headerTrigger.disabled,true);
for(const scenario of [{endpoint:null},{ok:false},{response:{pending:true}},{response:{subscribed:false}}]){const flow=preview(scenario);flow.open();await flow.submit();assert.equal(flow.saved.has('dimohe-newsletter-subscribed'),false);assert.equal(flow.saved.get('dimohe-welcome-offer-seen'),'true');assert.equal(flow.button.disabled,false);}
for(const dismissal of ['close','escape','backdrop','reload']){
 const flow=preview();flow.open();
 if(dismissal==='backdrop')flow.offerListeners.click.forEach(fn=>fn({target:flow.offer,clientX:-1,clientY:-1}));
 else if(dismissal!=='reload')flow.offer.close();
 assert.equal(flow.saved.has('dimohe-newsletter-subscribed'),false,'Dismissal is not subscription consent');
 const reload=preview({saved:flow.saved});reload.open();assert.equal(reload.offer.open,false,`${dismissal} must not trigger another offer on reload`);
 reload.trigger.click();assert.equal(reload.offer.open,true,`${dismissal} must still allow signup from the footer`);
}
const otherPage=preview({home:false});assert.equal(otherPage.timers.length,0);otherPage.trigger.click();assert.equal(otherPage.offer.open,true);
otherPage.offer.close();assert.equal(otherPage.headerTrigger.hidden,true,'Signup code leaves rotation visibility to the announcement bar');
otherPage.headerTrigger.click();assert.equal(otherPage.offer.open,true);
const blocked=preview({storageBlocked:true});blocked.open();blocked.offer.close();
const fallback=preview({storageBlocked:true,sessionSaved:blocked.sessionSaved});fallback.open();assert.equal(fallback.offer.open,false);
const deferred=preview();deferred.document.hidden=true;deferred.open();assert.equal(deferred.saved.size,0,'An offer never displayed must not be marked seen');
deferred.document.hidden=false;deferred.timers[1].callback();assert.equal(deferred.offer.open,true);
const tabs=preview();tabs.open();tabs.windowListeners.storage({key:'dimohe-welcome-offer-seen'});assert.equal(tabs.offer.open,false);
console.log('Passed: one-second first offer, no repeats after dismissals/reloads/return visits, session fallback, cross-tab suppression, deferred display and separate confirmed signup state.');
