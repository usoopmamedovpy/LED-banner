// ============================================
// LED BANNER - ФИНАЛ С ЦВЕТАМИ ЧЕРЕЗ СЛОИ
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
const inputArea = document.getElementById('inputArea');
const mathBtn = document.getElementById('mathBtn');
const mathKeyboard = document.getElementById('mathKeyboard');
const mathKeys = document.querySelectorAll('.math-key');
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const colorButtons = document.querySelectorAll('.color-btn');

// Вкладки
const tabFunctions = document.getElementById('tabFunctions');
const tabGreek = document.getElementById('tabGreek');
const tabSymbols = document.getElementById('tabSymbols');
const functionsTab = document.getElementById('functionsTab');
const greekTab = document.getElementById('greekTab');
const symbolsTab = document.getElementById('symbolsTab');

// Цветовой слой
let colorLayer = null;

// ============================================
// ПЕРЕМЕННЫЕ
// ============================================
let currentSpeed = 15;
let currentColor = 'white';
let currentSize = 15;
let isRunning = false;
let keyboardVisible = false;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
window.addEventListener('load', function() {
    console.log('LED Banner загружен');
    
    // Создаем слоеную структуру для цветов
    createColorLayers();
    
    // Создаем интерфейс
    createUnifiedInterface();
    
    loadSavedData();
    updateDisplay();
    scrollingText.style.textShadow = 'none';
    
    // Обновляем цвет через 1 сек
    setTimeout(updateColorLayer, 1000);
});

// ============================================
// СОЗДАНИЕ СЛОЕВ ДЛЯ ЦВЕТА
// ============================================
function createColorLayers() {
    const bannerArea = document.querySelector('.banner-area');
    if (!bannerArea) return;
    
    // Очищаем
    bannerArea.innerHTML = '';
    
    // Создаем контейнер
    const container = document.createElement('div');
    container.className = 'banner-container';
    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = '100%';
    
    // Слой с цветом (будет виден через буквы)
    colorLayer = document.createElement('div');
    colorLayer.className = 'color-layer';
    colorLayer.style.position = 'absolute';
    colorLayer.style.top = '0';
    colorLayer.style.left = '0';
    colorLayer.style.width = '100%';
    colorLayer.style.height = '100%';
    colorLayer.style.backgroundColor = '#ffffff';
    colorLayer.style.zIndex = '1';
    colorLayer.style.pointerEvents = 'none';
    colorLayer.style.transition = 'background-color 0.2s ease';
    
    // Слой с текстом (вырезает буквы)
    const textLayer = document.createElement('div');
    textLayer.className = 'text-layer';
    textLayer.id = 'scrollingText';
    textLayer.style.position = 'absolute';
    textLayer.style.top = '0';
    textLayer.style.left = '100%';
    textLayer.style.width = '100%';
    textLayer.style.height = '100%';
    textLayer.style.display = 'flex';
    textLayer.style.alignItems = 'center';
    textLayer.style.fontWeight = 'bold';
    textLayer.style.whiteSpace = 'nowrap';
    textLayer.style.animation = 'scrollText linear infinite';
    textLayer.style.animationDuration = '15s';
    textLayer.style.paddingRight = '50px';
    textLayer.style.fontSize = '15vw';
    textLayer.style.color = 'transparent';
    textLayer.style.webkitTextStroke = '2px white';
    textLayer.style.textShadow = 'none';
    textLayer.style.zIndex = '2';
    textLayer.style.pointerEvents = 'none';
    textLayer.style.mixBlendMode = 'screen';
    textLayer.textContent = 'LED бегущая строка';
    
    container.appendChild(colorLayer);
    container.appendChild(textLayer);
    bannerArea.appendChild(container);
    
    // Обновляем ссылку
    window.scrollingText = textLayer;
}

// ============================================
// ОБНОВЛЕНИЕ ЦВЕТОВОГО СЛОЯ
// ============================================
function updateColorLayer() {
    if (!colorLayer) return;
    
    console.log('Обновление цветового слоя:', currentColor);
    
    if (currentColor === 'white') colorLayer.style.backgroundColor = '#ffffff';
    else if (currentColor === 'red') colorLayer.style.backgroundColor = '#ff3b30';
    else if (currentColor === 'blue') colorLayer.style.backgroundColor = '#007aff';
    else if (currentColor === 'green') colorLayer.style.backgroundColor = '#34c759';
    else if (currentColor === 'yellow') colorLayer.style.backgroundColor = '#ffcc00';
    
    // Обновляем кнопки
    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(currentColor)) {
            btn.classList.add('active');
        }
    });
}

