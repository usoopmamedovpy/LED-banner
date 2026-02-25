// ============================================
// LED BANNER MATH - ПОЛНАЯ ВЕРСИЯ
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
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const inputArea = document.querySelector('.input-area');

// MATH элементы
const mathInput = document.getElementById('mathInput');
const mathBtn = document.getElementById('mathBtn');
const mathPanel = document.getElementById('mathPanel');
const mathCatBtns = document.querySelectorAll('.math-cat-btn');
const mathCategories = document.querySelectorAll('.math-category');
const mathSymbols = document.querySelectorAll('.math-symbol');

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
let isRunning = false;
let mathPanelVisible = false;

// ============================================
// ИНИЦИАЛИЗАЦИЯ MATHLIVE
// ============================================
if (mathInput) {
    mathInput.setOptions({
        smartFence: true,
        virtualKeyboardMode: 'off',
        smartMode: true,
        inlineShortcuts: {
            'sqrt': '\\sqrt{}',
            'frac': '\\frac{}{}',
            'alpha': '\\alpha',
            'beta': '\\beta',
            'gamma': '\\gamma',
            'delta': '\\delta',
            'pi': '\\pi',
            'sum': '\\sum',
            'int': '\\int'
        }
    });
}

// ============================================
// ЗАГРУЗКА СОХРАНЕННЫХ ДАННЫХ
// ============================================
function loadSavedData() {
    try {
        const localSave = localStorage.getItem('ledBannerMathData');
        if (localSave) {
            const savedData = JSON.parse(localSave);
            applySavedData(savedData);
        }
        
        if (tg.initDataUnsafe && tg.initDataUnsafe.start_param) {
            const savedData = JSON.parse(decodeURIComponent(tg.initDataUnsafe.start_param));
            applySavedData(savedData);
        }
    } catch (e) {
        console.log('Нет сохраненных данных');
    }
}

function applySavedData(savedData) {
    if (savedData.text && mathInput) {
        mathInput.setValue(savedData.text);
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
    
    applyAllSettings();
}

// ============================================
// СОХРАНЕНИЕ ДАННЫХ
// ============================================
function saveToBot() {
    const dataToSave = {
        text: mathInput ? mathInput.getValue() : '',
        color: currentColor,
        speed: currentSpeed,
        size: currentSize
    };
    
    localStorage.setItem('ledBannerMathData', JSON.stringify(dataToSave));
    
    if (tg) {
        try {
            tg.sendData(JSON.stringify({
                action: 'save_all',
                data: dataToSave
            }));
        } catch (e) {
            console.log('Ошибка отправки');
        }
    }
}

// ============================================
// ОТОБРАЖЕНИЕ ФОРМУЛЫ
// ============================================
function renderFormula() {
    if (!mathInput) return;
    
    const latex = mathInput.getValue();
    
    // Оборачиваем в математический режим
    scrollingText.innerHTML = `\\(${latex}\\)`;
    
    // Принудительно рендерим MathJax
    if (window.MathJax) {
        MathJax.typesetPromise([scrollingText]).catch(err => console.log(err));
    }
    
    // Применяем настройки
    scrollingText.style.fontSize = currentSize + 'vw';
    scrollingText.style.color = '';
    scrollingText.classList.add(currentColor);
}

// ============================================
// ФУНКЦИЯ СМЕНЫ ЦВЕТА
// ============================================
function setTextColor(color) {
    scrollingText.classList.remove('white', 'red', 'blue', 'green', 'yellow');
    scrollingText.classList.add(color);
    
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
// ПРИМЕНЕНИЕ НАСТРОЕК
// ============================================
function applyAllSettings() {
    // Размер
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    
    // Скорость
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    
    // Цвет
    setTextColor(currentColor);
    
    // Формула
    renderFormula();
}

// ============================================
// АНИМАЦИЯ
// ============================================
function restartAnimation() {
    scrollingText.style.animation = 'none';
    scrollingText.offsetHeight;
    scrollingText.style.animation = `scrollText ${currentSpeed}s linear infinite`;
}

// ============================================
// УПРАВЛЕНИЕ ЭЛЕМЕНТАМИ
// ============================================
function toggleControls() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else {
        renderFormula();
        inputArea.style.display = 'none';
        settingsBtn.style.display = 'none';
        isRunning = true;
        saveToBot();
    }
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

// MATH кнопка
mathBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    mathPanelVisible = !mathPanelVisible;
    
    if (mathPanelVisible) {
        mathPanel.classList.add('show');
        mathBtn.classList.add('active');
    } else {
        mathPanel.classList.remove('show');
        mathBtn.classList.remove('active');
    }
});

// Переключение категорий
mathCatBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const cat = this.dataset.cat;
        
        mathCatBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        mathCategories.forEach(c => c.classList.remove('active'));
        document.getElementById(`cat-${cat}`).classList.add('active');
    });
});

// Вставка символов
mathSymbols.forEach(symbol => {
    symbol.addEventListener('click', function() {
        const latex = this.dataset.latex;
        
        if (mathInput) {
            mathInput.executeCommand('insert', latex);
            
            if (latex.includes('{}')) {
                mathInput.executeCommand('moveToNextPlaceholder');
            }
            
            renderFormula();
            saveToBot();
        }
    });
});

// Закрытие MATH панели
document.addEventListener('click', function(e) {
    if (!mathBtn.contains(e.target) && !mathPanel.contains(e.target)) {
        mathPanel.classList.remove('show');
        mathBtn.classList.remove('active');
        mathPanelVisible = false;
    }
});

// Цвет
colorButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        let color = this.classList[1];
        setTextColor(color);
        saveToBot();
    });
});

// Размер
sizeSlider.addEventListener('input', function() {
    currentSize = this.value;
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveToBot();
});

// Скорость
speedSlider.addEventListener('input', function() {
    currentSpeed = this.value;
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    saveToBot();
});

// RUN
runBtn.addEventListener('click', toggleControls);

// Крестик
resetBtn.addEventListener('click', function() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    }
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
    mathPanel.classList.remove('show');
    mathBtn.classList.remove('active');
    mathPanelVisible = false;
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
        mathPanel.classList.remove('show');
        mathBtn.classList.remove('active');
        mathPanelVisible = false;
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
mathInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        toggleControls();
    }
});

// Обновление при вводе
mathInput.addEventListener('input', function() {
    renderFormula();
    saveToBot();
});

// ============================================
// ЗАГРУЗКА
// ============================================
window.addEventListener('load', function() {
    console.log('LED Banner Math загружен');
    
    loadSavedData();
    applyAllSettings();
    
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
    } else if (mathPanel.classList.contains('show')) {
        mathPanel.classList.remove('show');
        mathBtn.classList.remove('active');
        mathPanelVisible = false;
    } else if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    } else {
        tg.close();
    }
});
tg.BackButton.show();

console.log('✅ LED Banner Math готов!');
