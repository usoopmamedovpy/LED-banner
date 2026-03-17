// ============================================
// LED BANNER - ИДЕАЛЬНОЕ НАЛОЖЕНИЕ
// ============================================

// Telegram
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

if (tg.isVersionAtLeast && tg.isVersionAtLeast('8.0')) {
    try { tg.requestFullscreen(); } catch (e) {}
}

tg.setHeaderColor('#000000');
tg.setBackgroundColor('#000000');

document.documentElement.style.backgroundColor = '#000000';
document.body.style.backgroundColor = '#000000';
document.body.style.color = '#ffffff';

// ============================================
// ЭЛЕМЕНТЫ
// ============================================
const scrollingText = document.getElementById('scrollingText');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const settingsBtn = document.getElementById('settingsBtn');
const donateBtn = document.getElementById('donateBtn');
const settingsPanel = document.getElementById('settingsPanel');
const mathKeyboard = document.getElementById('mathKeyboard');
const mathKeys = document.querySelectorAll('.math-key');
const inputField = document.getElementById('inputField');
const renderLayer = document.getElementById('renderLayer');
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const colorButtons = document.querySelectorAll('.color-btn');

// ============================================
// MATHQUILL ДЛЯ РЕНДЕРА
// ============================================
let mathField = null;
let MQ = null;

function initRenderer() {
    if (!renderLayer) return;
    
    try {
        MQ = MathQuill.getInterface(2);
        
        mathField = MQ.MathField(renderLayer, {
            spaceBehavesLikeTab: false,
            handlers: { edit: function() {} }
        });
        
        renderLayer.style.pointerEvents = 'none';
        console.log('Renderer ready');
    } catch (e) {
        console.error('Renderer error:', e);
    }
}

// ============================================
// ПАРСЕР
// ============================================
function parseToLaTeX(text) {
    if (!text) return '';
    
    let result = text;
    
    // Корни: √[выражение] -> \sqrt{выражение}
    result = result.replace(/√\[([^\]]+)\]/g, '\\sqrt{$1}');
    
    // Дроби: (числитель)/(знаменатель) -> \frac{числитель}{знаменатель}
    result = result.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, '\\frac{$1}{$2}');
    result = result.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
    
    // Векторы: {выражение} -> \vec{выражение}
    result = result.replace(/\{([^}]+)\}/g, '\\vec{$1}');
    
    // Степени
    result = result.replace(/(\w)\^\(([^)]+)\)/g, '$1^{$2}');
    result = result.replace(/(\w)\^(\w)/g, '$1^{$2}');
    
    // Индексы
    result = result.replace(/(\w)_\(([^)]+)\)/g, '$1_{$2}');
    result = result.replace(/(\w)_(\w)/g, '$1_{$2}');
    
    return result;
}

// ============================================
// ОБНОВЛЕНИЕ РЕНДЕРА
// ============================================
function updateRenderer() {
    if (!mathField) return;
    
    const text = inputField.value;
    const latex = parseToLaTeX(text);
    
    try {
        mathField.latex(latex);
        
        scrollingText.innerHTML = '\\(' + latex + '\\)';
        if (window.MathJax) {
            MathJax.typesetPromise([scrollingText]).then(applyColor);
        }
        
        saveData();
    } catch (e) {
        console.error('Update error:', e);
    }
}

// ============================================
// ПЕРЕМЕННЫЕ
// ============================================
let currentSpeed = 15;
let currentColor = 'white';
let currentSize = 15;
let isRunning = false;
let keyboardVisible = false;

const colorMap = {
    'white': '#ffffff', 'red': '#ff3b30', 'blue': '#007aff',
    'green': '#34c759', 'yellow': '#ffcc00'
};

// ============================================
// НАСТРОЙКИ
// ============================================
function loadSettings() {
    try {
        const saved = localStorage.getItem('ledData');
        if (!saved) return;
        
        const data = JSON.parse(saved);
        
        if (data.color) {
            currentColor = data.color;
            applyColor();
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
        
        if (data.text) {
            inputField.value = data.text;
            updateRenderer();
        }
    } catch (e) {}
}

function saveData() {
    const data = {
        text: inputField.value,
        color: currentColor,
        speed: currentSpeed,
        size: currentSize
    };
    localStorage.setItem('ledData', JSON.stringify(data));
    
    if (tg) {
        tg.sendData(JSON.stringify({ action: 'save', data: data }));
    }
}

// ============================================
// ЦВЕТА
// ============================================
function applyColor() {
    const color = colorMap[currentColor];
    scrollingText.style.color = color;
    
    scrollingText.querySelectorAll('mjx-container').forEach(el => {
        el.style.color = color;
    });
    
    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(currentColor)) {
            btn.classList.add('active');
        }
    });
}

