let tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

if (tg.isVersionAtLeast && tg.isVersionAtLeast('8.0')) {
    try { tg.requestFullscreen(); console.log('✅ Fullscreen mode activated'); } catch(e) { console.log('❌ Fullscreen not supported'); }
}

tg.setHeaderColor('#000000');
tg.setBackgroundColor('#000000');
document.documentElement.style.backgroundColor = '#000000';
document.body.style.backgroundColor = '#000000';
document.body.style.color = '#ffffff';

const userLang = tg.initDataUnsafe?.user?.language_code || navigator.language || 'en';
const isRussian = userLang.startsWith('ru') || userLang.startsWith('be');
const t = (isRussian ? {
    banner: 'LED бегущая строка', inputPlaceholder: 'Введите текст...', settings: 'Настройки',
    textSize: 'Размер текста (8-40)', speed: 'Скорость (2-30 сек)', color: 'Цвет текста', run: 'RUN', math: 'MATH'
} : {
    banner: 'LED banner', inputPlaceholder: 'Enter text...', settings: 'Settings',
    textSize: 'Text size (8-40)', speed: 'Speed (2-30 sec)', color: 'Text color', run: 'RUN', math: 'MATH'
});

const scrollingText = document.getElementById('scrollingText');
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
const tabPhysics = document.getElementById('tabPhysics');
const functionsTab = document.getElementById('functionsTab');
const greekTab = document.getElementById('greekTab');
const symbolsTab = document.getElementById('symbolsTab');
const physicsTab = document.getElementById('physicsTab');

const physicsSubtabs = document.querySelectorAll('.physics-subtab-btn');
const physicsCategories = document.querySelectorAll('.physics-category');
const physicsKeys = document.querySelectorAll('.physics-category .math-key');

let currentSpeed = 15, currentColor = 'white', currentSize = 15, isRunning = false, keyboardVisible = false;
const colorMap = { 'white': '#ffffff', 'red': '#ff3b30', 'blue': '#007aff', 'green': '#34c759', 'yellow': '#ffcc00' };

window.addEventListener('load', function() {
    updateTexts();
    createUnifiedInterface();
    loadSavedData();
    setTimeout(applyColorToMath, 500);
    scrollingText.style.textShadow = 'none';
});

function updateTexts() {
    const settingsTitle = document.querySelector('.settings-content h3');
    if (settingsTitle) settingsTitle.textContent = t.settings;
    const settingLabels = document.querySelectorAll('.setting-item label');
    if (settingLabels.length >= 3) {
        settingLabels[0].textContent = t.textSize;
        settingLabels[1].textContent = t.speed;
        settingLabels[2].textContent = t.color;
    }
    scrollingText.innerHTML = '\\(' + t.banner + '\\)';
}

function createUnifiedInterface() {
    const mathFieldElement = document.getElementById('mathField');
    if (!mathFieldElement) return;
    
    inputArea.innerHTML = '';
    inputArea.style.cssText = 'display:flex; justify-content:flex-end; align-items:center; padding:16px; gap:10px; position:absolute; bottom:0; left:0; right:0; background:#000; border-top:2px solid rgba(255,255,255,0.2); z-index:100;';
    
    const mathButton = document.createElement('button');
    mathButton.className = 'math-btn';
    mathButton.id = 'mainMathBtn';
    mathButton.textContent = t.math;
    mathButton.style.cssText = 'width:70px; height:60px; background:#000; border:2px solid #fff; border-radius:30px; color:#fff; font-weight:bold; font-size:18px; cursor:pointer; flex-shrink:0; transition:all 0.2s ease;';
    
    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'mainInput';
    textInput.className = 'text-input';
    textInput.placeholder = t.inputPlaceholder;
    textInput.value = t.banner;
    textInput.style.cssText = 'flex:1; min-width:0; background:#111; border:2px solid #fff; border-radius:30px; padding:14px 18px; font-size:16px; color:#fff; outline:none; transition:all 0.2s ease;';
    
    const runButton = document.createElement('button');
    runButton.className = 'run-btn';
    runButton.id = 'mainRunBtn';
    runButton.textContent = t.run;
    runButton.style.cssText = 'width:70px; height:60px; background:transparent; border:2px solid #fff; border-radius:30px; color:#fff; font-weight:bold; font-size:18px; cursor:pointer; flex-shrink:0; transition:all 0.2s ease;';
    
    inputArea.appendChild(mathButton);
    inputArea.appendChild(textInput);
    inputArea.appendChild(runButton);
    
    mathButton.addEventListener('click', (e) => { e.stopPropagation(); toggleKeyboard(); });
    runButton.addEventListener('click', toggleRun);
    
    textInput.addEventListener('input', (e) => {
        const text = e.target.value;
        const latex = parseToLaTeX(text);
        scrollingText.innerHTML = '\\(' + latex + '\\)';
        if (window.MathJax) MathJax.typesetPromise([scrollingText]).then(() => applyColorToMath()).catch(()=>{});
        saveData({ latex: latex, raw: text });
    });
    
    textInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') toggleRun(); });
    
    document.addEventListener('click', (e) => {
        if (keyboardVisible && !mathKeyboard.contains(e.target) && !mathButton.contains(e.target)) closeKeyboard();
    });
    
    physicsKeys.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); e.preventDefault();
            const formula = btn.dataset.formula;
            if (formula) insertMathSymbol(formula);
            return false;
        });
    });
    
    tabPhysics.addEventListener('click', () => {
        tabFunctions.classList.remove('active'); tabGreek.classList.remove('active'); tabSymbols.classList.remove('active'); tabPhysics.classList.add('active');
        functionsTab.classList.remove('active'); greekTab.classList.remove('active'); symbolsTab.classList.remove('active'); physicsTab.classList.add('active');
        physicsCategories.forEach(cat => cat.classList.remove('active'));
        physicsSubtabs.forEach(btn => btn.classList.remove('active'));
        document.getElementById('phys-mechanics').classList.add('active');
        physicsSubtabs[0].classList.add('active');
    });
    
    physicsSubtabs.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const cat = btn.dataset.physCat;
            physicsSubtabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            physicsCategories.forEach(catEl => catEl.classList.remove('active'));
            document.getElementById(`phys-${cat}`).classList.add('active');
        });
    });
}

