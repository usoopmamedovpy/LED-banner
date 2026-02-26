// ===============================
// LED Banner Math — stable build
// ===============================

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor('#000000');
  tg.setBackgroundColor('#000000');
}

const scrollingText = document.getElementById('scrollingText');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsPanel = document.getElementById('settingsPanel');
const inputArea = document.getElementById('inputArea');
const mathBtn = document.getElementById('mathBtn');
const mathKeyboard = document.getElementById('mathKeyboard');

const sizeSlider = document.getElementById('sizeSlider');
const sizeValue = document.getElementById('sizeValue');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const colorButtons = document.querySelectorAll('.color-btn');
const mathKeys = document.querySelectorAll('.math-key');

const tabFunctions = document.getElementById('tabFunctions');
const tabGreek = document.getElementById('tabGreek');
const tabSymbols = document.getElementById('tabSymbols');
const functionsTab = document.getElementById('functionsTab');
const greekTab = document.getElementById('greekTab');
const symbolsTab = document.getElementById('symbolsTab');

let MQ;
let mathField;

let currentSpeed = 15;
let currentSize = 15;
let currentColor = 'white';

let isRunning = false;
let keyboardVisible = false;

// ===============================

window.addEventListener('load', () => {

  const el = document.getElementById('mathField');

  MQ = MathQuill.getInterface(2);

  mathField = MQ.MathField(el, {
    spaceBehavesLikeTab: true,
    autoCommands:
      'pi theta sqrt sum prod int alpha beta gamma delta epsilon zeta eta theta iota kappa lambda mu nu xi rho sigma tau upsilon phi chi psi omega',
    autoOperatorNames:
      'sin cos tan cot arcsin arccos arctan arccot log ln lg exp lim',

    handlers: {
      edit() {
        renderBanner();
        saveData();
      }
    }
  });

  loadData();
  renderBanner();
  updateUI();
});

// ===============================
// MathJax render
// ===============================

function renderBanner() {
  const latex = mathField.latex().trim();

  if (!latex) {
    scrollingText.textContent = '';
    return;
  }

  scrollingText.innerHTML = '\\(' + latex + '\\)';

  if (window.MathJax) {
    MathJax.typesetClear([scrollingText]);
    MathJax.typesetPromise([scrollingText]).catch(() => {});
  }
}

// ===============================
// keyboard
// ===============================

function toggleKeyboard() {
  if (isRunning) return;

  keyboardVisible = !keyboardVisible;
  mathKeyboard.classList.toggle('show', keyboardVisible);
  mathBtn.classList.toggle('active', keyboardVisible);

  if (keyboardVisible) {
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
  }
}

function closeKeyboard() {
  keyboardVisible = false;
  mathKeyboard.classList.remove('show');
  mathBtn.classList.remove('active');
}

// ===============================
// insert commands
// ===============================

function insertMath(cmd) {

  if (!mathField) return;

  switch (cmd) {

    case '^':
      mathField.cmd('^');
      break;

    case '_':
      mathField.cmd('_');
      break;

    case '\\frac':
      mathField.cmd('\\frac');
      break;

    case '\\sqrt':
      mathField.cmd('\\sqrt');
      break;

    case '\\vec':
      mathField.cmd('\\vec');
      break;

    case '\\int':
    case '\\sum':
    case '\\prod':
      mathField.cmd(cmd);
      break;

    default:
      mathField.write(cmd);
      break;
  }

  mathField.focus();
}

// ===============================
// run
// ===============================

function toggleRun() {

  if (isRunning) {
    inputArea.style.display = 'flex';
    settingsBtn.style.display = 'flex';
    isRunning = false;
    return;
  }

  updateUI();
  inputArea.style.display = 'none';
  settingsBtn.style.display = 'none';
  closeKeyboard();
  isRunning = true;
  saveData();
}

// ===============================
// ui
// ===============================

function updateUI() {

  scrollingText.style.fontSize = currentSize + 'vw';
  sizeValue.textContent = currentSize + 'vw';

  speedValue.textContent = currentSpeed + ' сек';

  restartAnimation();
  applyColor();
}

function restartAnimation() {
  scrollingText.style.animation = 'none';
  void scrollingText.offsetWidth;
  scrollingText.style.animation = `scrollText ${currentSpeed}s linear infinite`;
}

