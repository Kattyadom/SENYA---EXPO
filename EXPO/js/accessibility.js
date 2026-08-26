// ===== ACCESSIBILITY PANEL =====

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

    saveMode(
      'lowVision',
      document.body.classList.contains('low-vision')
    );
  };
}


// ===== DYSLEXIA =====

const dyslexiaBtn = document.getElementById('dyslexiaBtn');

if(dyslexiaBtn){
  dyslexiaBtn.onclick = () => {
    document.body.classList.toggle('dyslexia');

    saveMode(
      'dyslexia',
      document.body.classList.contains('dyslexia')
    );
  };
}


// ===== DEAF VISUAL =====

const deafBtn = document.getElementById('deafBtn');

if(deafBtn){
  deafBtn.onclick = () => {
    document.body.classList.toggle('deaf-visual');

    saveMode(
      'deafVisual',
      document.body.classList.contains('deaf-visual')
    );
  };
}


// ===== TEXT SIZE =====

function setTextSize(size){

  document.body.classList.remove(
    'text-small',
    'text-large'
  );

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


document.getElementById('smallText')?.addEventListener(
  'click',
  () => setTextSize('small')
);

document.getElementById('normalText')?.addEventListener(
  'click',
  () => setTextSize('normal')
);

document.getElementById('largeText')?.addEventListener(
  'click',
  () => setTextSize('large')
);


// ===== RESET ACCESSIBILITY =====

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


// =====================================================
// SIGN LANGUAGE VIDEO MENU
// =====================================================

const signMenuButton = document.querySelector('.menu-toggle');

if(signMenuButton){

  // Create panel
  const signPanel = document.createElement('div');

  signPanel.className = 'sign-language-panel';

  signPanel.innerHTML = `

    <div class="sign-panel-header">

      <button
        class="sign-close-btn"
        aria-label="Close">
        &times;
      </button>

    </div>

    <div class="sign-panel-content">

      <!-- HOME -->
      <a href="index.html" class="sign-video-card">
        <video muted loop playsinline preload="metadata">
          <source src="videos/home.mp4" type="video/mp4">
        </video>
      </a>

      <!-- PARTNER NETWORK -->
      <a href="opciones.html" class="sign-video-card">
        <video muted loop playsinline preload="metadata">
          <source src="videos/network.mp4" type="video/mp4">
        </video>
      </a>

      <!-- PROFILE -->
      <a href="profile.html" class="sign-video-card">
        <video muted loop playsinline preload="metadata">
          <source src="videos/perfil.mp4" type="video/mp4">
        </video>
      </a>

      <!-- ABOUT US -->
      <a href="about.html" class="sign-video-card">
        <video muted loop playsinline preload="metadata">
          <source src="videos/about.mp4" type="video/mp4">
        </video>
      </a>

      <!-- CONTACT -->
      <a href="soporte.html" class="sign-video-card">
        <video muted loop playsinline preload="metadata">
          <source src="videos/contacto.mp4" type="video/mp4">
        </video>
      </a>

    </div>
  `;

  // Add panel to the page
  document.body.appendChild(signPanel);

  // Close button
  const signCloseButton =
    signPanel.querySelector('.sign-close-btn');


  // Open panel
  signMenuButton.addEventListener('click', () => {

    signPanel.classList.add('open');

    document.body.classList.add('sign-menu-open');

    const videos = signPanel.querySelectorAll('video');

    videos.forEach(video => {
      video.play().catch(() => {});
    });

  });


  // Close panel
  signCloseButton.addEventListener('click', () => {

    signPanel.classList.remove('open');

    document.body.classList.remove('sign-menu-open');

    const videos = signPanel.querySelectorAll('video');

    videos.forEach(video => {
      video.pause();
    });

  });


  // Close with ESC
  document.addEventListener('keydown', event => {

    if(event.key === 'Escape'){

      signPanel.classList.remove('open');

      document.body.classList.remove('sign-menu-open');

      const videos = signPanel.querySelectorAll('video');

      videos.forEach(video => {
        video.pause();
      });

    }

  });

}


// ===== RESTORE ACCESSIBILITY =====

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

  const savedTextSize =
    localStorage.getItem('textSize');

  if(savedTextSize === 'small'){
    setTextSize('small');
  }
  else if(savedTextSize === 'large'){
    setTextSize('large');
  }
  else{
    setTextSize('normal');
  }

});