function parseToLaTeX(text) {
    if (!text) return '';
    let result = text;
    
    // 1. Сохраняем пробелы
    result = result.replace(/ /g, '\\ ');
    
    // 2. Векторы
    result = result.replace(/\{([^}]+)\}/g, '\\vec{$1}');
    
    // 3. Дроби в формате (выражение/выражение)
    let prevResult;
    do {
        prevResult = result;
        result = result.replace(/\(([^()/]+)\/([^()/]+)\)/g, '\\frac{$1}{$2}');
        result = result.replace(/\(((?:[^()]|\([^()]*\))*)\)\s*\/\s*\(((?:[^()]|\([^()]*\))*)\)/g, '\\frac{$1}{$2}');
        result = result.replace(/\((\d+)\/([^()]+)\)/g, '\\frac{$1}{$2}');
        result = result.replace(/\(([^()]+)\/(\d+)\)/g, '\\frac{$1}{$2}');
        result = result.replace(/\(([a-zA-Zα-ω]+)\/([a-zA-Zα-ω]+)\)/g, '\\frac{$1}{$2}');
    } while (result !== prevResult);
    
    // 4. Простые дроби
    result = result.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
    
    // 5. КОРНИ с дробями внутри
    result = result.replace(/√\[\(([^)]+)\/([^)]+)\)\]/g, '\\sqrt{\\frac{$1}{$2}}');
    
    // 6. КОРЕНЬ n-Й СТЕПЕНИ
    result = result.replace(/\/(\d+)\/√\[([^\]]+)\]/g, '\\sqrt[$1]{$2}');
    result = result.replace(/\/([a-zA-Zα-ω]+)\/√\[([^\]]+)\]/g, '\\sqrt[$1]{$2}');
    
    // 7. КУБИЧЕСКИЙ КОРЕНЬ
    result = result.replace(/∛\[([^\]]+)\]/g, '\\sqrt[3]{$1}');
    
    // 8. КОРЕНЬ 4-Й СТЕПЕНИ
    result = result.replace(/∜\[([^\]]+)\]/g, '\\sqrt[4]{$1}');
    
    // 9. ОБЫЧНЫЙ КОРЕНЬ
    result = result.replace(/√\[([^\]]+)\]/g, '\\sqrt{$1}');
    result = result.replace(/√([a-zA-Z0-9α-ω])/g, '\\sqrt{$1}');
    
    // 10. Степени
    result = result.replace(/([a-zA-Z0-9α-ω])\^\(([^)]+)\)/g, '$1^{$2}');
    result = result.replace(/([a-zA-Z0-9α-ω])\^([a-zA-Z0-9α-ω])/g, '$1^{$2}');
    
    // 11. Индексы
    result = result.replace(/([a-zA-Z0-9α-ω])_\(([^)]+)\)/g, '$1_{$2}');
    result = result.replace(/([a-zA-Z0-9α-ω])_([a-zA-Z0-9α-ω])/g, '$1_{$2}');
    
    // 12. Греческие буквы
    const greekMap = {
        'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta',
        'ε': '\\epsilon', 'ζ': '\\zeta', 'η': '\\eta', 'θ': '\\theta',
        'ι': '\\iota', 'κ': '\\kappa', 'λ': '\\lambda', 'μ': '\\mu',
        'ν': '\\nu', 'ξ': '\\xi', 'π': '\\pi', 'ρ': '\\rho',
        'σ': '\\sigma', 'τ': '\\tau', 'υ': '\\upsilon', 'φ': '\\phi',
        'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega',
        'Α': '\\Alpha', 'Β': '\\Beta', 'Γ': '\\Gamma', 'Δ': '\\Delta',
        'Ε': '\\Epsilon', 'Ζ': '\\Zeta', 'Η': '\\Eta', 'Θ': '\\Theta',
        'Ι': '\\Iota', 'Κ': '\\Kappa', 'Λ': '\\Lambda', 'Μ': '\\Mu',
        'Ν': '\\Nu', 'Ξ': '\\Xi', 'Π': '\\Pi', 'Ρ': '\\Rho',
        'Σ': '\\Sigma', 'Τ': '\\Tau', 'Υ': '\\Upsilon', 'Φ': '\\Phi',
        'Χ': '\\Chi', 'Ψ': '\\Psi', 'Ω': '\\Omega'
    };
    
    for (let [char, latex] of Object.entries(greekMap)) {
        result = result.replace(new RegExp(char, 'g'), latex);
    }
    
    // 13. Функции
    const funcs = ['sin', 'cos', 'tan', 'cot', 'arcsin', 'arccos', 'arctan', 'arccot', 'log', 'ln', 'exp', 'lim'];
    funcs.forEach(func => {
        result = result.replace(new RegExp(func + '\\s*\\(', 'g'), func + '(');
    });
    
    return result;
}

