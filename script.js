let tg = window.Telegram.WebApp;

// ============================================
// ЖЕСТКИЙ СТАБИЛИЗИРУЮЩИЙ ПАТЧ
// ============================================
tg.ready();

let expandedOnce = false;
let userInteracted = false;
const appStartedAt = Date.now();

function expandAfterUserGesture() {
    if (expandedOnce) return;
    expandedOnce = true;
    try { tg.expand(); } catch(_) {}
}

document.addEventListener('pointerdown', expandAfterUserGesture, { once: true });
document.addEventListener('touchstart', expandAfterUserGesture, { once: true, passive: true });
document.addEventListener('click', expandAfterUserGesture, { once: true });

document.addEventListener('pointerdown', () => { userInteracted = true; }, { passive: true });
document.addEventListener('touchstart', () => { userInteracted = true; }, { passive: true });
document.addEventListener('click', () => { userInteracted = true; });

try { tg.setHeaderColor('#000000'); } catch(_) {}
try { tg.setBackgroundColor('#000000'); } catch(_) {}

document.documentElement.style.backgroundColor = '#000000';
document.body.style.backgroundColor = '#000000';
document.body.style.color = '#ffffff';

// ============================================
// УМНЫЙ BACKBUTTON
// ============================================
function syncBackButton() {
    const shouldShow = settingsPanel && settingsPanel.classList.contains('show') || keyboardVisible || isRunning;
    if (shouldShow) {
        tg.BackButton.show();
    } else {
        tg.BackButton.hide();
    }
}

// ============================================
// ТЕКСТЫ
// ============================================
const texts = {
    banner: 'LED banner',
    inputPlaceholder: 'Enter text...',
    settings: 'Settings',
    textSize: 'Text size (8-40)',
    speed: 'Speed (2-30 sec)',
    color: 'Text color',
    run: 'RUN',
    math: 'MATH'
};

const t = texts;

const scrollingText = document.getElementById('scrollingText');
const resetBtn = document.getElementById('resetBtn');
const settingsBtn = document.getElementById('settingsBtn');
const donateBtn = document.getElementById('donateBtn');
const settingsPanel = document.getElementById('settingsPanel');
const inputArea = document.getElementById('inputArea');
const mathBtn = document.getElementById('mathBtn');
const mathKeyboard = document.getElementById('mathKeyboard');
const mathKeys = document.querySelectorAll('.math-key');
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

// Цветовой пикер
const colorPreview = document.getElementById('colorPreview');
const colorPalette = document.getElementById('colorPalette');
const paletteIndicator = document.getElementById('paletteIndicator');
const hueSlider = document.getElementById('hueSlider');
const shadesScroll = document.getElementById('shadesScroll');

const tabFunctions = document.getElementById('tabFunctions');
const tabGreek = document.getElementById('tabGreek');
const tabSymbols = document.getElementById('tabSymbols');
const tabPhysics = document.getElementById('tabPhysics');
const functionsTab = document.getElementById('functionsTab');
const greekTab = document.getElementById('greekTab');
const symbolsTab = document.getElementById('symbolsTab');
const physicsTab = document.getElementById('physicsTab');

const physicsSubtabs = document.querySelectorAll('.physics-subtab-btn');
const physicsCategories = document.querySelectorAll('.physics-category');
const physicsKeys = document.querySelectorAll('.physics-category .math-key');

let currentSpeed = 15, currentColor = '#ffffff', currentSize = 15, isRunning = false, keyboardVisible = false;

