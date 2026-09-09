// =====================================================
// ESTADO GLOBAL E IDIOMA
// =====================================================
let currentLang = 'en';
let isSpeechActive = false;
let lastSpokenElement = null;
const synth = window.speechSynthesis;

// =====================================================
// 1. TRADUCCIÓN AUTOMÁTICA TOTAL (GOOGLE TRANSLATE)
// =====================================================
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        includedLanguages: 'en,es',
        autoDisplay: false
    }, 'google_translate_element');
}

(function loadGoogleTranslate() {
    if (!document.getElementById('google_translate_element')) {
        const div = document.createElement('div');
        div.id = 'google_translate_element';
        div.style.display = 'none';
        document.body.appendChild(div);
    }
    
    if(document.querySelector('script[src*="translate.google.com/translate_a/element.js"]'))return;
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.head.appendChild(script);
})();

let translationRetry;
function translatePage(langCode, attempt=0) {
    clearTimeout(translationRetry);
    const select = document.querySelector('#google_translate_element select') || document.querySelector('.goog-te-combo');
    if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
        currentLang = langCode;

        if (synth && synth.speaking) {
            synth?.cancel();
            lastSpokenElement = null;
        }
        
        updateSpeechButtonUI();
        updateLangButtonUI();
    } else {
        if(attempt<20)translationRetry=setTimeout(() => translatePage(langCode,attempt+1), 200);
        else if(langToggleBtn)langToggleBtn.title='Translation is unavailable. Please try again later.';
    }
}

// =====================================================
// 2. PANEL DE ACCESIBILIDAD (CORREGIDO)
// =====================================================
function initPanelEvents() {
    const panel = document.getElementById('accessibilityPanel');
    // Se buscan ambas posibilidades de ID para mayor seguridad
    const openBtn = document.getElementById('openPanel') || document.getElementById('accessibilityBtn');
    const closeBtn = document.getElementById('closePanel');

    if (openBtn && panel) {
        openBtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            panel.classList.add('active');
            panel.classList.add('open');
            panel.style.display = 'block';
            panel.style.visibility = 'visible';
            panel.style.opacity = '1';
        });
    }

    if (closeBtn && panel) {
        closeBtn.addEventListener('click', e => {
            e.preventDefault();
            panel.classList.remove('active');
            panel.classList.remove('open');
            panel.style.removeProperty('display');
        });
    }
}

function saveMode(mode, value) {
    localStorage.setItem(mode, value);
}

// Modos de Accesibilidad
const dyslexiaBtn = document.getElementById('dyslexiaBtn');
if (dyslexiaBtn) {
    dyslexiaBtn.onclick = () => {
        document.body.classList.toggle('dyslexia');
        saveMode('dyslexia', document.body.classList.contains('dyslexia'));
    };
}

const deafBtn = document.getElementById('deafBtn');
if (deafBtn) {
    deafBtn.onclick = () => {
        document.body.classList.toggle('deaf-visual');
        saveMode('deafVisual', document.body.classList.contains('deaf-visual'));
    };
}

// =====================================================
// 3. CONTROL DE TAMAÑO DE TEXTO (SLIDER)
// =====================================================
const slider = document.getElementById("textSizeSlider");
const valueDisplay = document.getElementById("textSizeValue");

function updateTextSize(val) {
    if (valueDisplay) valueDisplay.textContent = `${val}%`;
    window.SenyaTextSize?.set(String(val));
}

if (slider) {
    slider.addEventListener("input", (e) => {
        updateTextSize(e.target.value);
    });
}

// =====================================================
// 4. LECTURA EN VOZ ALTA (RÁPIDA Y COMPLETA)
// =====================================================
const speechBtn = document.getElementById('speechBtn');

function updateSpeechButtonUI() {
    if (!speechBtn) return;
    const h4 = speechBtn.querySelector('h4');
    if (h4) {
        if (currentLang === 'en') {
            h4.textContent = isSpeechActive ? 'Stop Reading' : 'Read Aloud';
        } else {
            h4.textContent = isSpeechActive ? 'Detener Lectura' : 'Leer en Voz Alta';
        }
    }
}

if (speechBtn) {
    speechBtn.onclick = () => {
        isSpeechActive = !isSpeechActive;
        saveMode('speechActive', isSpeechActive);
        updateSpeechButtonUI();

        if (!isSpeechActive) {
            synth?.cancel();
            lastSpokenElement = null;
        }
    };
}

function getNaturalVoice(lang) {
    const voices = synth?.getVoices?.() || [];
    const targetLang = lang === 'en' ? 'en' : 'es';
    
    return voices.find(v => 
        v.lang.startsWith(targetLang) && 
        (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))
    ) || voices.find(v => v.lang.startsWith(targetLang)) || voices[0];
}

