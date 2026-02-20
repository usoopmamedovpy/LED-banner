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
const inputArea = document.querySelector('.input-area'); // Добавляем поле ввода и RUN

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
let isRunning = false; // Состояние: запущена ли бегущая строка

// Функция обновления текста
function updateText(newText) {
    if (!newText || newText.trim() === '') {
        // Если текст пустой, возвращаем предыдущий
        textInput.value = scrollingText.textContent;
        return;
    }
    
    scrollingText.textContent = newText;
    textInput.value = newText;
    
    // Обновляем скорость в зависимости от длины текста
    updateSpeedByTextLength();
    restartAnimation();
    
    // Отправляем данные боту для сохранения
    if (tg) {
        try {
            tg.sendData(JSON.stringify({
                action: 'new_text',
                text: newText
            }));
        } catch (e) {
            console.log('Error sending data:', e);
        }
    }
    
    // Вибрация при обновлении
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Функция запуска бегущей строки (скрывает элементы управления)
function startRunning() {
    if (isRunning) return; // Уже запущено
    
    isRunning = true;
    
    // Прячем элементы управления
    inputArea.style.display = 'none'; // Прячем поле ввода и кнопку RUN
    settingsBtn.style.display = 'none'; // Прячем шестеренку
    
    // Если настройки открыты, закрываем их
    if (settingsVisible) {
        closeSettings();
    }
    
    // Вибрация при запуске
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Функция остановки бегущей строки (возвращает элементы управления)
function stopRunning() {
    if (!isRunning) return; // Уже остановлено
    
    isRunning = false;
    
    // Показываем элементы управления
    inputArea.style.display = 'flex'; // Показываем поле ввода и кнопку RUN
    settingsBtn.style.display = 'flex'; // Показываем шестеренку
    
    // Вибрация при остановке
    if (tg && tg.HapticFeedback) {
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
    updateSpeedByTextLength();
    restartAnimation();
    
    // Останавливаем бегущую строку (возвращаем элементы)
    stopRunning();
    
    // Вибрация при сбросе
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Функция перезапуска анимации
function restartAnimation() {
    // Сбрасываем анимацию
    scrollingText.style.animation = 'none';
    
    // Форсируем перерасчет (reflow)
    void scrollingText.offsetWidth;
    
    // Запускаем заново
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
    
    // Цвет - БЕЗ ПОДСВЕТКИ (просто цвет)
    scrollingText.style.color = currentColor;
    scrollingText.style.textShadow = 'none'; // Полностью убираем подсветку
    
    // Обновляем активный цвет в кнопках
    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(currentColor)) {
            btn.classList.add('active');
        }
    });
    
    // Перезапускаем анимацию с новой скоростью
    restartAnimation();
    
    // Отправляем настройки боту
    if (tg) {
        try {
            tg.sendData(JSON.stringify({
                action: 'save_settings',
                color: currentColor,
                speed: animationSpeed,
                size: size
            }));
        } catch (e) {
            console.log('Error sending settings:', e);
        }
    }
}

// Функция обновления скорости в зависимости от длины текста
function updateSpeedByTextLength() {
    const text = scrollingText.textContent;
    const length = text.length;
    
    // Чем длиннее текст, тем медленнее (чтобы можно было прочитать)
    if (length > 50) {
        speedSlider.value = 20;
    } else if (length > 30) {
        speedSlider.value = 15;
    } else {
        speedSlider.value = 10;
    }
    
    // Обновляем отображение скорости
    animationSpeed = parseInt(speedSlider.value);
    speedValue.textContent = animationSpeed + ' сек';
}

// Функция открытия/закрытия настроек
function toggleSettings() {
    if (isRunning) return; // Если бегущая строка запущена, не открываем настройки
    
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
    updateText(text);
    startRunning(); // Запускаем бегущую строку и скрываем элементы
});

// Обработчик крестика
resetBtn.addEventListener('click', () => {
    resetAll();
    // stopRunning() уже вызывается внутри resetAll
});

// Обработчик шестеренки
settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!isRunning) { // Только если не запущена бегущая строка
        toggleSettings();
    }
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
        // Получаем цвет из класса кнопки
        const colorClass = btn.classList[1]; // white, red, blue, green, yellow
        currentColor = colorClass;
        applySettings();
        
        // Вибрация при выборе цвета
        if (tg && tg.HapticFeedback) {
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
    // Применяем настройки по умолчанию
    applySettings();
    
    // Растягиваем на весь экран
    tg.expand();
    
    // Фокус на поле ввода
    textInput.focus();
    
    // Плавные переходы для цвета
    scrollingText.style.transition = 'color 0.3s';
    
    // Еще раз принудительно ставим черный фон
    document.body.style.backgroundColor = '#000000';
    document.documentElement.style.backgroundColor = '#000000';
    
    // Убираем подсветку принудительно
    scrollingText.style.textShadow = 'none';
    
    // Убеждаемся, что все элементы видны при старте
    inputArea.style.display = 'flex';
    settingsBtn.style.display = 'flex';
    isRunning = false;
});

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    restartAnimation();
});

// Обработка кнопки назад в Telegram
if (tg) {
    tg.BackButton.onClick(() => {
        if (settingsVisible) {
            closeSettings();
        } else if (isRunning) {
            stopRunning(); // Если бегущая строка запущена, останавливаем
        } else {
            tg.close();
        }
    });
    tg.BackButton.show();
}

// Функция для полного экрана
function setFullScreen() {
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    if (tg) tg.expand();
}

// Устанавливаем полный экран при загрузке
setFullScreen();

// Следим за изменениями в Telegram
if (tg) {
    tg.onEvent('viewportChanged', setFullScreen);
}

// Убираем все стандартные диалоги (промпты, алерты)
window.alert = function() {};
window.confirm = function() { return true; };
window.prompt = function() { return ''; };

// Закрытие по свайпу вниз (для мобилок)
let touchStartY = 0;
settingsPanel.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

settingsPanel.addEventListener('touchmove', (e) => {
    if (!settingsVisible) return;
    
    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY;
    
    if (diff > 50) { // Свайп вниз больше 50px
        closeSettings();
    }
});

// Экспортируем функции для глобального доступа (на всякий случай)
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

// Дополнительная защита от подсветки (каждую секунду проверяем)
setInterval(() => {
    if (scrollingText.style.textShadow !== 'none') {
        scrollingText.style.textShadow = 'none';
    }
}, 1000);

console.log('LED Banner initialized with HIDE-ON-RUN feature');
