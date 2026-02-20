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
const bannerArea = document.getElementById('bannerArea');

// Переменная для скорости анимации
let animationSpeed = 15;

// Функция обновления текста
function updateText(newText) {
    if (!newText || newText.trim() === '') return;
    
    scrollingText.textContent = newText;
    textInput.value = newText; // Синхронизируем поле ввода
    
    // Перезапускаем анимацию
    restartAnimation();
    
    // Вибрация при обновлении
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
    }
}

// Функция сброса всего
function resetAll() {
    // Возвращаем текст по умолчанию
    const defaultText = 'LED бегущая строка';
    scrollingText.textContent = defaultText;
    textInput.value = defaultText;
    
    // Перезапускаем анимацию
    restartAnimation();
    
    // Вибрация при сбросе
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }
}

// Функция перезапуска анимации
function restartAnimation() {
    // Сбрасываем анимацию
    scrollingText.style.animation = 'none';
    
    // Форсируем перерасчет
    void scrollingText.offsetWidth;
    
    // Запускаем заново
    scrollingText.style.animation = `scrollText ${animationSpeed}s linear infinite`;
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

// Обработка ввода с клавиатуры
textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        runBtn.click();
    }
});

// Автоматический запуск при загрузке
window.addEventListener('load', () => {
    updateSpeedByTextLength();
    tg.expand();
    
    // Убеждаемся, что поле ввода активно
    textInput.focus();
});

// Адаптация скорости под длину текста
function updateSpeedByTextLength() {
    const text = scrollingText.textContent;
    const length = text.length;
    
    if (length > 50) {
        animationSpeed = 20;
    } else if (length > 30) {
        animationSpeed = 15;
    } else {
        animationSpeed = 10;
    }
    
    restartAnimation();
}

// Обновляем скорость при изменении текста
runBtn.addEventListener('click', updateSpeedByTextLength);
resetBtn.addEventListener('click', updateSpeedByTextLength);

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    restartAnimation();
});

// Обработка кнопки назад в Telegram
tg.BackButton.onClick(() => {
    tg.close();
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

// Убираем промпт полностью - он больше не появится
// Запрещаем любые стандартные диалоги
window.alert = function() {};
window.confirm = function() {};
window.prompt = function() { return ''; };

// Экспортируем функции
window.ledBanner = {
    updateText: updateText,
    reset: resetAll,
    setSpeed: (seconds) => {
        animationSpeed = seconds;
        restartAnimation();
    }
};
