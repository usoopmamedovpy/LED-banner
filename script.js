// ============================================
// LED BANNER - УМНЫЙ ПАРСЕР С КВАДРАТНЫМИ СКОБКАМИ
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

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
window.addEventListener('load', function() {
    console.log('LED Banner загружен');
    
    if (isMobile) {
        createMobileInterface();
    } else {
        createDesktopInterface();
    }
    
    loadSavedData();
    updateDisplay();
    scrollingText.style.textShadow = 'none';
});

// ============================================
// ДЕСКТОПНЫЙ ИНТЕРФЕЙС
// ============================================
function createDesktopInterface() {
    const mathFieldElement = document.getElementById('mathField');
    if (!mathFieldElement) return;
    
    // Создаем input для ввода
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'desktopInput';
    input.className = 'text-input';
    input.placeholder = '√[x+1] или (x^2+1)/(x-1)';
    input.value = 'LED бегущая строка';
    input.style.flex = '1';
    input.style.background = '#111111';
    input.style.border = '2px solid #ffffff';
    input.style.borderRadius = '30px';
    input.style.padding = '16px 20px';
    input.style.fontSize = '18px';
    input.style.color = '#ffffff';
    
    // Заменяем mathField на input
    mathFieldElement.parentNode.replaceChild(input, mathFieldElement);
    
    // Обработчик ввода
    input.addEventListener('input', function(e) {
        const text = e.target.value;
        const latex = parseToLaTeX(text);
        scrollingText.innerHTML = '\\(' + latex + '\\)';
        if (window.MathJax) {
            MathJax.typesetPromise([scrollingText]).catch(() => {});
        }
        saveData({ latex: latex, raw: text });
    });
    
    // Enter
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            toggleRun();
        }
    });
}

// ============================================
// МОБИЛЬНЫЙ ИНТЕРФЕЙС
// ============================================
function createMobileInterface() {
    inputArea.innerHTML = '';
    inputArea.style.display = 'flex';
    inputArea.style.flexDirection = 'column';
    inputArea.style.gap = '10px';
    
    // Верхняя строка - кнопка MATH и отображение
    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.gap = '10px';
    topRow.style.alignItems = 'center';
    
    const mathButton = document.createElement('button');
    mathButton.className = 'math-btn';
    mathButton.textContent = 'MATH';
    mathButton.style.width = '70px';
    mathButton.style.height = '60px';
    
    const previewSpan = document.createElement('span');
    previewSpan.id = 'previewSpan';
    previewSpan.style.flex = '1';
    previewSpan.style.minHeight = '60px';
    previewSpan.style.background = '#111111';
    previewSpan.style.border = '2px solid #ffffff';
    previewSpan.style.borderRadius = '30px';
    previewSpan.style.padding = '16px 20px';
    previewSpan.style.fontSize = '18px';
    previewSpan.style.color = '#ffffff';
    previewSpan.style.display = 'flex';
    previewSpan.style.alignItems = 'center';
    previewSpan.textContent = 'LED бегущая строка';
    
    topRow.appendChild(mathButton);
    topRow.appendChild(previewSpan);
    
    // Нижняя строка - ввод и RUN
    const bottomRow = document.createElement('div');
    bottomRow.style.display = 'flex';
    bottomRow.style.gap = '10px';
    bottomRow.style.alignItems = 'center';
    
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'mobileInput';
    textInput.placeholder = '√[x+1] или (x^2+1)/(x-1)';
    textInput.style.flex = '1';
    textInput.style.background = '#111111';
    textInput.style.border = '2px solid #ffffff';
    textInput.style.borderRadius = '30px';
    textInput.style.padding = '16px 20px';
    textInput.style.fontSize = '18px';
    textInput.style.color = '#ffffff';
    
    const runButton = document.createElement('button');
    runButton.className = 'run-btn';
    runButton.textContent = 'RUN';
    runButton.style.width = '70px';
    runButton.style.height = '60px';
    
    bottomRow.appendChild(textInput);
    bottomRow.appendChild(runButton);
    
    inputArea.appendChild(topRow);
    inputArea.appendChild(bottomRow);
    
    // Обработчики
    mathButton.addEventListener('click', toggleKeyboard);
    runButton.addEventListener('click', toggleRun);
    
    textInput.addEventListener('input', function(e) {
        const text = e.target.value;
        const latex = parseToLaTeX(text);
        previewSpan.innerHTML = '';
        previewSpan.appendChild(document.createTextNode(text));
        scrollingText.innerHTML = '\\(' + latex + '\\)';
        if (window.MathJax) {
            MathJax.typesetPromise([scrollingText]).catch(() => {});
        }
        saveData({ latex: latex, raw: text });
    });
    
    textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            toggleRun();
        }
    });
}

