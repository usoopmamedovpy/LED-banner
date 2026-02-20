// Инициализация Telegram Mini App
let tg = window.Telegram.WebApp;

// Говорим Telegram, что приложение готово
tg.ready();

// Растягиваем на весь экран (максимально)
tg.expand();

// Запрашиваем полный экран
tg.setHeaderColor('#000000');
tg.setBackgroundColor('#000000');

// Настройка цветов под тему Telegram
document.body.style.background = tg.themeParams.bg_color || '#000000';

// Получаем элементы
const scrollingText = document.getElementById('scrollingText');
const textInput = document.getElementById('textInput');
const runBtn = document.getElementById('runBtn');
const bannerArea = document.getElementById('bannerArea');

// Переменная для скорости анимации
let animationSpeed = 15; // секунд на полный проход

// Функция обновления текста
function updateText(newText) {
    if (!newText || newText.trim() === '') return;
    
    scrollingText.textContent = newText;
    
    // Перезапускаем анимацию
    restartAnimation();
    
    // Вибрация при обновлении
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('light');
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

// Обработчик кнопки RUN
runBtn.addEventListener('click', () => {
    const text = textInput.value.trim();
    if (text) {
        updateText(text);
    } else {
        // Если пусто - возвращаем предыдущий текст
        textInput.value = scrollingText.textContent;
    }
});

// Обработка ввода с клавиатуры
textInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        runBtn.click();
    }
});

// Автоматический запуск при загрузке
window.addEventListener('load', () => {
    // Настраиваем скорость в зависимости от длины текста
    updateSpeedByTextLength();
    
    // Растягиваем на весь экран
    tg.expand();
});

// Адаптация скорости под длину текста
function updateSpeedByTextLength() {
    const text = scrollingText.textContent;
    const length = text.length;
    
    // Чем длиннее текст, тем быстрее анимация (чтобы не ждать вечно)
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
runBtn.addEventListener('click', () => {
    updateSpeedByTextLength();
});

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

// Экспортируем функции для глобального доступа
window.ledBanner = {
    updateText: updateText,
    setSpeed: (seconds) => {
        animationSpeed = seconds;
        restartAnimation();
    }
};

// Дополнительная настройка для полного экрана
function setFullScreen() {
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    tg.expand();
}

// Вызываем при старте
setFullScreen();

// Следим за изменениями в Telegram
tg.onEvent('viewportChanged', setFullScreen);
