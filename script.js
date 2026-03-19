// ============================================
// LED BANNER - ДЕСКТОПНАЯ ЛОГИКА НА МОБИЛКАХ
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

document.documentElement.style.backgroundColor = '#000000';
document.body.style.backgroundColor = '#000000';
document.body.style.color = '#ffffff';

// ============================================
// ЭЛЕМЕНТЫ
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

const colorMap = {
    'white': '#ffffff', 'red': '#ff3b30', 'blue': '#007aff',
    'green': '#34c759', 'yellow': '#ffcc00'
};

// ============================================
// ИНИЦИАЛИЗАЦИЯ MATHQUILL
// ============================================
window.addEventListener('load', function() {
    console.log('LED Banner loaded');
    
    const mathFieldElement = document.getElementById('mathField');
    
    setTimeout(() => {
        if (typeof MathQuill !== 'undefined') {
            initMathQuill(mathFieldElement);
        }
    }, 500);
    
    loadSavedData();
    applyColor();
});

function initMathQuill(element) {
    try {
        MQ = MathQuill.getInterface(2);
        
        mathField = MQ.MathField(element, {
            spaceBehavesLikeTab: true,
            autoCommands: 'pi theta sqrt sum prod int alpha beta gamma delta epsilon',
            autoOperatorNames: 'sin cos tan cot arcsin arccos arctan log ln exp lim',
            handlers: {
                edit: function() {
                    const latex = mathField.latex();
                    if (latex) {
                        scrollingText.innerHTML = '\\(' + latex + '\\)';
                        if (window.MathJax) {
                            MathJax.typesetPromise([scrollingText]).then(() => {
                                applyColor();
                            }).catch(() => {});
                        }
                    }
                    saveData({ latex: latex });
                }
            }
        });
        
        // Устанавливаем начальное значение
        mathField.latex('LED\\ бегущая\\ строка');
        
        // Обработчики для мобилок (только фокус)
        element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            mathField.focus();
        });
        
        element.addEventListener('click', () => {
            mathField.focus();
        });
        
        console.log('MathQuill initialized');
        loadSavedData();
        
    } catch (e) {
        console.error('MathQuill error:', e);
    }
}

