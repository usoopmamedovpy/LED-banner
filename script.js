// ============================================
// LED BANNER - ДВУХСЛОЙНАЯ СИСТЕМА С ЦВЕТАМИ
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
    
    // Создаем двухслойную структуру
    createDualLayerInterface();
    
    loadSavedData();
    updateDisplay();
    scrollingText.style.textShadow = 'none';
});

// ============================================
// ДВУХСЛОЙНЫЙ ИНТЕРФЕЙС
// ============================================
function createDualLayerInterface() {
    const mathFieldElement = document.getElementById('mathField');
    if (!mathFieldElement) return;
    
    // Полностью перестраиваем интерфейс
    document.body.innerHTML = '';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    document.body.style.position = 'relative';
    
    // Цветной фоновый слой
    const colorLayer = document.createElement('div');
    colorLayer.id = 'colorLayer';
    colorLayer.style.position = 'absolute';
    colorLayer.style.top = '0';
    colorLayer.style.left = '0';
    colorLayer.style.width = '100%';
    colorLayer.style.height = '100%';
    colorLayer.style.backgroundColor = '#ffffff'; // По умолчанию белый
    colorLayer.style.zIndex = '1';
    colorLayer.style.transition = 'background-color 0.3s ease';
    
    // Черный слой с вырезанными символами (трафарет)
    const stencilLayer = document.createElement('div');
    stencilLayer.id = 'stencilLayer';
    stencilLayer.style.position = 'absolute';
    stencilLayer.style.top = '0';
    stencilLayer.style.left = '0';
    stencilLayer.style.width = '100%';
    stencilLayer.style.height = '100%';
    stencilLayer.style.backgroundColor = '#000000';
    stencilLayer.style.zIndex = '2';
    stencilLayer.style.mixBlendMode = 'multiply'; // Магия!
    
    // Контейнер для бегущей строки (будет вырезать символы)
    const bannerContainer = document.createElement('div');
    bannerContainer.style.position = 'absolute';
    bannerContainer.style.top = '0';
    bannerContainer.style.left = '0';
    bannerContainer.style.width = '100%';
    bannerContainer.style.height = '100%';
    bannerContainer.style.display = 'flex';
    bannerContainer.style.alignItems = 'center';
    bannerContainer.style.overflow = 'hidden';
    bannerContainer.style.zIndex = '3';
    bannerContainer.style.pointerEvents = 'none'; // Не мешает кликам
    
    const scrollingDiv = document.createElement('div');
    scrollingDiv.id = 'scrollingText';
    scrollingDiv.style.position = 'absolute';
    scrollingDiv.style.left = '100%';
    scrollingDiv.style.whiteSpace = 'nowrap';
    scrollingDiv.style.fontWeight = 'bold';
    scrollingDiv.style.fontSize = currentSize + 'vw';
    scrollingDiv.style.color = '#000000'; // Черный цвет для вырезания
    scrollingDiv.style.mixBlendMode = 'destination-out'; // Вырезает символы!
    scrollingDiv.style.animation = `scrollText ${currentSpeed}s linear infinite`;
    scrollingDiv.style.paddingRight = '50px';
    scrollingDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    scrollingDiv.textContent = 'LED бегущая строка';
    
    bannerContainer.appendChild(scrollingDiv);
    
    // Кнопки управления (поверх всего)
    const controlsContainer = document.createElement('div');
    controlsContainer.style.position = 'absolute';
    controlsContainer.style.top = '0';
    controlsContainer.style.left = '0';
    controlsContainer.style.width = '100%';
    controlsContainer.style.height = '100%';
    controlsContainer.style.zIndex = '4';
    controlsContainer.style.pointerEvents = 'none'; // Разрешаем клики через фон
    
    // Крестик
    const resetButton = document.createElement('button');
    resetButton.id = 'resetBtn';
    resetButton.style.position = 'absolute';
    resetButton.style.top = '16px';
    resetButton.style.right = '16px';
    resetButton.style.width = '48px';
    resetButton.style.height = '48px';
    resetButton.style.borderRadius = '50%';
    resetButton.style.background = '#000000';
    resetButton.style.border = '2px solid #ffffff';
    resetButton.style.display = 'flex';
    resetButton.style.alignItems = 'center';
    resetButton.style.justifyContent = 'center';
    resetButton.style.cursor = 'pointer';
    resetButton.style.zIndex = '5';
    resetButton.style.pointerEvents = 'auto';
    resetButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>';
    
    // Шестеренка
    const settingsButton = document.createElement('button');
    settingsButton.id = 'settingsBtn';
    settingsButton.style.position = 'absolute';
    settingsButton.style.top = '16px';
    settingsButton.style.right = '80px';
    settingsButton.style.width = '48px';
    settingsButton.style.height = '48px';
    settingsButton.style.borderRadius = '50%';
    settingsButton.style.background = '#000000';
    settingsButton.style.border = '2px solid #ffffff';
    settingsButton.style.display = 'flex';
    settingsButton.style.alignItems = 'center';
    settingsButton.style.justifyContent = 'center';
    settingsButton.style.cursor = 'pointer';
    settingsButton.style.zIndex = '5';
    settingsButton.style.pointerEvents = 'auto';
    settingsButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="white" stroke-width="2"/><path d="M19.4 15C18.9 16 18.1 16.7 17.2 17.2L19 20.6L16 21L15.2 18.2C14.3 18.5 13.3 18.6 12.3 18.6C11.3 18.6 10.3 18.5 9.4 18.2L8.6 21L5.6 20.6L7.4 17.2C6.5 16.7 5.7 16 5.2 15L2 15L2 12L5.2 12C5.3 11 5.6 10 6.1 9.2L4.3 5.8L7.3 5.4L8.1 8.2C9 7.9 10 7.7 11 7.7C12 7.7 13 7.8 14 8.1L14.8 5.4L17.8 5.8L16 9.2C16.5 10 16.8 11 16.9 12L20 12L20 15L19.4 15Z" stroke="white" stroke-width="1.5"/></svg>';
    
    // Нижняя панель ввода (будет видна только когда не RUN)
    const inputContainer = document.createElement('div');
    inputContainer.id = 'inputArea';
    inputContainer.style.position = 'absolute';
    inputContainer.style.bottom = '0';
    inputContainer.style.left = '0';
    inputContainer.style.width = '100%';
    inputContainer.style.padding = '16px';
    inputContainer.style.display = 'flex';
    inputContainer.style.gap = '10px';
    inputContainer.style.alignItems = 'center';
    inputContainer.style.justifyContent = 'flex-end'; // Прижимаем к правому краю
    inputContainer.style.zIndex = '5';
    inputContainer.style.pointerEvents = 'auto';
    inputContainer.style.boxSizing = 'border-box';
    
    // MATH кнопка слева
    const mathButton = document.createElement('button');
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
    
    // Текстовое поле (растягивается)
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'mainInput';
    textInput.placeholder = '√[x+1] или (a)/(b) или {вектор}';
    textInput.value = 'LED бегущая строка';
    textInput.style.flex = '1';
    textInput.style.background = '#111111';
    textInput.style.border = '2px solid #ffffff';
    textInput.style.borderRadius = '30px';
    textInput.style.padding = '16px 20px';
    textInput.style.fontSize = '18px';
    textInput.style.color = '#ffffff';
    textInput.style.outline = 'none';
    textInput.style.minWidth = '0'; // Позволяет сжиматься
    
    // RUN кнопка справа
    const runButton = document.createElement('button');
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
    
    inputContainer.appendChild(mathButton);
    inputContainer.appendChild(textInput);
    inputContainer.appendChild(runButton);
    
    // Панель настроек
    const settingsPanel = document.createElement('div');
    settingsPanel.id = 'settingsPanel';
    settingsPanel.style.position = 'absolute';
    settingsPanel.style.top = '0';
    settingsPanel.style.left = '0';
    settingsPanel.style.right = '0';
    settingsPanel.style.bottom = '0';
    settingsPanel.style.background = 'rgba(0, 0, 0, 0.95)';
    settingsPanel.style.backdropFilter = 'blur(10px)';
    settingsPanel.style.display = 'none';
    settingsPanel.style.justifyContent = 'center';
    settingsPanel.style.alignItems = 'center';
    settingsPanel.style.zIndex = '6';
    settingsPanel.style.pointerEvents = 'auto';
    
    const settingsContent = document.createElement('div');
    settingsContent.style.background = '#111111';
    settingsContent.style.border = '2px solid #ffffff';
    settingsContent.style.borderRadius = '30px';
    settingsContent.style.padding = '25px';
    settingsContent.style.width = '90%';
    settingsContent.style.maxWidth = '400px';
    
    // Добавляем все элементы
    document.body.appendChild(colorLayer);
    document.body.appendChild(stencilLayer);
    document.body.appendChild(bannerContainer);
    document.body.appendChild(controlsContainer);
    controlsContainer.appendChild(resetButton);
    controlsContainer.appendChild(settingsButton);
    controlsContainer.appendChild(inputContainer);
    document.body.appendChild(settingsPanel);
    settingsPanel.appendChild(settingsContent);
    
    // Копируем содержимое настроек из оригинального HTML
    settingsContent.innerHTML = document.querySelector('.settings-content')?.innerHTML || '';
    
    // Обновляем ссылки на элементы
    window.scrollingText = scrollingDiv;
    window.runBtn = runButton;
    window.resetBtn = resetButton;
    window.settingsBtn = settingsButton;
    window.settingsPanel = settingsPanel;
    window.inputArea = inputContainer;
    window.mathBtn = mathButton;
    window.mathKeyboard = document.getElementById('mathKeyboard');
    
    // Обновляем ссылки на элементы настроек
    window.sizeSlider = document.getElementById('sizeSlider');
    window.sizeValue = document.getElementById('sizeValue');
    window.speedSlider = document.getElementById('speedSlider');
    window.speedValue = document.getElementById('speedValue');
    window.colorButtons = document.querySelectorAll('.color-btn');
    
    // Добавляем анимацию
    const style = document.createElement('style');
    style.textContent = `
        @keyframes scrollText {
            0% { left: 100%; }
            100% { left: -100%; }
        }
    `;
    document.head.appendChild(style);
    
    // Обработчики
    mathButton.addEventListener('click', toggleKeyboard);
    runButton.addEventListener('click', toggleRun);
    resetButton.addEventListener('click', resetAll);
    settingsButton.addEventListener('click', toggleSettings);
    
    textInput.addEventListener('input', function(e) {
        const text = e.target.value;
        const latex = parseToLaTeX(text);
        scrollingDiv.innerHTML = latex;
        saveData({ latex: latex, raw: text });
    });
    
    textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') toggleRun();
    });
    
    // Закрытие MATH клавиатуры по клику вне
    document.addEventListener('click', function(e) {
        if (keyboardVisible && 
            !mathKeyboard.contains(e.target) && 
            !mathButton.contains(e.target)) {
            closeKeyboard();
        }
    });
}

