// ============================================
// LED BANNER - КРАСИВЫЙ ИНТЕРФЕЙС С ДВУМЯ ПОЛЯМИ
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
let mathField = null;
let MQ = null;
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
window.addEventListener('load', function() {
    console.log('LED Banner загружен');
    
    // Создаем красивый интерфейс с двумя полями
    createDualInputSystem();
    
    loadSavedData();
    updateDisplay();
    scrollingText.style.textShadow = 'none';
});

// ============================================
// СОЗДАЕМ КРАСИВЫЙ ИНТЕРФЕЙС С ДВУМЯ ПОЛЯМИ
// ============================================
function createDualInputSystem() {
    const mathFieldElement = document.getElementById('mathField');
    if (!mathFieldElement) return;
    
    // Очищаем inputArea
    inputArea.innerHTML = '';
    inputArea.style.display = 'flex';
    inputArea.style.flexDirection = 'column';
    inputArea.style.gap = '10px';
    inputArea.style.padding = '16px';
    
    // ===== ВЕРХНЯЯ СТРОКА (MATH поле) =====
    const topRow = document.createElement('div');
    topRow.style.display = 'flex';
    topRow.style.gap = '10px';
    topRow.style.alignItems = 'center';
    topRow.style.width = '100%';
    
    // Кнопка MATH (одна!)
    const mathButton = document.createElement('button');
    mathButton.className = 'math-btn';
    mathButton.id = 'mathBtnNew';
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
    
    // MATH поле
    const mathDiv = document.createElement('div');
    mathDiv.id = 'mathField';
    mathDiv.className = 'math-field';
    mathDiv.style.flex = '1';
    mathDiv.style.minHeight = '60px';
    mathDiv.style.background = '#111111';
    mathDiv.style.border = '2px solid #ffffff';
    mathDiv.style.borderRadius = '30px';
    mathDiv.style.padding = '12px 20px';
    mathDiv.style.fontSize = '18px';
    mathDiv.style.color = '#ffffff';
    
    topRow.appendChild(mathButton);
    topRow.appendChild(mathDiv);
    
    // ===== НИЖНЯЯ СТРОКА (текстовое поле + стрелка + RUN) =====
    const bottomRow = document.createElement('div');
    bottomRow.style.display = 'flex';
    bottomRow.style.gap = '10px';
    bottomRow.style.alignItems = 'center';
    bottomRow.style.width = '100%';
    
    // Текстовое поле
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'textInput';
    textInput.className = 'text-input';
    textInput.placeholder = 'Введите обычный текст...';
    textInput.value = '';
    textInput.style.flex = '1';
    textInput.style.background = '#111111';
    textInput.style.border = '2px solid #ffffff';
    textInput.style.borderRadius = '30px';
    textInput.style.padding = '16px 20px';
    textInput.style.fontSize = '18px';
    textInput.style.color = '#ffffff';
    textInput.style.outline = 'none';
    
    // Кнопка стрелка (красивая)
    const arrowBtn = document.createElement('button');
    arrowBtn.id = 'arrowBtn';
    arrowBtn.innerHTML = '→';
    arrowBtn.style.width = '60px';
    arrowBtn.style.height = '60px';
    arrowBtn.style.background = '#000000';
    arrowBtn.style.border = '2px solid #ffffff';
    arrowBtn.style.borderRadius = '30px';
    arrowBtn.style.color = '#ffffff';
    arrowBtn.style.fontSize = '28px';
    arrowBtn.style.fontWeight = 'bold';
    arrowBtn.style.cursor = 'pointer';
    arrowBtn.style.display = 'flex';
    arrowBtn.style.alignItems = 'center';
    arrowBtn.style.justifyContent = 'center';
    arrowBtn.style.transition = 'all 0.2s ease';
    
    // RUN кнопка (оригинальная)
    const runButton = document.createElement('button');
    runButton.className = 'run-btn';
    runButton.id = 'runBtn';
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
    runButton.style.textTransform = 'uppercase';
    runButton.style.letterSpacing = '2px';
    
    bottomRow.appendChild(textInput);
    bottomRow.appendChild(arrowBtn);
    bottomRow.appendChild(runButton);
    
    // Добавляем строки в inputArea
    inputArea.appendChild(topRow);
    inputArea.appendChild(bottomRow);
    
    // Инициализируем MathQuill
    initMathQuill(mathDiv);
    
    // ===== ОБРАБОТЧИКИ =====
    
    // MATH кнопка
    mathButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleKeyboard();
    });
    
    // Стрелка - вставляет текст в MATH поле
    arrowBtn.addEventListener('click', function() {
        const text = textInput.value;
        if (text && mathField) {
            // Вставляем текст в текущую позицию курсора
            for (let char of text) {
                mathField.typedText(char);
            }
            textInput.value = ''; // Очищаем после вставки
            textInput.focus();
        }
    });
    
    // Enter в текстовом поле - вставляет текст
    textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            arrowBtn.click();
        }
    });
    
    // RUN кнопка
    runButton.addEventListener('click', function() {
        toggleRun();
    });
    
    // Обновляем ссылку на runBtn
    window.runBtn = runButton;
}

