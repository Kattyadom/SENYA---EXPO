(function (root) {
 'use strict';
 const plans = [{minutes:5,cents:400,name:'Quick call'},{minutes:15,cents:1000,name:'Standard call'},{minutes:30,cents:1900,name:'Long session'},{minutes:60,cents:3600,name:'Extended session'}];
 const money = cents => '$'+(cents/100).toFixed(2);
 function estimate(minutes, seconds) {
  const plan=plans.find(p=>p.minutes===Number(minutes));
  if(!plan||!Number.isFinite(seconds)||seconds<0)throw Error('Invalid session duration.');
  const extraSeconds=Math.max(0,seconds-plan.minutes*60);
  return {total:plan.cents+Math.round(extraSeconds*70/60),extra:Math.round(extraSeconds*70/60),earnings:seconds>0?Math.max(200,Math.round(seconds*40/60)):0};
 }
 function pack(minutes, details) {
  const plan=plans.find(p=>p.minutes===Number(minutes));
  if(!plan)throw Error('Choose a time package.');
  const text=`SENYA package: ${plan.minutes} min — ${money(plan.cents)} USD. Estimated price.\n${details}`;
  if(text.length>3000)throw Error('Please shorten your request details to leave room for the package summary.');
  return text;
 }
 function unpack(details) {
  const match=/^SENYA (?:demo )?package: (5|15|30|60) min — \$[\d.]+ USD\. (?:No payment|Estimated price)\.\n/.exec(details||'');
  return match?plans.find(p=>p.minutes===Number(match[1])):null;
 }
 root.SenyaPricingDemo={plans,money,estimate,pack,unpack};
 if(typeof module!=='undefined')module.exports=root.SenyaPricingDemo;
 if(!root.document)return;
 document.addEventListener('DOMContentLoaded',()=>{
  const select=document.getElementById('demoPackage');
  if(!select)return;
  const duration=document.getElementById('demoMinutes');
  const render=()=>{
   const plan=plans.find(p=>p.minutes===Number(select.value));
   document.getElementById('demoPackageSummary').textContent=`${plan.name}: ${plan.minutes} minutes for ${money(plan.cents)} USD.`;
   const value=Number(duration.value);
   const valid=duration.value!==''&&Number.isFinite(value)&&value>=0&&value<=240;
   const summary=document.getElementById('demoEstimate');
   if(!valid){summary.textContent='Enter a duration between 0 and 240 minutes.';return;}
   const result=estimate(plan.minutes,value*60);
   summary.textContent=`Estimated total: ${money(result.total)} · Additional time: ${money(result.extra)} · Interpreter estimate: ${money(result.earnings)}.`;
  };
  select.addEventListener('change',render);duration.addEventListener('input',render);render();
 });
})(typeof window==='undefined'?globalThis:window);
