import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=await fs.readFile('public/storefront.js','utf8');
const code=source.slice(source.indexOf("  const offer=document.querySelector('[data-welcome-offer]');"),source.indexOf('  const reduced='));
function preview({subscribed=false,endpoint='https://mail.example.test/join',response={subscribed:true},ok=true}={}){
 const saved=new Map(subscribed?[['dimohe-newsletter-subscribed','confirmed']]:[]),timers=[],listeners={},requests=[];
 const button={disabled:false,textContent:''},input={disabled:false},status={hidden:true,textContent:''};
 const form={elements:{email:{value:'visitor@example.test'}},querySelector:selector=>selector==='[type=submit]'?button:input,addEventListener:(event,fn)=>listeners[event]=fn};
 const offer={open:false,addEventListener(){},showModal(){this.open=true;},close(){this.open=false;},querySelector:selector=>selector==='form'?form:status};
 const storage={getItem:key=>saved.get(key),setItem:(key,value)=>saved.set(key,value)};
 vm.runInNewContext(code,{document:{hidden:false,querySelector:selector=>selector==='[data-welcome-offer]'?offer:null},localStorage:storage,window:{addEventListener(){}},location:{href:'https://shop.example.test/',origin:'https://shop.example.test'},URL,setTimeout:(callback,delay)=>timers.push({callback,delay}),fetch:async(url,options)=>{requests.push({url,options});return requests.length===1?{ok:true,json:async()=>({endpoint})}:{ok,json:async()=>response};}});
 return{offer,status,saved,button,requests,open:()=>timers[0].callback(),delay:timers[0].delay,submit:()=>listeners.submit({preventDefault(){},currentTarget:form})};
}
const success=preview();assert.equal(success.delay,1000);success.open();assert.equal(success.offer.open,true);await success.submit();assert.equal(success.saved.get('dimohe-newsletter-subscribed'),'confirmed');assert.equal(success.button.disabled,true);
const returning=preview({subscribed:true});returning.open();assert.equal(returning.offer.open,false);
for(const scenario of [{endpoint:null},{ok:false},{response:{pending:true}},{response:{subscribed:false}}]){const flow=preview(scenario);flow.open();await flow.submit();assert.equal(flow.saved.size,0);assert.equal(flow.button.disabled,false);}
console.log('Passed: one-second welcome offer, persistence only after confirmed subscription, no repeat for subscribers, and failed/unconnected/pending signups remain eligible.');
