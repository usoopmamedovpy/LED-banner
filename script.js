// ============================================
// LED BANNER - УПРОЩЕННАЯ РАБОЧАЯ ВЕРСИЯ
// ============================================

// Принудительно черный фон
document.documentElement.style.backgroundColor = '#000000';
document.body.style.backgroundColor = '#000000';
document.body.style.color = '#ffffff';

// Telegram
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// ============================================
// ПОЛУЧАЕМ ВСЕ ЭЛЕМЕНТЫ
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
let isRunning = false;

// ============================================
// ФУНКЦИЯ ПРИМЕНЕНИЯ ВСЕХ НАСТРОЕК (САМАЯ ВАЖНАЯ)
// ============================================
function applyAllSettings() {
    console.log('Применяем настройки...');
    
    // 1. РАЗМЕР
    let size = sizeSlider.value;
    scrollingText.style.fontSize = size + 'vw';
    sizeValue.textContent = size + 'vw';
    
    // 2. СКОРОСТЬ
    currentSpeed = speedSlider.value;
    speedValue.textContent = currentSpeed + ' сек';
    
    // 3. ЦВЕТ
    scrollingText.style.color = currentColor;
    scrollingText.style.textShadow = 'none';
    
    // 4. ПЕРЕЗАПУСК АНИМАЦИИ
    restartAnimation();
    
    console.log('Текущие настройки:', {
        размер: size + 'vw',
        скорость: currentSpeed + ' сек',
        цвет: currentColor
    });
}

// ============================================
// ФУНКЦИЯ ПЕРЕЗАПУСКА АНИМАЦИИ
// ============================================
function restartAnimation() {
    // Убираем анимацию
    scrollingText.style.animation = 'none';
    
    // Принудительный перерасчет
    scrollingText.offsetHeight;
    
    // Запускаем заново с новой скоростью
    scrollingText.style.animation = `scrollText ${currentSpeed}s linear infinite`;
}

// ============================================
// ФУНКЦИЯ ОБНОВЛЕНИЯ ТЕКСТА
// ============================================
function updateDisplayText(newText) {
    if (!newText || newText.trim() === '') return;
    
    // Меняем текст
    scrollingText.textContent = newText;
    textInput.value = newText;
    
    // Применяем настройки к новому тексту
    applyAllSettings();
}

// ============================================
// ОБРАБОТЧИКИ НАСТРОЕК (ПРЯМОЕ ПРИМЕНЕНИЕ)
// ============================================

// Размер - применяем сразу при движении
sizeSlider.addEventListener('input', function() {
    scrollingText.style.fontSize = this.value + 'vw';
    sizeValue.textContent = this.value + 'vw';
    console.log('Размер изменен:', this.value + 'vw');
});

// Скорость - применяем сразу
speedSlider.addEventListener('input', function() {
    currentSpeed = this.value;
    speedValue.textContent = this.value + ' сек';
    restartAnimation();
    console.log('Скорость изменена:', this.value + ' сек');
});

// Цвет - применяем сразу
colorButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        // Убираем активный класс у всех
        colorButtons.forEach(b => b.classList.remove('active'));
        
        // Добавляем активный класс текущей кнопке
        this.classList.add('active');
        
        // Получаем цвет из класса
        let color = this.classList[1]; // white, red, blue, green, yellow
        currentColor = color;
        
        // Применяем цвет
        scrollingText.style.color = color;
        
        console.log('Цвет изменен:', color);
    });
});

// ============================================
// КНОПКА RUN
// ============================================
runBtn.addEventListener('click', function() {
    let text = textInput.value.trim();
    if (text === '') {
        text = 'LED бегущая строка';
        textInput.value = text;
    }
    
    // Обновляем текст
    scrollingText.textContent = text;
    
    // Применяем настройки
    applyAllSettings();
    
    // Прячем элементы
    inputArea.style.display = 'none';
    settingsBtn.style.display = 'none';
    isRunning = true;
    
    // Закрываем настройки если открыты
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    }
});

// ============================================
// КНОПКА RESET (КРЕСТИК)
// ============================================
resetBtn.addEventListener('click', function() {
    // Возвращаем текст по умолчанию
    let defaultText = 'LED бегущая строка';
    scrollingText.textContent = defaultText;
    textInput.value = defaultText;
    
    // Сбрасываем настройки
    sizeSlider.value = 15;
    speedSlider.value = 15;
    currentColor = 'white';
    
    // Убираем активные классы у цветов
    colorButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector('.color-btn.white').classList.add('active');
    
    // Применяем сброшенные настройки
    applyAllSettings();
    
    // Показываем элементы обратно
    inputArea.style.display = 'flex';
    settingsBtn.style.display = 'flex';
    isRunning = false;
});

// ============================================
// КНОПКА НАСТРОЕК (ШЕСТЕРЕНКА)
// ============================================
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

// ============================================
// ЗАКРЫТИЕ НАСТРОЕК ПО КЛИКУ ВНЕ
// ============================================
settingsPanel.addEventListener('click', function(e) {
    if (e.target === settingsPanel) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    }
});

// ============================================
// ENTER В ПОЛЕ ВВОДА
// ============================================
textInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        runBtn.click();
    }
});

// ============================================
// ЗАГРУЗКА СТРАНИЦЫ
// ============================================
window.addEventListener('load', function() {
    console.log('LED Banner загружен');
    
    // Устанавливаем начальные значения
    scrollingText.textContent = 'LED бегущая строка';
    textInput.value = 'LED бегущая строка';
    
    // Применяем настройки по умолчанию
    applyAllSettings();
    
    // Убираем подсветку
    scrollingText.style.textShadow = 'none';
    
    // Черный фон
    document.body.style.backgroundColor = '#000000';
});

// ============================================
// КНОПКА НАЗАД В TELEGRAM
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

// ============================================
// ЗАЩИТА ОТ ПОДСВЕТКИ
// ============================================
setInterval(function() {
    if (scrollingText.style.textShadow !== 'none') {
        scrollingText.style.textShadow = 'none';
    }
}, 500);

console.log('✅ LED Banner готов к работе!');
