// Инициализация Telegram Mini App
let tg = window.Telegram.WebApp;

// Говорим Telegram, что приложение готово
tg.ready();

// Растягиваем на весь экран
tg.expand();

// Настройка цветов под тему Telegram
document.body.style.background = tg.themeParams.bg_color || '#000000';

// Получаем данные пользователя (если нужно)
let user = tg.initDataUnsafe?.user;
console.log('Пользователь:', user?.first_name);

// Элементы для десктопа
const desktopBanner = document.getElementById('ledBanner');
const bannerText = document.getElementById('bannerText');
const runButton = document.getElementById('runButton');

// Элементы для мобилки
const mobileInput = document.getElementById('mobileInput');
const mobileRunButton = document.getElementById('mobileRunButton');
const scrollingText = document.getElementById('scrollingText');

// Состояние анимации
let isScrolling = false;

// Функция для запуска анимации на десктопе
function startDesktopScroll(text) {
    bannerText.textContent = text;
    bannerText.classList.add('scrolling');
    isScrolling = true;
}

// Функция для остановки анимации на десктопе
function stopDesktopScroll() {
    bannerText.classList.remove('scrolling');
    isScrolling = false;
}

// Функция для обновления текста на мобилке
function updateMobileText(text) {
    scrollingText.textContent = text;
    // Перезапускаем анимацию
    scrollingText.style.animation = 'none';
    scrollingText.offsetHeight; // Форсируем reflow
    scrollingText.style.animation = 'scrollMobile 15s linear infinite';
}

// Обработчик для десктопной кнопки
runButton.addEventListener('click', () => {
    // Здесь можно открыть диалог для ввода текста
    // Но для простоты будем использовать prompt
    const newText = prompt('Введите текст для бегущей строки:', bannerText.textContent);
    
    if (newText && newText.trim() !== '') {
        startDesktopScroll(newText);
        
        // Отправляем событие в Telegram (опционально)
        tg.sendData(JSON.stringify({
            action: 'update_text',
            text: newText,
            device: 'desktop'
        }));
    }
});

// Обработчик для мобильной кнопки
mobileRunButton.addEventListener('click', () => {
    const text = mobileInput.value.trim();
    
    if (text) {
        updateMobileText(text);
        
        // Вибрация (если поддерживается)
        if (tg.HapticFeedback) {
            tg.HapticFeedback.impactOccurred('light');
        }
        
        // Отправляем событие в Telegram
        tg.sendData(JSON.stringify({
            action: 'start_scroll',
            text: text,
            device: 'mobile'
        }));
    } else {
        // Если текст пустой, показываем ошибку
        mobileInput.style.borderColor = 'red';
        setTimeout(() => {
            mobileInput.style.borderColor = 'white';
        }, 500);
    }
});

// Обработка ввода с клавиатуры на мобилке
mobileInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        mobileRunButton.click();
    }
});

// Автоматический запуск при загрузке
window.addEventListener('load', () => {
    // Проверяем, мобилка или десктоп
    if (window.innerWidth <= 768) {
        // Мобилка: запускаем с текстом по умолчанию
        updateMobileText('LED бегущая строка');
    } else {
        // Десктоп: пока просто показываем статичный текст
        bannerText.textContent = 'LED бегущая строка';
    }
});

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    if (window.innerWidth <= 768) {
        // Переключаемся на мобильный режим
        if (scrollingText.textContent !== mobileInput.value) {
            updateMobileText(mobileInput.value || 'LED бегущая строка');
        }
    }
});

// Функция для закрытия приложения
function closeApp() {
    tg.close();
}

// Обработка кнопки назад в Telegram
tg.BackButton.onClick(() => {
    if (isScrolling) {
        stopDesktopScroll();
        tg.BackButton.hide();
    } else {
        closeApp();
    }
});

// Показываем кнопку назад только если анимация запущена
runButton.addEventListener('click', () => {
    if (window.innerWidth > 768) {
        tg.BackButton.show();
    }
});

// Для мобильной версии показываем кнопку назад всегда
if (window.innerWidth <= 768) {
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
        closeApp();
    });
}

// Экспортируем функции для глобального доступа (если нужно)
window.ledBanner = {
    startScroll: startDesktopScroll,
    stopScroll: stopDesktopScroll,
    updateText: updateMobileText
};