// ============================================
// LED BANNER - WYSIWYG MATH EDITOR (PHOTOMATH STYLE)
// ============================================

// Telegram
let tg = window.Telegram.WebApp;

// Сначала расширяем до максимума
tg.ready();
tg.expand();

// ЗАПРАШИВАЕМ ПОЛНОЭКРАННЫЙ РЕЖИМ (для новых версий Telegram)
if (tg.isVersionAtLeast && tg.isVersionAtLeast('8.0')) {
    try {
        tg.requestFullscreen();
        console.log('✅ Fullscreen mode activated');
    } catch (e) {
        console.log('❌ Fullscreen not supported');
    }
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
// MATHQUILL РЕДАКТОР
// ============================================
let mathField = null;
let MQ = null;

function initMathQuill() {
    const editorElement = document.getElementById('mathEditor');
    if (!editorElement) {
        console.error('Editor element not found');
        return;
    }
    
    try {
        MQ = MathQuill.getInterface(2);
        
        mathField = MQ.MathField(editorElement, {
            spaceBehavesLikeTab: true,
            autoCommands: 'pi theta sqrt sum prod int alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi pi rho sigma tau upsilon phi chi psi omega',
            autoOperatorNames: 'sin cos tan cot log ln exp lim',
            handlers: {
                edit: function() {
                    // Получаем LaTeX и обновляем бегущую строку
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
                },
                // Фокус на редакторе
                focus: function() {
                    console.log('Editor focused');
                },
                // Потеря фокуса
                blur: function() {
                    console.log('Editor blurred');
                }
            }
        });
        
        // Устанавливаем начальное значение
        mathField.latex('LED\\ banner');
        
        console.log('MathQuill editor initialized');
        
        // Загружаем сохраненные данные
        loadSavedData();
        
    } catch (e) {
        console.error('Error initializing MathQuill:', e);
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
let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Карта цветов
const colorMap = {
    'white': '#ffffff',
    'red': '#ff3b30',
    'blue': '#007aff',
    'green': '#34c759',
    'yellow': '#ffcc00'
};

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
window.addEventListener('load', function() {
    console.log('LED Banner WYSIWYG loaded');
    
    // Инициализируем MathQuill
    initMathQuill();
    
    // Загружаем настройки
    loadSettings();
    
    setTimeout(applyColorToMath, 500);
    scrollingText.style.textShadow = 'none';
});

// ============================================
// ЗАГРУЗКА НАСТРОЕК
// ============================================
function loadSettings() {
    try {
        const saved = localStorage.getItem('ledBannerSettings');
        if (saved) {
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
    localStorage.setItem('ledBannerSettings', JSON.stringify(fullData));
    
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
// ПРИМЕНЕНИЕ ЦВЕТА
// ============================================
function applyColorToMath() {
    console.log('Applying color:', currentColor);
    
    const color = colorMap[currentColor];
    scrollingText.style.color = color;
    
    scrollingText.querySelectorAll('mjx-container').forEach(el => {
        el.style.color = color;
    });
    
    const oldStyle = document.getElementById('mathColorStyle');
    if (oldStyle) oldStyle.remove();
    
    const style = document.createElement('style');
    style.id = 'mathColorStyle';
    style.textContent = `
      #scrollingText, 
      #scrollingText mjx-container {
        color: ${color} !important;
      }
    `;
    document.head.appendChild(style);
    
    colorButtons.forEach(btn => {
        btn.classList.toggle('active', btn.classList.contains(currentColor));
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

function toggleRun() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        isRunning = false;
    } else {
        scrollingText.style.fontSize = currentSize + 'vw';
        sizeValue.textContent = currentSize + 'vw';
        speedValue.textContent = currentSpeed + ' sec';
        restartAnimation();
        applyColorToMath();
        
        inputArea.style.display = 'none';
        settingsBtn.style.display = 'none';
        donateBtn.style.display = 'none';
        isRunning = true;
        closeKeyboard();
        
        if (mathField) {
            saveData({ latex: mathField.latex() });
        }
    }
}

// ============================================
// УМНЫЙ КРЕСТИК
// ============================================
function handleReset() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        isRunning = false;
        
        if (mathField) {
            saveData({ latex: mathField.latex() });
        }
    } else {
        if (mathField) {
            mathField.latex('LED\\ banner');
        }
        
        scrollingText.innerHTML = '\\(LED\\ banner\\)';
        if (window.MathJax) {
            MathJax.typesetPromise([scrollingText]).then(() => {
                applyColorToMath();
            }).catch(() => {});
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
        
        saveData({ latex: 'LED\\ banner' });
    }
    
    closeKeyboard();
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
}

// ============================================
// ВСТАВКА В MATHQUILL
// ============================================
function insertMathCommand(cmd) {
    if (!mathField) return;
    
    try {
        console.log('Inserting:', cmd);
        
        if (cmd === '√') {
            mathField.cmd('\\sqrt');
        } else if (cmd === '∛') {
            mathField.typedText('\\sqrt[3]{');
            mathField.keystroke('Right');
        } else if (cmd === 'n√') {
            mathField.typedText('\\sqrt[n]{');
            mathField.keystroke('Right');
        } else if (cmd === 'a/b' || cmd === 'frac') {
            mathField.cmd('\\frac');
        } else if (cmd === '^') {
            mathField.cmd('^');
        } else if (cmd === '_') {
            mathField.cmd('_');
        } else if (cmd === '→' || cmd === '\\vec') {
            mathField.typedText('\\vec{}');
            mathField.keystroke('Left');
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
        console.error('Error inserting command:', e);
    }
}

// ============================================
// ОБРАБОТЧИКИ ВКЛАДОК
// ============================================

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

// ============================================
// ОБРАБОТЧИКИ КНОПОК КЛАВИАТУРЫ
// ============================================

mathKeys.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const cmd = this.textContent;
        const dataCmd = this.dataset.cmd;
        
        if (dataCmd === 'frac' || cmd === 'a/b') {
            insertMathCommand('frac');
        } else if (dataCmd === '\\vec' || cmd === '⃗' || cmd === '→') {
            insertMathCommand('→');
        } else if (dataCmd === '\\sqrt[n]' || cmd === 'n√') {
            insertMathCommand('n√');
        } else if (dataCmd === '\\Delta' || cmd === 'Δ') {
            insertMathCommand('\\Delta');
        } else {
            insertMathCommand(cmd);
        }
        
        return false;
    });
});

// ============================================
// ОБРАБОТЧИКИ НАСТРОЕК
// ============================================

colorButtons.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        let color = 'white';
        if (this.classList.contains('red')) color = 'red';
        else if (this.classList.contains('blue')) color = 'blue';
        else if (this.classList.contains('green')) color = 'green';
        else if (this.classList.contains('yellow')) color = 'yellow';
        
        currentColor = color;
        applyColorToMath();
        saveData({});
    });
});

sizeSlider.addEventListener('input', function() {
    currentSize = parseInt(this.value);
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveData({});
});

speedSlider.addEventListener('input', function() {
    currentSpeed = parseInt(this.value);
    speedValue.textContent = currentSpeed + ' sec';
    restartAnimation();
    saveData({});
});

resetBtn.addEventListener('click', handleReset);

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
        donateBtn.style.display = 'flex';
        isRunning = false;
    } else {
        tg.close();
    }
});
tg.BackButton.show();

console.log('✅ LED BANNER - WYSIWYG MATH EDITOR READY!');