function applyColorToMath() {
    const color = colorMap[currentColor];
    scrollingText.style.color = color;
    scrollingText.querySelectorAll('mjx-container').forEach(el => el.style.color = color);
    const oldStyle = document.getElementById('mathColorStyle');
    if (oldStyle) oldStyle.remove();
    const style = document.createElement('style');
    style.id = 'mathColorStyle';
    style.textContent = `#scrollingText, #scrollingText mjx-container { color: ${color} !important; }`;
    document.head.appendChild(style);
    colorButtons.forEach(btn => btn.classList.toggle('active', btn.classList.contains(currentColor)));
}

function loadSavedData() {
    try {
        const saved = localStorage.getItem('ledBannerData');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.color) { currentColor = data.color; setTimeout(() => applyColorToMath(), 100); }
            if (data.speed) { currentSpeed = data.speed; speedSlider.value = currentSpeed; speedValue.textContent = currentSpeed + (isRussian ? ' сек' : ' sec'); }
            if (data.size) { currentSize = data.size; sizeSlider.value = currentSize; sizeValue.textContent = currentSize + 'vw'; scrollingText.style.fontSize = currentSize + 'vw'; }
            if (data.raw) {
                const input = document.getElementById('mainInput');
                if (input) input.value = data.raw;
                if (data.latex) {
                    scrollingText.innerHTML = '\\(' + data.latex + '\\)';
                    if (window.MathJax) MathJax.typesetPromise([scrollingText]).then(() => applyColorToMath()).catch(()=>{});
                }
            }
        }
    } catch(e) {}
}

function saveData(data) {
    const fullData = { ...data, color: currentColor, speed: currentSpeed, size: currentSize };
    localStorage.setItem('ledBannerData', JSON.stringify(fullData));
    if (tg) try { tg.sendData(JSON.stringify({ action: 'save', data: fullData })); } catch(e) {}
}

function restartAnimation() { scrollingText.style.animation = 'none'; void scrollingText.offsetWidth; scrollingText.style.animation = `scrollText ${currentSpeed}s linear infinite`; }

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
        donateBtn.style.display = 'flex';
        isRunning = false;
    } else {
        scrollingText.style.fontSize = currentSize + 'vw';
        sizeValue.textContent = currentSize + 'vw';
        speedValue.textContent = currentSpeed + (isRussian ? ' сек' : ' sec');
        restartAnimation();
        applyColorToMath();
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
        const input = document.getElementById('mainInput');
        if (input) { const currentText = input.value; const latex = parseToLaTeX(currentText); saveData({ latex, raw: currentText }); }
    } else {
        const input = document.getElementById('mainInput');
        if (input) input.value = t.banner;
        scrollingText.innerHTML = '\\(' + t.banner + '\\)';
        if (window.MathJax) MathJax.typesetPromise([scrollingText]).then(() => applyColorToMath()).catch(()=>{});
        currentColor = 'white'; currentSpeed = 15; currentSize = 15;
        sizeSlider.value = 15; speedSlider.value = 15;
        sizeValue.textContent = '15vw'; speedValue.textContent = currentSpeed + (isRussian ? ' сек' : ' sec');
        scrollingText.style.fontSize = '15vw';
        applyColorToMath();
        restartAnimation();
        saveData({ latex: 'LED\\ ' + (isRussian ? 'бегущая строка' : 'banner'), raw: t.banner });
    }
    closeKeyboard();
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
}