// ============================================
// УМНЫЙ ПАРСЕР МАТЕМАТИКИ
// ============================================
function parseToLaTeX(text) {
    if (!text) return '';
    
    let result = text;
    
    // 1. Дроби в формате (числитель)/(знаменатель)
    result = result.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, '\\frac{$1}{$2}');
    
    // 2. Простые дроби (число/число) - для обратной совместимости
    result = result.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
    
    // 3. Корни с квадратными скобками: √[выражение] → \sqrt{выражение}
    result = result.replace(/√\[([^\]]+)\]/g, '\\sqrt{$1}');
    
    // 4. Корни с индексом: √[n]{выражение} → \sqrt[n]{выражение}
    result = result.replace(/√\[([^\]]+)\]\{([^}]+)\}/g, '\\sqrt[$1]{$2}');
    
    // 5. Степени: x^y → x^{y}
    result = result.replace(/([a-zA-Z0-9α-ω])\^\(([^)]+)\)/g, '$1^{$2}');
    result = result.replace(/([a-zA-Z0-9α-ω])\^([a-zA-Z0-9α-ω])/g, '$1^{$2}');
    
    // 6. Индексы: x_y → x_{y}
    result = result.replace(/([a-zA-Z0-9α-ω])_\(([^)]+)\)/g, '$1_{$2}');
    result = result.replace(/([a-zA-Z0-9α-ω])_([a-zA-Z0-9α-ω])/g, '$1_{$2}');
    
    // 7. Греческие буквы
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
    
    for (let [char, latex] of Object.entries(greekMap)) {
        result = result.replace(new RegExp(char, 'g'), latex);
    }
    
    // 8. Функции
    const funcs = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 
                   'arcsin', 'arccos', 'arctan', 'arccot',
                   'log', 'ln', 'lg', 'exp', 'lim'];
    funcs.forEach(func => {
        const regex = new RegExp(func + '\\s*\\(', 'g');
        result = result.replace(regex, func + '(');
    });
    
    // 9. Специальные символы
    const specialMap = {
        '∞': '\\infty',
        '∫': '\\int',
        '∑': '\\sum',
        '∏': '\\prod',
        '±': '\\pm',
        '×': '\\times',
        '÷': '\\div',
        '≠': '\\neq',
        '≤': '\\leq',
        '≥': '\\geq',
        '≈': '\\approx',
        '→': '\\rightarrow',
        '←': '\\leftarrow',
        '⇒': '\\Rightarrow',
        '⇔': '\\Leftrightarrow',
        '∀': '\\forall',
        '∃': '\\exists',
        '∈': '\\in',
        '∉': '\\notin',
        '⊂': '\\subset',
        '⊃': '\\supset',
        '∪': '\\cup',
        '∩': '\\cap',
        '∇': '\\nabla',
        '∂': '\\partial',
        '∝': '\\propto'
    };
    
    for (let [char, latex] of Object.entries(specialMap)) {
        result = result.replace(new RegExp('\\' + char, 'g'), latex);
    }
    
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
                updateColor();
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
            }
            if (data.latex) {
                scrollingText.innerHTML = '\\(' + data.latex + '\\)';
                if (window.MathJax) {
                    MathJax.typesetPromise([scrollingText]).catch(() => {});
                }
            }
            if (data.raw) {
                const input = document.getElementById('mobileInput') || document.getElementById('desktopInput');
                if (input) input.value = data.raw;
                
                const previewSpan = document.getElementById('previewSpan');
                if (previewSpan) {
                    previewSpan.innerHTML = '';
                    previewSpan.appendChild(document.createTextNode(data.raw));
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
        size: currentSize,
        timestamp: Date.now()
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
// ОБНОВЛЕНИЕ
// ============================================
function updateDisplay() {
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    
    updateColor();
}

function updateColor() {
    if (currentColor === 'white') scrollingText.style.color = '#ffffff';
    else if (currentColor === 'red') scrollingText.style.color = '#ff3b30';
    else if (currentColor === 'blue') scrollingText.style.color = '#007aff';
    else if (currentColor === 'green') scrollingText.style.color = '#34c759';
    else if (currentColor === 'yellow') scrollingText.style.color = '#ffcc00';
    
    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(currentColor)) {
            btn.classList.add('active');
        }
    });
}

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
        if (isMobile) {
            document.querySelector('.math-btn')?.classList.add('active');
        }
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else {
        mathKeyboard.classList.remove('show');
        mathBtn.classList.remove('active');
        if (isMobile) {
            document.querySelector('.math-btn')?.classList.remove('active');
        }
    }
}

function closeKeyboard() {
    keyboardVisible = false;
    mathKeyboard.classList.remove('show');
    mathBtn.classList.remove('active');
    if (isMobile) {
        document.querySelector('.math-btn')?.classList.remove('active');
    }
}

