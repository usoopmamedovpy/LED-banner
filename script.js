// ============================================
// LED BANNER - ПРОСТАЯ ВЕРСИЯ С МАТЕМАТИЧЕСКИМИ СИМВОЛАМИ
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
// ЗАГРУЗКА
// ============================================
window.addEventListener('load', function() {
    console.log('LED Banner загружен');
    
    loadSavedData();
    updateDisplay();
    scrollingText.style.textShadow = 'none';
    
    // Если это мобилка - показываем подсказку
    if (isMobile) {
        console.log('Мобильное устройство');
    }
});

// ============================================
// СОХРАНЕНИЕ
// ============================================
function loadSavedData() {
    try {
        const saved = localStorage.getItem('ledBannerSimpleData');
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
                speedValue.textContent = currentSpeed + ' сек';
            }
            if (data.size) {
                currentSize = data.size;
                sizeSlider.value = currentSize;
                sizeValue.textContent = currentSize + 'vw';
            }
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
    
    localStorage.setItem('ledBannerSimpleData', JSON.stringify(data));
    
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
    scrollingText.textContent = textInput.value || 'LED бегущая строка';
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    
    updateColor();
}

function updateColor() {
    console.log('Обновление цвета на:', currentColor);
    
    // Убираем старые классы
    scrollingText.classList.remove('white', 'red', 'blue', 'green', 'yellow');
    
    // Добавляем новый класс
    scrollingText.classList.add(currentColor);
    
    // Убираем inline style
    scrollingText.style.color = '';
    
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
// УПРАВЛЕНИЕ КЛАВИАТУРОЙ
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

// ============================================
// ВСТАВКА СИМВОЛА
// ============================================
function insertSymbol(symbol) {
    const start = textInput.selectionStart;
    const end = textInput.selectionEnd;
    const text = textInput.value;
    
    let insertText = symbol;
    
    // Для функций добавляем скобки
    if (['sin', 'cos', 'tan', 'cot', 'arcsin', 'arccos', 'arctan', 'arccot', 'log', 'ln', 'lg', 'exp', 'lim'].includes(symbol)) {
        insertText = symbol + '(';
    }
    
    const newText = text.substring(0, start) + insertText + text.substring(end);
    textInput.value = newText;
    
    // Возвращаем курсор
    const newPos = start + insertText.length;
    textInput.setSelectionRange(newPos, newPos);
    textInput.focus();
    
    // Обновляем отображение
    scrollingText.textContent = newText;
    saveData();
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
        saveData();
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
    sizeValue.textContent = '15vw';
    speedValue.textContent = '15 сек';
    
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

// Закрытие клавиатуры
document.addEventListener('click', function(e) {
    if (keyboardVisible && 
        !mathKeyboard.contains(e.target) && 
        !mathBtn.contains(e.target)) {
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

// Кнопки клавиатуры
mathKeys.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const symbol = this.textContent;
        insertSymbol(symbol);
        
        return false;
    });
});

// Текстовое поле
textInput.addEventListener('input', function() {
    scrollingText.textContent = this.value || 'LED бегущая строка';
    saveData();
});

// Цвет
colorButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        
        let color = '';
        if (this.classList.contains('white')) color = 'white';
        if (this.classList.contains('red')) color = 'red';
        if (this.classList.contains('blue')) color = 'blue';
        if (this.classList.contains('green')) color = 'green';
        if (this.classList.contains('yellow')) color = 'yellow';
        
        if (color) {
            currentColor = color;
            updateColor();
            saveData();
        }
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

// Enter
textInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        toggleRun();
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

console.log('✅ LED Banner простая версия готова!');
