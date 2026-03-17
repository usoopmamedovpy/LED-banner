// ============================================
// LED BANNER - ГИБРИДНАЯ ВЕРСИЯ
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
const mathBtn = document.getElementById('mathBtn');
const mathKeyboard = document.getElementById('mathKeyboard');
const mathKeys = document.querySelectorAll('.math-key');
const textInput = document.getElementById('textInput');
const mathDisplay = document.getElementById('mathDisplay');
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const colorButtons = document.querySelectorAll('.color-btn');

// ============================================
// MATHQUILL ДЛЯ ОТОБРАЖЕНИЯ
// ============================================
let mathField = null;
let MQ = null;

function initMathDisplay() {
    if (!mathDisplay) return;
    
    try {
        MQ = MathQuill.getInterface(2);
        
        mathField = MQ.MathField(mathDisplay, {
            spaceBehavesLikeTab: false,
            handlers: {
                edit: function() {
                    // Не делаем ничего, это только отображение
                }
            }
        });
        
        // Делаем поле только для чтения
        mathDisplay.style.pointerEvents = 'none';
        
        console.log('MathQuill display ready');
    } catch (e) {
        console.error('MathQuill error:', e);
    }
}

// ============================================
// ПАРСЕР (старый, но надёжный)
// ============================================
function parseToLaTeX(text) {
    if (!text) return '';
    
    let result = text;
    
    // Сохраняем пробелы
    result = result.replace(/ /g, '\\ ');
    
    // Векторы
    result = result.replace(/\{([^}]+)\}/g, '\\vec{$1}');
    
    // Дроби
    result = result.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, '\\frac{$1}{$2}');
    result = result.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
    
    // Корни
    result = result.replace(/√\[([^\]]+)\]/g, '\\sqrt{$1}');
    
    // Степени и индексы
    result = result.replace(/([a-zA-Z0-9])\^\(([^)]+)\)/g, '$1^{$2}');
    result = result.replace(/([a-zA-Z0-9])\^([a-zA-Z0-9])/g, '$1^{$2}');
    result = result.replace(/([a-zA-Z0-9])_\(([^)]+)\)/g, '$1_{$2}');
    result = result.replace(/([a-zA-Z0-9])_([a-zA-Z0-9])/g, '$1_{$2}');
    
    return result;
}

// ============================================
// ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ
// ============================================
function updateDisplay() {
    if (!mathField) return;
    
    const text = textInput.value;
    const latex = parseToLaTeX(text);
    
    try {
        mathField.latex(latex);
        
        scrollingText.innerHTML = '\\(' + latex + '\\)';
        if (window.MathJax) {
            MathJax.typesetPromise([scrollingText]).then(applyColorToMath);
        }
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
        const saved = localStorage.getItem('ledBannerData');
        if (!saved) return;
        
        const data = JSON.parse(saved);
        
        if (data.color) {
            currentColor = data.color;
            applyColorToMath();
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
            textInput.value = data.text;
            updateDisplay();
        }
    } catch (e) {}
}

function saveData() {
    const data = {
        text: textInput.value,
        color: currentColor,
        speed: currentSpeed,
        size: currentSize
    };
    localStorage.setItem('ledBannerData', JSON.stringify(data));
    
    if (tg) {
        tg.sendData(JSON.stringify({ action: 'save', data: data }));
    }
}

// ============================================
// ЦВЕТА
// ============================================
function applyColorToMath() {
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
    mathBtn.classList.toggle('active', keyboardVisible);
}

function closeKeyboard() {
    keyboardVisible = false;
    mathKeyboard.classList.remove('show');
    mathBtn.classList.remove('active');
}

function toggleRun() {
    if (isRunning) {
        document.querySelector('.hybrid-editor-container').style.display = 'block';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        mathBtn.style.display = 'block';
        isRunning = false;
    } else {
        scrollingText.style.fontSize = currentSize + 'vw';
        sizeValue.textContent = currentSize + 'vw';
        speedValue.textContent = currentSpeed + ' sec';
        restartAnimation();
        applyColorToMath();
        
        document.querySelector('.hybrid-editor-container').style.display = 'none';
        settingsBtn.style.display = 'none';
        donateBtn.style.display = 'none';
        mathBtn.style.display = 'none';
        isRunning = true;
        closeKeyboard();
        saveData();
    }
}

function handleReset() {
    if (isRunning) {
        document.querySelector('.hybrid-editor-container').style.display = 'block';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        mathBtn.style.display = 'block';
        isRunning = false;
    } else {
        textInput.value = 'LED';
        updateDisplay();
        
        currentColor = 'white';
        currentSpeed = 15;
        currentSize = 15;
        
        sizeSlider.value = 15;
        speedSlider.value = 15;
        sizeValue.textContent = '15vw';
        speedValue.textContent = '15 sec';
        
        scrollingText.style.fontSize = '15vw';
        applyColorToMath();
        restartAnimation();
        saveData();
    }
    
    closeKeyboard();
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
}

// ============================================
// ВСТАВКА СИМВОЛОВ
// ============================================
function insertSymbol(symbol) {
    const start = textInput.selectionStart;
    const end = textInput.selectionEnd;
    const text = textInput.value;
    
    const newText = text.substring(0, start) + symbol + text.substring(end);
    textInput.value = newText;
    
    const newPos = start + symbol.length;
    textInput.setSelectionRange(newPos, newPos);
    textInput.focus();
    
    updateDisplay();
    saveData();
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

window.addEventListener('load', () => {
    initMathDisplay();
    loadSettings();
    updateDisplay();
    setTimeout(applyColorToMath, 500);
});

textInput.addEventListener('input', () => {
    updateDisplay();
    saveData();
});

mathBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleKeyboard();
});

mathKeys.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const symbol = btn.dataset.symbol;
        if (symbol) insertSymbol(symbol);
        return false;
    });
});

runBtn.addEventListener('click', toggleRun);
resetBtn.addEventListener('click', handleReset);

settingsBtn.addEventListener('click', () => {
    if (isRunning) return;
    settingsPanel.classList.toggle('show');
    settingsBtn.classList.toggle('active');
    closeKeyboard();
});

settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
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
        applyColorToMath();
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
    if (keyboardVisible && 
        !mathKeyboard.contains(e.target) && 
        !mathBtn.contains(e.target)) {
        closeKeyboard();
    }
});

tg.BackButton.onClick(() => {
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else if (keyboardVisible) {
        closeKeyboard();
    } else if (isRunning) {
        document.querySelector('.hybrid-editor-container').style.display = 'block';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        mathBtn.style.display = 'block';
        isRunning = false;
    } else {
        tg.close();
    }
});
tg.BackButton.show();

console.log('✅ ГИБРИДНАЯ ВЕРСИЯ ГОТОВА!');
