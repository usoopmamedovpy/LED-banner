// ============================================
// LED BANNER С МАТЕМАТИЧЕСКОЙ КЛАВИАТУРОЙ
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
const textInput = document.getElementById('textInput');
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
const functionsTab = document.getElementById('functionsTab');
const greekTab = document.getElementById('greekTab');
const mathKeys = document.querySelectorAll('.math-key');

// Элементы настроек
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const colorButtons = document.querySelectorAll('.color-btn');

// ============================================
// ПЕРЕМЕННЫЕ
// ============================================
let currentSpeed = 15;
let currentColor = 'white';
let currentSize = 15;
let isRunning = false;
let keyboardVisible = false;

// ============================================
// ЗАГРУЗКА СОХРАНЕННЫХ ДАННЫХ
// ============================================
function loadSavedData() {
    try {
        const localSave = localStorage.getItem('ledBannerData');
        if (localSave) {
            const savedData = JSON.parse(localSave);
            applySavedData(savedData);
        }
    } catch (e) {
        console.log('Нет сохраненных данных');
    }
}

function applySavedData(savedData) {
    if (savedData.text) textInput.value = savedData.text;
    if (savedData.color) currentColor = savedData.color;
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
    const dataToSave = {
        text: textInput.value,
        color: currentColor,
        speed: currentSpeed,
        size: currentSize
    };
    
    localStorage.setItem('ledBannerData', JSON.stringify(dataToSave));
    
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
// ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ
// ============================================
function updateDisplay() {
    // Текст
    scrollingText.textContent = textInput.value || 'LED бегущая строка';
    
    // Размер
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    
    // Скорость
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    
    // Цвет
    scrollingText.classList.remove('white', 'red', 'blue', 'green', 'yellow');
    scrollingText.classList.add(currentColor);
    
    // Активная кнопка цвета
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
// ВСТАВКА СИМВОЛА
// ============================================
function insertSymbol(symbol) {
    const start = textInput.selectionStart;
    const end = textInput.selectionEnd;
    const text = textInput.value;
    
    const newText = text.substring(0, start) + symbol + text.substring(end);
    textInput.value = newText;
    
    // Возвращаем курсор
    const newPos = start + symbol.length;
    textInput.setSelectionRange(newPos, newPos);
    textInput.focus();
    
    // Обновляем предпросмотр
    scrollingText.textContent = newText;
    saveToBot();
}

// ============================================
// УПРАВЛЕНИЕ ЗАПУСКОМ
// ============================================
function toggleRun() {
    if (isRunning) {
        // Останавливаем
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    } else {
        // Запускаем
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
    functionsTab.classList.add('active');
    greekTab.classList.remove('active');
});

tabGreek.addEventListener('click', () => {
    tabGreek.classList.add('active');
    tabFunctions.classList.remove('active');
    greekTab.classList.add('active');
    functionsTab.classList.remove('active');
});

// Кнопки клавиатуры
mathKeys.forEach(key => {
    key.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = key.dataset.value;
        if (value) insertSymbol(value);
    });
});

// Цвет
colorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const color = btn.classList[1];
        currentColor = color;
        updateDisplay();
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

// Текст
textInput.addEventListener('input', () => {
    scrollingText.textContent = textInput.value || 'LED бегущая строка';
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

// Enter
textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        toggleRun();
    }
});

// ============================================
// ЗАГРУЗКА
// ============================================
window.addEventListener('load', () => {
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

console.log('✅ LED Banner готов!');
