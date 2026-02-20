// ============================================
// LED BANNER - РАБОЧАЯ ВЕРСИЯ С ЦВЕТАМИ
// ============================================

// Telegram
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();
tg.setHeaderColor('#000000');
tg.setBackgroundColor('#000000');

// Черный фон принудительно
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
let isRunning = false;

// ============================================
// ФУНКЦИЯ СМЕНЫ ЦВЕТА
// ============================================
function setTextColor(color) {
    console.log('Меняем цвет на:', color);
    
    // Убираем все классы цвета
    scrollingText.classList.remove('white', 'red', 'blue', 'green', 'yellow');
    
    // Добавляем новый класс
    scrollingText.classList.add(color);
    
    // Также применяем через style (на всякий случай)
    if (color === 'white') scrollingText.style.color = '#ffffff';
    if (color === 'red') scrollingText.style.color = '#ff3b30';
    if (color === 'blue') scrollingText.style.color = '#007aff';
    if (color === 'green') scrollingText.style.color = '#34c759';
    if (color === 'yellow') scrollingText.style.color = '#ffcc00';
    
    // Убираем подсветку
    scrollingText.style.textShadow = 'none';
    
    // Обновляем активную кнопку
    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(color)) {
            btn.classList.add('active');
        }
    });
    
    currentColor = color;
}

// ============================================
// ФУНКЦИЯ ПРИМЕНЕНИЯ НАСТРОЕК
// ============================================
function applySettings() {
    console.log('Применяем настройки');
    
    // Размер (теперь до 40)
    let size = sizeSlider.value;
    scrollingText.style.fontSize = size + 'vw';
    sizeValue.textContent = size + 'vw';
    
    // Скорость (теперь от 2)
    currentSpeed = speedSlider.value;
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    
    // Цвет
    setTextColor(currentColor);
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
        
        if (tg) {
            tg.sendData(JSON.stringify({
                action: 'save_settings',
                color: color,
                speed: currentSpeed,
                size: sizeSlider.value
            }));
        }
    });
});

// Размер
sizeSlider.addEventListener('input', function() {
    scrollingText.style.fontSize = this.value + 'vw';
    sizeValue.textContent = this.value + 'vw';
});

// Скорость
speedSlider.addEventListener('input', function() {
    currentSpeed = this.value;
    speedValue.textContent = this.value + ' сек';
    restartAnimation();
});

// RUN
runBtn.addEventListener('click', function() {
    let text = textInput.value.trim();
    if (text === '') text = 'LED бегущая строка';
    
    scrollingText.textContent = text;
    applySettings();
    
    inputArea.style.display = 'none';
    settingsBtn.style.display = 'none';
    isRunning = true;
    
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
    
    if (tg) {
        tg.sendData(JSON.stringify({
            action: 'new_text',
            text: text
        }));
    }
});

// RESET
resetBtn.addEventListener('click', function() {
    scrollingText.textContent = 'LED бегущая строка';
    textInput.value = 'LED бегущая строка';
    
    sizeSlider.value = 15;
    speedSlider.value = 15;
    setTextColor('white');
    
    applySettings();
    
    inputArea.style.display = 'flex';
    settingsBtn.style.display = 'flex';
    isRunning = false;
    
    if (tg) {
        tg.sendData(JSON.stringify({
            action: 'reset',
            text: 'LED бегущая строка'
        }));
    }
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
    
    scrollingText.textContent = 'LED бегущая строка';
    textInput.value = 'LED бегущая строка';
    
    // Устанавливаем начальные значения слайдеров
    sizeSlider.value = 15;
    speedSlider.value = 15;
    
    applySettings();
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

console.log('✅ LED Banner готов! Теперь размер до 40, скорость от 2 сек');