// Дефолтные цвета
const defaultColors = [
    { name: 'white', hex: '#ffffff', shades: ['#ffffff', '#f5f5f5', '#e0e0e0', '#cccccc', '#b3b3b3'] },
    { name: 'black', hex: '#000000', shades: ['#000000', '#1a1a1a', '#333333', '#4d4d4d', '#666666'] },
    { name: 'red', hex: '#ff3b30', shades: ['#ff3b30', '#ff5e5e', '#ff8a8a', '#ffb5b5', '#ffd1d1'] },
    { name: 'orange', hex: '#ff9500', shades: ['#ff9500', '#ffaa33', '#ffbf66', '#ffd499', '#ffeacc'] },
    { name: 'yellow', hex: '#ffcc00', shades: ['#ffcc00', '#ffd633', '#ffe066', '#ffeb99', '#fff5cc'] },
    { name: 'green', hex: '#34c759', shades: ['#34c759', '#5ad37a', '#80de9b', '#a6e9bc', '#ccf4dd'] },
    { name: 'cyan', hex: '#5ac8fa', shades: ['#5ac8fa', '#7bd4fb', '#9ce0fc', '#bdecfe', '#def8ff'] },
    { name: 'blue', hex: '#007aff', shades: ['#007aff', '#3395ff', '#66b0ff', '#99cbff', '#cce5ff'] },
    { name: 'purple', hex: '#af52de', shades: ['#af52de', '#bf77e4', '#cf9cea', '#dfc1f0', '#efe6f8'] },
    { name: 'pink', hex: '#ff2d55', shades: ['#ff2d55', '#ff5d7d', '#ff8da6', '#ffbdce', '#ffdee7'] }
];

let ctx = null;
let isDragging = false;
let currentHue = 0;
let currentSat = 100;
let currentLight = 50;
let currentRGB = { r: 255, g: 255, b: 255 };
let displayW = 0;
let displayH = 0;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

// ============================================
// ГЛАВНАЯ ФУНКЦИЯ ДЛЯ ОБНОВЛЕНИЯ БЕГУЩЕЙ СТРОКИ
// ============================================
function setScrollingFromRaw(raw) {
    const latex = parseToLaTeX(raw || '');
    scrollingText.innerHTML = '\\(' + latex + '\\)';
    if (window.MathJax) {
        MathJax.typesetPromise([scrollingText]).then(() => applyColorToMath()).catch(() => {});
    } else {
        applyColorToMath();
    }
}

window.addEventListener('load', function() {
    updateTexts();
    createUnifiedInterface();
    loadSavedData();
    initColorPicker();
    setTimeout(() => setScrollingFromRaw(t.banner), 500);
    scrollingText.style.textShadow = 'none';
    syncBackButton();
});

function updateTexts() {
    const settingsTitle = document.querySelector('.settings-content h3');
    if (settingsTitle) settingsTitle.textContent = t.settings;
    const settingLabels = document.querySelectorAll('.setting-item label');
    if (settingLabels.length >= 3) {
        settingLabels[0].textContent = t.textSize;
        settingLabels[1].textContent = t.speed;
        settingLabels[2].textContent = t.color;
    }
    setScrollingFromRaw(t.banner);
}

