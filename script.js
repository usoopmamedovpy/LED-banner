// Инициализация Telegram Mini App
let tg = window.Telegram.WebApp;

// Говорим Telegram, что приложение готово
tg.ready();

// Растягиваем на весь экран
tg.expand();
tg.setHeaderColor('#000000');
tg.setBackgroundColor('#000000');

// Настройка цветов под тему Telegram
document.body.style.background = tg.themeParams.bg_color || '#000000';

// Получаем элементы
const scrollingText = document.getElementById('scrollingText');
const textInput = document.getElementById('textInput');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const bannerArea = document.getElementById('bannerArea');

// Элементы настроек
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const colorButtons = document.querySelectorAll('.color-btn');

// Переменные
let animationSpeed = 15;
let currentColor = 'white';
let settingsVisible = false;

// Функция обновления текста
function updateText(newText) {
    if (!newText || newText.trim() === '') return;
    
    scrollingText.textContent = newText;
    textInput.value = newText;
    
    restartAnimation();
    
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Функция сброса всего
function resetAll() {
    const defaultText = 'LED бегущая строка';
    scrollingText.textContent = defaultText;
    textInput.value = defaultText;
    
    // Сбрасываем настройки
    sizeSlider.value = 15;
    speedSlider.value = 15;
    currentColor = 'white';
    
    applySettings();
    restartAnimation();
    
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Функция перезапуска анимации
function restartAnimation() {
    scrollingText.style.animation = 'none';
    void scrollingText.offsetWidth;
    scrollingText.style.animation = `scrollText ${animationSpeed}s linear infinite`;
}

// Функция применения настроек
function applySettings() {
    // Размер текста
    const size = sizeSlider.value;
    scrollingText.style.fontSize = size + 'vw';
    sizeValue.textContent = size + 'vw';
    
    // Скорость
    animationSpeed = parseInt(speedSlider.value);
    speedValue.textContent = animationSpeed + ' сек';
    restartAnimation();
    
    // Цвет
    scrollingText.style.color = currentColor;
    scrollingText.style.textShadow = `0 0 20px ${currentColor}`;
    
    // Обновляем активный цвет в кнопках
    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(currentColor)) {
            btn.classList.add('active');
        }
    });
}

// Функция открытия/закрытия настроек
function toggleSettings() {
    settingsVisible = !settingsVisible;
    
    if (settingsVisible) {
        settingsPanel.classList.add('show');
        settingsBtn.classList.add('active');
    } else {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    }
}

// Функция закрытия настроек
function closeSettings() {
    settingsVisible = false;
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
}

// Обработчик кнопки RUN
runBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (text) {
        updateText(text);
    }
});

// Обработчик крестика
resetBtn.addEventListener('click', resetAll);

// Обработчик шестеренки
settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSettings();
});

// Закрытие по клику вне настроек
settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
        closeSettings();
    }
});

// Обработчики слайдеров
sizeSlider.addEventListener('input', applySettings);
speedSlider.addEventListener('input', applySettings);

// Обработчики цветов
colorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        currentColor = btn.classList[1]; // white, red, blue, etc.
        applySettings();
        
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    });
});

// Обработка ввода с клавиатуры
textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        runBtn.click();
    }
});

// Автоматический запуск при загрузке
window.addEventListener('load', () => {
    applySettings();
    tg.expand();
    textInput.focus();
    
    // Добавляем поддержку цветов
    scrollingText.style.transition = 'color 0.3s, text-shadow 0.3s';
});

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    restartAnimation();
});

// Обработка кнопки назад в Telegram
tg.BackButton.onClick(() => {
    if (settingsVisible) {
        closeSettings();
    } else {
        tg.close();
    }
});

// Показываем кнопку назад
tg.BackButton.show();

// Функция для полного экрана
function setFullScreen() {
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    tg.expand();
}

setFullScreen();
tg.onEvent('viewportChanged', setFullScreen);

// Убираем промпт
window.alert = function() {};
window.confirm = function() {};
window.prompt = function() { return ''; };

// Экспортируем функции
window.ledBanner = {
    updateText: updateText,
    reset: resetAll,
    setSpeed: (speed) => {
        speedSlider.value = speed;
        applySettings();
    },
    setSize: (size) => {
        sizeSlider.value = size;
        applySettings();
    },
    setColor: (color) => {
        if (['white', 'red', 'blue', 'green', 'yellow'].includes(color)) {
            currentColor = color;
            applySettings();
        }
    }
};

// Закрытие по свайпу вниз (для мобилок)
let touchStartY = 0;
settingsPanel.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

settingsPanel.addEventListener('touchmove', (e) => {
    if (!settingsVisible) return;
    
    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY;
    
    if (diff > 50) { // Свайп вниз
        closeSettings();
    }
});