// ============================================
// ПРИМЕНЕНИЕ ЦВЕТА
// ============================================
function applyColor() {
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
        #scrollingText, #scrollingText mjx-container {
            color: ${color} !important;
        }
    `;
    document.head.appendChild(style);
    
    colorButtons.forEach(btn => {
        btn.classList.toggle('active', btn.classList.contains(currentColor));
    });
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
                currentColor = data.color;
                applyColor();
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
    localStorage.setItem('ledBannerData', JSON.stringify(fullData));
    
    if (tg) {
        try {
            tg.sendData(JSON.stringify({ action: 'save', data: fullData }));
        } catch (e) {}
    }
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
        applyColor();
        
        inputArea.style.display = 'none';
        settingsBtn.style.display = 'none';
        donateBtn.style.display = 'none';
        isRunning = true;
        closeKeyboard();
        saveData({});
    }
}

function handleReset() {
    if (isRunning) {
        inputArea.style.display = 'flex';
        settingsBtn.style.display = 'flex';
        donateBtn.style.display = 'flex';
        isRunning = false;
        
        if (mathField) {
            const currentLatex = mathField.latex();
            saveData({ latex: currentLatex });
        }
    } else {
        if (mathField) {
            mathField.latex('LED\\ бегущая\\ строка');
        }
        
        scrollingText.innerHTML = '\\(LED\\ бегущая\\ строка\\)';
        if (window.MathJax) {
            MathJax.typesetPromise([scrollingText]).then(applyColor);
        }
        
        currentColor = 'white';
        currentSpeed = 15;
        currentSize = 15;
        
        sizeSlider.value = 15;
        speedSlider.value = 15;
        sizeValue.textContent = '15vw';
        speedValue.textContent = '15 sec';
        
        scrollingText.style.fontSize = '15vw';
        applyColor();
        restartAnimation();
        
        saveData({ latex: 'LED\\ бегущая\\ строка' });
    }
    
    closeKeyboard();
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
}

function insertMathCommand(cmd) {
    if (!mathField) return;
    
    try {
        if (cmd === '√') mathField.cmd('\\sqrt');
        else if (cmd === '∛') mathField.typedText('\\sqrt[3]{');
        else if (cmd === '∜') mathField.typedText('\\sqrt[4]{');
        else if (cmd === 'n√') mathField.typedText('\\sqrt[n]{');
        else if (cmd === '→' || cmd === '\\vec') mathField.typedText('\\vec{}');
        else if (cmd === 'a/b' || cmd === 'frac') mathField.cmd('\\frac');
        else if (cmd === 'Δ') mathField.cmd('\\Delta');
        else mathField.cmd(cmd);
        
        mathField.focus();
    } catch (e) {
        console.error('Insert error:', e);
    }
}

// ============================================
// ОБРАБОТЧИКИ
// ============================================

if (mathBtn) mathBtn.style.display = 'none';

tabFunctions.addEventListener('click', () => {
    tabFunctions.classList.add('active');
    tabGreek.classList.remove('active');
    tabSymbols.classList.remove('active');
    functionsTab.classList.add('active');
    greekTab.classList.remove('active');
    symbolsTab.classList.remove('active');
});

tabGreek.addEventListener('click', () => {
    tabGreek.classList.add('active');
    tabFunctions.classList.remove('active');
    tabSymbols.classList.remove('active');
    greekTab.classList.add('active');
    functionsTab.classList.remove('active');
    symbolsTab.classList.remove('active');
});

tabSymbols.addEventListener('click', () => {
    tabSymbols.classList.add('active');
    tabFunctions.classList.remove('active');
    tabGreek.classList.remove('active');
    symbolsTab.classList.add('active');
    functionsTab.classList.remove('active');
    greekTab.classList.remove('active');
});

mathKeys.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const cmd = btn.textContent;
        const dataCmd = btn.dataset.cmd;
        
        if (dataCmd === 'frac' || cmd === 'a/b') insertMathCommand('frac');
        else if (dataCmd === '\\vec' || cmd === '⃗' || cmd === '→') insertMathCommand('→');
        else if (dataCmd === '\\sqrt[n]' || cmd === 'n√') insertMathCommand('n√');
        else if (dataCmd === '\\Delta' || cmd === 'Δ') insertMathCommand('Δ');
        else insertMathCommand(cmd);
    });
});

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
        applyColor();
        saveData({});
    });
});

sizeSlider.addEventListener('input', () => {
    currentSize = parseInt(sizeSlider.value);
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveData({});
});

speedSlider.addEventListener('input', () => {
    currentSpeed = parseInt(speedSlider.value);
    speedValue.textContent = currentSpeed + ' sec';
    restartAnimation();
    saveData({});
});

resetBtn.addEventListener('click', handleReset);

settingsBtn.addEventListener('click', () => {
    if (isRunning) return;
    
    if (settingsPanel.classList.contains('show')) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    } else {
        settingsPanel.classList.add('show');
        settingsBtn.classList.add('active');
        closeKeyboard();
    }
});

settingsPanel.addEventListener('click', (e) => {
    if (e.target === settingsPanel) {
        settingsPanel.classList.remove('show');
        settingsBtn.classList.remove('active');
    }
});

document.addEventListener('click', (e) => {
    if (keyboardVisible && 
        !mathKeyboard.contains(e.target) && 
        !mathBtn.contains(e.target)) {
        closeKeyboard();
    }
});

// ============================================
// TELEGRAM BACK BUTTON
// ============================================
tg.BackButton.onClick(() => {
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

console.log('✅ DESKTOP LOGIC ON MOBILE - READY!');