function createUnifiedInterface() {
    const mathFieldElement = document.getElementById('mathField');
    if (!mathFieldElement) return;
    
    inputArea.innerHTML = '';
    inputArea.style.cssText = 'display:flex; justify-content:flex-end; align-items:center; padding:16px; gap:10px; position:absolute; bottom:0; left:0; right:0; background:#000; border-top:2px solid rgba(255,255,255,0.2); z-index:100;';
    
    const mathButton = document.createElement('button');
    mathButton.className = 'math-btn';
    mathButton.id = 'mainMathBtn';
    mathButton.textContent = t.math;
    mathButton.style.cssText = 'width:70px; height:60px; background:#000; border:2px solid #fff; border-radius:30px; color:#fff; font-weight:bold; font-size:18px; cursor:pointer; flex-shrink:0; transition:all 0.2s ease;';
    
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'mainInput';
    textInput.className = 'text-input';
    textInput.placeholder = t.inputPlaceholder;
    textInput.value = t.banner;
    textInput.style.cssText = 'flex:1; min-width:0; background:#111; border:2px solid #fff; border-radius:30px; padding:14px 18px; font-size:16px; color:#fff; outline:none; transition:all 0.2s ease;';
    
    const runButton = document.createElement('button');
    runButton.className = 'run-btn';
    runButton.id = 'mainRunBtn';
    runButton.textContent = t.run;
    runButton.style.cssText = 'width:70px; height:60px; background:transparent; border:2px solid #fff; border-radius:30px; color:#fff; font-weight:bold; font-size:18px; cursor:pointer; flex-shrink:0; transition:all 0.2s ease;';
    
    inputArea.appendChild(mathButton);
    inputArea.appendChild(textInput);
    inputArea.appendChild(runButton);
    
    mathButton.addEventListener('click', (e) => { e.stopPropagation(); toggleKeyboard(); });
    runButton.addEventListener('click', toggleRun);
    
    textInput.addEventListener('input', (e) => {
        const text = e.target.value;
        setScrollingFromRaw(text);
        saveData({ latex: parseToLaTeX(text), raw: text });
    });
    
    textInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') toggleRun(); });
    
    document.addEventListener('click', (e) => {
        if (keyboardVisible && !mathKeyboard.contains(e.target) && !mathButton.contains(e.target)) closeKeyboard();
    });
    
    physicsKeys.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); e.preventDefault();
            const formula = btn.dataset.formula;
            if (formula) insertMathSymbol(formula);
            return false;
        });
    });
    
    tabPhysics.addEventListener('click', () => {
        tabFunctions.classList.remove('active'); tabGreek.classList.remove('active'); tabSymbols.classList.remove('active'); tabPhysics.classList.add('active');
        functionsTab.classList.remove('active'); greekTab.classList.remove('active'); symbolsTab.classList.remove('active'); physicsTab.classList.add('active');
        physicsCategories.forEach(cat => cat.classList.remove('active'));
        physicsSubtabs.forEach(btn => btn.classList.remove('active'));
        document.getElementById('phys-mechanics').classList.add('active');
        physicsSubtabs[0].classList.add('active');
        syncBackButton();
    });
    
    physicsSubtabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const cat = btn.dataset.physCat;
            physicsSubtabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            physicsCategories.forEach(catEl => catEl.classList.remove('active'));
            document.getElementById(`phys-${cat}`).classList.add('active');
            syncBackButton();
        });
    });
}

