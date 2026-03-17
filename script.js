// ============================================
// LED BANNER - ЧИСТЫЙ MATHQUILL (ФИНАЛЬНЫЙ)
// ============================================

// Telegram
let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Полноэкранный режим
if (tg.isVersionAtLeast && tg.isVersionAtLeast('8.0')) {
    try { tg.requestFullscreen(); } catch (e) {}
}

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
const donateBtn = document.getElementById('donateBtn');
const settingsPanel = document.getElementById('settingsPanel');
const mathBtn = document.getElementById('mathBtn');
const mathKeyboard = document.getElementById('mathKeyboard');
const mathKeys = document.querySelectorAll('.math-key');
const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const colorButtons = document.querySelectorAll('.color-btn');

// ============================================
// MATHQUILL РЕДАКТОР
// ============================================
let mathField = null;
let MQ = null;

function initMathQuill() {
    const editorElement = document.getElementById('mathEditor');
    if (!editorElement) return;
    
    try {
        MQ = MathQuill.getInterface(2);
        
        mathField = MQ.MathField(editorElement, {
            spaceBehavesLikeTab: true,
            autoCommands: 'pi theta sqrt sum prod int alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi pi rho sigma tau upsilon phi chi psi omega',
            autoOperatorNames: 'sin cos tan cot log ln exp lim',
            handlers: {
                edit: function() {
                    const latex = mathField.latex();
                    if (latex) {
                        scrollingText.innerHTML = '\\(' + latex + '\\)';
                        if (window.MathJax) {
                            MathJax.typesetPromise([scrollingText]).then(() => {
                                applyColorToMath();
                            }).catch(() => {});
                        }
                    }
                    saveData({ latex: latex });
                }
            }
        });
        
        // ВАЖНО: фокус по тапу для мобилок (усиленная версия)
        editorElement.addEventListener('mousedown', () => {
            if (mathField) {
                mathField.focus();
                console.log('Focus via mousedown');
            }
        });
        
        editorElement.addEventListener('touchstart', () => {
            if (mathField) {
                mathField.focus();
                console.log('Focus via touchstart');
            }
        }, { passive: true });
        
        // Сразу фокусируем при загрузке
        setTimeout(() => {
            if (mathField) {
                mathField.focus();
                console.log('Initial focus');
            }
        }, 500);
        
        // Защита от удаления последнего символа
        editorElement.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                const latex = mathField.latex();
                if (latex === 'LED' || latex === 'L' || latex === '') {
                    e.preventDefault();
                }
            }
        });
        
        mathField.latex('LED');
        loadSettings();
        console.log('MathQuill ready');
        
    } catch (e) {
        console.error('MathQuill error:', e);
    }
}

// ============================================
// ПЕРЕМЕННЫЕ
// ============================================
let currentSpeed = 15;
let currentColor = 'white';
let currentSize = 15;
let isRunning = false;
let keyboardVisible = false;

const colorMap = {
    'white': '#ffffff', 'red': '#ff3b30', 'blue': '#007aff',
    'green': '#34c759', 'yellow': '#ffcc00'
};

// ============================================
// ЗАГРУЗКА/СОХРАНЕНИЕ
// ============================================
function loadSettings() {
    try {
        const saved = localStorage.getItem('ledBannerData');
        if (!saved) return;
        
        const data = JSON.parse(saved);
        
        if (data.color) {
            currentColor = data.color;
            applyColorToMath();
        }
        
        if (data.speed) {
            currentSpeed = data.speed;
            speedSlider.value = currentSpeed;
            speedValue.textContent = currentSpeed + ' sec';
        }
        
        if (data.size) {
            currentSize = data.size;
            sizeSlider.value = currentSize;
            sizeValue.textContent = currentSize + 'vw';
            scrollingText.style.fontSize = currentSize + 'vw';
        }
        
        if (data.latex && mathField) {
            mathField.latex(data.latex);
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
            tg.sendData(JSON.stringify({ action: 'save', data: fullData }));
        } catch (e) {}
    }
}

// ============================================
// ПРИМЕНЕНИЕ ЦВЕТА
// ============================================
function applyColorToMath() {
    const color = colorMap[currentColor];
    scrollingText.style.color = color;
    
    scrollingText.querySelectorAll('mjx-container').forEach(el => {
        el.style.color = color;
    });
    
    // Обновляем кнопки
    colorButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.classList.contains(currentColor)) {
            btn.classList.add('active');
        }
    });
}

// ============================================
// АНИМАЦИЯ
// ============================================
function restartAnimation() {
    scrollingText.style.animation = 'none';
    void scrollingText.offsetWidth;
    scrollingText.style.animation = `scrollText ${currentSpeed}s linear infinite`;
}

// ============================================
// УПРАВЛЕНИЕ
// ============================================
function toggleKeyboard() {
    if (isRunning) return;
    keyboardVisible = !keyboardVisible;
    mathKeyboard.classList.toggle('show', keyboardVisible);
    mathBtn.classList.toggle('active', keyboardVisible);
}