function insertMathSymbol(symbol) {
    const input = document.getElementById('mainInput');
    if (!input) return;
    const start = input.selectionStart, end = input.selectionEnd, text = input.value;
    let insertText = symbol;
    if (symbol === '√') insertText = '√[]';
    else if (symbol === '∛') insertText = '∛[]';
    else if (symbol === '∜') insertText = '∜[]';
    else if (symbol === 'n√' || symbol === '√[n]') insertText = '/n/√[]';
    else if (symbol === '→' || symbol === '\\vec' || symbol === '⃗') insertText = '{}';
    else if (symbol === 'a/b' || symbol === 'frac') insertText = '()';
    else if (symbol === 'Δ' || symbol === '\\Delta') insertText = 'Δ';
    const newText = text.substring(0, start) + insertText + text.substring(end);
    input.value = newText;
    let newPos = start + insertText.length;
    if (insertText.includes('[]')) newPos = start + insertText.length - 1;
    else if (insertText === '{}') newPos = start + 1;
    else if (insertText === '()') newPos = start + 1;
    else if (insertText === '/n/√[]') newPos = start + 3;
    input.setSelectionRange(newPos, newPos);
    input.focus();
    const latex = parseToLaTeX(newText);
    scrollingText.innerHTML = '\\(' + latex + '\\)';
    if (window.MathJax) MathJax.typesetPromise([scrollingText]).then(() => applyColorToMath()).catch(()=>{});
    saveData({ latex, raw: newText });
}

tabFunctions.addEventListener('click', () => {
    tabFunctions.classList.add('active'); tabGreek.classList.remove('active'); tabSymbols.classList.remove('active'); tabPhysics.classList.remove('active');
    functionsTab.classList.add('active'); greekTab.classList.remove('active'); symbolsTab.classList.remove('active'); physicsTab.classList.remove('active');
});
tabGreek.addEventListener('click', () => {
    tabGreek.classList.add('active'); tabFunctions.classList.remove('active'); tabSymbols.classList.remove('active'); tabPhysics.classList.remove('active');
    greekTab.classList.add('active'); functionsTab.classList.remove('active'); symbolsTab.classList.remove('active'); physicsTab.classList.remove('active');
});
tabSymbols.addEventListener('click', () => {
    tabSymbols.classList.add('active'); tabFunctions.classList.remove('active'); tabGreek.classList.remove('active'); tabPhysics.classList.remove('active');
    symbolsTab.classList.add('active'); functionsTab.classList.remove('active'); greekTab.classList.remove('active'); physicsTab.classList.remove('active');
});

mathKeys.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); e.preventDefault();
        const cmd = btn.textContent;
        const dataCmd = btn.dataset.cmd;
        if (dataCmd === 'frac' || cmd === 'a/b') insertMathSymbol('frac');
        else if (dataCmd === '\\vec' || cmd === '⃗' || cmd === '→') insertMathSymbol('→');
        else if (dataCmd === '\\sqrt[n]' || cmd === 'n√') insertMathSymbol('n√');
        else if (dataCmd === '\\Delta' || cmd === 'Δ') insertMathSymbol('Δ');
        else insertMathSymbol(cmd);
        return false;
    });
});

colorButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); e.preventDefault();
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

sizeSlider.addEventListener('input', () => {
    currentSize = parseInt(sizeSlider.value);
    scrollingText.style.fontSize = currentSize + 'vw';
    sizeValue.textContent = currentSize + 'vw';
    saveData({});
});
speedSlider.addEventListener('input', () => {
    currentSpeed = parseInt(speedSlider.value);
    speedValue.textContent = currentSpeed + (isRussian ? ' сек' : ' sec');
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
settingsPanel.addEventListener('click', (e) => { if (e.target === settingsPanel) { settingsPanel.classList.remove('show'); settingsBtn.classList.remove('active'); } });

tg.BackButton.onClick(() => {
    if (settingsPanel.classList.contains('show')) { settingsPanel.classList.remove('show'); settingsBtn.classList.remove('active'); }
    else if (keyboardVisible) closeKeyboard();
    else if (isRunning) { inputArea.style.display = 'flex'; settingsBtn.style.display = 'flex'; donateBtn.style.display = 'flex'; isRunning = false; }
    else tg.close();
});
tg.BackButton.show();

console.log('✅ LED BANNER - PHYSICS FORMULAS WITH ROOTS AND MULTIPLE VARIANTS');