function toggleRun() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    } else {
        updateDisplay();
        inputArea.style.display = 'none';
        settingsBtn.style.display = 'none';
        isRunning = true;
        closeKeyboard();
    }
}

function resetAll() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    }
    
    const input = document.getElementById('mobileInput') || document.getElementById('desktopInput');
    if (input) input.value = 'LED бегущая строка';
    
    const previewSpan = document.getElementById('previewSpan');
    if (previewSpan) {
        previewSpan.innerHTML = '';
        previewSpan.appendChild(document.createTextNode('LED бегущая строка'));
    }
    
    scrollingText.innerHTML = '\\(LED\\ бегущая\\ строка\\)';
    if (window.MathJax) {
        MathJax.typesetPromise([scrollingText]).catch(() => {});
    }
    
    currentColor = 'white';
    currentSpeed = 15;
    currentSize = 15;
    
    sizeSlider.value = 15;
    speedSlider.value = 15;
    
    updateDisplay();
    closeKeyboard();
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
    
    saveData({ latex: 'LED\\ бегущая\\ строка', raw: 'LED бегущая строка' });
}

// ============================================
// ВСТАВКА СИМВОЛОВ
// ============================================
function insertMathSymbol(symbol) {
    const input = document.getElementById('mobileInput') || document.getElementById('desktopInput');
    if (!input) return;
    
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    
    let insertText = symbol;
    
    // Специальные символы
    if (symbol === '√') {
        insertText = '√[]';  // Квадратные скобки для корня
    } else if (symbol === '∛') {
        insertText = '∛[]';
    } else if (symbol === '∜') {
        insertText = '∜[]';
    } else if (symbol === '→') {
        insertText = '→';
    } else if (symbol === '/' && text[start-1] !== '(' && text[end] !== '(') {
        insertText = '/( )';
    } else if (symbol === 'a/b' || symbol === 'frac') {
        insertText = '(a)/(b)';  // Дробь со скобками
    }
    
    const newText = text.substring(0, start) + insertText + text.substring(end);
    input.value = newText;
    
    // Устанавливаем курсор в нужное место
    let newPos = start + insertText.length;
    if (insertText.includes('[]')) {
        newPos = start + insertText.length - 1;
    } else if (insertText.includes('/( )')) {
        newPos = start + insertText.length - 2;
    } else if (insertText === '(a)/(b)') {
        newPos = start + 2; // Курсор после первой скобки
    }
    input.setSelectionRange(newPos, newPos);
    input.focus();
    
    // Обновляем отображение
    const latex = parseToLaTeX(newText);
    scrollingText.innerHTML = '\\(' + latex + '\\)';
    if (window.MathJax) {
        MathJax.typesetPromise([scrollingText]).catch(() => {});
    }
    
    if (isMobile) {
        const previewSpan = document.getElementById('previewSpan');
        if (previewSpan) {
            previewSpan.innerHTML = '';
            previewSpan.appendChild(document.createTextNode(newText));
        }
    }
    
    saveData({ latex: latex, raw: newText });
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

mathBtn.addEventListener('click', toggleKeyboard);

document.addEventListener('click', function(e) {
    if (keyboardVisible && 
        !mathKeyboard.contains(e.target) && 
        !mathBtn.contains(e.target) &&
        !(isMobile && e.target.classList.contains('math-btn'))) {
        closeKeyboard();
    }
});

// Вкладки
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

// Кнопки клавиатуры - ОБНОВЛЕНО ДЛЯ ДРОБИ
mathKeys.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const cmd = this.textContent;
        const dataCmd = this.dataset.cmd;
        
        if (dataCmd === 'frac' || cmd === 'a/b') {
            insertMathSymbol('frac');
        } else if (cmd) {
            insertMathSymbol(cmd);
        }
        
        return false;
    });
});

// Цвета
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
        
        scrollingText.style.color = 
            color === 'white' ? '#ffffff' :
            color === 'red' ? '#ff3b30' :
            color === 'blue' ? '#007aff' :
            color === 'green' ? '#34c759' : '#ffcc00';
        
        colorButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        saveData({});
    });
});

// Размер
sizeSlider.addEventListener('input', function() {
    currentSize = parseInt(this.value);
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveData({});
});

// Скорость
speedSlider.addEventListener('input', function() {
    currentSpeed = parseInt(this.value);
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    saveData({});
});

// RUN
runBtn.addEventListener('click', toggleRun);

// Крестик
resetBtn.addEventListener('click', resetAll);

// Шестеренка
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

// Закрытие настроек
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

console.log('✅ УМНЫЙ ПАРСЕР: √[x+1] для корней, (a)/(b) для дробей');