function parseToLaTeX(text) {
    if (!text) return '';
    let result = text;
    result = result.replace(/ /g, '\\ ');
    result = result.replace(/\{([^}]+)\}/g, '\\vec{$1}');
    
    let prevResult;
    do {
        prevResult = result;
        result = result.replace(/\(([^()/]+)\/([^()/]+)\)/g, '\\frac{$1}{$2}');
        result = result.replace(/\(((?:[^()]|\([^()]*\))*)\/((?:[^()]|\([^()]*\))*)\)/g, '\\frac{$1}{$2}');
    } while (result !== prevResult);
    
    result = result.replace(/\(\/\)/g, '\\frac{}{}');
    result = result.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
    result = result.replace(/\/(\d+)\/√\[([^\]]+)\]/g, '\\sqrt[$1]{$2}');
    result = result.replace(/\/([a-zA-Zα-ω]+)\/√\[([^\]]+)\]/g, '\\sqrt[$1]{$2}');
    result = result.replace(/∛\[([^\]]+)\]/g, '\\sqrt[3]{$1}');
    result = result.replace(/∜\[([^\]]+)\]/g, '\\sqrt[4]{$1}');
    result = result.replace(/√\[([^\]]+)\]/g, '\\sqrt{$1}');
    result = result.replace(/√([a-zA-Z0-9α-ω])/g, '\\sqrt{$1}');
    result = result.replace(/([a-zA-Z0-9α-ω])\^\(([^)]+)\)/g, '$1^{$2}');
    result = result.replace(/([a-zA-Z0-9α-ω])\^([a-zA-Z0-9α-ω])/g, '$1^{$2}');
    result = result.replace(/([a-zA-Z0-9α-ω])_\(([^)]+)\)/g, '$1_{$2}');
    result = result.replace(/([a-zA-Z0-9α-ω])_([a-zA-Z0-9α-ω])/g, '$1_{$2}');
    
    const greekMap = {
        'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta',
        'ε': '\\epsilon', 'ζ': '\\zeta', 'η': '\\eta', 'θ': '\\theta',
        'ι': '\\iota', 'κ': '\\kappa', 'λ': '\\lambda', 'μ': '\\mu',
        'ν': '\\nu', 'ξ': '\\xi', 'π': '\\pi', 'ρ': '\\rho',
        'σ': '\\sigma', 'τ': '\\tau', 'υ': '\\upsilon', 'φ': '\\phi',
        'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega',
        'Α': '\\Alpha', 'Β': '\\Beta', 'Γ': '\\Gamma', 'Δ': '\\Delta',
        'Ε': '\\Epsilon', 'Ζ': '\\Zeta', 'Η': '\\Eta', 'Θ': '\\Theta',
        'Ι': '\\Iota', 'Κ': '\\Kappa', 'Λ': '\\Lambda', 'Μ': '\\Mu',
        'Ν': '\\Nu', 'Ξ': '\\Xi', 'Π': '\\Pi', 'Ρ': '\\Rho',
        'Σ': '\\Sigma', 'Τ': '\\Tau', 'Υ': '\\Upsilon', 'Φ': '\\Phi',
        'Χ': '\\Chi', 'Ψ': '\\Psi', 'Ω': '\\Omega'
    };
    for (let [char, latex] of Object.entries(greekMap)) result = result.replace(new RegExp(char, 'g'), latex);
    
    const funcs = ['sin', 'cos', 'tan', 'cot', 'arcsin', 'arccos', 'arctan', 'arccot', 'log', 'ln', 'exp', 'lim'];
    funcs.forEach(func => { result = result.replace(new RegExp(func + '\\s*\\(', 'g'), func + '('); });
    
    return result;
}

function applyColorToMath() {
    scrollingText.style.color = currentColor;
    scrollingText.querySelectorAll('mjx-container').forEach(el => el.style.color = currentColor);
    if (colorPreview) colorPreview.style.backgroundColor = currentColor;
    const oldStyle = document.getElementById('mathColorStyle');
    if (oldStyle) oldStyle.remove();
    const style = document.createElement('style');
    style.id = 'mathColorStyle';
    style.textContent = `#scrollingText, #scrollingText mjx-container { color: ${currentColor} !important; }`;
    document.head.appendChild(style);
}

function loadSavedData() {
    try {
        const saved = localStorage.getItem('ledBannerData');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.color) { 
                currentColor = data.color; 
                applyColorToMath();
                if (data.hue) currentHue = data.hue;
                if (data.sat) currentSat = data.sat;
                if (data.light) currentLight = data.light;
                if (hueSlider && currentHue) hueSlider.value = currentHue;
            }
            if (data.speed) { 
                currentSpeed = data.speed; 
                speedSlider.value = currentSpeed; 
                speedValue.textContent = currentSpeed + ' sec'; 
            }
            if (data.size) { 
                currentSize = data.size; 
                sizeSlider.value = currentSize; 
                sizeValue.textContent = currentSize + 'vw'; 
                scrollingText.style.fontSize = currentSize + 'vw'; 
            }
            if (data.raw) {
                const input = document.getElementById('mainInput');
                if (input) {
                    input.value = data.raw;
                }
                if (data.latex) {
                    setScrollingFromRaw(data.raw);
                }
            }
        }
    } catch(e) {}
}

function saveData(data) {
    const fullData = { 
        ...data, 
        color: currentColor, 
        speed: currentSpeed, 
        size: currentSize,
        hue: currentHue,
        sat: currentSat,
        light: currentLight
    };
    localStorage.setItem('ledBannerData', JSON.stringify(fullData));
}

