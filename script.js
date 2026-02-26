// ============================================
// LED BANNER - РАЗДЕЛЕНИЕ ВВОДА И ОТОБРАЖЕНИЯ
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
    
    // Полностью перестраиваем интерфейс для мобилок
    if (isMobile) {
        createMobileInterface();
    } else {
        // Для компьютера оставляем как есть
        initMathQuill(document.getElementById('mathField'));
    }
    
    loadSavedData();
    updateDisplay();
    scrollingText.style.textShadow = 'none';
});

// ============================================
// МОБИЛЬНЫЙ ИНТЕРФЕЙС (Ввод через input, отображение через MathQuill)
// ============================================
function createMobileInterface() {
    console.log('Создание мобильного интерфейса...');
    
    const mathFieldElement = document.getElementById('mathField');
    if (!mathFieldElement) return;
    
    // Очищаем inputArea
    inputArea.innerHTML = '';
    inputArea.style.display = 'flex';
    inputArea.style.flexDirection = 'column';
    inputArea.style.gap = '10px';
    
    // ===== ВЕРХНЯЯ СТРОКА - ОТОБРАЖЕНИЕ MATH =====
    const displayRow = document.createElement('div');
    displayRow.style.display = 'flex';
    displayRow.style.gap = '10px';
    displayRow.style.alignItems = 'center';
    displayRow.style.width = '100%';
    
    // MATH кнопка
    const mathButton = document.createElement('button');
    mathButton.className = 'math-btn';
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
    
    // Поле для отображения (MathQuill)
    const displayField = document.createElement('div');
    displayField.id = 'mathDisplay';
    displayField.style.flex = '1';
    displayField.style.minHeight = '60px';
    displayField.style.background = '#111111';
    displayField.style.border = '2px solid #ffffff';
    displayField.style.borderRadius = '30px';
    displayField.style.padding = '12px 20px';
    displayField.style.fontSize = '18px';
    displayField.style.color = '#ffffff';
    displayField.style.pointerEvents = 'none'; // Не реагирует на клики
    
    displayRow.appendChild(mathButton);
    displayRow.appendChild(displayField);
    
    // ===== НИЖНЯЯ СТРОКА - ВВОД ТЕКСТА =====
    const inputRow = document.createElement('div');
    inputRow.style.display = 'flex';
    inputRow.style.gap = '10px';
    inputRow.style.alignItems = 'center';
    inputRow.style.width = '100%';
    
    // Поле для ввода текста (обычный input)
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'mobileTextInput';
    textInput.placeholder = 'Введите текст...';
    textInput.style.flex = '1';
    textInput.style.background = '#111111';
    textInput.style.border = '2px solid #ffffff';
    textInput.style.borderRadius = '30px';
    textInput.style.padding = '16px 20px';
    textInput.style.fontSize = '18px';
    textInput.style.color = '#ffffff';
    textInput.style.outline = 'none';
    
    // Кнопка для вставки математических символов
    const insertMathBtn = document.createElement('button');
    insertMathBtn.innerHTML = '∑';
    insertMathBtn.style.width = '60px';
    insertMathBtn.style.height = '60px';
    insertMathBtn.style.background = '#000000';
    insertMathBtn.style.border = '2px solid #ffffff';
    insertMathBtn.style.borderRadius = '30px';
    insertMathBtn.style.color = '#ffffff';
    insertMathBtn.style.fontSize = '24px';
    insertMathBtn.style.fontWeight = 'bold';
    insertMathBtn.style.cursor = 'pointer';
    
    // RUN кнопка
    const runButton = document.createElement('button');
    runButton.className = 'run-btn';
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
    
    inputRow.appendChild(textInput);
    inputRow.appendChild(insertMathBtn);
    inputRow.appendChild(runButton);
    
    // Добавляем строки в интерфейс
    inputArea.appendChild(displayRow);
    inputArea.appendChild(inputRow);
    
    // Инициализируем MathQuill на поле отображения
    initMathQuill(displayField, true); // true = режим только для чтения
    
    // ===== ОБРАБОТЧИКИ =====
    
    // MATH кнопка - открывает клавиатуру с символами
    mathButton.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleKeyboard();
    });
    
    // Кнопка вставки математических символов
    insertMathBtn.addEventListener('click', function() {
        // Фокус на текстовое поле
        textInput.focus();
    });
    
    // Ввод текста
    textInput.addEventListener('input', function(e) {
        const text = e.target.value;
        if (mathField) {
            // Обновляем MathQuill
            mathField.latex(text);
            
            // Обновляем бегущую строку
            scrollingText.innerHTML = '\\(' + text + '\\)';
            if (window.MathJax) {
                MathJax.typesetPromise([scrollingText]).catch(() => {});
            }
        }
        saveData();
    });
    
    // Enter в текстовом поле
    textInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            toggleRun();
        }
    });
    
    // RUN
    runButton.addEventListener('click', toggleRun);
    
    console.log('Мобильный интерфейс создан');
}