function applyColor() {

  const map = {
    white: '#ffffff',
    red: '#ff3b30',
    blue: '#007aff',
    green: '#34c759',
    yellow: '#ffcc00'
  };

  scrollingText.style.color = map[currentColor];

  colorButtons.forEach(b => b.classList.remove('active'));
  document.querySelector('.color-btn.' + currentColor)?.classList.add('active');
}

// ===============================
// storage
// ===============================

function saveData() {

  if (!mathField) return;

  const data = {
    latex: mathField.latex(),
    color: currentColor,
    speed: currentSpeed,
    size: currentSize
  };

  localStorage.setItem('ledBannerData', JSON.stringify(data));

  if (tg) {
    try {
      tg.sendData(JSON.stringify(data));
    } catch {}
  }
}

function loadData() {

  const raw = localStorage.getItem('ledBannerData');
  if (!raw) {
    mathField.latex('LED\\ бегущая\\ строка');
    return;
  }

  try {

    const data = JSON.parse(raw);

    if (data.latex) mathField.latex(data.latex);
    if (data.color) currentColor = data.color;
    if (data.speed) currentSpeed = data.speed;
    if (data.size) currentSize = data.size;

  } catch {
    mathField.latex('LED\\ бегущая\\ строка');
  }
}

// ===============================
// reset
// ===============================

function resetAll() {

  isRunning = false;

  inputArea.style.display = 'flex';
  settingsBtn.style.display = 'flex';

  currentSpeed = 15;
  currentSize = 15;
  currentColor = 'white';

  sizeSlider.value = 15;
  speedSlider.value = 15;

  mathField.latex('LED\\ бегущая\\ строка');

  updateUI();
  renderBanner();
  closeKeyboard();
  settingsPanel.classList.remove('show');
  settingsBtn.classList.remove('active');

  saveData();
}

// ===============================
// events
// ===============================

mathBtn.addEventListener('click', toggleKeyboard);

document.addEventListener('click', e => {
  if (
    keyboardVisible &&
    !mathKeyboard.contains(e.target) &&
    !mathBtn.contains(e.target)
  ) closeKeyboard();
});

mathKeys.forEach(b => {
  b.addEventListener('click', e => {
    e.preventDefault();
    e.stopPropagation();
    insertMath(b.dataset.cmd);
  });
});

runBtn.addEventListener('click', toggleRun);
resetBtn.addEventListener('click', resetAll);

settingsBtn.addEventListener('click', () => {

  if (isRunning) return;

  const open = settingsPanel.classList.toggle('show');
  settingsBtn.classList.toggle('active', open);

  if (open) closeKeyboard();
});

settingsPanel.addEventListener('click', e => {
  if (e.target === settingsPanel) {
    settingsPanel.classList.remove('show');
    settingsBtn.classList.remove('active');
  }
});

sizeSlider.addEventListener('input', () => {
  currentSize = +sizeSlider.value;
  updateUI();
  saveData();
});

speedSlider.addEventListener('input', () => {
  currentSpeed = +speedSlider.value;
  updateUI();
  saveData();
});

colorButtons.forEach(btn => {
  btn.addEventListener('click', () => {

    if (btn.classList.contains('red')) currentColor = 'red';
    else if (btn.classList.contains('blue')) currentColor = 'blue';
    else if (btn.classList.contains('green')) currentColor = 'green';
    else if (btn.classList.contains('yellow')) currentColor = 'yellow';
    else currentColor = 'white';

    applyColor();
    saveData();
  });
});

// tabs

tabFunctions.onclick = () => setTab('functions');
tabGreek.onclick = () => setTab('greek');
tabSymbols.onclick = () => setTab('symbols');

function setTab(t) {

  tabFunctions.classList.toggle('active', t === 'functions');
  tabGreek.classList.toggle('active', t === 'greek');
  tabSymbols.classList.toggle('active', t === 'symbols');

  functionsTab.classList.toggle('active', t === 'functions');
  greekTab.classList.toggle('active', t === 'greek');
  symbolsTab.classList.toggle('active', t === 'symbols');
}

// ===============================
// telegram back
// ===============================

if (tg?.BackButton) {

  tg.BackButton.show();

  tg.BackButton.onClick(() => {

    if (settingsPanel.classList.contains('show')) {
      settingsPanel.classList.remove('show');
      settingsBtn.classList.remove('active');
      return;
    }

    if (keyboardVisible) {
      closeKeyboard();
      return;
    }

    if (isRunning) {
      inputArea.style.display = 'flex';
      settingsBtn.style.display = 'flex';
      isRunning = false;
      return;
    }

    tg.close();
  });
}