function sendToBot() {
    try {
        const data = {
            color: currentColor,
            speed: currentSpeed,
            size: currentSize,
            hue: currentHue,
            sat: currentSat,
            light: currentLight
        };
        tg.sendData(JSON.stringify({ action: 'save_all', data: data }));
    } catch (e) {
        console.log('sendData not available');
    }
}

function restartAnimation() { scrollingText.style.animation = 'none'; void scrollingText.offsetWidth; scrollingText.style.animation = `scrollText ${currentSpeed}s linear infinite`; }

function toggleKeyboard() {
    if (isRunning) return;
    keyboardVisible = !keyboardVisible;
    const mainMathBtn = document.getElementById('mainMathBtn');
    if (keyboardVisible) {
        mathKeyboard.classList.add('show');
        mathBtn.classList.add('active');
        if (mainMathBtn) mainMathBtn.classList.add('active');
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else {
        mathKeyboard.classList.remove('show');
        mathBtn.classList.remove('active');
        if (mainMathBtn) mainMathBtn.classList.remove('active');
    }
    syncBackButton();
}

function closeKeyboard() {
    keyboardVisible = false;
    mathKeyboard.classList.remove('show');
    mathBtn.classList.remove('active');
    const mainMathBtn = document.getElementById('mainMathBtn');
    if (mainMathBtn) mainMathBtn.classList.remove('active');
    syncBackButton();
}

function toggleRun() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        isRunning = false;
    } else {
        scrollingText.style.fontSize = currentSize + 'vw';
        sizeValue.textContent = currentSize + 'vw';
        speedValue.textContent = currentSpeed + ' sec';
        restartAnimation();
        applyColorToMath();
        inputArea.style.display = 'none';
        settingsBtn.style.display = 'none';
        donateBtn.style.display = 'none';
        isRunning = true;
        closeKeyboard();
        saveData({});
    }
    syncBackButton();
}

function handleReset() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        isRunning = false;
        const input = document.getElementById('mainInput');
        if (input) { 
            const currentText = input.value;
            setScrollingFromRaw(currentText);
            saveData({ latex: parseToLaTeX(currentText), raw: currentText });
        }
    } else {
        const input = document.getElementById('mainInput');
        if (input) input.value = t.banner;
        setScrollingFromRaw(t.banner);
        
        // Сброс цвета в белый
        currentColor = '#ffffff';
        currentHue = 0;
        currentSat = 0;
        currentLight = 100;
        
        currentSpeed = 15; 
        currentSize = 15;
        
        if (hueSlider) hueSlider.value = 0;
        sizeSlider.value = 15; 
        speedSlider.value = 15;
        sizeValue.textContent = '15vw'; 
        speedValue.textContent = '15 sec';
        scrollingText.style.fontSize = '15vw';
        
        // Перерисовка палитры
        if (colorPalette && ctx) {
            drawColorPalette(0);
            const rect = colorPalette.getBoundingClientRect();
            if (rect.width > 0) {
                const x = 0;
                const y = 0;
                updateIndicatorPosition(x, y);
            }
        }
        
        applyColorToMath();
        restartAnimation();
        saveData({ latex: parseToLaTeX(t.banner), raw: t.banner });
    }
    closeKeyboard();
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
    syncBackButton();
}

