const aslMap = {
  A: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/a.gif',
  B: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/b.gif',
  C: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/c.gif',
  D: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/d.gif',
  E: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/e.gif',
  F: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/f.gif',
  G: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/g.gif',
  H: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/h.gif',
  I: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/i.gif',
  J: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/j.gif',
  K: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/k.gif',
  L: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/l.gif',
  M: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/m.gif',
  N: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/n.gif',
  O: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/o.gif',
  P: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/p.gif',
  Q: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/q.gif',
  R: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/r.gif',
  S: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/s.gif',
  T: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/t.gif',
  U: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/u.gif',
  V: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/v.gif',
  W: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/w.gif',
  X: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/x.gif',
  Y: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/y.gif',
  Z: 'https://www.lifeprint.com/asl101/fingerspelling/abc-gifs/z.gif'
};

const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const inputText = document.getElementById('inputText');
const translateBtn = document.getElementById('translateBtn');
const clearBtn = document.getElementById('clearBtn');
const voiceBtn = document.getElementById('voiceBtn');
const statusEl = document.getElementById('status');
const signImage = document.getElementById('signImage');
const signLetter = document.getElementById('signLetter');
const translationPreview = document.getElementById('translationPreview');
const historyList = document.getElementById('historyList');

let historyItems = JSON.parse(localStorage.getItem('asl-history') || '[]');
let animTimer;

function renderHistory() {
  historyList.innerHTML = '';
  if (!historyItems.length) {
    historyList.innerHTML = '<li>No translations yet.</li>';
    return;
  }
  historyItems.forEach((item) => {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${item.text}</strong><time>${item.time}</time>`;
    historyList.appendChild(li);
  });
}

function switchTab(tabName) {
  tabs.forEach((tab) => tab.classList.toggle('is-active', tab.dataset.tab === tabName));
  panels.forEach((panel) => panel.classList.toggle('is-active', panel.id === tabName));
}

tabs.forEach((tab) => {
  tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

function animateAsl(text) {
  clearInterval(animTimer);
  const letters = text.toUpperCase().split('').filter((c) => aslMap[c]);
  if (!letters.length) {
    statusEl.textContent = 'No alphabetic characters found. Please enter A-Z text.';
    signImage.removeAttribute('src');
    signLetter.textContent = '–';
    return;
  }

  let idx = 0;
  statusEl.textContent = `Animating ${letters.length} sign frames...`;
  translationPreview.textContent = `ASL sequence: ${letters.join(' · ')}`;

  const showFrame = () => {
    const letter = letters[idx];
    signImage.src = aslMap[letter];
    signImage.alt = `ASL sign for ${letter}`;
    signLetter.textContent = letter;
    idx = (idx + 1) % letters.length;
  };

  showFrame();
  animTimer = setInterval(showFrame, 900);
}

function saveToHistory(text) {
  historyItems.unshift({
    text,
    time: new Date().toLocaleString()
  });
  historyItems = historyItems.slice(0, 12);
  localStorage.setItem('asl-history', JSON.stringify(historyItems));
  renderHistory();
}

translateBtn.addEventListener('click', () => {
  const text = inputText.value.trim();
  if (!text) {
    statusEl.textContent = 'Please enter text first.';
    return;
  }
  animateAsl(text);
  saveToHistory(text);
});

clearBtn.addEventListener('click', () => {
  inputText.value = '';
  translationPreview.textContent = '';
  statusEl.textContent = 'Cleared.';
  clearInterval(animTimer);
  signImage.removeAttribute('src');
  signLetter.textContent = '–';
});

voiceBtn.addEventListener('click', () => {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    statusEl.textContent = 'Speech recognition is not supported in this browser.';
    return;
  }

  const recognition = new Recognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  statusEl.textContent = 'Listening... please speak clearly.';
  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    inputText.value = transcript;
    statusEl.textContent = `Heard: "${transcript}"`;
    animateAsl(transcript);
    saveToHistory(transcript);
  };

  recognition.onerror = () => {
    statusEl.textContent = 'Could not process audio. Please try again.';
  };
});

renderHistory();
