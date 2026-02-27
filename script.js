// ============================================
// УМНЫЙ ПАРСЕР - ВСЕ КОРНИ КРАСИВЫЕ
// ============================================
function parseToLaTeX(text) {
    if (!text) return '';
    
    let result = text;
    
    // 1. Векторы
    result = result.replace(/\{([^}]+)\}/g, '\\vec{$1}');
    
    // 2. Дроби
    result = result.replace(/\(([^)]+)\)\s*\/\s*\(([^)]+)\)/g, '\\frac{$1}{$2}');
    result = result.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');
    
    // 3. КУБИЧЕСКИЙ КОРЕНЬ: ∛[выражение] → \sqrt[3]{выражение}
    result = result.replace(/∛\[([^\]]+)\]/g, '\\sqrt[3]{$1}');
    
    // 4. КОРЕНЬ 4-Й СТЕПЕНИ: ∜[выражение] → \sqrt[4]{выражение}
    result = result.replace(/∜\[([^\]]+)\]/g, '\\sqrt[4]{$1}');
    
    // 5. КОРЕНЬ n-Й СТЕПЕНИ: √[n]{выражение} → \sqrt[n]{выражение}
    result = result.replace(/√\[([^\]]+)\]\{([^}]+)\}/g, '\\sqrt[$1]{$2}');
    
    // 6. ОБЫЧНЫЙ КОРЕНЬ: √[выражение] → \sqrt{выражение}
    result = result.replace(/√\[([^\]]+)\]/g, '\\sqrt{$1}');
    
    // 7. Степени и индексы
    result = result.replace(/([a-zA-Z0-9α-ω])\^\(([^)]+)\)/g, '$1^{$2}');
    result = result.replace(/([a-zA-Z0-9α-ω])\^([a-zA-Z0-9α-ω])/g, '$1^{$2}');
    result = result.replace(/([a-zA-Z0-9α-ω])_\(([^)]+)\)/g, '$1_{$2}');
    result = result.replace(/([a-zA-Z0-9α-ω])_([a-zA-Z0-9α-ω])/g, '$1_{$2}');
    
    // 8. Греческие буквы
    const greekMap = {
        'α': '\\alpha', 'β': '\\beta', 'γ': '\\gamma', 'δ': '\\delta',
        'ε': '\\epsilon', 'ζ': '\\zeta', 'η': '\\eta', 'θ': '\\theta',
        'ι': '\\iota', 'κ': '\\kappa', 'λ': '\\lambda', 'μ': '\\mu',
        'ν': '\\nu', 'ξ': '\\xi', 'π': '\\pi', 'ρ': '\\rho',
        'σ': '\\sigma', 'τ': '\\tau', 'υ': '\\upsilon', 'φ': '\\phi',
        'χ': '\\chi', 'ψ': '\\psi', 'ω': '\\omega'
    };
    
    for (let [char, latex] of Object.entries(greekMap)) {
        result = result.replace(new RegExp(char, 'g'), latex);
    }
    
    // 9. Функции
    const funcs = ['sin', 'cos', 'tan', 'cot', 'log', 'ln', 'exp', 'lim'];
    funcs.forEach(func => {
        result = result.replace(new RegExp(func + '\\s*\\(', 'g'), func + '(');
    });
    
    return result;
}

// ============================================
// ВСТАВКА СИМВОЛОВ (обновлено для корней)
// ============================================
function insertMathSymbol(symbol) {
    const input = document.getElementById('mainInput');
    if (!input) return;
    
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    
    let insertText = symbol;
    
    // Специальные символы
    if (symbol === '√') {
        insertText = '√[]';  // Обычный корень
    } else if (symbol === '∛') {
        insertText = '∛[]';  // Кубический корень
    } else if (symbol === '∜') {
        insertText = '∜[]';  // Корень 4-й степени
    } else if (symbol === 'n√') {
        insertText = '√[n]{}';  // Корень n-й степени (курсор будет в выражении)
    } else if (symbol === '→' || symbol === '\\vec' || symbol === '⃗') {
        insertText = '{}';  // Вектор
    } else if (symbol === 'a/b' || symbol === 'frac') {
        insertText = '(a)/(b)';  // Дробь
    }
    
    const newText = text.substring(0, start) + insertText + text.substring(end);
    input.value = newText;
    
    // Устанавливаем курсор в нужное место
    let newPos = start + insertText.length;
    if (insertText.includes('[]')) {
        newPos = start + insertText.length - 1;  // Курсор внутри скобок
    } else if (insertText === '{}') {
        newPos = start + 1;  // Курсор внутри фигурных скобок
    } else if (insertText === '(a)/(b)') {
        newPos = start + 2;  // Курсор после первой скобки
    } else if (insertText === '√[n]{}') {
        newPos = start + 5;  // Курсор внутри фигурных скобок (после выражения)
    }
    
    input.setSelectionRange(newPos, newPos);
    input.focus();
    
    const latex = parseToLaTeX(newText);
    scrollingText.innerHTML = '\\(' + latex + '\\)';
    if (window.MathJax) {
        MathJax.typesetPromise([scrollingText]).then(() => {
            applyColorToMath();
        }).catch(() => {});
    }
    
    saveData({ latex: latex, raw: newText });
}
