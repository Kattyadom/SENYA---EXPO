const panel = document.getElementById('accessibilityPanel');
const openBtn = document.getElementById('accessibilityBtn'); 
const closeBtn = document.getElementById('closePanel');

openBtn.addEventListener('click', e => { 
e.preventDefault(); 
panel.classList.add('open'); 
});

closeBtn.addEventListener('click', () => { 
panel.classList.remove('open'); 
});

// Low Vision
document.getElementById('lowVisionBtn').onclick = () => { 
document.body.classList.toggle('low-vision'); 
}; 

// Dyslexia 
document.getElementById('dyslexiaBtn').onclick = () => { 
document.body.classList.toggle('dyslexia'); 
}; 

// Deaf Support 
document.getElementById('deafBtn').onclick = () => { 
document.body.classList.toggle('deaf-visual'); 
};

// Text Size 
function setTextSize(size){ 
document.body.classList.remove('text-small','text-large'); 

document.querySelectorAll('.size-buttons button') 
.forEach(b => b.classList.remove('active')); 

if(size === 'small'){ document.body.classList.add('text-small');
document.getElementById('smallText').classList.add('active'); 
}

if(size === 'normal'){ 
document.getElementById('normalText').classList.add('active'); 
}

if(size === 'large'){
document.body.classList.add('text-large');
document.getElementById('largeText').classList.add('active'); 
}
}

document.getElementById('smallText').onclick = () => setTextSize('small');
document.getElementById('normalText').onclick = () => setTextSize('normal');
document.getElementById('largeText').onclick = () => setTextSize('large');

// Reset 
document.getElementById('resetAccessibility').onclick = () => {
    
document.body.classList.remove( 
'low-vision', 
'dyslexia', 
'deaf-visual', 
'text-small', 
'text-large' 
); 

setTextSize('normal'); 
};

// Default 
setTextSize('normal');