function speakText(text) {
    if (!synth || !isSpeechActive || !text || !text.trim()) return;

    // Cancela inmediatamente cualquier lectura anterior para respuesta rápida
    synth?.cancel();

    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = currentLang === 'en' ? 'en-US' : 'es-ES';
    
    const selectedVoice = getNaturalVoice(currentLang);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
    }

    utterance.rate = 1.0; // Velocidad fluida
    utterance.pitch = 1.0;

    synth.speak(utterance);
}

function extractText(element) {
    if (!element) return '';
    const clone = element.cloneNode(true);
    clone.querySelectorAll('img[alt]').forEach(img=>img.replaceWith(document.createTextNode(img.alt)));

    // Elimina iconos para no leer código extra
    const icons = clone.querySelectorAll('i, svg, .icon, .acc-icon, [class*="fa-"]');
    icons.forEach(icon => icon.remove());

    return (clone.textContent || clone.innerText || '').replace(/\s+/g, ' ').trim();
}

// Evento de paso del mouse optimizado
document.addEventListener('mouseover', (event) => {
    if (!isSpeechActive) return;

    const target = event.target;

    // 1. Detección de tarjetas (Panel, Categorías, Servicios)
    const cardEl = target.closest('.acc-card, .category-card, .why-card, .card, .testimonial-card');
    if (cardEl) {
        if (lastSpokenElement === cardEl) return;
        lastSpokenElement = cardEl;

        const textToRead = extractText(cardEl);
        speakText(textToRead);
        return;
    }

    // 2. Detección de botones y enlaces interactivos
    const interactiveEl = target.closest('button, a, .help-btn, .primary, .secondary, .cta-btn');
    if (interactiveEl) {
        if (lastSpokenElement === interactiveEl) return;
        lastSpokenElement = interactiveEl;

        const textToRead = extractText(interactiveEl);
        const prefix = currentLang === 'en' ? 'Button: ' : 'Botón: ';
        speakText(`${prefix}${textToRead}`);
        return;
    }

    // 3. Encabezados (h1, h2, h3, h4)
    const headingEl = target.closest('h1, h2, h3, h4, h5, h6');
    if (headingEl) {
        if (lastSpokenElement === headingEl) return;
        lastSpokenElement = headingEl;

        speakText(extractText(headingEl));
        return;
    }

    // 4. Parrafitos o textos sueltos
    const textEl = target.closest('p, span, li, label');
    if (textEl) {
        if (lastSpokenElement === textEl) return;
        lastSpokenElement = textEl;

        speakText(extractText(textEl));
        return;
    }
}, true);

document.addEventListener('mouseout', (event) => {
    if (!event.relatedTarget) {
        lastSpokenElement = null;
    }
});

if (synth && synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = () => synth.getVoices();
}

// =====================================================
// 5. BOTÓN DE CAMBIO DE IDIOMA
// =====================================================
const langToggleBtn = document.getElementById('langToggleBtn');

function updateLangButtonUI() {
    if (!langToggleBtn) return;
    const h4 = langToggleBtn.querySelector('h4');
    if (h4) {
        h4.textContent = currentLang === 'en' ? 'Switch Language' : 'Cambiar Idioma';
    }
}

if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
        translatePage(currentLang === 'en' ? 'es' : 'en');
    });
}

// =====================================================
// 6. RESTABLECER CONFIGURACIÓN
// =====================================================
const resetBtn = document.getElementById('resetAccessibility');

if (resetBtn) {
    resetBtn.onclick = () => {
        document.body.classList.remove('dyslexia', 'deaf-visual');

        localStorage.removeItem('dyslexia');
        localStorage.removeItem('deafVisual');
        localStorage.removeItem('textSize');
        localStorage.removeItem('speechActive');

        isSpeechActive = false;
        synth?.cancel();

        if (slider) slider.value = 100;
        updateTextSize(100);

        document.body.classList.remove('low-vision');localStorage.removeItem('lowVision');
        // Reset display preferences without changing the selected language.
        updateSpeechButtonUI();
    };
}

// =====================================================
// 7. RESTAURAR ESTADO GUARDADO Y VINCULAR EVENTOS
// =====================================================
window.addEventListener('DOMContentLoaded', () => {
    // Inicializar los eventos de abrir/cerrar panel
    initPanelEvents();

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

    const savedTextSize = localStorage.getItem('textSize') || 'normal';
    if (slider) slider.value = savedTextSize;
    updateTextSize(savedTextSize);
});
// Preserve Low Vision and the shared role-aware navigation.
const lowVisionBtn=document.getElementById('lowVisionBtn');
if(lowVisionBtn)lowVisionBtn.onclick=()=>{document.body.classList.toggle('low-vision');saveMode('lowVision',document.body.classList.contains('low-vision'));};
if(localStorage.getItem('lowVision')==='true')document.body.classList.add('low-vision');