// ============================================
// MATHQUILL ИНИЦИАЛИЗАЦИЯ
// ============================================
function initMathQuill(element) {
    try {
        console.log('Инициализация MathQuill...');
        
        MQ = MathQuill.getInterface(2);
        
        mathField = MQ.MathField(element, {
            spaceBehavesLikeTab: true,
            autoCommands: 'pi theta sqrt sum prod int alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi pi rho sigma tau upsilon phi chi psi omega',
            autoOperatorNames: 'sin cos tan cot arcsin arccos arctan arccot log ln lg exp lim',
            handlers: {
                edit: function() {
                    const latex = mathField.latex();
                    
                    if (latex) {
                        scrollingText.innerHTML = '\\(' + latex + '\\)';
                        if (window.MathJax) {
                            MathJax.typesetPromise([scrollingText]).catch(() => {});
                        }
                    }
                    
                    saveData();
                }
            }
        });
        
        mathField.latex('LED\\ бегущая\\ строка');
        console.log('MathQuill готов');
        loadSavedData();
        
    } catch (e) {
        console.error('Ошибка MathQuill:', e);
    }
}

// ============================================
// СОХРАНЕНИЕ
// ============================================
function loadSavedData() {
    try {
        const saved = localStorage.getItem('ledBannerMathData');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.color) {
                currentColor = data.color;
                updateColor();
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
            
            if (data.latex && mathField) {
                mathField.latex(data.latex);
            }
        }
    } catch (e) {}
}

function saveData() {
    if (!mathField) return;
    
    const data = {
        latex: mathField.latex(),
        color: currentColor,
        speed: currentSpeed,
        size: currentSize
    };
    
    localStorage.setItem('ledBannerMathData', JSON.stringify(data));
    
    if (tg) {
        try {
            tg.sendData(JSON.stringify({
                action: 'save',
                data: data
            }));
        } catch (e) {}
    }
}

// ============================================
// ОБНОВЛЕНИЕ ОТОБРАЖЕНИЯ
// ============================================
function updateDisplay() {
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    
    updateColor();
}

function updateColor() {
    console.log('Обновление цвета на:', currentColor);
    
    // Убираем все классы цвета
    scrollingText.classList.remove('white', 'red', 'blue', 'green', 'yellow');
    
    // Добавляем новый класс
    scrollingText.classList.add(currentColor);
    
    // Также применяем inline style для надежности
    if (currentColor === 'white') scrollingText.style.color = '#ffffff';
    if (currentColor === 'red') scrollingText.style.color = '#ff3b30';
    if (currentColor === 'blue') scrollingText.style.color = '#007aff';
    if (currentColor === 'green') scrollingText.style.color = '#34c759';
    if (currentColor === 'yellow') scrollingText.style.color = '#ffcc00';
    
    // Обновляем активную кнопку цвета
    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(currentColor)) {
            btn.classList.add('active');
        }
    });
}

function restartAnimation() {
    scrollingText.style.animation = 'none';
    void scrollingText.offsetWidth;
    scrollingText.style.animation = `scrollText ${currentSpeed}s linear infinite`;
}