// ============================================
// УПРАВЛЕНИЕ ЦВЕТОМ (НОВЫЙ МЕТОД)
// ============================================
function setColor(color) {
    console.log('Устанавливаем цвет:', color);
    
    const colorLayer = document.getElementById('colorLayer');
    if (!colorLayer) return;
    
    if (color === 'white') colorLayer.style.backgroundColor = '#ffffff';
    else if (color === 'red') colorLayer.style.backgroundColor = '#ff3b30';
    else if (color === 'blue') colorLayer.style.backgroundColor = '#007aff';
    else if (color === 'green') colorLayer.style.backgroundColor = '#34c759';
    else if (color === 'yellow') colorLayer.style.backgroundColor = '#ffcc00';
    
    currentColor = color;
    
    // Обновляем активную кнопку
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(color)) btn.classList.add('active');
    });
}

// ============================================
// ПАРСЕР
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
    
    return result;
}

// ============================================
// СОХРАНЕНИЕ
// ============================================
function loadSavedData() {
    try {
        const saved = localStorage.getItem('ledBannerData');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.color) {
                setColor(data.color);
            }
            if (data.speed) {
                currentSpeed = data.speed;
                if (window.speedSlider) {
                    window.speedSlider.value = currentSpeed;
                    window.speedValue.textContent = currentSpeed + ' сек';
                }
            }
            if (data.size) {
                currentSize = data.size;
                if (window.sizeSlider) {
                    window.sizeSlider.value = currentSize;
                    window.sizeValue.textContent = currentSize + 'vw';
                }
                if (window.scrollingText) {
                    window.scrollingText.style.fontSize = currentSize + 'vw';
                }
            }
            if (data.raw) {
                const input = document.getElementById('mainInput');
                if (input) input.value = data.raw;
                
                if (window.scrollingText && data.latex) {
                    window.scrollingText.innerHTML = data.latex;
                }
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
    
    if (tg) {
        try {
            tg.sendData(JSON.stringify({
                action: 'save',
                data: fullData
            }));
        } catch (e) {}
    }
}

// ============================================
// УПРАВЛЕНИЕ
// ============================================
function toggleKeyboard() {
    if (isRunning) return;
    keyboardVisible = !keyboardVisible;
    
    if (keyboardVisible) {
        mathKeyboard.classList.add('show');
        document.getElementById('mainMathBtn')?.classList.add('active');
        settingsPanel.classList.remove('show');
    } else {
        mathKeyboard.classList.remove('show');
        document.getElementById('mainMathBtn')?.classList.remove('active');
    }
}

function closeKeyboard() {
    keyboardVisible = false;
    mathKeyboard.classList.remove('show');
    document.getElementById('mainMathBtn')?.classList.remove('active');
}

function toggleRun() {
    if (isRunning) {
        document.getElementById('inputArea').style.display = 'flex';
        document.getElementById('settingsBtn').style.display = 'flex';
        isRunning = false;
    } else {
        document.getElementById('inputArea').style.display = 'none';
        document.getElementById('settingsBtn').style.display = 'none';
        isRunning = true;
        closeKeyboard();
        saveData({});
    }
}

function toggleSettings() {
    if (isRunning) return;
    
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
        document.getElementById('settingsBtn').classList.remove('active');
    } else {
        settingsPanel.classList.add('show');
        document.getElementById('settingsBtn').classList.add('active');
        closeKeyboard();
    }
}

