// ============================================
// LED BANNER С MATHQUILL
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

// MATH элементы
const mathBtn = document.getElementById('mathBtn');
const mathKeyboard = document.getElementById('mathKeyboard');
const tabFunctions = document.getElementById('tabFunctions');
const tabGreek = document.getElementById('tabGreek');
const tabSymbols = document.getElementById('tabSymbols');
const functionsTab = document.getElementById('functionsTab');
const greekTab = document.getElementById('greekTab');
const symbolsTab = document.getElementById('symbolsTab');
const mathKeys = document.querySelectorAll('.math-key');

// Элементы настроек
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const colorButtons = document.querySelectorAll('.color-btn');

// ============================================
// ИНИЦИАЛИЗАЦИЯ MATHQUILL
// ============================================
let mathField = null;

function initMathQuill() {
    const MQ = MathQuill.getInterface(2);
    const mathFieldElement = document.getElementById('mathField');
    
    mathField = MQ.MathField(mathFieldElement, {
        spaceBehavesLikeTab: true,
        handlers: {
            edit: function() {
                // Получаем LaTeX и обновляем предпросмотр
                const latex = mathField.latex();
                scrollingText.innerHTML = `\\(${latex}\\)`;
                
                if (window.MathJax) {
                    MathJax.typesetPromise([scrollingText]).catch(() => {});
                }
                
                saveToBot();
            }
        }
    });
    
    // Устанавливаем начальное значение
    mathField.latex('LED\\ бегущая\\ строка');
}

// ============================================
// ЗАГРУЗКА СОХРАНЕННЫХ ДАННЫХ
// ============================================
function loadSavedData() {
    try {
        const localSave = localStorage.getItem('ledBannerMathData');
        if (localSave) {
            const savedData = JSON.parse(localSave);
            applySavedData(savedData);
        }
    } catch (e) {}
}

function applySavedData(savedData) {
    if (savedData.latex && mathField) {
        mathField.latex(savedData.latex);
    }
    
    if (savedData.color) {
        currentColor = savedData.color;
        updateColor();
    }
    
    if (savedData.speed) {
        currentSpeed = savedData.speed;
        speedSlider.value = currentSpeed;
    }
    
    if (savedData.size) {
        currentSize = savedData.size;
        sizeSlider.value = currentSize;
    }
    
    updateDisplay();
}