// ============================================
// MATHQUILL ИНИЦИАЛИЗАЦИЯ
// ============================================
function initMathQuill(element, readOnly = false) {
    try {
        console.log('Инициализация MathQuill...');
        
        MQ = MathQuill.getInterface(2);
        
        const config = {
            spaceBehavesLikeTab: true,
            autoCommands: 'pi theta sqrt sum prod int alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi pi rho sigma tau upsilon phi chi psi omega',
            autoOperatorNames: 'sin cos tan cot arcsin arccos arctan arccot log ln lg exp lim'
        };
        
        // В режиме только для чтения - отключаем редактирование
        if (readOnly) {
            config.handlers = {
                edit: function() {} // Пустой обработчик
            };
        } else {
            config.handlers = {
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
            };
        }
        
        mathField = MQ.MathField(element, config);
        
        if (!readOnly) {
            mathField.latex('LED\\ бегущая\\ строка');
        }
        
        console.log('MathQuill готов');
        loadSavedData();
        
    } catch (e) {
        console.error('Ошибка MathQuill:', e);
    }
}

// ============================================
// ЗАГРУЗКА/СОХРАНЕНИЕ
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
                
                // Обновляем текстовое поле если есть
                const textInput = document.getElementById('mobileTextInput');
                if (textInput) {
                    textInput.value = data.latex.replace(/\\[a-zA-Z]+/g, '').replace(/[{}]/g, '');
                }
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
    
    // Применяем цвет через inline style
    if (currentColor === 'white') scrollingText.style.color = '#ffffff';
    else if (currentColor === 'red') scrollingText.style.color = '#ff3b30';
    else if (currentColor === 'blue') scrollingText.style.color = '#007aff';
    else if (currentColor === 'green') scrollingText.style.color = '#34c759';
    else if (currentColor === 'yellow') scrollingText.style.color = '#ffcc00';
    
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
        if (isMobile) {
            document.querySelector('.math-btn')?.classList.add('active');
        }
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else {
        mathKeyboard.classList.remove('show');
        mathBtn.classList.remove('active');
        if (isMobile) {
            document.querySelector('.math-btn')?.classList.remove('active');
        }
    }
}

function closeKeyboard() {
    keyboardVisible = false;
    mathKeyboard.classList.remove('show');
    mathBtn.classList.remove('active');
    if (isMobile) {
        document.querySelector('.math-btn')?.classList.remove('active');
    }
}

// ============================================
// ВСТАВКА В ТЕКСТОВОЕ ПОЛЕ (ДЛЯ МОБИЛОК)
// ============================================
function insertMathCommand(cmd) {
    if (!mathField) return;
    
    try {
        console.log('Вставка символа:', cmd);
        
        let latexCmd = cmd;
        
        if (cmd === '^') latexCmd = '^';
        else if (cmd === '_') latexCmd = '_';
        else if (cmd === '√') latexCmd = '\\sqrt{}';
        else if (cmd === '∛') latexCmd = '\\sqrt[3]{}';
        else if (cmd === '∜') latexCmd = '\\sqrt[4]{}';
        else if (cmd === 'n√') latexCmd = '\\sqrt[n]{}';
        else if (cmd === '→' || cmd === '\\vec') latexCmd = '\\vec{}';
        else if (cmd === '/') latexCmd = '\\frac{}{}';
        
        // Для мобилок - вставляем в текстовое поле
        if (isMobile) {
            const textInput = document.getElementById('mobileTextInput');
            if (textInput) {
                const start = textInput.selectionStart;
                const end = textInput.selectionEnd;
                const text = textInput.value;
                
                const newText = text.substring(0, start) + latexCmd + text.substring(end);
                textInput.value = newText;
                textInput.setSelectionRange(start + latexCmd.length, start + latexCmd.length);
                
                // Обновляем MathQuill
                mathField.latex(newText);
                
                // Обновляем бегущую строку
                scrollingText.innerHTML = '\\(' + newText + '\\)';
                if (window.MathJax) {
                    MathJax.typesetPromise([scrollingText]).catch(() => {});
                }
                
                saveData();
            }
        } else {
            // Для компьютера - прямая вставка в MathQuill
            mathField.cmd(cmd);
        }
        
    } catch (e) {
        console.error('Ошибка вставки:', e);
    }
}

// ============================================
// УПРАВЛЕНИЕ ЗАПУСКОМ
// ============================================
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
    
    // Очищаем текстовое поле для мобилок
    const textInput = document.getElementById('mobileTextInput');
    if (textInput) {
        textInput.value = 'LED бегущая строка';
    }
    
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

// MATH кнопка
mathBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleKeyboard();
});

// Закрытие клавиатуры
document.addEventListener('click', function(e) {
    if (keyboardVisible && 
        !mathKeyboard.contains(e.target) && 
        !mathBtn.contains(e.target) &&
        !(isMobile && e.target.classList.contains('math-btn'))) {
        closeKeyboard();
    }
});

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

// ЦВЕТА
colorButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        console.log('Клик по кнопке цвета');
        
        let color = 'white';
        if (this.classList.contains('red')) color = 'red';
        else if (this.classList.contains('blue')) color = 'blue';
        else if (this.classList.contains('green')) color = 'green';
        else if (this.classList.contains('yellow')) color = 'yellow';
        
        console.log('Устанавливаем цвет:', color);
        currentColor = color;
        
        // Принудительно применяем цвет
        scrollingText.style.color = 
            color === 'white' ? '#ffffff' :
            color === 'red' ? '#ff3b30' :
            color === 'blue' ? '#007aff' :
            color === 'green' ? '#34c759' : '#ffcc00';
        
        // Обновляем активный класс
        colorButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        saveData();
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

// RUN
runBtn.addEventListener('click', toggleRun);

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

console.log('✅ РАЗДЕЛЕННАЯ ВЕРСИЯ: ввод через input, отображение через MathQuill');
