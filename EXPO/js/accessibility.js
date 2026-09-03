// ===== ACCESSIBILITY PANEL =====

const panel = document.getElementById('accessibilityPanel');
const openBtn = document.getElementById('accessibilityBtn');
const closeBtn = document.getElementById('closePanel');

if (openBtn && panel) {
  openBtn.addEventListener('click', e => {
    e.preventDefault();
    panel.classList.add('open');
  });
}

if (closeBtn && panel) {
  closeBtn.addEventListener('click', () => {
    panel.classList.remove('open');
  });
}


// ===== SAVE MODE =====

function saveMode(mode, enabled) {
  localStorage.setItem(mode, enabled);
}


// ===== LOW VISION =====

const lowVisionBtn = document.getElementById('lowVisionBtn');

if (lowVisionBtn) {
  lowVisionBtn.onclick = () => {
    document.body.classList.toggle('low-vision');
    saveMode('lowVision', document.body.classList.contains('low-vision'));
  };
}


// ===== DYSLEXIA =====

const dyslexiaBtn = document.getElementById('dyslexiaBtn');

if (dyslexiaBtn) {
  dyslexiaBtn.onclick = () => {
    document.body.classList.toggle('dyslexia');
    saveMode('dyslexia', document.body.classList.contains('dyslexia'));
  };
}


// ===== DEAF VISUAL =====

const deafBtn = document.getElementById('deafBtn');

if (deafBtn) {
  deafBtn.onclick = () => {
    document.body.classList.toggle('deaf-visual');
    saveMode('deafVisual', document.body.classList.contains('deaf-visual'));
  };
}


// ===== TEXT SIZE =====

function setTextSize(size) {
  document.body.classList.remove('text-small', 'text-large');

  document.querySelectorAll('.size-buttons button')
    .forEach(b => b.classList.remove('active'));

  if (size === 'small') {
    document.body.classList.add('text-small');
    document.getElementById('smallText')?.classList.add('active');
  }

  if (size === 'normal') {
    document.getElementById('normalText')?.classList.add('active');
  }

  if (size === 'large') {
    document.body.classList.add('text-large');
    document.getElementById('largeText')?.classList.add('active');
  }

  localStorage.setItem('textSize', size);
}

document.getElementById('smallText')?.addEventListener('click', () => setTextSize('small'));
document.getElementById('normalText')?.addEventListener('click', () => setTextSize('normal'));
document.getElementById('largeText')?.addEventListener('click', () => setTextSize('large'));


// ===== READ ALOUD (LECTURA AL PASAR EL CURSOR) =====

let isSpeechActive = false;
let lastSpokenElement = null;
const synth = window.speechSynthesis;
const speechBtn = document.getElementById('speechBtn');

if (speechBtn) {
  speechBtn.onclick = () => {
    isSpeechActive = !isSpeechActive;
    const title = speechBtn.querySelector('h4') || speechBtn;

    if (!isSpeechActive) {
      synth.cancel();
      lastSpokenElement = null;
      if (speechBtn.querySelector('h4')) {
        speechBtn.querySelector('h4').textContent = 'Read Aloud';
      }
    } else {
      if (speechBtn.querySelector('h4')) {
        speechBtn.querySelector('h4').textContent = 'Stop Reading';
      }
    }
  };
}

// Función encargada de emitir la voz
function speakText(text) {
  if (!isSpeechActive || !text || !text.trim()) return;

  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = 'en-US';
  utterance.rate = 1;
  utterance.pitch = 1;

  synth.speak(utterance);
}

// Función para obtener texto limpio ignorando etiquetas de iconos
function extractText(element) {
  const clone = element.cloneNode(true);
  const icons = clone.querySelectorAll('i, svg, .icon, [class*="fa-"]');
  icons.forEach(icon => icon.remove());

  return (clone.textContent || clone.innerText || '').replace(/\s+/g, ' ').trim();
}

