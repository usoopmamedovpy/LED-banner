// ============================================
// LED BANNER - ФИНАЛЬНАЯ ВЕРСИЯ 4.0
// ============================================

// Telegram
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
tg.setHeaderColor('#000000');
tg.setBackgroundColor('#000000');

// Черный фон
document.documentElement.style.backgroundColor = '#000000';
document.body.style.backgroundColor = '#000000';
document.body.style.color = '#ffffff';

// ============================================
// ПОЛУЧАЕМ ЭЛЕМЕНТЫ
// ============================================
const scrollingText = document.getElementById('scrollingText');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const inputArea = document.getElementById('inputArea');
const mathBtn = document.getElementById('mathBtn');
const mathKeyboard = document.getElementById('mathKeyboard');
const mathKeys = document.querySelectorAll('.math-key');
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const colorButtons = document.querySelectorAll('.color-btn');

// Вкладки
const tabFunctions = document.getElementById('tabFunctions');
const tabGreek = document.getElementById('tabGreek');
const tabSymbols = document.getElementById('tabSymbols');
const functionsTab = document.getElementById('functionsTab');
const greekTab = document.getElementById('greekTab');
const symbolsTab = document.getElementById('symbolsTab');

// ============================================
// ПЕРЕМЕННЫЕ
// ============================================
let currentSpeed = 15;
let currentColor = 'white';
let currentSize = 15;
let isRunning = false;
let keyboardVisible = false;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Карта цветов
const colorMap = {
    'white': '#ffffff',
    'red': '#ff3b30',
    'blue': '#007aff',
    'green': '#34c759',
    'yellow': '#ffcc00'
};

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
window.addEventListener('load', function() {
    console.log('LED Banner загружен');
    
    createUnifiedInterface();
    loadSavedData();
    
    setTimeout(applyColorToMath, 500);
    scrollingText.style.textShadow = 'none';
});

// ============================================
// ЕДИНЫЙ ИНТЕРФЕЙС
// ============================================
function createUnifiedInterface() {
    const mathFieldElement = document.getElementById('mathField');
    if (!mathFieldElement) return;
    
    inputArea.innerHTML = '';
    inputArea.style.display = 'flex';
    inputArea.style.justifyContent = 'flex-end';
    inputArea.style.alignItems = 'center';
    inputArea.style.padding = '16px';
    inputArea.style.gap = '10px';
    inputArea.style.position = 'absolute';
    inputArea.style.bottom = '0';
    inputArea.style.left = '0';
    inputArea.style.right = '0';
    inputArea.style.backgroundColor = '#000000';
    inputArea.style.borderTop = '2px solid rgba(255, 255, 255, 0.2)';
    
    const mathButton = document.createElement('button');
    mathButton.className = 'math-btn';
    mathButton.id = 'mainMathBtn';
    mathButton.textContent = 'MATH';
    mathButton.style.width = '70px';
    mathButton.style.height = '60px';
    mathButton.style.background = '#000000';
    mathButton.style.border = '2px solid #ffffff';
    mathButton.style.borderRadius = '30px';
    mathButton.style.color = '#ffffff';
    mathButton.style.fontWeight = 'bold';
    mathButton.style.fontSize = '18px';
    mathButton.style.cursor = 'pointer';
    mathButton.style.flexShrink = '0';
    
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'mainInput';
    textInput.className = 'text-input';
    textInput.placeholder = '√[x+1] или (a)/(b) или {вектор}';
    textInput.value = 'LED бегущая строка';
    textInput.style.flex = '1';
    textInput.style.maxWidth = 'calc(100% - 160px)';
    textInput.style.background = '#111111';
    textInput.style.border = '2px solid #ffffff';
    textInput.style.borderRadius = '30px';
    textInput.style.padding = '14px 18px';
    textInput.style.fontSize = '16px';
    textInput.style.color = '#ffffff';
    textInput.style.outline = 'none';
    
    const runButton = document.createElement('button');
    runButton.className = 'run-btn';
    runButton.id = 'mainRunBtn';
    runButton.textContent = 'RUN';
    runButton.style.width = '70px';
    runButton.style.height = '60px';
    runButton.style.background = 'transparent';
    runButton.style.border = '2px solid #ffffff';
    runButton.style.borderRadius = '30px';
    runButton.style.color = '#ffffff';
    runButton.style.fontWeight = 'bold';
    runButton.style.fontSize = '18px';
    runButton.style.cursor = 'pointer';
    runButton.style.flexShrink = '0';
    
    inputArea.appendChild(mathButton);
    inputArea.appendChild(textInput);
    inputArea.appendChild(runButton);
    
    mathButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleKeyboard();
    });
    
    runButton.addEventListener('click', toggleRun);
    
    textInput.addEventListener('input', function(e) {
        const text = e.target.value;
        const latex = parseToLaTeX(text);
        scrollingText.innerHTML = '\\(' + latex + '\\)';
        if (window.MathJax) {
            MathJax.typesetPromise([scrollingText]).then(() => {
                applyColorToMath();
            }).catch(() => {});
        }
        saveData({ latex: latex, raw: text });
    });
    
    textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            toggleRun();
        }
    });
    
    document.addEventListener('click', function(e) {
        if (keyboardVisible && 
            !mathKeyboard.contains(e.target) && 
            !mathButton.contains(e.target)) {
            closeKeyboard();
        }
    });
}

