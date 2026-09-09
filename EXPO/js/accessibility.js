// =====================================================
// ESTADO GLOBAL E IDIOMA
// =====================================================
let currentLang = localStorage.getItem('senyaLanguage') === 'es' ? 'es' : 'en';
function readingLanguage() {
    const selected = document.querySelector('.goog-te-combo')?.value;
    if (selected === 'es' || selected === 'en') return selected;
    // Google restores translation across pages even before its selector is ready.
    const cookie = document.cookie.split(';').map(part => part.trim()).find(part => part.startsWith('googtrans='));
    if (cookie) {
        try {
            const language = decodeURIComponent(cookie.slice('googtrans='.length)).split('/').pop();
            if (language === 'es' || language === 'en') return language;
        } catch (_) { /* Ignore malformed translation cookies. */ }
    }
    if (document.documentElement.lang.toLowerCase().startsWith('es')) return 'es';
    return currentLang;
}
document.addEventListener('change',event=>{if(event.target.matches?.('.goog-te-combo')){currentLang=event.target.value==='es'?'es':'en';localStorage.setItem('senyaLanguage',currentLang);synth?.cancel();lastSpokenElement=null;updateSpeechButtonUI();}}, true);
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
        localStorage.setItem("senyaLanguage", currentLang);

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
let deafObserver;
let deafNoticeTimer;
let deafNotice;
const deafStatusSelector = '[role="status"], [role="alert"], [aria-live="polite"], [aria-live="assertive"]';
function showDeafNotice(text) {
    if (!deafNotice) {
        deafNotice = document.createElement('div');
        deafNotice.className = 'senya-deaf-notice';
        deafNotice.setAttribute('role', 'status');
        const label = document.createElement('span');
        const close = document.createElement('button');
        close.type = 'button';
        close.textContent = '×';
        close.setAttribute('aria-label', 'Dismiss notification');
        close.onclick = () => { deafNotice.hidden = true; };
        deafNotice.append(label, close);
        document.body.appendChild(deafNotice);
    }
    deafNotice.firstElementChild.textContent = text;
    deafNotice.hidden = false;
    clearTimeout(deafNoticeTimer);
    deafNoticeTimer = setTimeout(() => { deafNotice.hidden = true; }, 10000);
}
function setDeafSupport(active, announce = false) {
    deafObserver?.disconnect();
    clearTimeout(deafNoticeTimer);
    if (deafNotice) deafNotice.hidden = true;
    document.body.classList.toggle('deaf-visual', active);
    if (deafBtn) {
        deafBtn.classList.toggle('active', active);
        deafBtn.setAttribute('aria-pressed', String(active));
    }
    if (!active) return;
    const seen = new WeakMap();
    document.querySelectorAll(deafStatusSelector).forEach(el => seen.set(el, el.textContent.trim()));
    deafObserver = new MutationObserver(records => {
        const candidates = new Set();
        for (const record of records) {
            const el = record.target.nodeType === 1 ? record.target : record.target.parentElement;
            if (!el || el.closest('.senya-deaf-notice, #accessibilityPanel, #google_translate_element')) continue;
            const status = el.closest(deafStatusSelector);
            if (status) candidates.add(status);
            for (const node of record.addedNodes) {
                if (node.nodeType !== 1) continue;
                if (node.matches(deafStatusSelector)) candidates.add(node);
                node.querySelectorAll(deafStatusSelector).forEach(item => candidates.add(item));
            }
        }
        for (const el of candidates) {
            if (el.closest('.senya-deaf-notice') || el.hidden || !el.getClientRects().length) continue;
            const text = el.textContent.replace(/\s+/g, ' ').trim();
            if (text && seen.get(el) !== text) showDeafNotice(text);
            seen.set(el, text);
        }
    });
    deafObserver.observe(document.body, { childList: true, characterData: true, subtree: true });
    if (announce) showDeafNotice('Deaf Support is on. Status updates will also appear as visual notifications.');
}
if (deafBtn) {
    deafBtn.type = 'button';
    deafBtn.setAttribute('aria-pressed', 'false');
    deafBtn.onclick = () => {
        const active = !document.body.classList.contains('deaf-visual');
        saveMode('deafVisual', active);
        setDeafSupport(active, active);
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
    ) || voices.find(v => v.lang.startsWith(targetLang));
}

function speakText(text) {
    if (!synth || !isSpeechActive || !text || !text.trim()) return;

    // Cancela inmediatamente cualquier lectura anterior para respuesta rápida
    synth?.cancel();

    currentLang = readingLanguage();
    const utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.lang = currentLang === 'en' ? 'en-US' : 'es-ES';
    
    const selectedVoice = getNaturalVoice(currentLang);
    if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
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
        speakText(textToRead);
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
        setDeafSupport(false);
        document.body.classList.remove('dyslexia', 'deaf-visual');

        localStorage.removeItem('dyslexia');
        localStorage.removeItem('deafVisual');
        localStorage.removeItem('textSize');
        localStorage.removeItem('speechActive');

        lastSpokenElement = null;
        localStorage.removeItem("senyaHeadTrackingActive");
        window.dispatchEvent(new Event("senya:reset-accessibility"));
        document.querySelectorAll("#lowVisionBtn,#dyslexiaBtn,#deafBtn,#speechBtn,#activarHeadTracking").forEach(button=>{button.classList.remove("active");button.setAttribute("aria-pressed","false");});
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
        setDeafSupport(true);
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
