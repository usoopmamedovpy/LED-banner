// ============================================
// LED BANNER - С СОХРАНЕНИЕМ И УМНЫМ КРЕСТИКОМ
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
        // Пытаемся получить данные из localStorage (для теста в браузере)
        const localSave = localStorage.getItem('ledBannerData');
        if (localSave) {
            const savedData = JSON.parse(localSave);
            console.log('Найдены локальные данные:', savedData);
            applySavedData(savedData);
            return;
        }
        
        // Пытаемся получить данные из Telegram
        if (tg.initDataUnsafe && tg.initDataUnsafe.start_param) {
            const savedData = JSON.parse(decodeURIComponent(tg.initDataUnsafe.start_param));
            console.log('Найдены данные от бота:', savedData);
            applySavedData(savedData);
        }
    } catch (e) {
        console.log('Нет сохраненных данных:', e);
    }
}

// ============================================
// ПРИМЕНЕНИЕ СОХРАНЕННЫХ ДАННЫХ
// ============================================
function applySavedData(savedData) {
    if (savedData.text) {
        currentText = savedData.text;
        textInput.value = currentText;
        scrollingText.textContent = currentText;
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
    
    // Применяем все настройки
    applyAllSettings();
}

// ============================================
// ФУНКЦИЯ ОТПРАВКИ ДАННЫХ В БОТА
// ============================================
function saveToBot() {
    const dataToSave = {
        text: scrollingText.textContent,
        color: currentColor,
        speed: currentSpeed,
        size: currentSize
    };
    
    console.log('Сохраняем:', dataToSave);
    
    // Сохраняем в localStorage (для теста)
    localStorage.setItem('ledBannerData', JSON.stringify(dataToSave));
    
    // Отправляем в бота
    if (tg) {
        try {
            tg.sendData(JSON.stringify({
                action: 'save_all',
                data: dataToSave
            }));
        } catch (e) {
            console.log('Ошибка отправки в бота:', e);
        }
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
    saveToBot();
}

// ============================================
// ФУНКЦИЯ ПРИМЕНЕНИЯ ВСЕХ НАСТРОЕК
// ============================================
function applyAllSettings() {
    console.log('Применяем настройки');
    
    // Размер
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    
    // Скорость
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
// ФУНКЦИЯ ПОКАЗА ЭЛЕМЕНТОВ (НОВЫЙ КРЕСТИК)
// ============================================
function toggleControls() {
    if (isRunning) {
        // Если бегущая строка запущена - показываем элементы
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    } else {
        // Если не запущена - прячем элементы и запускаем
        const text = textInput.value.trim();
        if (text !== '') {
            currentText = text;
            scrollingText.textContent = text;
            applyAllSettings();
        }
        
        inputArea.style.display = 'none';
        settingsBtn.style.display = 'none';
        isRunning = true;
        
        // Закрываем настройки если открыты
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
        
        saveToBot();
    }
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

// ЦВЕТ - клик
colorButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        let color = this.classList[1];
        setTextColor(color);
    });
});

// РАЗМЕР - изменение
sizeSlider.addEventListener('input', function() {
    currentSize = this.value;
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveToBot();
});

// СКОРОСТЬ - изменение
speedSlider.addEventListener('input', function() {
    currentSpeed = this.value;
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    saveToBot();
});

// ТЕКСТ - ввод
textInput.addEventListener('input', function() {
    currentText = this.value;
});

// RUN - теперь просто переключает видимость
runBtn.addEventListener('click', function() {
    toggleControls();
});

// КРЕСТИК - показывает элементы, НО НЕ СБРАСЫВАЕТ ТЕКСТ!
resetBtn.addEventListener('click', function() {
    if (isRunning) {
        // Если текст бежит - просто показываем элементы
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
        
        // Закрываем настройки
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else {
        // Если не бежит - просто закрываем настройки (если открыты)
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    }
});

// ШЕСТЕРЕНКА
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

// Закрытие настроек по клику вне
settingsPanel.addEventListener('click', function(e) {
    if (e.target === settingsPanel) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    }
});

// Enter
textInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        toggleControls();
    }
});

// ============================================
// ЗАГРУЗКА
// ============================================
window.addEventListener('load', function() {
    console.log('LED Banner загружен');
    
    // Загружаем сохраненные данные
    loadSavedData();
    
    // Применяем настройки
    applyAllSettings();
    
    // Убираем подсветку
    scrollingText.style.textShadow = 'none';
    
    // Показываем элементы при старте
    inputArea.style.display = 'flex';
    settingsBtn.style.display = 'flex';
    isRunning = false;
});

// ============================================
// TELEGRAM BACK BUTTON
// ============================================
tg.BackButton.onClick(function() {
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else if (isRunning) {
        // Если текст бежит - показываем элементы
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    } else {
        tg.close();
    }
});
tg.BackButton.show();

console.log('✅ LED Banner - Умный крестик и сохранение!');
