// ============================================
// LED BANNER - МНОГОСТРОЧНАЯ ВЕРСИЯ
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
const hiddenTextarea = document.getElementById('hiddenTextarea');
const visualLayer = document.getElementById('visualLayer');
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const colorButtons = document.querySelectorAll('.color-btn');

// ============================================
// MATHQUILL ДЛЯ ВИЗУАЛЬНОГО СЛОЯ
// ============================================
let mathField = null;
let MQ = null;

function initVisualLayer() {
    if (!visualLayer) return;
    
    try {
        MQ = MathQuill.getInterface(2);
        
        mathField = MQ.MathField(visualLayer, {
            spaceBehavesLikeTab: false,
            handlers: {
                edit: function() {
                    // Не делаем ничего, это только отображение
                }
            }
        });
        
        // Делаем поле только для чтения
        visualLayer.style.pointerEvents = 'none';
        
        console.log('Visual layer ready');
    } catch (e) {
        console.error('MathQuill error:', e);
    }
}

// ============================================
// МНОГОСТРОЧНЫЙ ПАРСЕР
// ============================================
function parseMultilineToLaTeX(text) {
    if (!text) return '';
    
    let result = text;
    
    // 1. Дроби: (числитель)/(знаменатель) -> \frac{числитель}{знаменатель}
    result = result.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, (match, num, den) => {
        return `\\frac{${parseMultilineToLaTeX(num)}}{${parseMultilineToLaTeX(den)}}`;
    });
    
    // 2. Простые дроби (число/число)
    result = result.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
    
    // 3. Корни: √[выражение] -> \sqrt{выражение}
    result = result.replace(/√\[([^\]]+)\]/g, (match, expr) => {
        return `\\sqrt{${parseMultilineToLaTeX(expr)}}`;
    });
    
    // 4. Корни с индексом: √[n]{выражение} -> \sqrt[n]{выражение}
    result = result.replace(/√\[([^\]]+)\]\{([^}]+)\}/g, (match, n, expr) => {
        return `\\sqrt[${n}]{${parseMultilineToLaTeX(expr)}}`;
    });
    
    // 5. Векторы: {выражение} -> \vec{выражение}
    result = result.replace(/\{([^}]+)\}/g, (match, expr) => {
        return `\\vec{${parseMultilineToLaTeX(expr)}}`;
    });
    
    // 6. Степени
    result = result.replace(/([a-zA-Z0-9α-ω])\^\(([^)]+)\)/g, (match, base, exp) => {
        return `${base}^{${parseMultilineToLaTeX(exp)}}`;
    });
    
    result = result.replace(/([a-zA-Z0-9α-ω])\^([a-zA-Z0-9α-ω])/g, '$1^{$2}');
    
    // 7. Индексы
    result = result.replace(/([a-zA-Z0-9α-ω])_\(([^)]+)\)/g, (match, base, idx) => {
        return `${base}_{${parseMultilineToLaTeX(idx)}}`;
    });
    
    result = result.replace(/([a-zA-Z0-9α-ω])_([a-zA-Z0-9α-ω])/g, '$1_{$2}');
    
    return result;
}

// ============================================
// ОБНОВЛЕНИЕ ВИЗУАЛЬНОГО СЛОЯ
// ============================================
function updateVisualLayer() {
    if (!mathField) return;
    
    const text = hiddenTextarea.value;
    const latex = parseMultilineToLaTeX(text);
    
    try {
        mathField.latex(latex);
        
        scrollingText.innerHTML = '\\(' + latex + '\\)';
        if (window.MathJax) {
            MathJax.typesetPromise([scrollingText]).then(applyColorToMath);
        }
        
        // Автоматически регулируем высоту textarea
        hiddenTextarea.style.height = 'auto';
        hiddenTextarea.style.height = hiddenTextarea.scrollHeight + 'px';
        
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
            hiddenTextarea.value = data.text;
            updateVisualLayer();
        }
    } catch (e) {}
}

function saveData() {
    const data = {
        text: hiddenTextarea.value,
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
        document.querySelector('.multiline-editor-container').style.display = 'block';
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
        
        document.querySelector('.multiline-editor-container').style.display = 'none';
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
        document.querySelector('.multiline-editor-container').style.display = 'block';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        mathBtn.style.display = 'block';
        isRunning = false;
    } else {
        hiddenTextarea.value = 'LED';
        updateVisualLayer();
        
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
    const start = hiddenTextarea.selectionStart;
    const end = hiddenTextarea.selectionEnd;
    const text = hiddenTextarea.value;
    
    let insertText = symbol;
    
    // Специальные символы
    if (symbol === '√[]') insertText = '√[]';
    else if (symbol === '{}') insertText = '{}';
    else if (symbol === '(a)/(b)') insertText = '(a)/(b)';
    
    const newText = text.substring(0, start) + insertText + text.substring(end);
    hiddenTextarea.value = newText;
    
    const newPos = start + insertText.length;
    hiddenTextarea.setSelectionRange(newPos, newPos);
    hiddenTextarea.focus();
    
    updateVisualLayer();
    saveData();
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

window.addEventListener('load', () => {
    initVisualLayer();
    loadSettings();
    updateVisualLayer();
    setTimeout(applyColorToMath, 500);
});

hiddenTextarea.addEventListener('input', () => {
    updateVisualLayer();
    saveData();
});

hiddenTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        // Можно добавить специальную обработку Enter
    }
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
        document.querySelector('.multiline-editor-container').style.display = 'block';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        mathBtn.style.display = 'block';
        isRunning = false;
    } else {
        tg.close();
    }
});
tg.BackButton.show();

console.log('✅ МНОГОСТРОЧНАЯ ВЕРСИЯ ГОТОВА!');
