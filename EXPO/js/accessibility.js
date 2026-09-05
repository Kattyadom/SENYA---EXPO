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

// Actualizar la interfaz del botón de voz
function updateSpeechButtonUI() {
  if (!speechBtn) return;
  const h4 = speechBtn.querySelector('h4');
  if (h4) {
    h4.textContent = isSpeechActive ? 'Stop Reading' : 'Read Aloud';
  }
}

if (speechBtn) {
  speechBtn.onclick = () => {
    isSpeechActive = !isSpeechActive;
    saveMode('speechActive', isSpeechActive);
    updateSpeechButtonUI();

    if (!isSpeechActive) {
      synth.cancel();
      lastSpokenElement = null;
    }
  };
}

// Función encargada de emitir la voz sin modificar el DOM real
function speakText(text) {
  if (!isSpeechActive || !text || !text.trim()) return;

  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = 'es-ES'; // Cambiado a Español para mejor coincidencia con la UI
  utterance.rate = 1;
  utterance.pitch = 1;

  synth.speak(utterance);
}

// Función segura para extraer texto eliminando clones de íconos
function extractText(element) {
  if (!element) return '';
  
  // Se crea un clon desconectado del DOM para no afectar la pantalla
  const clone = element.cloneNode(true);
  const icons = clone.querySelectorAll('i, svg, .icon, [class*="fa-"], img');
  icons.forEach(icon => icon.remove());

  return (clone.textContent || clone.innerText || '').replace(/\s+/g, ' ').trim();
}

// Evento Hover Optimizado
document.addEventListener('mouseover', (event) => {
  if (!isSpeechActive) return;

  const target = event.target;

  // Ignorar panel de accesibilidad para evitar lecturas de la propia interfaz
  if (target.closest('#accessibilityPanel') || target.closest('.sign-language-panel')) return;

  // PRIORIDAD 1: Botones o Enlaces Interactivos
  const interactiveEl = target.closest('button, a, [role="button"]');
  if (interactiveEl) {
    if (lastSpokenElement === interactiveEl) return;
    lastSpokenElement = interactiveEl;

    const label = interactiveEl.getAttribute('aria-label') || 
                  interactiveEl.getAttribute('title') || 
                  extractText(interactiveEl) || 
                  'Enlace';

    speakText(`Boton, ${label}`);
    return;
  }

  // PRIORIDAD 2: Imágenes independientes
  const imgEl = target.closest('img');
  if (imgEl) {
    if (lastSpokenElement === imgEl) return;
    lastSpokenElement = imgEl;

    const altText = imgEl.getAttribute('alt') || 'Imagen';
    speakText(`Imagen de ${altText}`);
    return;
  }

  // PRIORIDAD 3: Encabezados (h1 a h6)
  const headingEl = target.closest('h1, h2, h3, h4, h5, h6');
  if (headingEl) {
    if (lastSpokenElement === headingEl) return;
    lastSpokenElement = headingEl;

    speakText(extractText(headingEl));
    return;
  }

  // PRIORIDAD 4: Tarjetas y contenedores principales
  const cardEl = target.closest('.category-card, .why-card, .card, .step, .testimonial-card, .option-card, .acc-card');
  if (cardEl) {
    if (lastSpokenElement === cardEl) return;
    lastSpokenElement = cardEl;

    speakText(extractText(cardEl));
    return;
  }

  // PRIORIDAD 5: Texto plano (párrafos, ítems de lista, etiquetas)
  const textEl = target.closest('p, span, li, label');
  if (textEl) {
    const textContent = extractText(textEl);
    if (textContent !== '') {
      if (lastSpokenElement === textEl) return;
      lastSpokenElement = textEl;

      speakText(textContent);
      return;
    }
  }
});

// Limpiar la referencia cuando el cursor sale del sitio
document.addEventListener('mouseout', (event) => {
  if (!event.relatedTarget) {
    lastSpokenElement = null;
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
    localStorage.removeItem('speechActive');

    isSpeechActive = false;
    synth.cancel();
    updateSpeechButtonUI();

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

  if (localStorage.getItem('speechActive') === 'true') {
    isSpeechActive = true;
    updateSpeechButtonUI();
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