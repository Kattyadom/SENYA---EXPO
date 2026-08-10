// ===== PANEL =====
const panel = document.getElementById('accessibilityPanel');
const openBtn = document.getElementById('accessibilityBtn');
const closeBtn = document.getElementById('closePanel');

if(openBtn && panel){
  openBtn.addEventListener('click', e => {
    e.preventDefault();
    panel.classList.add('open');
  });
}

if(closeBtn && panel){
  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
  });
}

// ===== SAVE MODE =====
function saveMode(mode, enabled){
  localStorage.setItem(mode, enabled);
}

// ===== LOW VISION =====
const lowVisionBtn = document.getElementById('lowVisionBtn');

if(lowVisionBtn){
  lowVisionBtn.onclick = () => {
    document.body.classList.toggle('low-vision');
    saveMode('lowVision', document.body.classList.contains('low-vision'));
  };
}

// ===== DYSLEXIA =====
const dyslexiaBtn = document.getElementById('dyslexiaBtn');

if(dyslexiaBtn){
  dyslexiaBtn.onclick = () => {
    document.body.classList.toggle('dyslexia');
    saveMode('dyslexia', document.body.classList.contains('dyslexia'));
  };
}

// ===== DEAF VISUAL =====
const deafBtn = document.getElementById('deafBtn');

if(deafBtn){
  deafBtn.onclick = () => {
    document.body.classList.toggle('deaf-visual');
    saveMode('deafVisual', document.body.classList.contains('deaf-visual'));
  };
}

// ===== TEXT SIZE =====
function setTextSize(size){

  document.body.classList.remove('text-small','text-large');

  document.querySelectorAll('.size-buttons button')
    .forEach(b => b.classList.remove('active'));

  if(size === 'small'){
    document.body.classList.add('text-small');
    document.getElementById('smallText')?.classList.add('active');
  }

  if(size === 'normal'){
    document.getElementById('normalText')?.classList.add('active');
  }

  if(size === 'large'){
    document.body.classList.add('text-large');
    document.getElementById('largeText')?.classList.add('active');
  }

  localStorage.setItem('textSize', size);
}

document.getElementById('smallText')?.addEventListener('click', () => setTextSize('small'));
document.getElementById('normalText')?.addEventListener('click', () => setTextSize('normal'));
document.getElementById('largeText')?.addEventListener('click', () => setTextSize('large'));

// ===== RESET =====
const resetBtn = document.getElementById('resetAccessibility');

if(resetBtn){
  resetBtn.onclick = () => {

    document.body.classList.remove(
      'low-vision',
      'dyslexia',
      'deaf-visual',
      'text-small',
      'text-large'
    );

    localStorage.removeItem('lowVision');
    localStorage.removeItem('dyslexia');
    localStorage.removeItem('deafVisual');
    localStorage.removeItem('textSize');

    setTextSize('normal');
  };
}

// ===== RESTORE WHEN CHANGING PAGE =====
window.addEventListener('DOMContentLoaded', () => {

  if(localStorage.getItem('lowVision') === 'true'){
    document.body.classList.add('low-vision');
  }

  if(localStorage.getItem('dyslexia') === 'true'){
    document.body.classList.add('dyslexia');
  }

  if(localStorage.getItem('deafVisual') === 'true'){
    document.body.classList.add('deaf-visual');
  }

  const savedTextSize = localStorage.getItem('textSize');

  if(savedTextSize === 'small'){
    setTextSize('small');
  }else if(savedTextSize === 'large'){
    setTextSize('large');
  }else{
    setTextSize('normal');
  }

});