// ============================================
// ЕДИНЫЙ ИНТЕРФЕЙС
// ============================================
function createUnifiedInterface() {
    const mathFieldElement = document.getElementById('mathField');
    if (!mathFieldElement) return;
    
    inputArea.innerHTML = '';
    inputArea.style.display = 'flex';
    inputArea.style.justifyContent = 'flex-end'; // Прижимаем вправо
    inputArea.style.alignItems = 'center';
    inputArea.style.gap = '10px';
    inputArea.style.padding = '16px';
    inputArea.style.position = 'absolute';
    inputArea.style.bottom = '0';
    inputArea.style.left = '0';
    inputArea.style.right = '0';
    inputArea.style.backgroundColor = '#000000';
    inputArea.style.borderTop = '2px solid rgba(255,255,255,0.2)';
    
    // MATH кнопка
    const mathButton = document.createElement('button');
    mathButton.className = 'math-btn';
    mathButton.id = 'mainMathBtn';
    mathButton.textContent = 'MATH';
    mathButton.style.width = '70px';
    mathButton.style.height = '60px';
    mathButton.style.background = '#000000';
    mathButton.style.border = '2px solid #ffffff';
    mathButton.style.borderRadius = '30px';
    mathButton.style.color = '#ffffff';
    mathButton.style.fontWeight = 'bold';
    mathButton.style.fontSize = '18px';
    mathButton.style.cursor = 'pointer';
    mathButton.style.flexShrink = '0';
    
    // Поле ввода (растягивается)
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'mainInput';
    textInput.className = 'text-input';
    textInput.placeholder = '√[x+1] или (a)/(b) или {вектор}';
    textInput.value = 'LED бегущая строка';
    textInput.style.flex = '1';
    textInput.style.minWidth = '0'; // Позволяет сжиматься
    textInput.style.maxWidth = 'calc(100% - 160px)'; // Учитываем MATH и RUN
    textInput.style.background = '#111111';
    textInput.style.border = '2px solid #ffffff';
    textInput.style.borderRadius = '30px';
    textInput.style.padding = '16px 20px';
    textInput.style.fontSize = '18px';
    textInput.style.color = '#ffffff';
    textInput.style.outline = 'none';
    
    // RUN кнопка
    const runButton = document.createElement('button');
    runButton.className = 'run-btn';
    runButton.id = 'mainRunBtn';
    runButton.textContent = 'RUN';
    runButton.style.width = '70px';
    runButton.style.height = '60px';
    runButton.style.background = 'transparent';
    runButton.style.border = '2px solid #ffffff';
    runButton.style.borderRadius = '30px';
    runButton.style.color = '#ffffff';
    runButton.style.fontWeight = 'bold';
    runButton.style.fontSize = '18px';
    runButton.style.cursor = 'pointer';
    runButton.style.flexShrink = '0';
    
    inputArea.appendChild(mathButton);
    inputArea.appendChild(textInput);
    inputArea.appendChild(runButton);
    
    // Обработчики
    mathButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleKeyboard();
    });
    
    runButton.addEventListener('click', toggleRun);
    
    textInput.addEventListener('input', function(e) {
        const text = e.target.value;
        const latex = parseToLaTeX(text);
        scrollingText.textContent = text;
        saveData({ latex: latex, raw: text });
    });
    
    textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            toggleRun();
        }
    });
    
    // Закрытие MATH при клике вне
    document.addEventListener('click', function(e) {
        if (keyboardVisible && 
            !mathKeyboard.contains(e.target) && 
            !mathButton.contains(e.target)) {
            closeKeyboard();
        }
    });
}

// ============================================
// УПРАВЛЕНИЕ
// ============================================
function toggleKeyboard() {
    if (isRunning) return;
    keyboardVisible = !keyboardVisible;
    
    if (keyboardVisible) {
        mathKeyboard.classList.add('show');
        mathBtn.classList.add('active');
        document.getElementById('mainMathBtn')?.classList.add('active');
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else {
        mathKeyboard.classList.remove('show');
        mathBtn.classList.remove('active');
        document.getElementById('mainMathBtn')?.classList.remove('active');
    }
}

function closeKeyboard() {
    keyboardVisible = false;
    mathKeyboard.classList.remove('show');
    mathBtn.classList.remove('active');
    document.getElementById('mainMathBtn')?.classList.remove('active');
}

function toggleRun() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    } else {
        updateDisplay();
        inputArea.style.display = 'none';
        settingsBtn.style.display = 'none';
        isRunning = true;
        closeKeyboard();
        saveData({});
    }
}

function resetAll() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    } else {
        // Если не запущено, просто показываем элементы
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
    }
    
    // НЕ СБРАСЫВАЕМ ТЕКСТ!
    // Просто закрываем клавиатуру и настройки
    closeKeyboard();
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
}

// ============================================
// ОСТАЛЬНЫЕ ФУНКЦИИ (ПАРСЕР, СОХРАНЕНИЕ И Т.Д.)
// ============================================
function parseToLaTeX(text) {
    if (!text) return '';
    
    let result = text;
    
    // Векторы
    result = result.replace(/\{([^}]+)\}/g, '\\vec{$1}');
    
    // Дроби
    result = result.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, '\\frac{$1}{$2}');
    result = result.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
    
    // Корни
    result = result.replace(/√\[([^\]]+)\]/g, '\\sqrt{$1}');
    result = result.replace(/√\[([^\]]+)\]\{([^}]+)\}/g, '\\sqrt[$1]{$2}');
    
    return result;
}

