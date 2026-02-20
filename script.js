// Игнорируем тему Telegram - всегда темная тема
if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.setHeaderColor('#000000');
    window.Telegram.WebApp.setBackgroundColor('#000000');
    window.Telegram.WebApp.expand();
}

// Принудительно устанавливаем черный фон
document.documentElement.style.backgroundColor = '#000000';
document.body.style.backgroundColor = '#000000';
document.body.style.color = '#ffffff';

// Инициализация Telegram Mini App
let tg = window.Telegram.WebApp;

// Говорим Telegram, что приложение готово
tg.ready();

// Растягиваем на весь экран
tg.expand();

// Получаем элементы
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

// Переменные
let animationSpeed = 15;
let currentColor = 'white';
let settingsVisible = false;
let isRunning = false;

// Функция обновления текста
function updateText(newText) {
    if (!newText || newText.trim() === '') {
        textInput.value = scrollingText.textContent;
        return;
    }
    
    scrollingText.textContent = newText;
    textInput.value = newText;
    
    updateSpeedByTextLength();
    restartAnimation();
    
    // Отправляем данные боту
    sendToBot('new_text', { text: newText });
    
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Функция отправки данных в бота
function sendToBot(action, data) {
    if (!tg) return;
    
    try {
        const payload = {
            action: action,
            ...data,
            timestamp: Date.now()
        };
        
        console.log('Sending to bot:', payload);
        tg.sendData(JSON.stringify(payload));
    } catch (e) {
        console.log('Error sending to bot:', e);
    }
}

// Функция запуска бегущей строки
function startRunning() {
    if (isRunning) return;
    
    isRunning = true;
    
    if (inputArea) inputArea.style.display = 'none';
    if (settingsBtn) settingsBtn.style.display = 'none';
    
    if (settingsVisible) {
        closeSettings();
    }
    
    console.log('Started running - elements hidden');
    
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Функция остановки бегущей строки
function stopRunning() {
    if (!isRunning) return;
    
    isRunning = false;
    
    if (inputArea) inputArea.style.display = 'flex';
    if (settingsBtn) settingsBtn.style.display = 'flex';
    
    console.log('Stopped running - elements shown');
    
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Функция сброса всего
function resetAll() {
    const defaultText = 'LED бегущая строка';
    scrollingText.textContent = defaultText;
    textInput.value = defaultText;
    
    sizeSlider.value = 15;
    speedSlider.value = 15;
    currentColor = 'white';
    
    applySettings();
    updateSpeedByTextLength();
    restartAnimation();
    
    stopRunning();
    
    // Отправляем сброс в бота
    sendToBot('reset', { text: defaultText });
    
    if (tg && tg.HapticFeedback) {
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
    // Размер
    const size = sizeSlider.value;
    scrollingText.style.fontSize = size + 'vw';
    sizeValue.textContent = size + 'vw';
    
    // Скорость
    animationSpeed = parseInt(speedSlider.value);
    speedValue.textContent = animationSpeed + ' сек';
    
    // Цвет - БЕЗ ПОДСВЕТКИ
    scrollingText.style.color = currentColor;
    scrollingText.style.textShadow = 'none';
    
    // Обновляем активный цвет
    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(currentColor)) {
            btn.classList.add('active');
        }
    });
    
    // Перезапускаем анимацию
    restartAnimation();
    
    // Отправляем настройки в бота
    sendToBot('save_settings', {
        color: currentColor,
        speed: animationSpeed,
        size: size
    });
    
    console.log('Settings applied:', { color: currentColor, speed: animationSpeed, size: size });
}

// Функция обновления скорости по длине текста
function updateSpeedByTextLength() {
    const text = scrollingText.textContent;
    const length = text.length;
    
    if (length > 50) {
        speedSlider.value = 20;
    } else if (length > 30) {
        speedSlider.value = 15;
    } else {
        speedSlider.value = 10;
    }
    
    animationSpeed = parseInt(speedSlider.value);
    speedValue.textContent = animationSpeed + ' сек';
}

// Функция открытия/закрытия настроек
function toggleSettings() {
    if (isRunning) return;
    
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

// Обработчик RUN
runBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    updateText(text);
    startRunning();
});

// Обработчик крестика
resetBtn.addEventListener('click', resetAll);

// Обработчик шестеренки
settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isRunning) {
        toggleSettings();
    }
});

// Закрытие настроек по клику вне
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
        const colorClass = btn.classList[1];
        currentColor = colorClass;
        applySettings();
        
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    });
});

// Обработка Enter
textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        runBtn.click();
    }
});

// Загрузка
window.addEventListener('load', () => {
    applySettings();
    tg.expand();
    textInput.focus();
    
    scrollingText.style.transition = 'color 0.3s';
    document.body.style.backgroundColor = '#000000';
    document.documentElement.style.backgroundColor = '#000000';
    scrollingText.style.textShadow = 'none';
    
    inputArea.style.display = 'flex';
    settingsBtn.style.display = 'flex';
    isRunning = false;
    
    console.log('LED Banner loaded');
    
    // Отправляем сообщение о загрузке
    setTimeout(() => {
        sendToBot('app_loaded', {});
    }, 1000);
});

// Ресайз
window.addEventListener('resize', () => {
    restartAnimation();
});

// Кнопка назад
if (tg) {
    tg.BackButton.onClick(() => {
        if (settingsVisible) {
            closeSettings();
        } else if (isRunning) {
            stopRunning();
        } else {
            tg.close();
        }
    });
    tg.BackButton.show();
}

// Полный экран
function setFullScreen() {
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    if (tg) tg.expand();
}

setFullScreen();
if (tg) tg.onEvent('viewportChanged', setFullScreen);

// Убираем диалоги
window.alert = function() {};
window.confirm = function() { return true; };
window.prompt = function() { return ''; };

// Закрытие по свайпу
let touchStartY = 0;
settingsPanel.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

settingsPanel.addEventListener('touchmove', (e) => {
    if (!settingsVisible) return;
    
    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY;
    
    if (diff > 50) {
        closeSettings();
    }
});

// Защита от подсветки
setInterval(() => {
    if (scrollingText.style.textShadow !== 'none') {
        scrollingText.style.textShadow = 'none';
    }
}, 1000);

// Экспорт
window.ledBanner = {
    updateText: updateText,
    reset: resetAll,
    start: startRunning,
    stop: stopRunning,
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
    },
    closeSettings: closeSettings
};

console.log('LED Banner initialized with settings fix');
