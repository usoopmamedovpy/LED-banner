// ============================================
// LED BANNER С MATHQUILL - ФИНАЛЬНАЯ ВЕРСИЯ
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
    console.log('LED Banner загружен, устройство:', isMobile ? 'Мобильное' : 'Компьютер');
    
    setTimeout(function() {
        if (typeof MathQuill !== 'undefined') {
            initMathQuill();
        } else {
            console.error('MathQuill не загрузился');
            createFallbackInput();
        }
    }, 500);
    
    loadSavedData();
    updateDisplay();
    scrollingText.style.textShadow = 'none';
});

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
                            MathJax.typesetPromise([scrollingText]).catch(() => {});
                        }
                    }
                    
                    saveData();
                }
            }
        });
        
        mathField.latex('LED\\ бегущая\\ строка');
        
        // На компьютере - обычный ввод
        if (!isMobile) {
            mathFieldElement.addEventListener('click', function() {
                mathField.focus();
            });
        }
        
        console.log('MathQuill готов');
        loadSavedData();
        
    } catch (e) {
        console.error('Ошибка MathQuill:', e);
        createFallbackInput();
    }
}

// ============================================
// СОЗДАЕМ ЗАПАСНОЙ INPUT
// ============================================
function createFallbackInput() {
    const mathFieldElement = document.getElementById('mathField');
    if (!mathFieldElement) return;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'text-input';
    input.id = 'fallbackInput';
    input.value = 'LED бегущая строка';
    input.style.flex = '1';
    input.style.background = '#111111';
    input.style.border = '2px solid #ffffff';
    input.style.borderRadius = '30px';
    input.style.padding = '16px 20px';
    input.style.fontSize = '18px';
    input.style.color = '#ffffff';
    
    mathFieldElement.parentNode.replaceChild(input, mathFieldElement);
    
    input.addEventListener('input', function(e) {
        scrollingText.textContent = e.target.value;
        saveFallbackData(e.target.value);
    });
    
    console.log('Создан запасной input');
}

// ============================================
// МОБИЛЬНАЯ КНОПКА КЛАВИАТУРЫ
// ============================================
function addMobileKeyboardButton() {
    // Проверяем, есть ли уже кнопка
    if (document.querySelector('.mobile-keyboard-btn')) return;
    
    const mathFieldElement = document.getElementById('mathField');
    if (!mathFieldElement) return;
    
    // Создаем контейнер
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.flex = '1';
    container.style.gap = '10px';
    container.style.alignItems = 'center';
    
    // Обертываем mathField
    mathFieldElement.parentNode.insertBefore(container, mathFieldElement);
    container.appendChild(mathFieldElement);
    
    // Создаем кнопку клавиатуры
    const keyboardBtn = document.createElement('button');
    keyboardBtn.className = 'mobile-keyboard-btn';
    keyboardBtn.innerHTML = '⌨️';
    keyboardBtn.style.width = '50px';
    keyboardBtn.style.height = '50px';
    keyboardBtn.style.background = '#000000';
    keyboardBtn.style.border = '2px solid #ffffff';
    keyboardBtn.style.borderRadius = '25px';
    keyboardBtn.style.color = '#ffffff';
    keyboardBtn.style.fontSize = '24px';
    keyboardBtn.style.cursor = 'pointer';
    keyboardBtn.style.display = 'flex';
    keyboardBtn.style.alignItems = 'center';
    keyboardBtn.style.justifyContent = 'center';
    keyboardBtn.style.flexShrink = '0';
    
    container.appendChild(keyboardBtn);
    
    // Обработчик для кнопки
    keyboardBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openMobileInput();
    });
}

// ============================================
// ОТКРЫТЬ МОБИЛЬНЫЙ INPUT
// ============================================
function openMobileInput() {
    if (!mathField) return;
    
    // Получаем текущий LaTeX
    const currentLatex = mathField.latex();
    
    // Создаем временный input
    const tempInput = document.createElement('input');
    tempInput.type = 'text';
    tempInput.style.position = 'fixed';
    tempInput.style.top = '50%';
    tempInput.style.left = '50%';
    tempInput.style.transform = 'translate(-50%, -50%)';
    tempInput.style.width = '90%';
    tempInput.style.maxWidth = '400px';
    tempInput.style.height = '60px';
    tempInput.style.background = '#111111';
    tempInput.style.border = '2px solid #ffffff';
    tempInput.style.borderRadius = '30px';
    tempInput.style.padding = '16px 20px';
    tempInput.style.fontSize = '18px';
    tempInput.style.color = '#ffffff';
    tempInput.style.zIndex = '10000';
    tempInput.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    tempInput.placeholder = 'Введите текст...';
    tempInput.value = currentLatex.replace(/\\[a-zA-Z]+/g, '').replace(/[{}]/g, '');
    
    document.body.appendChild(tempInput);
    tempInput.focus();
    
    // Обработчик ввода
    tempInput.addEventListener('input', function(e) {
        const text = e.target.value;
        // Вставляем как обычный текст в MathQuill
        mathField.typedText(text);
    });
    
    // Обработчик Enter
    tempInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            tempInput.remove();
            mathField.focus();
        }
    });
    
    // Обработчик потери фокуса
    tempInput.addEventListener('blur', function() {
        setTimeout(function() {
            tempInput.remove();
            mathField.focus();
        }, 200);
    });
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

function saveFallbackData(text) {
    const data = {
        latex: text,
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
    
    // Убираем старые классы
    scrollingText.classList.remove('white', 'red', 'blue', 'green', 'yellow');
    
    // Добавляем новый класс
    scrollingText.classList.add(currentColor);
    
    // Убираем inline style
    scrollingText.style.color = '';
    
    // Обновляем кнопки
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
        
        // Если это мобилка и нет кнопки клавиатуры - добавляем
        if (isMobile) {
            addMobileKeyboardButton();
        }
    } else {
        mathKeyboard.classList.remove('show');
        mathBtn.classList.remove('active');
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
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        isRunning = false;
        
        if (mathField) {
            setTimeout(function() {
                mathField.focus();
            }, 100);
        }
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
    sizeValue.textContent = '15vw';
    speedValue.textContent = '15 сек';
    
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

// ЦВЕТ - ИСПРАВЛЕНО!
colorButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        console.log('Клик по цвету:', this.classList);
        
        // Получаем цвет из класса
        let color = '';
        if (this.classList.contains('white')) color = 'white';
        if (this.classList.contains('red')) color = 'red';
        if (this.classList.contains('blue')) color = 'blue';
        if (this.classList.contains('green')) color = 'green';
        if (this.classList.contains('yellow')) color = 'yellow';
        
        if (color) {
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

console.log('✅ LED Banner финальная версия готова!');
