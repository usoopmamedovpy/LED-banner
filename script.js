// ============================================
// LED BANNER - КРАСИВЫЕ ФОРМУЛЫ НА ВСЕХ УСТРОЙСТВАХ
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
let currentText = 'LED бегущая строка';
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
window.addEventListener('load', function() {
    console.log('LED Banner загружен');
    
    // Создаем поле ввода
    createInput();
    
    loadSavedData();
    updateDisplay();
    scrollingText.style.textShadow = 'none';
    
    // Принудительно устанавливаем цвета
    setTimeout(updateColor, 100);
});

// ============================================
// СОЗДАЕМ ПОЛЕ ВВОДА (ОДИНАКОВОЕ ДЛЯ ВСЕХ)
// ============================================
function createInput() {
    const mathFieldElement = document.getElementById('mathField');
    if (!mathFieldElement) return;
    
    // Создаем input
    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'mathInput';
    input.className = 'text-input';
    input.style.flex = '1';
    input.style.background = '#111111';
    input.style.border = '2px solid #ffffff';
    input.style.borderRadius = '30px';
    input.style.padding = '16px 20px';
    input.style.fontSize = '18px';
    input.style.color = '#ffffff';
    input.style.outline = 'none';
    input.value = currentText;
    
    // Заменяем MathQuill поле на input
    mathFieldElement.parentNode.replaceChild(input, mathFieldElement);
    
    // Обработчик ввода
    input.addEventListener('input', function(e) {
        currentText = e.target.value;
        updateMathDisplay(currentText);
        saveData();
    });
    
    // Обработчик Enter
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            toggleRun();
        }
    });
    
    console.log('Создан input для ввода');
}

