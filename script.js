// ============================================
// LED BANNER С MATHQUILL - МОБИЛЬНАЯ ВЕРСИЯ С КНОПКОЙ
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
    
    // Если это мобилка - добавляем кнопку клавиатуры сразу
    if (isMobile) {
        setTimeout(function() {
            addMobileKeyboardButton();
        }, 1000);
    }
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
    console.log('Добавляем кнопку клавиатуры для мобилок');
    
    // Проверяем, есть ли уже кнопка
    if (document.querySelector('.mobile-keyboard-btn')) {
        console.log('Кнопка уже существует');
        return;
    }
    
    const mathFieldElement = document.getElementById('mathField');
    if (!mathFieldElement) {
        console.log('mathField не найден');
        return;
    }
    
    // Проверяем, не обернут ли уже mathField
    let container = mathFieldElement.parentNode;
    if (container.classList && container.classList.contains('math-field-container')) {
        console.log('Уже обернуто');
        return;
    }
    
    // Создаем контейнер
    const container = document.createElement('div');
    container.className = 'math-field-container';
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
    keyboardBtn.style.transition = 'all 0.2s ease';
    
    container.appendChild(keyboardBtn);
    
    console.log('Кнопка клавиатуры добавлена');
    
    // Обработчик для кнопки
    keyboardBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openMobileInput();
    });
    
    keyboardBtn.addEventListener('touchstart', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openMobileInput();
    });
}

// ============================================
// ОТКРЫТЬ МОБИЛЬНЫЙ INPUT
// ============================================
function openMobileInput() {
    if (!mathField) return;
    
    console.log('Открываем мобильный input');
    
    // Получаем текущий LaTeX
    const currentLatex = mathField.latex();
    
    // Простая очистка LaTeX для отображения
    let plainText = currentLatex
        .replace(/\\[a-zA-Z]+/g, '')
        .replace(/[{}]/g, '')
        .replace(/\\/g, '');
    
    // Создаем затемнение фона
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.background = 'rgba(0,0,0,0.8)';
    overlay.style.zIndex = '9999';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    
    // Создаем контейнер для input
    const inputContainer = document.createElement('div');
    inputContainer.style.width = '90%';
    inputContainer.style.maxWidth = '400px';
    inputContainer.style.background = '#111111';
    inputContainer.style.border = '2px solid #ffffff';
    inputContainer.style.borderRadius = '30px';
    inputContainer.style.padding = '20px';
    
    // Создаем заголовок
    const title = document.createElement('div');
    title.textContent = 'Введите текст';
    title.style.color = '#ffffff';
    title.style.fontSize = '18px';
    title.style.marginBottom = '15px';
    title.style.textAlign = 'center';
    
    // Создаем input
    const tempInput = document.createElement('input');
    tempInput.type = 'text';
    tempInput.style.width = '100%';
    tempInput.style.height = '50px';
    tempInput.style.background = '#000000';
    tempInput.style.border = '2px solid #ffffff';
    tempInput.style.borderRadius = '25px';
    tempInput.style.padding = '0 15px';
    tempInput.style.fontSize = '16px';
    tempInput.style.color = '#ffffff';
    tempInput.style.outline = 'none';
    tempInput.style.marginBottom = '15px';
    tempInput.value = plainText || 'LED бегущая строка';
    tempInput.placeholder = 'Введите текст...';
    
    // Создаем кнопки
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '10px';
    
    const okBtn = document.createElement('button');
    okBtn.textContent = 'Готово';
    okBtn.style.flex = '1';
    okBtn.style.height = '45px';
    okBtn.style.background = '#ffffff';
    okBtn.style.border = 'none';
    okBtn.style.borderRadius = '22px';
    okBtn.style.color = '#000000';
    okBtn.style.fontSize = '16px';
    okBtn.style.fontWeight = 'bold';
    okBtn.style.cursor = 'pointer';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Отмена';
    cancelBtn.style.flex = '1';
    cancelBtn.style.height = '45px';
    cancelBtn.style.background = 'transparent';
    cancelBtn.style.border = '2px solid #ffffff';
    cancelBtn.style.borderRadius = '22px';
    cancelBtn.style.color = '#ffffff';
    cancelBtn.style.fontSize = '16px';
    cancelBtn.style.fontWeight = 'bold';
    cancelBtn.style.cursor = 'pointer';
    
    buttonContainer.appendChild(okBtn);
    buttonContainer.appendChild(cancelBtn);
    
    inputContainer.appendChild(title);
    inputContainer.appendChild(tempInput);
    inputContainer.appendChild(buttonContainer);
    overlay.appendChild(inputContainer);
    document.body.appendChild(overlay);
    
    tempInput.focus();
    
    // Обработчики
    function closeAndSave() {
        const text = tempInput.value;
        if (text) {
            // Вставляем текст в MathQuill
            mathField.typedText(text);
        }
        document.body.removeChild(overlay);
        mathField.focus();
    }
    
    function closeWithoutSave() {
        document.body.removeChild(overlay);
        mathField.focus();
    }
    
    okBtn.addEventListener('click', closeAndSave);
    cancelBtn.addEventListener('click', closeWithoutSave);
    
    tempInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            closeAndSave();
        }
    });
    
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeWithoutSave();
        }
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

console.log('✅ LED Banner финальная версия с кнопкой клавиатуры готова!');
