/* Shared text sizing, including text authored with fixed pixel sizes. */
(()=>{
 const levels={small:0.875,normal:1,large:1.25};
 const labels={small:'Small',normal:'Normal',large:'Large'};
 const ids={smallText:'small',normalText:'normal',largeText:'large'};
 let size=localStorage.getItem('textSize')||localStorage.getItem('senyaInterpreterTextSize')||'normal';
 const valid=value=>value in levels||(/^(?:8[0-9]|9[0-9]|1[0-4][0-9]|150)$/.test(String(value)));
 if(!valid(size))size='normal';
 localStorage.setItem('textSize',size);
 let frame=0;const originals=new Map();
 function controlSize(button){return ids[button.id]||button.dataset.size;}
 function syncControls(){
  const slider=document.getElementById('textSizeSlider');const value=document.getElementById('textSizeValue');const percent=Math.round((levels[size]||Number(size)/100)*100);if(slider)slider.value=percent;if(value&&value.textContent!==percent+'%')value.textContent=percent+'%';
  document.querySelectorAll('.size-buttons button').forEach(button=>{
   const value=controlSize(button);if(!(value in levels))return;
   if(button.textContent!==labels[value])button.textContent=labels[value];
   button.type='button';button.setAttribute('aria-label',labels[value]+' text size');
   button.setAttribute('aria-pressed',String(value===size));button.classList.toggle('active',value===size);
  });
 }
 function apply(){
  frame=0;
  for(const [el,original] of originals){if(original.value)el.style.setProperty('font-size',original.value,original.priority);else el.style.removeProperty('font-size');}
  originals.clear();
  if(document.body.classList.contains('text-small')||document.body.classList.contains('text-large'))document.body.classList.remove('text-small','text-large');
  document.documentElement.dataset.textSize=size in levels?size:Number(size)>100?'large':Number(size)<100?'small':'normal';
  syncControls();
  if(size==='normal')return;
  const measurements=[];
  for(const el of document.body.querySelectorAll('*')){
   if(el.closest('script,style,svg,video,canvas,pre,code,.fa,.fas,.far,.fab,.fa-solid,.fa-regular,.acc-icon,#headCursor'))continue;
   const hasText=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
   if(!hasText&&!el.matches('input,textarea,select'))continue;
   const style=getComputedStyle(el),pixels=parseFloat(style.fontSize);
   if(!Number.isFinite(pixels))continue;
   measurements.push([el,pixels*(levels[size]||Number(size)/100),{value:el.style.getPropertyValue('font-size'),priority:el.style.getPropertyPriority('font-size')}]);
  }
  for(const [el,pixels,original] of measurements){originals.set(el,original);el.style.setProperty('font-size',pixels+'px','important');}
 }
 function refresh(){if(!frame)frame=requestAnimationFrame(apply);}
 function set(value){if(!valid(value))return;size=String(value);localStorage.setItem('textSize',size);localStorage.removeItem('senyaInterpreterTextSize');refresh();}
 window.SenyaTextSize={set,refresh};
 document.addEventListener('click',event=>{
  const button=event.target.closest('.size-buttons button');if(!button)return;
  const value=controlSize(button);if(value in levels)set(value);
 });
 new MutationObserver(refresh).observe(document.body,{childList:true,subtree:true,characterData:true});
 new MutationObserver(refresh).observe(document.body,{attributes:true,attributeFilter:['class']});
 window.addEventListener('resize',refresh);
 document.fonts?.ready.then(refresh);
 window.addEventListener('storage',event=>{if(event.key==='textSize'){size=valid(event.newValue)?event.newValue:'normal';refresh();}});
 refresh();
})();