// ============================================
// СОХРАНЕНИЕ ДАННЫХ
// ============================================
function saveToBot() {
    if (!mathField) return;
    
    const dataToSave = {
        latex: mathField.latex(),
        color: currentColor,
        speed: currentSpeed,
        size: currentSize
    };
    
    localStorage.setItem('ledBannerMathData', JSON.stringify(dataToSave));
    
    if (tg) {
        try {
            tg.sendData(JSON.stringify({
                action: 'save_all',
                data: dataToSave
            }));
        } catch (e) {}
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

// ============================================
// ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ
// ============================================
function updateDisplay() {
    // Размер
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    
    // Скорость
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    
    // Цвет
    updateColor();
}

function updateColor() {
    scrollingText.style.color = '';
    
    if (currentColor === 'white') scrollingText.style.color = '#ffffff';
    if (currentColor === 'red') scrollingText.style.color = '#ff3b30';
    if (currentColor === 'blue') scrollingText.style.color = '#007aff';
    if (currentColor === 'green') scrollingText.style.color = '#34c759';
    if (currentColor === 'yellow') scrollingText.style.color = '#ffcc00';
    
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
// УПРАВЛЕНИЕ КЛАВИАТУРОЙ
// ============================================
function toggleKeyboard() {
    if (isRunning) return;
    
    keyboardVisible = !keyboardVisible;
    
    if (keyboardVisible) {
        mathKeyboard.classList.add('show');
        mathBtn.classList.add('active');
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

// ============================================
// ВСТАВКА КОМАНДЫ MATHQUILL
// ============================================
function insertMathCommand(cmd) {
    if (!mathField) return;
    
    if (cmd === '^') {
        mathField.cmd('^');
    } else if (cmd === '_') {
        mathField.cmd('_');
    } else if (cmd === '\\sqrt') {
        mathField.cmd('\\sqrt');
    } else if (cmd === '\\sqrt[3]') {
        mathField.cmd('\\sqrt[3]');
    } else if (cmd === '\\sqrt[4]') {
        mathField.cmd('\\sqrt[4]');
    } else if (cmd === '\\sqrt[n]') {
        mathField.typedText('\\sqrt[n]{');
    } else if (cmd === '\\frac') {
        mathField.cmd('\\frac');
    } else if (cmd === '\\vec') {
        mathField.typedText('\\vec{}');
        mathField.keystroke('Left');
    } else {
        mathField.cmd(cmd);
    }
    
    mathField.focus();
}

// ============================================
// УПРАВЛЕНИЕ ЗАПУСКОМ
// ============================================
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
        saveToBot();
    }
}

// ============================================
// СБРОС
// ============================================
function resetAll() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    }
    
    if (mathField) {
        mathField.latex('LED\\ бегущая\\ строка');
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
    saveToBot();
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

// MATH кнопка
mathBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleKeyboard();
});

// Закрытие по клику вне
document.addEventListener('click', (e) => {
    if (keyboardVisible && 
        !mathKeyboard.contains(e.target) && 
        !mathBtn.contains(e.target)) {
        closeKeyboard();
    }
});

// Переключение вкладок
tabFunctions.addEventListener('click', () => {
    tabFunctions.classList.add('active');
    tabGreek.classList.remove('active');
    tabSymbols.classList.remove('active');
    functionsTab.classList.add('active');
    greekTab.classList.remove('active');
    symbolsTab.classList.remove('active');
});

tabGreek.addEventListener('click', () => {
    tabGreek.classList.add('active');
    tabFunctions.classList.remove('active');
    tabSymbols.classList.remove('active');
    greekTab.classList.add('active');
    functionsTab.classList.remove('active');
    symbolsTab.classList.remove('active');
});

tabSymbols.addEventListener('click', () => {
    tabSymbols.classList.add('active');
    tabFunctions.classList.remove('active');
    tabGreek.classList.remove('active');
    symbolsTab.classList.add('active');
    functionsTab.classList.remove('active');
    greekTab.classList.remove('active');
});

// Кнопки клавиатуры
mathKeys.forEach(key => {
    key.addEventListener('click', (e) => {
        e.stopPropagation();
        const cmd = key.dataset.cmd;
        if (cmd) {
            insertMathCommand(cmd);
        }
    });
});

// Цвет
colorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.classList[1];
        currentColor = color;
        updateColor();
        saveToBot();
    });
});

// Размер
sizeSlider.addEventListener('input', () => {
    currentSize = parseInt(sizeSlider.value);
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveToBot();
});

// Скорость
speedSlider.addEventListener('input', () => {
    currentSpeed = parseInt(speedSlider.value);
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    saveToBot();
});

// RUN
runBtn.addEventListener('click', toggleRun);

// Крестик
resetBtn.addEventListener('click', resetAll);

// Шестеренка
settingsBtn.addEventListener('click', () => {
    if (isRunning) return;
    
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else {
        settingsPanel.classList.add('show');
        settingsBtn.classList.add('active');
        closeKeyboard();
    }
});

// Закрытие настроек
settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    }
});

// ============================================
// ЗАГРУЗКА
// ============================================
window.addEventListener('load', () => {
    console.log('LED Banner с MathQuill загружен');
    
    initMathQuill();
    loadSavedData();
    updateDisplay();
    
    inputArea.style.display = 'flex';
    settingsBtn.style.display = 'flex';
    isRunning = false;
    
    scrollingText.style.textShadow = 'none';
});

// ============================================
// TELEGRAM BACK BUTTON
// ============================================
tg.BackButton.onClick(() => {
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

console.log('✅ LED Banner с MathQuill готов!');