// Evento Hover Inteligente
document.addEventListener('mouseover', (event) => {
  if (!isSpeechActive) return;

  const target = event.target;

  // Ignorar panel de accesibilidad
  if (target.closest('#accessibilityPanel')) return;

  // 1. Botones o enlaces
  const interactiveEl = target.closest('button, a, [role="button"]');
  if (interactiveEl) {
    if (lastSpokenElement === interactiveEl) return;
    lastSpokenElement = interactiveEl;

    const label = interactiveEl.getAttribute('aria-label') || 
                  interactiveEl.getAttribute('title') || 
                  extractText(interactiveEl) || 
                  'button';

    speakText(`Button, ${label}`);
    return;
  }

  // 2. Tarjetas completas
  const cardEl = target.closest('.category-card, .why-card, .card, .step, .testimonial-card, .option-card');
  if (cardEl) {
    if (lastSpokenElement === cardEl) return;
    lastSpokenElement = cardEl;

    const cleanText = extractText(cardEl);
    speakText(`Card: ${cleanText}`);
    return;
  }

  // 3. Encabezados (h1 a h6)
  const headingEl = target.closest('h1, h2, h3, h4, h5, h6');
  if (headingEl) {
    if (lastSpokenElement === headingEl) return;
    lastSpokenElement = headingEl;

    speakText(`Heading, ${extractText(headingEl)}`);
    return;
  }

  // 4. Imágenes (Aquí lee la propiedad alt de cada imagen)
  const imgEl = target.closest('img');
  if (imgEl) {
    if (lastSpokenElement === imgEl) return;
    lastSpokenElement = imgEl;

    const altText = imgEl.getAttribute('alt') || 'image';
    speakText(`Image of ${altText}`);
    return;
  }

  // 5. Párrafos y elementos de texto
  const textEl = target.closest('p, span, li, label');
  if (textEl && extractText(textEl) !== '') {
    if (lastSpokenElement === textEl) return;
    lastSpokenElement = textEl;

    speakText(extractText(textEl));
    return;
  }
});


// ===== RESET ACCESSIBILITY =====

const resetBtn = document.getElementById('resetAccessibility');

if (resetBtn) {
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


// ===== SIGN LANGUAGE VIDEO MENU =====

const signMenuButton = document.querySelector('.menu-toggle');

if (signMenuButton) {
  const signPanel = document.createElement('div');
  signPanel.className = 'sign-language-panel';

  signPanel.innerHTML = `
    <div class="sign-panel-header">
      <button class="sign-close-btn" aria-label="Close">&times;</button>
    </div>
    <div class="sign-panel-content">
      <a href="index.html" class="sign-video-card">
        <video muted loop playsinline preload="metadata">
          <source src="videos/home.mp4" type="video/mp4">
        </video>
      </a>
      <a href="opciones.html" class="sign-video-card">
        <video muted loop playsinline preload="metadata">
          <source src="videos/network.mp4" type="video/mp4">
        </video>
      </a>
      <a href="profile.html" class="sign-video-card">
        <video muted loop playsinline preload="metadata">
          <source src="videos/perfil.mp4" type="video/mp4">
        </video>
      </a>
      <a href="about.html" class="sign-video-card">
        <video muted loop playsinline preload="metadata">
          <source src="videos/about.mp4" type="video/mp4">
        </video>
      </a>
      <a href="soporte.html" class="sign-video-card">
        <video muted loop playsinline preload="metadata">
          <source src="videos/contacto.mp4" type="video/mp4">
        </video>
      </a>
    </div>
  `;

  document.body.appendChild(signPanel);

  const signCloseButton = signPanel.querySelector('.sign-close-btn');

  signMenuButton.addEventListener('click', () => {
    signPanel.classList.add('open');
    document.body.classList.add('sign-menu-open');
    const videos = signPanel.querySelectorAll('video');
    videos.forEach(video => {
      video.play().catch(() => {});
    });
  });

  signCloseButton.addEventListener('click', () => {
    signPanel.classList.remove('open');
    document.body.classList.remove('sign-menu-open');
    const videos = signPanel.querySelectorAll('video');
    videos.forEach(video => {
      video.pause();
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
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
  if (localStorage.getItem('lowVision') === 'true') {
    document.body.classList.add('low-vision');
  }

  if (localStorage.getItem('dyslexia') === 'true') {
    document.body.classList.add('dyslexia');
  }

  if (localStorage.getItem('deafVisual') === 'true') {
    document.body.classList.add('deaf-visual');
  }

  const savedTextSize = localStorage.getItem('textSize');

  if (savedTextSize === 'small') {
    setTextSize('small');
  } else if (savedTextSize === 'large') {
    setTextSize('large');
  } else {
    setTextSize('normal');
  }
});