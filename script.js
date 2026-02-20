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

// ============================================
// ФУНКЦИИ ПРИМЕНЕНИЯ НАСТРОЕК (САМОЕ ВАЖНОЕ!)
// ============================================

// Функция применения настроек к тексту
function applySettings() {
    console.log('Applying settings:', { color: currentColor, speed: animationSpeed, size: sizeSlider.value });
    
    // Размер текста - ПРИМЕНЯЕМ СРАЗУ!
    const size = sizeSlider.value;
    scrollingText.style.fontSize = size + 'vw';
    sizeValue.textContent = size + 'vw';
    
    // Скорость анимации - ПРИМЕНЯЕМ СРАЗУ!
    animationSpeed = parseInt(speedSlider.value);
    speedValue.textContent = animationSpeed + ' сек';
    
    // Цвет текста - ПРИМЕНЯЕМ СРАЗУ! (без подсветки)
    scrollingText.style.color = currentColor;
    scrollingText.style.textShadow = 'none';
    
    // Обновляем активный цвет в кнопках
    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(currentColor)) {
            btn.classList.add('active');
        }
    });
    
    // Перезапускаем анимацию с новой скоростью
    restartAnimation();
    
    // Отправляем в бота (в фоне)
    if (tg) {
        try {
            tg.sendData(JSON.stringify({
                action: 'save_settings',
                color: currentColor,
                speed: animationSpeed,
                size: size
            }));
        } catch (e) {
            console.log('Error sending to bot:', e);
        }
    }
}

// Функция обновления текста
function updateText(newText) {
    if (!newText || newText.trim() === '') {
        textInput.value = scrollingText.textContent;
        return;
    }
    
    // Меняем текст
    scrollingText.textContent = newText;
    textInput.value = newText;
    
    // Обновляем скорость под новый текст
    updateSpeedByTextLength();
    
    // ВАЖНО: применяем текущие настройки к новому тексту
    applySettings();
    
    // Отправляем в бота
    if (tg) {
        try {
            tg.sendData(JSON.stringify({
                action: 'new_text',
                text: newText
            }));
        } catch (e) {
            console.log('Error sending to bot:', e);
        }
    }
    
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Функция перезапуска анимации
function restartAnimation() {
    // Сбрасываем анимацию
    scrollingText.style.animation = 'none';
    
    // Форсируем перерасчет
    void scrollingText.offsetWidth;
    
    // Запускаем заново с текущей скоростью
    scrollingText.style.animation = `scrollText ${animationSpeed}s linear infinite`;
}

// Функция обновления скорости по длине текста
function updateSpeedByTextLength() {
    const text = scrollingText.textContent;
    const length = text.length;
    
    // Чем длиннее текст, тем медленнее
    if (length > 50) {
        speedSlider.value = 20;
    } else if (length > 30) {
        speedSlider.value = 15;
    } else {
        speedSlider.value = 10;
    }
    
    // Применяем новую скорость
    animationSpeed = parseInt(speedSlider.value);
    speedValue.textContent = animationSpeed + ' сек';
}

// ============================================
// ФУНКЦИИ УПРАВЛЕНИЯ
// ============================================

function startRunning() {
    if (isRunning) return;
    
    isRunning = true;
    
    if (inputArea) inputArea.style.display = 'none';
    if (settingsBtn) settingsBtn.style.display = 'none';
    
    if (settingsVisible) {
        closeSettings();
    }
    
    console.log('Started running');
    
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

function stopRunning() {
    if (!isRunning) return;
    
    isRunning = false;
    
    if (inputArea) inputArea.style.display = 'flex';
    if (settingsBtn) settingsBtn.style.display = 'flex';
    
    console.log('Stopped running');
    
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

function resetAll() {
    const defaultText = 'LED бегущая строка';
    scrollingText.textContent = defaultText;
    textInput.value = defaultText;
    
    // Сбрасываем настройки в значения по умолчанию
    sizeSlider.value = 15;
    speedSlider.value = 15;
    currentColor = 'white';
    
    // ВАЖНО: применяем сброшенные настройки
    applySettings();
    
    stopRunning();
    
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

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

function closeSettings() {
    settingsVisible = false;
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
}

// ============================================
// ОБРАБОТЧИКИ СОБЫТИЙ
// ============================================

// RUN button
runBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    updateText(text);
    startRunning();
});

// Reset button (крестик)
resetBtn.addEventListener('click', resetAll);

// Settings button (шестеренка)
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

// Слайдер размера - ПРИМЕНЯЕТ НАСТРОЙКИ СРАЗУ!
sizeSlider.addEventListener('input', () => {
    applySettings();
});

// Слайдер скорости - ПРИМЕНЯЕТ НАСТРОЙКИ СРАЗУ!
speedSlider.addEventListener('input', () => {
    applySettings();
});

// Кнопки цвета - ПРИМЕНЯЮТ НАСТРОЙКИ СРАЗУ!
colorButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const colorClass = btn.classList[1]; // white, red, blue, green, yellow
        currentColor = colorClass;
        applySettings(); // ← ВАЖНО: применяем цвет сразу!
        
        if (tg && tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
    });
});

// Enter в поле ввода
textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        runBtn.click();
    }
});

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================

window.addEventListener('load', () => {
    console.log('Loading LED Banner...');
    
    // Применяем настройки по умолчанию
    applySettings();
    
    // Растягиваем на весь экран
    tg.expand();
    
    // Фокус на поле ввода
    textInput.focus();
    
    // Плавные переходы для цвета
    scrollingText.style.transition = 'color 0.3s';
    
    // Черный фон принудительно
    document.body.style.backgroundColor = '#000000';
    document.documentElement.style.backgroundColor = '#000000';
    
    // Убираем подсветку
    scrollingText.style.textShadow = 'none';
    
    // Показываем элементы
    inputArea.style.display = 'flex';
    settingsBtn.style.display = 'flex';
    isRunning = false;
    
    console.log('LED Banner loaded successfully');
});

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    restartAnimation();
});

// Кнопка назад в Telegram
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

// Убираем стандартные диалоги
window.alert = function() {};
window.confirm = function() { return true; };
window.prompt = function() { return ''; };

// Закрытие по свайпу вниз
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

// Экспорт функций
window.ledBanner = {
    updateText: updateText,
    reset: resetAll,
    applySettings: applySettings,
    start: startRunning,
    stop: stopRunning
};

console.log('LED Banner initialized with REAL-TIME settings!');
