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
const inputContainer = document.getElementById('inputContainer');
const inputArea = document.getElementById('inputArea');

// MATH элементы
const mathBtn = document.getElementById('mathBtn');
const mathKeyboard = document.getElementById('mathKeyboard');
const sectionFunctions = document.getElementById('sectionFunctions');
const sectionGreek = document.getElementById('sectionGreek');
const keyboardFunctions = document.getElementById('keyboardFunctions');
const keyboardGreek = document.getElementById('keyboardGreek');
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
        
        if (tg.initDataUnsafe && tg.initDataUnsafe.start_param) {
            const savedData = JSON.parse(decodeURIComponent(tg.initDataUnsafe.start_param));
            applySavedData(savedData);
        }
    } catch (e) {
        console.log('Нет сохраненных данных');
    }
}

function applySavedData(savedData) {
    if (savedData.text) {
        textInput.value = savedData.text;
        scrollingText.textContent = savedData.text;
    }
    
    if (savedData.color) {
        currentColor = savedData.color;
    }
    
    if (savedData.speed) {
        currentSpeed = savedData.speed;
        speedSlider.value = currentSpeed;
    }
    
    if (savedData.size) {
        currentSize = savedData.size;
        sizeSlider.value = currentSize;
    }
    
    applyAllSettings();
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
        } catch (e) {
            console.log('Ошибка отправки');
        }
    }
}

// ============================================
// ФУНКЦИИ УПРАВЛЕНИЯ КЛАВИАТУРОЙ
// ============================================
function toggleKeyboard() {
    if (isRunning) return;
    
    keyboardVisible = !keyboardVisible;
    
    if (keyboardVisible) {
        mathKeyboard.classList.add('show');
        mathBtn.classList.add('active');
        inputContainer.classList.add('keyboard-open');
    } else {
        mathKeyboard.classList.remove('show');
        mathBtn.classList.remove('active');
        inputContainer.classList.remove('keyboard-open');
    }
}

function closeKeyboard() {
    keyboardVisible = false;
    mathKeyboard.classList.remove('show');
    mathBtn.classList.remove('active');
    inputContainer.classList.remove('keyboard-open');
}

// ============================================
// ВСТАВКА МАТЕМАТИЧЕСКИХ СИМВОЛОВ
// ============================================
function insertMathSymbol(symbol) {
    const cursorPos = textInput.selectionStart;
    const currentText = textInput.value;
    const textBefore = currentText.substring(0, cursorPos);
    const textAfter = currentText.substring(cursorPos);
    
    let insertText = symbol;
    
    // Специальная обработка для функций
    if (['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 
         'arcsin', 'arccos', 'arctan', 'arccot',
         'log', 'ln', 'lg', 'exp', 'lim'].includes(symbol)) {
        insertText = symbol + '(';
    }
    
    // Для стрелки (вектор)
    if (symbol === '→') {
        insertText = '→';
    }
    
    textInput.value = textBefore + insertText + textAfter;
    
    // Устанавливаем курсор
    let newPos = cursorPos + insertText.length;
    if (['sin', 'cos', 'tan'].includes(symbol)) {
        newPos = cursorPos + symbol.length + 1;
    }
    
    textInput.setSelectionRange(newPos, newPos);
    textInput.focus();
    
    // Обновляем бегущую строку
    scrollingText.textContent = textInput.value;
    applyAllSettings();
    saveToBot();
}

// ============================================
// ФУНКЦИЯ СМЕНЫ ЦВЕТА
// ============================================
function setTextColor(color) {
    console.log('Меняем цвет на:', color);
    
    // Удаляем все классы цвета
    scrollingText.classList.remove('white', 'red', 'blue', 'green', 'yellow');
    
    // Добавляем новый класс
    scrollingText.classList.add(color);
    
    // Обновляем активную кнопку
    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(color)) {
            btn.classList.add('active');
        }
    });
    
    currentColor = color;
    
    // Применяем цвет через style на всякий случай
    if (color === 'white') scrollingText.style.color = '#ffffff';
    if (color === 'red') scrollingText.style.color = '#ff3b30';
    if (color === 'blue') scrollingText.style.color = '#007aff';
    if (color === 'green') scrollingText.style.color = '#34c759';
    if (color === 'yellow') scrollingText.style.color = '#ffcc00';
    
    saveToBot();
}

// ============================================
// ПРИМЕНЕНИЕ НАСТРОЕК
// ============================================
function applyAllSettings() {
    // Размер
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    
    // Скорость
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    
    // Цвет
    setTextColor(currentColor);
    
    // Текст
    scrollingText.textContent = textInput.value;
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
// УПРАВЛЕНИЕ ЭЛЕМЕНТАМИ
// ============================================
function toggleControls() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
        closeKeyboard();
    } else {
        applyAllSettings();
        inputArea.style.display = 'none';
        settingsBtn.style.display = 'none';
        isRunning = true;
        saveToBot();
    }
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

// MATH кнопка
mathBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleKeyboard();
});

// Закрытие по клику вне клавиатуры
document.addEventListener('click', function(e) {
    if (keyboardVisible && 
        !mathKeyboard.contains(e.target) && 
        !mathBtn.contains(e.target)) {
        closeKeyboard();
    }
});

// Предотвращаем закрытие при клике на клавиатуру
mathKeyboard.addEventListener('click', function(e) {
    e.stopPropagation();
});

// Текстовое поле
textInput.addEventListener('focus', function() {
    if (keyboardVisible) {
        closeKeyboard();
    }
});

// Переключение на раздел функций
sectionFunctions.addEventListener('click', function() {
    sectionFunctions.classList.add('active');
    sectionGreek.classList.remove('active');
    keyboardFunctions.classList.add('active');
    keyboardGreek.classList.remove('active');
});

// Переключение на раздел греческих букв
sectionGreek.addEventListener('click', function() {
    sectionGreek.classList.add('active');
    sectionFunctions.classList.remove('active');
    keyboardGreek.classList.add('active');
    keyboardFunctions.classList.remove('active');
});

// Кнопки математи