function insertMathSymbol(symbol) {
    const input = document.getElementById('mainInput');
    if (!input) return;
    const start = input.selectionStart, end = input.selectionEnd, text = input.value;
    let insertText = symbol;
    if (symbol === '√') insertText = '√[]';
    else if (symbol === '∛') insertText = '∛[]';
    else if (symbol === '∜') insertText = '∜[]';
    else if (symbol === 'n√' || symbol === '√[n]') insertText = '/n/√[]';
    else if (symbol === '→' || symbol === '\\vec' || symbol === '⃗') insertText = '{}';
    else if (symbol === 'a/b' || symbol === 'frac') insertText = '(/)';
    else if (symbol === 'Δ' || symbol === '\\Delta') insertText = 'Δ';
    const newText = text.substring(0, start) + insertText + text.substring(end);
    input.value = newText;
    let newPos = start + insertText.length;
    if (insertText.includes('[]')) newPos = start + insertText.length - 1;
    else if (insertText === '{}') newPos = start + 1;
    else if (insertText === '(/)') newPos = start + 2;
    else if (insertText === '/n/√[]') newPos = start + 3;
    input.setSelectionRange(newPos, newPos);
    input.focus();
    setScrollingFromRaw(newText);
    saveData({ latex: parseToLaTeX(newText), raw: newText });
}

tabFunctions.addEventListener('click', () => {
    tabFunctions.classList.add('active'); tabGreek.classList.remove('active'); tabSymbols.classList.remove('active'); tabPhysics.classList.remove('active');
    functionsTab.classList.add('active'); greekTab.classList.remove('active'); symbolsTab.classList.remove('active'); physicsTab.classList.remove('active');
    syncBackButton();
});
tabGreek.addEventListener('click', () => {
    tabGreek.classList.add('active'); tabFunctions.classList.remove('active'); tabSymbols.classList.remove('active'); tabPhysics.classList.remove('active');
    greekTab.classList.add('active'); functionsTab.classList.remove('active'); symbolsTab.classList.remove('active'); physicsTab.classList.remove('active');
    syncBackButton();
});
tabSymbols.addEventListener('click', () => {
    tabSymbols.classList.add('active'); tabFunctions.classList.remove('active'); tabGreek.classList.remove('active'); tabPhysics.classList.remove('active');
    symbolsTab.classList.add('active'); functionsTab.classList.remove('active'); greekTab.classList.remove('active'); physicsTab.classList.remove('active');
    syncBackButton();
});

mathKeys.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); e.preventDefault();
        const cmd = btn.textContent;
        const dataCmd = btn.dataset.cmd;
        if (dataCmd === 'frac' || cmd === 'a/b') insertMathSymbol('frac');
        else if (dataCmd === '\\vec' || cmd === '⃗' || cmd === '→') insertMathSymbol('→');
        else if (dataCmd === '\\sqrt[n]' || cmd === 'n√') insertMathSymbol('n√');
        else if (dataCmd === '\\Delta' || cmd === 'Δ') insertMathSymbol('Δ');
        else insertMathSymbol(cmd);
        return false;
    });
});

sizeSlider.addEventListener('input', () => {
    currentSize = parseInt(sizeSlider.value);
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveData({});
});
speedSlider.addEventListener('input', () => {
    currentSpeed = parseInt(speedSlider.value);
    speedValue.textContent = currentSpeed + ' sec';
    restartAnimation();
    saveData({});
});

resetBtn.addEventListener('click', handleReset);

settingsBtn.addEventListener('click', function() {
    if (isRunning) return;
    
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
        this.classList.remove('active');
    } else {
        settingsPanel.classList.add('show');
        this.classList.add('active');
        closeKeyboard();
        
        setTimeout(function() {
            if (colorPalette) {
                const rect = colorPalette.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    colorPalette.width = rect.width;
                    colorPalette.height = rect.height;
                    ctx = colorPalette.getContext('2d');
                    displayW = rect.width;
                    displayH = rect.height;
                    drawColorPalette(currentHue);
                    
                    const x = (currentSat / 100) * displayW;
                    const y = (1 - currentLight / 100) * displayH;
                    updateIndicatorPosition(x, y);
                }
            }
        }, 50);
    }
    syncBackButton();
});

settingsPanel.addEventListener('click', (e) => { 
    if (e.target === settingsPanel) { 
        settingsPanel.classList.remove('show'); 
        settingsBtn.classList.remove('active');
        syncBackButton();
    } 
});