// ============================================
// УПРАВЛЕНИЕ КЛАВИАТУРОЙ
// ============================================
function toggleKeyboard() {
    if (isRunning) return;
    
    keyboardVisible = !keyboardVisible;
    
    if (keyboardVisible) {
        mathKeyboard.classList.add('show');
        mathBtn.classList.add('active');
        document.getElementById('mathBtnNew')?.classList.add('active');
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else {
        mathKeyboard.classList.remove('show');
        mathBtn.classList.remove('active');
        document.getElementById('mathBtnNew')?.classList.remove('active');
    }
}

function closeKeyboard() {
    keyboardVisible = false;
    mathKeyboard.classList.remove('show');
    mathBtn.classList.remove('active');
    const newBtn = document.getElementById('mathBtnNew');
    if (newBtn) newBtn.classList.remove('active');
}

// ============================================
// ВСТАВКА В MATHQUILL
// ============================================
function insertMathCommand(cmd) {
    if (!mathField) return;
    
    try {
        console.log('Вставка символа:', cmd);
        
        if (cmd === '^') {
            mathField.cmd('^');
        } else if (cmd === '_') {
            mathField.cmd('_');
        } else if (cmd === '√') {
            mathField.cmd('\\sqrt');
        } else if (cmd === '∛') {
            mathField.typedText('\\sqrt[3]{');
        } else if (cmd === '∜') {
            mathField.typedText('\\sqrt[4]{');
        } else if (cmd === 'n√') {
            mathField.typedText('\\sqrt[n]{');
        } else if (cmd === '→' || cmd === '\\vec') {
            mathField.typedText('\\vec{');
            mathField.keystroke('Right');
            mathField.keystroke('Left');
        } else if (cmd === '/') {
            mathField.cmd('\\frac');
        } else if (cmd === '∫') {
            mathField.cmd('\\int');
        } else if (cmd === '∑') {
            mathField.cmd('\\sum');
        } else if (cmd === '∏') {
            mathField.cmd('\\prod');
        } else if (cmd === '∞') {
            mathField.typedText('\\infty');
        } else {
            mathField.cmd(cmd);
        }
        
        mathField.focus();
        
    } catch (e) {
        console.error('Ошибка вставки:', e);
    }
}

// ============================================
// УПРАВЛЕНИЕ ЗАПУСКОМ
// ============================================
function toggleRun() {
    const currentRunBtn = document.getElementById('runBtn');
    
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
        saveData();
    }
}

// ============================================
// СБРОС
// ============================================
function resetAll() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
    }
    
    if (mathField) {
        mathField.latex('LED\\ бегущая\\ строка');
    }
    
    // Очищаем текстовое поле
    const textInput = document.getElementById('textInput');
    if (textInput) textInput.value = '';
    
    currentColor = 'white';
    currentSpeed = 15;
    currentSize = 15;
    
    sizeSlider.value = 15;
    speedSlider.value = 15;
    
    updateDisplay();
    closeKeyboard();
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
    saveData();
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

// Оригинальная MATH кнопка (скрываем, но оставляем для обратной совместимости)
if (mathBtn) {
    mathBtn.style.display = 'none';
}

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
        
        const cmd = this.dataset.cmd;
        if (cmd) {
            insertMathCommand(cmd);
        }
        
        return false;
    });
});

// ЦВЕТ - ИСПРАВЛЕНО!
colorButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        console.log('Клик по цвету:', this.classList);
        
        // Получаем цвет из класса (white, red, blue, green, yellow)
        let color = '';
        if (this.classList.contains('white')) color = 'white';
        else if (this.classList.contains('red')) color = 'red';
        else if (this.classList.contains('blue')) color = 'blue';
        else if (this.classList.contains('green')) color = 'green';
        else if (this.classList.contains('yellow')) color = 'yellow';
        
        if (color) {
            console.log('Выбран цвет:', color);
            currentColor = color;
            updateColor();
            saveData();
        }
    });
});

// Размер
sizeSlider.addEventListener('input', function() {
    currentSize = parseInt(this.value);
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveData();
});

// Скорость
speedSlider.addEventListener('input', function() {
    currentSpeed = parseInt(this.value);
    speedValue.textContent = currentSpeed + ' сек';
    restartAnimation();
    saveData();
});

// Крестик
resetBtn.addEventListener('click', function() {
    resetAll();
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

console.log('✅ LED Banner с красивым интерфейсом готов!');
