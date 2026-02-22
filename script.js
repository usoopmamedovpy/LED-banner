// ============================================
// LED BANNER - С СОХРАНЕНИЕМ НАСТРОЕК
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
const inputArea = document.querySelector('.input-area');

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
let currentText = 'LED бегущая строка';
let isRunning = false;

// ============================================
// ЗАГРУЗКА СОХРАНЕННЫХ ДАННЫХ
// ============================================
function loadSavedData() {
    console.log('Загружаем сохраненные данные...');
    
    try {
        // Пытаемся получить данные из initDataUnsafe (то, что бот прислал)
        if (tg.initDataUnsafe && tg.initDataUnsafe.start_param) {
            const savedData = JSON.parse(decodeURIComponent(tg.initDataUnsafe.start_param));
            console.log('Найдены сохраненные данные:', savedData);
            
            if (savedData.text) currentText = savedData.text;
            if (savedData.color) currentColor = savedData.color;
            if (savedData.speed) currentSpeed = savedData.speed;
            if (savedData.size) currentSize = savedData.size;
            
            // Применяем к интерфейсу
            textInput.value = currentText;
            scrollingText.textContent = currentText;
            
            sizeSlider.value = currentSize;
            speedSlider.value = currentSpeed;
            
            // Применяем все настройки
            applyAllSettings();
        }
    } catch (e) {
        console.log('Нет сохраненных данных или ошибка парсинга:', e);
    }
}

// ============================================
// ФУНКЦИЯ ОТПРАВКИ ДАННЫХ В БОТА
// ============================================
function saveToBot() {
    if (!tg) return;
    
    const dataToSave = {
        text: scrollingText.textContent,
        color: currentColor,
        speed: currentSpeed,
        size: currentSize
    };
    
    console.log('Сохраняем в бота:', dataToSave);
    
    try {
        tg.sendData(JSON.stringify({
            action: 'save_all',
            data: dataToSave
        }));
    } catch (e) {
        console.log('Ошибка отправки:', e);
    }
}

// ============================================
// ФУНКЦИЯ СМЕНЫ ЦВЕТА
// ============================================
function setTextColor(color) {
    console.log('Меняем цвет на:', color);
    
    scrollingText.classList.remove('white', 'red', 'blue', 'green', 'yellow');
    scrollingText.classList.add(color);
    
    if (color === 'white') scrollingText.style.color = '#ffffff';
    if (color === 'red') scrollingText.style.color = '#ff3b30';
    if (color === 'blue') scrollingText.style.color = '#007aff';
    if (color === 'green') scrollingText.style.color = '#34c759';
    if (color === 'yellow') scrollingText.style.color = '#ffcc00';
    
    scrollingText.style.textShadow = 'none';
    
    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(color)) {
            btn.classList.add('active');
        }
    });
    
    currentColor = color;
    saveToBot(); // Сохраняем при изменении цвета
}

// ============================================
// ФУНКЦИЯ ПРИМЕНЕНИЯ ВСЕХ НАСТРОЕК
// ============================================
function applyAllSettings() {
    console.log('Применяем все настройки');
    
    // Размер
    currentSize = sizeSlider.value;
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    
    // Скорость
    currentSpeed = speedSlider.value;
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    
    // Цвет
    setTextColor(currentColor);
    
    // Текст
    scrollingText.textContent = currentText;
    textInput.value = currentText;
}

// ============================================
// ПЕРЕЗАПУСК АНИМАЦИИ
// ============================================
function restartAnimation() {
    scrollingText.style.animation = 'none';
    scrollingText.offsetHeight;
    scrollingText.style.animation = `scrollText ${currentSpeed}s linear infinite`;
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

// Цвет
colorButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        let color = this.classList[1];
        setTextColor(color);
    });
});

// Размер
sizeSlider.addEventListener('input', function() {
    currentSize = this.value;
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveToBot(); // Сохраняем при изменении размера
});

// Скорость
speedSlider.addEventListener('input', function() {
    currentSpeed = this.value;
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    saveToBot(); // Сохраняем при изменении скорости
});

// Текст
textInput.addEventListener('input', function() {
    currentText = this.value;
    // Не применяем к бегущей строке, пока не нажат RUN
});

// RUN
runBtn.addEventListener('click', function() {
    let text = textInput.value.trim();
    if (text === '') text = 'LED бегущая строка';
    
    currentText = text;
    scrollingText.textContent = text;
    applyAllSettings();
    
    inputArea.style.display = 'none';
    settingsBtn.style.display = 'none';
    isRunning = true;
    
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
    
    saveToBot(); // Сохраняем при запуске
});

// RESET
resetBtn.addEventListener('click', function() {
    currentText = 'LED бегущая строка';
    currentColor = 'white';
    currentSize = 15;
    currentSpeed = 15;
    
    textInput.value = currentText;
    sizeSlider.value = currentSize;
    speedSlider.value = currentSpeed;
    
    applyAllSettings();
    
    inputArea.style.display = 'flex';
    settingsBtn.style.display = 'flex';
    isRunning = false;
    
    saveToBot(); // Сохраняем при сбросе
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
        runBtn.click();
    }
});

// ============================================
// ЗАГРУЗКА
// ============================================
window.addEventListener('load', function() {
    console.log('LED Banner загружен');
    
    // Сначала пробуем загрузить сохраненные данные
    loadSavedData();
    
    // Если нет сохраненных, используем дефолтные
    if (!currentText) {
        currentText = 'LED бегущая строка';
        textInput.value = currentText;
        scrollingText.textContent = currentText;
    }
    
    applyAllSettings();
    scrollingText.style.textShadow = 'none';
});

// ============================================
// TELEGRAM BACK BUTTON
// ============================================
tg.BackButton.onClick(function() {
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    } else {
        tg.close();
    }
});
tg.BackButton.show();

console.log('✅ LED Banner с сохранением настроек!');
