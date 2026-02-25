// ============================================
// LED BANNER С MATHQUILL - ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ
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

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
window.addEventListener('load', function() {
    console.log('LED Banner загружен');
    
    // Ждем загрузки библиотек
    setTimeout(function() {
        if (typeof MathQuill !== 'undefined') {
            initMathQuill();
        } else {
            console.error('MathQuill не загрузился');
        }
    }, 500);
    
    loadSavedData();
    updateDisplay();
    scrollingText.style.textShadow = 'none';
});

// ============================================
// ЗАГРУЗКА/СОХРАНЕНИЕ
// ============================================
function loadSavedData() {
    try {
        const saved = localStorage.getItem('ledBannerMathData');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.color) currentColor = data.color;
            if (data.speed) currentSpeed = data.speed;
            if (data.size) currentSize = data.size;
            
            sizeSlider.value = currentSize;
            speedSlider.value = currentSpeed;
            
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
        size: currentSize,
        timestamp: Date.now()
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
// MATHQUILL ИНИЦИАЛИЗАЦИЯ
// ============================================
function initMathQuill() {
    try {
        console.log('Инициализация MathQuill...');
        
        MQ = MathQuill.getInterface(2);
        const mathFieldElement = document.getElementById('mathField');
        
        if (!mathFieldElement) {
            console.error('mathField элемент не найден');
            return;
        }
        
        mathField = MQ.MathField(mathFieldElement, {
            spaceBehavesLikeTab: true,
            autoCommands: 'pi theta sqrt sum prod int alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi pi rho sigma tau upsilon phi chi psi omega',
            autoOperatorNames: 'sin cos tan cot arcsin arccos arctan arccot log ln lg exp lim',
            handlers: {
                edit: function() {
                    const latex = mathField.latex();
                    
                    if (latex) {
                        scrollingText.innerHTML = '\\(' + latex + '\\)';
                        if (window.MathJax) {
                            MathJax.typesetPromise([scrollingText]).catch(function(err) {
                                console.log('MathJax error:', err);
                            });
                        }
                    }
                    
                    saveData();
                },
                focus: function() {
                    console.log('MathQuill получил фокус');
                    if (keyboardVisible) closeKeyboard();
                }
            }
        });
        
        // Устанавливаем начальное значение
        mathField.latex('LED\\ бегущая\\ строка');
        
        console.log('MathQuill готов');
        
        // Загружаем сохраненные данные
        loadSavedData();
        
        // Обработчики для мобилок
        mathFieldElement.addEventListener('click', function() {
            mathField.focus();
        });
        
        mathFieldElement.addEventListener('touchstart', function(e) {
            e.preventDefault();
            mathField.focus();
        });
        
    } catch (e) {
        console.error('Ошибка MathQuill:', e);
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
    scrollingText.style.color = '';
    
    if (currentColor === 'white') scrollingText.style.color = '#ffffff';
    if (currentColor === 'red') scrollingText.style.color = '#ff3b30';
    if (currentColor === 'blue') scrollingText.style.color = '#007aff';
    if (currentColor === 'green') scrollingText.style.color = '#34c759';
    if (currentColor === 'yellow') scrollingText.style.color = '#ffcc00';
    
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
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else {
        mathKeyboard.classList.remove('show');
        mathBtn.classList.remove('active');
        if (mathField) mathField.focus();
    }
}

function closeKeyboard() {
    keyboardVisible = false;
    mathKeyboard.classList.remove('show');
    mathBtn.classList.remove('active');
}

// ============================================
// ВСТАВКА В MATHQUILL
// ============================================
function insertMathCommand(cmd) {
    if (!mathField) return;
    
    try {
        console.log('Вставка:', cmd);
        
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
            mathField.typedText('\\vec{}');
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
        !mathBtn.contains(e.target)) {
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

// Цвет
colorButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
        currentColor = this.classList[1];
        updateColor();
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

console.log('✅ LED Banner с MathQuill полностью готов!');