tg.BackButton.onClick(() => {
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else if (keyboardVisible) {
        closeKeyboard();
    } else if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        isRunning = false;
    } else {
        const startedRecently = Date.now() - appStartedAt < 1200;
        if (startedRecently || !userInteracted) {
            return;
        }
        tg.close();
    }
    syncBackButton();
});
syncBackButton();

// ============================================
// ЦВЕТОВОЙ ПИКЕР - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================================

function resizeColorPaletteCanvas() {
    if (!colorPalette) return;
    
    const rect = colorPalette.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    
    colorPalette.width = rect.width;
    colorPalette.height = rect.height;
    
    ctx = colorPalette.getContext('2d', { alpha: false });
    
    displayW = rect.width;
    displayH = rect.height;
    
    drawColorPalette(currentHue);
}

function initColorPicker() {
    if (!colorPalette) return;
    
    resizeColorPaletteCanvas();
    
    // Устанавливаем начальную позицию кружка (белый цвет - левый верхний угол)
    currentHue = 0;
    currentSat = 0;
    currentLight = 100;
    
    if (hueSlider) hueSlider.value = currentHue;
    
    // Принудительно устанавливаем белый цвет
    updateColorFromHSL(currentHue, currentSat, currentLight);
    
    colorPalette.addEventListener('mousedown', startDrag);
    colorPalette.addEventListener('mousemove', drag);
    colorPalette.addEventListener('mouseup', stopDrag);
    colorPalette.addEventListener('click', pickColor);
    colorPalette.addEventListener('touchstart', startDragTouch, { passive: false });
    colorPalette.addEventListener('touchmove', dragTouch, { passive: false });
    colorPalette.addEventListener('touchend', stopDrag);
    
    hueSlider.addEventListener('input', function() {
        currentHue = parseInt(hueSlider.value);
        drawColorPalette(currentHue);
        updateColorFromHSL(currentHue, currentSat, currentLight);
        saveData({});
    });
    
    window.addEventListener('resize', function() {
        if (settingsPanel && settingsPanel.classList.contains('show')) {
            setTimeout(function() {
                resizeColorPaletteCanvas();
                const x = (currentSat / 100) * displayW;
                const y = (1 - currentLight / 100) * displayH;
                updateIndicatorPosition(x, y);
            }, 50);
        }
    });
    
    createShadesGrid();
}