// ============================================
// ПРИМЕНЕНИЕ ЦВЕТА
// ============================================
function applyColorToMath() {
    console.log('Применяем цвет к математике:', currentColor);
    
    const color = colorMap[currentColor];
    scrollingText.style.color = color;
    
    const mathElements = scrollingText.querySelectorAll('mjx-container, mjx-math, mjx-mi, mjx-mo, mjx-mn, mjx-msup, mjx-mfrac, mjx-sqrt');
    mathElements.forEach(el => {
        el.style.color = color;
    });
    
    const style = document.createElement('style');
    style.textContent = `
        #scrollingText, 
        #scrollingText mjx-container,
        #scrollingText mjx-math,
        #scrollingText mjx-mi,
        #scrollingText mjx-mo,
        #scrollingText mjx-mn,
        #scrollingText mjx-msup,
        #scrollingText mjx-mfrac,
        #scrollingText mjx-sqrt {
            color: ${color} !important;
        }
    `;
    
    const oldStyle = document.getElementById('mathColorStyle');
    if (oldStyle) oldStyle.remove();
    
    style.id = 'mathColorStyle';
    document.head.appendChild(style);
    
    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(currentColor)) {
            btn.classList.add('active');
        }
    });
}

// ============================================
// УМНЫЙ ПАРСЕР
// ============================================
function parseToLaTeX(text) {
    if (!text) return '';
    
    let result = text;
    
    result = result.replace(/\{([^}]+)\}/g, '\\vec{$1}');
    result = result.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, '\\frac{$1}{$2}');
    result = result.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
    result = result.replace(/√\[([^\]]+)\]/g, '\\sqrt{$1}');
    result = result.replace(/√\[([^\]]+)\]\{([^}]+)\}/g, '\\sqrt[$1]{$2}');
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
        'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega'
    };
    
    for (let [char, latex] of Object.entries(greekMap)) {
        result = result.replace(new RegExp(char, 'g'), latex);
    }
    
    const funcs = ['sin', 'cos', 'tan', 'cot', 'log', 'ln', 'exp', 'lim'];
    funcs.forEach(func => {
        result = result.replace(new RegExp(func + '\\s*\\(', 'g'), func + '(');
    });
    
    return result;
}

// ============================================
// СОХРАНЕНИЕ
// ============================================
function loadSavedData() {
    try {
        const saved = localStorage.getItem('ledBannerData');
        if (saved) {
            const data = JSON.parse(saved);
            
            if (data.color) {
                currentColor = data.color;
                setTimeout(() => applyColorToMath(), 100);
            }
            
            if (data.speed) {
                currentSpeed = data.speed;
                speedSlider.value = currentSpeed;
                speedValue.textContent = currentSpeed + ' сек';
            }
            
            if (data.size) {
                currentSize = data.size;
                sizeSlider.value = currentSize;
                sizeValue.textContent = currentSize + 'vw';
                scrollingText.style.fontSize = currentSize + 'vw';
            }
            
            if (data.raw) {
                const input = document.getElementById('mainInput');
                if (input) input.value = data.raw;
                
                if (data.latex) {
                    scrollingText.innerHTML = '\\(' + data.latex + '\\)';
                    if (window.MathJax) {
                        MathJax.typesetPromise([scrollingText]).then(() => {
                            applyColorToMath();
                        }).catch(() => {});
                    }
                }
            }
        }
    } catch (e) {}
}

function saveData(data) {
    const fullData = {
        ...data,
        color: currentColor,
        speed: currentSpeed,
        size: currentSize
    };
    localStorage.setItem('ledBannerData', JSON.stringify(fullData));
    
    if (tg) {
        try {
            tg.sendData(JSON.stringify({
                action: 'save',
                data: fullData
            }));
        } catch (e) {}
    }
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
    
    if (keyboardVisible) {
        mathKeyboard.classList.add('show');
        mathBtn.classList.add('active');
        document.getElementById('mainMathBtn')?.classList.add('active');
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else {
        mathKeyboard.classList.remove('show');
        mathBtn.classList.remove('active');
        document.getElementById('mainMathBtn')?.classList.remove('active');
    }
}

function closeKeyboard() {
    keyboardVisible = false;
    mathKeyboard.classList.remove('show');
    mathBtn.classList.remove('active');
    document.getElementById('mainMathBtn')?.classList.remove('active');
}

function toggleRun() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    } else {
        scrollingText.style.fontSize = currentSize + 'vw';
        sizeValue.textContent = currentSize + 'vw';
        speedValue.textContent = currentSpeed + ' сек';
        restartAnimation();
        applyColorToMath();
        
        inputArea.style.display = 'none';
        settingsBtn.style.display = 'none';
        isRunning = true;
        closeKeyboard();
        saveData({});
    }
}

