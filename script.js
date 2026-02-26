// ============================================
// LED BANNER - ФИНАЛЬНАЯ ВЕРСИЯ
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
    
    // Создаем единый интерфейс для всех устройств
    createUnifiedInterface();
    
    loadSavedData();
    updateDisplay();
    scrollingText.style.textShadow = 'none';
});

// ============================================
// ЕДИНЫЙ ИНТЕРФЕЙС (ОДНО ПОЛЕ ВВОДА)
// ============================================
function createUnifiedInterface() {
    const mathFieldElement = document.getElementById('mathField');
    if (!mathFieldElement) return;
    
    // Очищаем inputArea
    inputArea.innerHTML = '';
    inputArea.style.display = 'flex';
    inputArea.style.gap = '10px';
    inputArea.style.alignItems = 'center';
    inputArea.style.padding = '16px';
    
    // MATH кнопка слева
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
    
    // Поле ввода (одно!)
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'mainInput';
    textInput.className = 'text-input';
    textInput.placeholder = '√[x+1] или (a)/(b) или {вектор}';
    textInput.value = 'LED бегущая строка';
    textInput.style.flex = '1';
    textInput.style.background = '#111111';
    textInput.style.border = '2px solid #ffffff';
    textInput.style.borderRadius = '30px';
    textInput.style.padding = '16px 20px';
    textInput.style.fontSize = '18px';
    textInput.style.color = '#ffffff';
    textInput.style.outline = 'none';
    
    // RUN кнопка справа
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
    
    // Обработчики
    mathButton.addEventListener('click', toggleKeyboard);
    runButton.addEventListener('click', toggleRun);
    
    textInput.addEventListener('input', function(e) {
        const text = e.target.value;
        const latex = parseToLaTeX(text);
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
    
    // 1. Векторы: {текст} → \vec{текст}
    result = result.replace(/\{([^}]+)\}/g, '\\vec{$1}');
    
    // 2. Дроби в формате (числитель)/(знаменатель)
    result = result.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, '\\frac{$1}{$2}');
    
    // 3. Простые дроби (число/число)
    result = result.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
    
    // 4. Корни с квадратными скобками: √[выражение] → \sqrt{выражение}
    result = result.replace(/√\[([^\]]+)\]/g, '\\sqrt{$1}');
    
    // 5. Корни с индексом: √[n]{выражение} → \sqrt[n]{выражение}
    result = result.replace(/√\[([^\]]+)\]\{([^}]+)\}/g, '\\sqrt[$1]{$2}');
    
    // 6. Степени: x^y → x^{y}
    result = result.replace(/([a-zA-Z0-9α-ω])\^\(([^)]+)\)/g, '$1^{$2}');
    result = result.replace(/([a-zA-Z0-9α-ω])\^([a-zA-Z0-9α-ω])/g, '$1^{$2}');
    
    // 7. Индексы: x_y → x_{y}
    result = result.replace(/([a-zA-Z0-9α-ω])_\(([^)]+)\)/g, '$1_{$2}');
    result = result.replace(/([a-zA-Z0-9α-ω])_([a-zA-Z0-9α-ω])/g, '$1_{$2}');
    
    // 8. Греческие буквы
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
    
    // 9. Функции
    const funcs = ['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 
                   'arcsin', 'arccos', 'arctan', 'arccot',
                   'log', 'ln', 'lg', 'exp', 'lim'];
    funcs.forEach(func => {
        const regex = new RegExp(func + '\\s*\\(', 'g');
        result = result.replace(regex, func + '(');
    });
    
    // 10. Специальные символы
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
            if (data.raw) {
                const input = document.getElementById('mainInput');
                if (input) input.value = data.raw;
                
                if (data.latex) {
                    scrollingText.innerHTML = '\\(' + data.latex + '\\)';
                    if (window.MathJax) {
                        MathJax.typesetPromise([scrollingText]).catch(() => {});
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
    
    const input = document.getElementById('mainInput');
    if (input) input.value = 'LED бегущая строка';
    
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
    const input = document.getElementById('mainInput');
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
    } else if (symbol === '→' || symbol === '\\vec' || symbol === '⃗') {
        insertText = '{}';  // Фигурные скобки для вектора
    } else if (symbol === 'a/b' || symbol === 'frac') {
        insertText = '(a)/(b)';  // Дробь со скобками
    }
    
    const newText = text.substring(0, start) + insertText + text.substring(end);
    input.value = newText;
    
    // Устанавливаем курсор в нужное место
    let newPos = start + insertText.length;
    if (insertText.includes('[]')) {
        newPos = start + insertText.length - 1;
    } else if (insertText === '{}') {
        newPos = start + 1; // Курсор внутри фигурных скобок
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
    
    saveData({ latex: latex, raw: newText });
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

// Оригинальная MATH кнопка (скрываем)
if (mathBtn) {
    mathBtn.style.display = 'none';
}

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

// Кнопки клавиатуры
mathKeys.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const cmd = this.textContent;
        const dataCmd = this.dataset.cmd;
        
        if (dataCmd === 'frac' || cmd === 'a/b') {
            insertMathSymbol('frac');
        } else if (dataCmd === '\\vec' || cmd === '⃗' || cmd === '→') {
            insertMathSymbol('→');
        } else {
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

console.log('✅ ФИНАЛЬНАЯ ВЕРСИЯ: одно поле, вектор в {}, дроби в (a)/(b), корни в √[]');