function resetAll() {
    if (isRunning) {
        document.getElementById('inputArea').style.display = 'flex';
        document.getElementById('settingsBtn').style.display = 'flex';
        isRunning = false;
    }
    
    const input = document.getElementById('mainInput');
    if (input) input.value = 'LED бегущая строка';
    
    if (window.scrollingText) {
        window.scrollingText.innerHTML = 'LED\\ бегущая\\ строка';
    }
    
    setColor('white');
    currentSpeed = 15;
    currentSize = 15;
    
    if (window.sizeSlider) {
        window.sizeSlider.value = 15;
        window.sizeValue.textContent = '15vw';
    }
    if (window.speedSlider) {
        window.speedSlider.value = 15;
        window.speedValue.textContent = '15 сек';
    }
    if (window.scrollingText) {
        window.scrollingText.style.fontSize = '15vw';
    }
    
    closeKeyboard();
    settingsPanel.classList.remove('show');
    document.getElementById('settingsBtn').classList.remove('active');
    
    saveData({ latex: 'LED\\ бегущая\\ строка', raw: 'LED бегущая строка' });
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
    
    const latex = parseToLaTeX(newText);
    if (window.scrollingText) {
        window.scrollingText.innerHTML = latex;
    }
    
    saveData({ latex: latex, raw: newText });
}

