// ============================================
// LED BANNER - ПРОСТЕЙШАЯ РАБОЧАЯ ВЕРСИЯ
// ============================================

// Telegram
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Черный фон
document.documentElement.style.backgroundColor = '#000000';
document.body.style.backgroundColor = '#000000';

// ============================================
// ПОЛУЧАЕМ ЭЛЕМЕНТЫ
// ============================================
const scrollingText = document.getElementById('scrollingText');
const textInput = document.getElementById('textInput');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
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

// ============================================
// ЗАГРУЗКА/СОХРАНЕНИЕ
// ============================================
function loadSavedData() {
    try {
        const saved = localStorage.getItem('ledBannerData');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.text) textInput.value = data.text;
            if (data.color) {
                currentColor = data.color;
                updateColor();
            }
            if (data.speed) {
                currentSpeed = data.speed;
                speedSlider.value = currentSpeed;
            }
            if (data.size) {
                currentSize = data.size;
                sizeSlider.value = currentSize;
            }
        }
    } catch (e) {}
    updateDisplay();
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
// ОБНОВЛЕНИЕ
// ============================================
function updateDisplay() {
    scrollingText.textContent = textInput.value || 'LED бегущая строка';
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    
    updateColor();
}

function updateColor() {
    // Просто меняем цвет текста
    if (currentColor === 'white') scrollingText.style.color = '#ffffff';
    if (currentColor === 'red') scrollingText.style.color = '#ff3b30';
    if (currentColor === 'blue') scrollingText.style.color = '#007aff';
    if (currentColor === 'green') scrollingText.style.color = '#34c759';
    if (currentColor === 'yellow') scrollingText.style.color = '#ffcc00';
    
    // Обновляем кнопки
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
        document.querySelector('.input-area').style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    } else {
        updateDisplay();
        document.querySelector('.input-area').style.display = 'none';
        settingsBtn.style.display = 'none';
        isRunning = true;
        closeKeyboard();
        saveData();
    }
}

function resetAll() {
    if (isRunning) {
        document.querySelector('.input-area').style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    }
    
    textInput.value = 'LED бегущая строка';
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
// ВСТАВКА СИМВОЛА
// ============================================
function insertSymbol(symbol) {
    const start = textInput.selectionStart;
    const end = textInput.selectionEnd;
    const text = textInput.value;
    
    let insertText = symbol;
    
    // Для функций добавляем скобки
    if (['sin', 'cos', 'tan', 'cot', 'log', 'ln', 'lg'].includes(symbol)) {
        insertText = symbol + '(';
    }
    
    const newText = text.substring(0, start) + insertText + text.substring(end);
    textInput.value = newText;
    
    const newPos = start + insertText.length;
    textInput.setSelectionRange(newPos, newPos);
    textInput.focus();
    
    scrollingText.textContent = newText;
    saveData();
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

// MATH кнопка
mathBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleKeyboard();
});

// Закрытие клавиатуры
document.addEventListener('click', (e) => {
    if (keyboardVisible && !mathKeyboard.contains(e.target) && !mathBtn.contains(e.target)) {
        closeKeyboard();
    }
});

// Вкладки
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
mathKeys.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const value = btn.dataset.cmd || btn.dataset.value;
        if (value) insertSymbol(value);
    });
});

// Текст
textInput.addEventListener('input', () => {
    scrollingText.textContent = textInput.value || 'LED бегущая строка';
    saveData();
});

// Цвет - ПРОСТО И ПОНЯТНО
colorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.classList.contains('white')) currentColor = 'white';
        if (btn.classList.contains('red')) currentColor = 'red';
        if (btn.classList.contains('blue')) currentColor = 'blue';
        if (btn.classList.contains('green')) currentColor = 'green';
        if (btn.classList.contains('yellow')) currentColor = 'yellow';
        
        updateColor();
        saveData();
    });
});

// Размер
sizeSlider.addEventListener('input', () => {
    currentSize = parseInt(sizeSlider.value);
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveData();
});

// Скорость
speedSlider.addEventListener('input', () => {
    currentSpeed = parseInt(speedSlider.value);
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    saveData();
});

// RUN
runBtn.addEventListener('click', toggleRun);

// Крестик
resetBtn.addEventListener('click', resetAll);

// Шестеренка
settingsBtn.addEventListener('click', () => {
    if (isRunning) return;
    settingsPanel.classList.toggle('show');
    settingsBtn.classList.toggle('active');
    closeKeyboard();
});

// Закрытие настроек
settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    }
});

// Enter
textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') toggleRun();
});

// ============================================
// ЗАГРУЗКА
// ============================================
window.addEventListener('load', () => {
    loadSavedData();
    updateDisplay();
});

// Кнопка назад
tg.BackButton.onClick(() => {
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else if (keyboardVisible) {
        closeKeyboard();
    } else if (isRunning) {
        document.querySelector('.input-area').style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    } else {
        tg.close();
    }
});
tg.BackButton.show();

console.log('✅ Простая рабочая версия');