function loadSavedData() {
    try {
        const saved = localStorage.getItem('ledBannerData');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.color) {
                currentColor = data.color;
                updateColorLayer();
            }
            if (data.speed) {
                currentSpeed = data.speed;
                speedSlider.value = currentSpeed;
                speedValue.textContent = currentSpeed + ' сек';
            }
            if (data.size) {
                currentSize = data.size;
                sizeSlider.value = currentSize;
                sizeValue.textContent = currentSize + 'vw';
            }
            if (data.raw) {
                const input = document.getElementById('mainInput');
                if (input) input.value = data.raw;
                if (scrollingText) scrollingText.textContent = data.raw;
            }
        }
    } catch (e) {}
}

function saveData(data) {
    const fullData = {
        ...data,
        color: currentColor,
        speed: currentSpeed,
        size: currentSize
    };
    localStorage.setItem('ledBannerData', JSON.stringify(fullData));
}

function updateDisplay() {
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    updateColorLayer();
}

function restartAnimation() {
    scrollingText.style.animation = 'none';
    void scrollingText.offsetWidth;
    scrollingText.style.animation = `scrollText ${currentSpeed}s linear infinite`;
}

// ============================================
// ВСТАВКА СИМВОЛОВ
// ============================================
function insertMathSymbol(symbol) {
    const input = document.getElementById('mainInput');
    if (!input) return;
    
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    
    let insertText = symbol;
    
    if (symbol === '√') insertText = '√[]';
    else if (symbol === '∛') insertText = '∛[]';
    else if (symbol === '∜') insertText = '∜[]';
    else if (symbol === '→' || symbol === '\\vec' || symbol === '⃗') insertText = '{}';
    else if (symbol === 'a/b' || symbol === 'frac') insertText = '(a)/(b)';
    
    const newText = text.substring(0, start) + insertText + text.substring(end);
    input.value = newText;
    
    let newPos = start + insertText.length;
    if (insertText.includes('[]')) newPos = start + insertText.length - 1;
    else if (insertText === '{}') newPos = start + 1;
    else if (insertText === '(a)/(b)') newPos = start + 2;
    
    input.setSelectionRange(newPos, newPos);
    input.focus();
    
    scrollingText.textContent = newText;
    saveData({ latex: parseToLaTeX(newText), raw: newText });
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

// Скрываем оригинальную MATH кнопку
if (mathBtn) mathBtn.style.display = 'none';

// Вкладки
tabFunctions.addEventListener('click', function() {
    tabFunctions.classList.add('active');
    tabGreek.classList.remove('active');
    tabSymbols.classList.remove('active');
    functionsTab.classList.add('active');
    greekTab.classList.remove('active');
    symbolsTab.classList.remove('active');
});

tabGreek.addEventListener('click', function() {
    tabGreek.classList.add('active');
    tabFunctions.classList.remove('active');
    tabSymbols.classList.remove('active');
    greekTab.classList.add('active');
    functionsTab.classList.remove('active');
    symbolsTab.classList.remove('active');
});

tabSymbols.addEventListener('click', function() {
    tabSymbols.classList.add('active');
    tabFunctions.classList.remove('active');
    tabGreek.classList.remove('active');
    symbolsTab.classList.add('active');
    functionsTab.classList.remove('active');
    greekTab.classList.remove('active');
});

// Кнопки клавиатуры
mathKeys.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const cmd = this.textContent;
        const dataCmd = this.dataset.cmd;
        
        if (dataCmd === 'frac' || cmd === 'a/b') insertMathSymbol('frac');
        else if (dataCmd === '\\vec' || cmd === '⃗' || cmd === '→') insertMathSymbol('→');
        else insertMathSymbol(cmd);
        
        return false;
    });
});

// ЦВЕТА - теперь работают через слой!
colorButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        if (this.classList.contains('white')) currentColor = 'white';
        else if (this.classList.contains('red')) currentColor = 'red';
        else if (this.classList.contains('blue')) currentColor = 'blue';
        else if (this.classList.contains('green')) currentColor = 'green';
        else if (this.classList.contains('yellow')) currentColor = 'yellow';
        
        updateColorLayer();
        saveData({});
    });
});

// Размер
sizeSlider.addEventListener('input', function() {
    currentSize = parseInt(this.value);
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveData({});
});

// Скорость
speedSlider.addEventListener('input', function() {
    currentSpeed = parseInt(this.value);
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    saveData({});
});

// Крестик (теперь НЕ сбрасывает текст)
resetBtn.addEventListener('click', resetAll);

// Шестеренка
settingsBtn.addEventListener('click', function() {
    if (isRunning) return;
    
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
        this.classList.remove('active');
    } else {
        settingsPanel.classList.add('show');
        this.classList.add('active');
        closeKeyboard();
    }
});

// Закрытие настроек
settingsPanel.addEventListener('click', function(e) {
    if (e.target === settingsPanel) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    }
});

// ============================================
// TELEGRAM BACK BUTTON
// ============================================
tg.BackButton.onClick(function() {
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else if (keyboardVisible) {
        closeKeyboard();
    } else if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    } else {
        tg.close();
    }
});
tg.BackButton.show();

console.log('✅ ФИНАЛ: цвета через слои, крестик не сбрасывает текст, MATH в углу');