// ============================================
// НОВАЯ ЛОГИКА ДЛЯ КРЕСТИКА
// ============================================
function handleReset() {
    if (isRunning) {
        // Если RUN активен - только показываем кнопки, текст НЕ трогаем
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    } else {
        // Если RUN не активен - полный сброс
        const input = document.getElementById('mainInput');
        if (input) input.value = 'LED бегущая строка';
        
        scrollingText.innerHTML = '\\(LED\\ бегущая\\ строка\\)';
        if (window.MathJax) {
            MathJax.typesetPromise([scrollingText]).then(() => {
                applyColorToMath();
            }).catch(() => {});
        }
        
        currentColor = 'white';
        currentSpeed = 15;
        currentSize = 15;
        
        sizeSlider.value = 15;
        speedSlider.value = 15;
        sizeValue.textContent = '15vw';
        speedValue.textContent = '15 сек';
        
        scrollingText.style.fontSize = '15vw';
        applyColorToMath();
        restartAnimation();
    }
    
    // В любом случае закрываем клавиатуры и настройки
    closeKeyboard();
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
    
    saveData({ latex: 'LED\\ бегущая\\ строка', raw: 'LED бегущая строка' });
}

// ============================================
// ВСТАВКА СИМВОЛОВ
// ============================================
function insertMathSymbol(symbol) {
    const input = document.getElementById('mainInput');
    if (!input) return;
    
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    
    let insertText = symbol;
    
    if (symbol === '√') insertText = '√[]';
    else if (symbol === '∛') insertText = '∛[]';
    else if (symbol === '∜') insertText = '∜[]';
    else if (symbol === '→' || symbol === '\\vec' || symbol === '⃗') insertText = '{}';
    else if (symbol === 'a/b' || symbol === 'frac') insertText = '(a)/(b)';
    
    const newText = text.substring(0, start) + insertText + text.substring(end);
    input.value = newText;
    
    let newPos = start + insertText.length;
    if (insertText.includes('[]')) newPos = start + insertText.length - 1;
    else if (insertText === '{}') newPos = start + 1;
    else if (insertText === '(a)/(b)') newPos = start + 2;
    
    input.setSelectionRange(newPos, newPos);
    input.focus();
    
    const latex = parseToLaTeX(newText);
    scrollingText.innerHTML = '\\(' + latex + '\\)';
    if (window.MathJax) {
        MathJax.typesetPromise([scrollingText]).then(() => {
            applyColorToMath();
        }).catch(() => {});
    }
    
    saveData({ latex: latex, raw: newText });
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

if (mathBtn) mathBtn.style.display = 'none';

tabFunctions.addEventListener('click', function() {
    tabFunctions.classList.add('active');
    tabGreek.classList.remove('active');
    tabSymbols.classList.remove('active');
    functionsTab.classList.add('active');
    greekTab.classList.remove('active');
    symbolsTab.classList.remove('active');
});

tabGreek.addEventListener('click', function() {
    tabGreek.classList.add('active');
    tabFunctions.classList.remove('active');
    tabSymbols.classList.remove('active');
    greekTab.classList.add('active');
    functionsTab.classList.remove('active');
    symbolsTab.classList.remove('active');
});

tabSymbols.addEventListener('click', function() {
    tabSymbols.classList.add('active');
    tabFunctions.classList.remove('active');
    tabGreek.classList.remove('active');
    symbolsTab.classList.add('active');
    functionsTab.classList.remove('active');
    greekTab.classList.remove('active');
});

mathKeys.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const cmd = this.textContent;
        const dataCmd = this.dataset.cmd;
        
        if (dataCmd === 'frac' || cmd === 'a/b') insertMathSymbol('frac');
        else if (dataCmd === '\\vec' || cmd === '⃗' || cmd === '→') insertMathSymbol('→');
        else insertMathSymbol(cmd);
        
        return false;
    });
});

colorButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        let color = 'white';
        if (this.classList.contains('red')) color = 'red';
        else if (this.classList.contains('blue')) color = 'blue';
        else if (this.classList.contains('green')) color = 'green';
        else if (this.classList.contains('yellow')) color = 'yellow';
        
        currentColor = color;
        applyColorToMath();
        saveData({});
    });
});

sizeSlider.addEventListener('input', function() {
    currentSize = parseInt(this.value);
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveData({});
});

speedSlider.addEventListener('input', function() {
    currentSpeed = parseInt(this.value);
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    saveData({});
});

// НОВЫЙ ОБРАБОТЧИК ДЛЯ КРЕСТИКА
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
    }
});

settingsPanel.addEventListener('click', function(e) {
    if (e.target === settingsPanel) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    }
});

// ============================================
// TELEGRAM BACK BUTTON
// ============================================
tg.BackButton.onClick(function() {
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else if (keyboardVisible) {
        closeKeyboard();
    } else if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    } else {
        tg.close();
    }
});
tg.BackButton.show();

console.log('✅ ФИНАЛЬНАЯ ВЕРСИЯ: умный крестик готов!');