// ============================================
// ОБРАБОТЧИКИ ДЛЯ НАСТРОЕК
// ============================================
setTimeout(function() {
    // ЦВЕТА - ТЕПЕРЬ РАБОТАЮТ ЧЕРЕЗ ДВУХСЛОЙНУЮ СИСТЕМУ
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            let color = 'white';
            if (this.classList.contains('red')) color = 'red';
            else if (this.classList.contains('blue')) color = 'blue';
            else if (this.classList.contains('green')) color = 'green';
            else if (this.classList.contains('yellow')) color = 'yellow';
            
            setColor(color);
            saveData({});
        });
    });
    
    // Размер
    if (window.sizeSlider) {
        window.sizeSlider.addEventListener('input', function() {
            currentSize = parseInt(this.value);
            if (window.sizeValue) window.sizeValue.textContent = currentSize + 'vw';
            if (window.scrollingText) window.scrollingText.style.fontSize = currentSize + 'vw';
            saveData({});
        });
    }
    
    // Скорость
    if (window.speedSlider) {
        window.speedSlider.addEventListener('input', function() {
            currentSpeed = parseInt(this.value);
            if (window.speedValue) window.speedValue.textContent = currentSpeed + ' сек';
            if (window.scrollingText) {
                window.scrollingText.style.animation = 'none';
                void window.scrollingText.offsetWidth;
                window.scrollingText.style.animation = `scrollText ${currentSpeed}s linear infinite`;
            }
            saveData({});
        });
    }
    
    // Закрытие настроек
    if (window.settingsPanel) {
        window.settingsPanel.addEventListener('click', function(e) {
            if (e.target === window.settingsPanel) {
                window.settingsPanel.classList.remove('show');
                document.getElementById('settingsBtn').classList.remove('active');
            }
        });
    }
    
    // Кнопка назад в Telegram
    tg.BackButton.onClick(function() {
        if (window.settingsPanel && window.settingsPanel.classList.contains('show')) {
            window.settingsPanel.classList.remove('show');
            document.getElementById('settingsBtn').classList.remove('active');
        } else if (keyboardVisible) {
            closeKeyboard();
        } else if (isRunning) {
            document.getElementById('inputArea').style.display = 'flex';
            document.getElementById('settingsBtn').style.display = 'flex';
            isRunning = false;
        } else {
            tg.close();
        }
    });
    tg.BackButton.show();
    
}, 500);

console.log('✅ ДВУХСЛОЙНАЯ СИСТЕМА: цвета работают через mix-blend-mode!');