// ============================================
// ПРЕОБРАЗОВАНИЕ ТЕКСТА В МАТЕМАТИКУ
// ============================================
function updateMathDisplay(text) {
    // Заменяем специальные обозначения на LaTeX
    let latex = text;
    
    // Греческие буквы
    latex = latex.replace(/α/g, '\\alpha');
    latex = latex.replace(/β/g, '\\beta');
    latex = latex.replace(/γ/g, '\\gamma');
    latex = latex.replace(/δ/g, '\\delta');
    latex = latex.replace(/π/g, '\\pi');
    latex = latex.replace(/θ/g, '\\theta');
    latex = latex.replace(/λ/g, '\\lambda');
    latex = latex.replace(/μ/g, '\\mu');
    latex = latex.replace(/σ/g, '\\sigma');
    latex = latex.replace(/φ/g, '\\phi');
    latex = latex.replace(/ω/g, '\\omega');
    
    // Корни
    latex = latex.replace(/√\(([^)]+)\)/g, '\\sqrt{$1}');
    latex = latex.replace(/∛\(([^)]+)\)/g, '\\sqrt[3]{$1}');
    latex = latex.replace(/∜\(([^)]+)\)/g, '\\sqrt[4]{$1}');
    
    // Дроби
    latex = latex.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
    
    // Степени
    latex = latex.replace(/(\w+)\^(\d+)/g, '$1^{$2}');
    latex = latex.replace(/(\w+)\^\(([^)]+)\)/g, '$1^{$2}');
    
    // Векторы
    latex = latex.replace(/→(\w)/g, '\\vec{$1}');
    
    // Функции
    latex = latex.replace(/sin\(/g, '\\sin(');
    latex = latex.replace(/cos\(/g, '\\cos(');
    latex = latex.replace(/tan\(/g, '\\tan(');
    latex = latex.replace(/cot\(/g, '\\cot(');
    latex = latex.replace(/log\(/g, '\\log(');
    latex = latex.replace(/ln\(/g, '\\ln(');
    
    // Специальные символы
    latex = latex.replace(/∞/g, '\\infty');
    latex = latex.replace(/∫/g, '\\int');
    latex = latex.replace(/∑/g, '\\sum');
    latex = latex.replace(/∏/g, '\\prod');
    latex = latex.replace(/≠/g, '\\neq');
    latex = latex.replace(/≤/g, '\\leq');
    latex = latex.replace(/≥/g, '\\geq');
    latex = latex.replace(/≈/g, '\\approx');
    latex = latex.replace(/±/g, '\\pm');
    latex = latex.replace(/×/g, '\\times');
    latex = latex.replace(/÷/g, '\\div');
    
    // Отображаем на LED-экране
    scrollingText.innerHTML = '\\(' + latex + '\\)';
    
    // Рендерим MathJax
    if (window.MathJax) {
        MathJax.typesetPromise([scrollingText]).catch(() => {});
    }
}

// ============================================
// ВСТАВКА МАТЕМАТИЧЕСКИХ СИМВОЛОВ
// ============================================
function insertSymbol(symbol) {
    const input = document.getElementById('mathInput');
    if (!input) return;
    
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    
    let insertText = symbol;
    
    // Для функций добавляем скобки
    if (['sin', 'cos', 'tan', 'cot', 'log', 'ln'].includes(symbol)) {
        insertText = symbol + '(';
    }
    
    // Для корней
    if (symbol === '√') insertText = '√()';
    if (symbol === '∛') insertText = '∛()';
    if (symbol === '∜') insertText = '∜()';
    
    // Для дробей
    if (symbol === '/') insertText = '/';
    
    // Для вектора
    if (symbol === '→') insertText = '→';
    
    const newText = text.substring(0, start) + insertText + text.substring(end);
    input.value = newText;
    currentText = newText;
    
    // Возвращаем курсор
    let newPos = start + insertText.length;
    if (symbol === '√' || symbol === '∛' || symbol === '∜') {
        newPos = start + 1; // Ставим курсор между скобок
    }
    
    input.setSelectionRange(newPos, newPos);
    input.focus();
    
    updateMathDisplay(newText);
    saveData();
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
            if (data.text) {
                currentText = data.text;
                const input = document.getElementById('mathInput');
                if (input) {
                    input.value = currentText;
                    updateMathDisplay(currentText);
                }
            }
        }
    } catch (e) {}
}

function saveData() {
    const input = document.getElementById('mathInput');
    const text = input ? input.value : currentText;
    
    const data = {
        text: text,
        color: currentColor,
        speed: currentSpeed,
        size: currentSize
    };
    
    localStorage.setItem('ledBannerData', JSON.stringify(data));
    
    if (tg) {
        try {
            tg.sendData(JSON.stringify({
                action: 'save',
                data: data
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
    console.log('Применяем цвет:', currentColor);
    
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
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else {
        mathKeyboard.classList.remove('show');
        mathBtn.classList.remove('active');
    }
}

function closeKeyboard() {
    keyboardVisible = false;
    mathKeyboard.classList.remove('show');
    mathBtn.classList.remove('active');
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
        saveData();
    }
}

function resetAll() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    }
    
    currentText = 'LED бегущая строка';
    const input = document.getElementById('mathInput');
    if (input) {
        input.value = currentText;
        updateMathDisplay(currentText);
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
    saveData();
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

// MATH кнопка
mathBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleKeyboard();
});

// Кнопки клавиатуры
mathKeys.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const cmd = this.dataset.cmd;
        if (cmd) {
            let symbol = cmd;
            
            // Преобразуем LaTeX команды в символы
            if (cmd === '\\sin') symbol = 'sin';
            else if (cmd === '\\cos') symbol = 'cos';
            else if (cmd === '\\tan') symbol = 'tan';
            else if (cmd === '\\cot') symbol = 'cot';
            else if (cmd === '\\log') symbol = 'log';
            else if (cmd === '\\ln') symbol = 'ln';
            else if (cmd === '\\sqrt') symbol = '√';
            else if (cmd === '\\sqrt[3]') symbol = '∛';
            else if (cmd === '\\sqrt[4]') symbol = '∜';
            else if (cmd === '\\frac') symbol = '/';
            else if (cmd === '\\vec') symbol = '→';
            else if (cmd === '\\alpha') symbol = 'α';
            else if (cmd === '\\beta') symbol = 'β';
            else if (cmd === '\\gamma') symbol = 'γ';
            else if (cmd === '\\delta') symbol = 'δ';
            else if (cmd === '\\pi') symbol = 'π';
            else if (cmd === '\\theta') symbol = 'θ';
            else if (cmd === '\\lambda') symbol = 'λ';
            else if (cmd === '\\mu') symbol = 'μ';
            else if (cmd === '\\sigma') symbol = 'σ';
            else if (cmd === '\\phi') symbol = 'φ';
            else if (cmd === '\\omega') symbol = 'ω';
            else if (cmd === '\\infty') symbol = '∞';
            else if (cmd === '\\int') symbol = '∫';
            else if (cmd === '\\sum') symbol = '∑';
            else if (cmd === '\\prod') symbol = '∏';
            else if (cmd === '\\neq') symbol = '≠';
            else if (cmd === '\\leq') symbol = '≤';
            else if (cmd === '\\geq') symbol = '≥';
            else if (cmd === '\\approx') symbol = '≈';
            else if (cmd === '\\pm') symbol = '±';
            else if (cmd === '\\times') symbol = '×';
            else if (cmd === '\\div') symbol = '÷';
            
            insertSymbol(symbol);
        }
        
        return false;
    });
});

// ЦВЕТА
colorButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        if (this.classList.contains('white')) currentColor = 'white';
        else if (this.classList.contains('red')) currentColor = 'red';
        else if (this.classList.contains('blue')) currentColor = 'blue';
        else if (this.classList.contains('green')) currentColor = 'green';
        else if (this.classList.contains('yellow')) currentColor = 'yellow';
        
        updateColor();
        saveData();
    });
});

// Размер
sizeSlider.addEventListener('input', function() {
    currentSize = parseInt(this.value);
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveData();
});

// Скорость
speedSlider.addEventListener('input', function() {
    currentSpeed = parseInt(this.value);
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    saveData();
});

// RUN
runBtn.addEventListener('click', toggleRun);

// Крестик
resetBtn.addEventListener('click', function() {
    resetAll();
});

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

// Вкладки клавиатуры
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

console.log('✅ ФИНАЛ: красивые формулы на всех устройствах!');
я