// ============================================
// АНИМАЦИЯ
// ============================================
function restartAnimation() {
    scrollingText.style.animation = 'none';
    void scrollingText.offsetWidth;
    scrollingText.style.animation = `scrollText ${currentSpeed}s linear infinite`;
}

// ============================================
// УПРАВЛЕНИЕ
// ============================================
function toggleKeyboard() {
    if (isRunning) return;
    keyboardVisible = !keyboardVisible;
    mathKeyboard.classList.toggle('show', keyboardVisible);
}

function closeKeyboard() {
    keyboardVisible = false;
    mathKeyboard.classList.remove('show');
}

function toggleRun() {
    if (isRunning) {
        document.querySelector('.overlay-container').style.display = 'flex';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        isRunning = false;
    } else {
        scrollingText.style.fontSize = currentSize + 'vw';
        sizeValue.textContent = currentSize + 'vw';
        speedValue.textContent = currentSpeed + ' sec';
        restartAnimation();
        applyColor();
        
        document.querySelector('.overlay-container').style.display = 'none';
        settingsBtn.style.display = 'none';
        donateBtn.style.display = 'none';
        isRunning = true;
        closeKeyboard();
        saveData();
    }
}

function handleReset() {
    if (isRunning) {
        document.querySelector('.overlay-container').style.display = 'flex';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        isRunning = false;
    } else {
        inputField.value = 'LED';
        updateRenderer();
        
        currentColor = 'white';
        currentSpeed = 15;
        currentSize = 15;
        
        sizeSlider.value = 15;
        speedSlider.value = 15;
        sizeValue.textContent = '15vw';
        speedValue.textContent = '15 sec';
        
        scrollingText.style.fontSize = '15vw';
        applyColor();
        restartAnimation();
        saveData();
    }
    
    closeKeyboard();
    settingsPanel.classList.remove('show');
}

// ============================================
// ВСТАВКА СИМВОЛОВ
// ============================================
function insertSymbol(symbol) {
    const start = inputField.selectionStart;
    const end = inputField.selectionEnd;
    const text = inputField.value;
    
    const newText = text.substring(0, start) + symbol + text.substring(end);
    inputField.value = newText;
    
    const newPos = start + symbol.length;
    inputField.setSelectionRange(newPos, newPos);
    inputField.focus();
    
    updateRenderer();
    saveData();
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

window.addEventListener('load', () => {
    initRenderer();
    loadSettings();
    updateRenderer();
    setTimeout(applyColor, 500);
    inputField.focus();
});

inputField.addEventListener('input', updateRenderer);

mathKeys.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const symbol = btn.dataset.cmd;
        if (symbol) insertSymbol(symbol);
        return false;
    });
});

runBtn.addEventListener('click', toggleRun);
resetBtn.addEventListener('click', handleReset);

settingsBtn.addEventListener('click', () => {
    if (isRunning) return;
    settingsPanel.classList.toggle('show');
    closeKeyboard();
});

settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
        settingsPanel.classList.remove('show');
    }
});

colorButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        let color = 'white';
        if (btn.classList.contains('red')) color = 'red';
        else if (btn.classList.contains('blue')) color = 'blue';
        else if (btn.classList.contains('green')) color = 'green';
        else if (btn.classList.contains('yellow')) color = 'yellow';
        
        currentColor = color;
        applyColor();
        saveData();
    });
});

sizeSlider.addEventListener('input', () => {
    currentSize = parseInt(sizeSlider.value);
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveData();
});

speedSlider.addEventListener('input', () => {
    currentSpeed = parseInt(speedSlider.value);
    speedValue.textContent = currentSpeed + ' sec';
    restartAnimation();
    saveData();
});

document.addEventListener('click', (e) => {
    if (keyboardVisible && !mathKeyboard.contains(e.target)) {
        closeKeyboard();
    }
});

tg.BackButton.onClick(() => {
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
    } else if (keyboardVisible) {
        closeKeyboard();
    } else if (isRunning) {
        document.querySelector('.overlay-container').style.display = 'flex';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        isRunning = false;
    } else {
        tg.close();
    }
});
tg.BackButton.show();

console.log('✅ ИДЕАЛЬНОЕ НАЛОЖЕНИЕ ГОТОВО!');