function drawColorPalette(hue) {
    if (!ctx || !colorPalette) return;
    if (displayW === 0 || displayH === 0) return;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, displayW, displayH);
    
    for (let x = 0; x < displayW; x++) {
        const saturation = x / displayW;
        
        const gradient = ctx.createLinearGradient(0, 0, 0, displayH);
        gradient.addColorStop(0, `hsl(${hue}, ${saturation * 100}%, 100%)`);
        gradient.addColorStop(0.5, `hsl(${hue}, ${saturation * 100}%, 50%)`);
        gradient.addColorStop(1, `hsl(${hue}, ${saturation * 100}%, 0%)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, 0, 1, displayH);
    }
}

function updateHue() {
    currentHue = parseInt(hueSlider.value);
    drawColorPalette(currentHue);
    updateColorFromHSL(currentHue, currentSat, currentLight);
}

function startDrag(e) { isDragging = true; pickColorFromEvent(e); }
function startDragTouch(e) { e.preventDefault(); isDragging = true; pickColorFromTouch(e); }
function drag(e) { if (isDragging) pickColorFromEvent(e); }
function dragTouch(e) { if (isDragging) { e.preventDefault(); pickColorFromTouch(e); } }
function stopDrag() { isDragging = false; }

function pickColorFromEvent(e) {
    const rect = colorPalette.getBoundingClientRect();
    if (rect.width === 0) return;
    
    let xCss = e.clientX - rect.left;
    let yCss = e.clientY - rect.top;
    
    xCss = clamp(xCss, 0, rect.width);
    yCss = clamp(yCss, 0, rect.height);
    
    const saturation = (xCss / rect.width) * 100;
    const lightness = 100 - (yCss / rect.height) * 100;
    
    currentSat = saturation;
    currentLight = lightness;
    
    updateColorFromHSL(currentHue, currentSat, currentLight);
    updateIndicatorPosition(xCss, yCss);
    saveData({});
}

function pickColorFromTouch(e) {
    const rect = colorPalette.getBoundingClientRect();
    if (rect.width === 0) return;
    
    const touch = e.touches[0];
    if (!touch) return;
    
    let xCss = touch.clientX - rect.left;
    let yCss = touch.clientY - rect.top;
    
    xCss = clamp(xCss, 0, rect.width);
    yCss = clamp(yCss, 0, rect.height);
    
    const saturation = (xCss / rect.width) * 100;
    const lightness = 100 - (yCss / rect.height) * 100;
    
    currentSat = saturation;
    currentLight = lightness;
    
    updateColorFromHSL(currentHue, currentSat, currentLight);
    updateIndicatorPosition(xCss, yCss);
    saveData({});
}

function pickColor(e) { pickColorFromEvent(e); }

function updateIndicatorPosition(xCss, yCss) {
    if (!paletteIndicator) return;
    
    const wrap = colorPalette.parentElement;
    const wrapRect = wrap.getBoundingClientRect();
    const paletteRect = colorPalette.getBoundingClientRect();
    
    const left = (paletteRect.left - wrapRect.left) + xCss;
    const top = (paletteRect.top - wrapRect.top) + yCss;
    
    paletteIndicator.style.display = 'block';
    paletteIndicator.style.left = left + 'px';
    paletteIndicator.style.top = top + 'px';
}

function updateColorFromHSL(h, s, l) {
    const rgb = hslToRgb(h / 360, s / 100, l / 100);
    currentRGB = rgb;
    updateColorFromRGB(rgb.r, rgb.g, rgb.b);
}

function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function updateColorFromRGB(r, g, b) {
    const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    
    if (colorPreview) colorPreview.style.backgroundColor = hex;
    
    scrollingText.style.color = hex;
    currentColor = hex;
    
    scrollingText.querySelectorAll('mjx-container').forEach(el => {
        el.style.color = hex;
    });
    
    const oldStyle = document.getElementById('mathColorStyle');
    if (oldStyle) oldStyle.remove();
    const style = document.createElement('style');
    style.id = 'mathColorStyle';
    style.textContent = `#scrollingText, #scrollingText mjx-container { color: ${hex} !important; }`;
    document.head.appendChild(style);
    
    updateActiveShade(hex);
    
    saveData({});
}

function createShadesGrid() {
    if (!shadesScroll) return;
    shadesScroll.innerHTML = '';
    defaultColors.forEach(color => {
        color.shades.forEach(shade => {
            const shadeBtn = document.createElement('button');
            shadeBtn.className = 'shade-btn';
            shadeBtn.style.backgroundColor = shade;
            shadeBtn.setAttribute('data-color', shade);
            shadeBtn.addEventListener('click', function() { updateColorFromHex(shade); saveData({}); });
            shadesScroll.appendChild(shadeBtn);
        });
    });
}

function updateColorFromHex(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const rgb = { r, g, b };
    const hsl = rgbToHsl(r, g, b);
    
    currentHue = hsl.h * 360;
    currentSat = hsl.s * 100;
    currentLight = hsl.l * 100;
    
    hueSlider.value = currentHue;
    drawColorPalette(currentHue);
    
    const x = (currentSat / 100) * displayW;
    const y = (1 - currentLight / 100) * displayH;
    updateIndicatorPosition(x, y);
    updateColorFromRGB(r, g, b);
}

function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h, s, l };
}

function updateActiveShade(hex) {
    const shadeBtns = document.querySelectorAll('.shade-btn');
    shadeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.style.backgroundColor === hex) btn.classList.add('active');
    });
}

console.log('✅ LED BANNER - FINAL WITH FIXED COLOR PICKER');