function closeKeyboard() {
    keyboardVisible = false;
    mathKeyboard.classList.remove('show');
    mathBtn.classList.remove('active');
}

function toggleRun() {
    if (isRunning) {
        document.querySelector('.input-area').style.display = 'flex';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        isRunning = false;
    } else {
        scrollingText.style.fontSize = currentSize + 'vw';
        sizeValue.textContent = currentSize + 'vw';
        speedValue.textContent = currentSpeed + ' sec';
        restartAnimation();
        applyColorToMath();
        
        document.querySelector('.input-area').style.display = 'none';
        settingsBtn.style.display = 'none';
        donateBtn.style.display = 'none';
        isRunning = true;
        closeKeyboard();
        
        if (mathField) saveData({ latex: mathField.latex() });
    }
}

function handleReset() {
    if (isRunning) {
        document.querySelector('.input-area').style.display = 'flex';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        isRunning = false;
        if (mathField) saveData({ latex: mathField.latex() });
    } else {
        if (mathField) mathField.latex('LED');
        
        scrollingText.innerHTML = '\\(LED\\)';
        if (window.MathJax) {
            MathJax.typesetPromise([scrollingText]).then(applyColorToMath);
        }
        
        currentColor = 'white';
        currentSpeed = 15;
        currentSize = 15;
        
        sizeSlider.value = 15;
        speedSlider.value = 15;
        sizeValue.textContent = '15vw';
        speedValue.textContent = '15 sec';
        
        scrollingText.style.fontSize = '15vw';
        applyColorToMath();
        restartAnimation();
        
        saveData({ latex: 'LED' });
    }
    
    closeKeyboard();
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
}

// ============================================
// ВСТАВКА В MATHQUILL - ИСПРАВЛЕНО
// ============================================
function insertMathCommand(latexCmd) {
    if (!mathField || !latexCmd) return;
    
    try {
        console.log('Inserting:', latexCmd);
        
        if (latexCmd === '\\frac') {
            mathField.cmd('\\frac');
        } else if (latexCmd === '\\sqrt') {
            mathField.cmd('\\sqrt');
        } else if (latexCmd === '\\sqrt[3]') {
            mathField.typedText('\\sqrt[3]{');
            mathField.keystroke('Right');
        } else if (latexCmd === '\\sqrt[n]') {
            mathField.typedText('\\sqrt[n]{');
            mathField.keystroke('Right');
        } else if (latexCmd === '^' || latexCmd === '_') {
            mathField.cmd(latexCmd);
        } else if (latexCmd === '\\vec') {
            mathField.cmd('\\vec');
        } else {
            mathField.cmd(latexCmd);
        }
        
        mathField.focus();
    } catch (e) {
        console.error('Insert error:', e);
    }
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

// Инициализация
window.addEventListener('load', () => {
    initMathQuill();
    loadSettings();
    setTimeout(applyColorToMath, 500);
});

// Кнопка MATH
mathBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleKeyboard();
});

// Клавиатура
mathKeys.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const latexCmd = btn.dataset.cmd;
        if (latexCmd) insertMathCommand(latexCmd);
        return false;
    });
});

// RUN
runBtn.addEventListener('click', toggleRun);

// Крестик
resetBtn.addEventListener('click', handleReset);

// Настройки
settingsBtn.addEventListener('click', () => {
    if (isRunning) return;
    settingsPanel.classList.toggle('show');
    settingsBtn.classList.toggle('active');
    closeKeyboard();
});

settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    }
});

// Цвета
colorButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        let color = 'white';
        if (btn.classList.contains('red')) color = 'red';
        else if (btn.classList.contains('blue')) color = 'blue';
        else if (btn.classList.contains('green')) color = 'green';
        else if (btn.classList.contains('yellow')) color = 'yellow';
        
        currentColor = color;
        applyColorToMath();
        saveData({});
    });
});

// Размер
sizeSlider.addEventListener('input', () => {
    currentSize = parseInt(sizeSlider.value);
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveData({});
});

// Скорость
speedSlider.addEventListener('input', () => {
    currentSpeed = parseInt(speedSlider.value);
    speedValue.textContent = currentSpeed + ' sec';
    restartAnimation();
    saveData({});
});

// Закрытие клавиатуры по клику вне
document.addEventListener('click', (e) => {
    if (keyboardVisible && 
        !mathKeyboard.contains(e.target) && 
        !mathBtn.contains(e.target)) {
        closeKeyboard();
    }
});

// Кнопка назад в Telegram
tg.BackButton.onClick(() => {
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else if (keyboardVisible) {
        closeKeyboard();
    } else if (isRunning) {
        document.querySelector('.input-area').style.display = 'flex';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        isRunning = false;
    } else {
        tg.close();
    }
});
tg.BackButton.show();

console.log('✅ ЧИСТЫЙ MATHQUILL С ФИКСАМИ ГОТОВ!');
