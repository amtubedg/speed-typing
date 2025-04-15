let sampleText = "sun apple dream book cloud run forest idea moon world smart hope dance fire chill light sound smile tiger bright magic ghost rock happy plan flash open rain king power move time box blue night quick dark slow gold cat jump heart clean green storm love trust trick sweet leaf";
let sampleWords = []; // массив слов
const placeholder = "\u200B";  // zero-width space

let gameEnded = false;
let currentIndex = 0;
let timerStarted = false;
let remainingTime = 30;
let timerInterval = null;
let incorrectCount = 0;
let startTime = null;
let endTime = null;

let gameMode = "time";          // режим по умолчанию
let timeOptions = [15, 30, 60, 120];
let wordOptions = [10, 25, 50, 100];
let defaultTime = 30;
let wordCount = 25;

const textContainer = document.getElementById("text");
const timerDisplay = document.getElementById("timer");
const hiddenInput = document.getElementById("hiddenInput");

function setCaretToEnd(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function initInput() {
  hiddenInput.innerText = placeholder;
  setCaretToEnd(hiddenInput);
}

async function loadWords() {
  const res = await fetch("words_en.txt");
  const text = await res.text();
  sampleWords = text.trim().split(/\s+/);
}

async function loadWordsIfNeeded() {
  if (sampleWords.length > 0) return;
  const res = await fetch("words_en.txt");
  const text = await res.text();
  sampleWords = text.trim().split(/\s+/);
}


async function initText() {
  textContainer.innerHTML = "";
  currentIndex = 0;

  if (gameMode === "words") {
    await loadWordsIfNeeded();
    const shuffled = sampleWords.slice().sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, wordCount);
    sampleText = selected.join(" ");
  }

  const words = sampleText.split(" ");

  words.forEach((word, i) => {
    const groupSpan = document.createElement("span");
    groupSpan.classList.add("wordGroup");
    groupSpan.style.whiteSpace = "nowrap";

    for (let letter of word) {
      const letterSpan = document.createElement("span");
      letterSpan.classList.add("letter", "pending");
      letterSpan.textContent = letter;
      groupSpan.appendChild(letterSpan);
    }

    if (i < words.length - 1) {
      const spaceSpan = document.createElement("span");
      spaceSpan.classList.add("letter", "pending", "space");
      spaceSpan.textContent = " ";
      groupSpan.appendChild(spaceSpan);
    }

    textContainer.appendChild(groupSpan);
  });

  updateCursor();
  initInput();
}



let lastValidTop = null;

function updateCursor() {
  document.querySelectorAll(".letter").forEach(el => el.classList.remove("active"));
  const letters = document.querySelectorAll(".letter");
  if (currentIndex < letters.length) {
    letters[currentIndex].classList.add("active");
  }
}


function focusInput() {
  // УБИРАЕМ setTimeout
  hiddenInput.focus({ preventScroll: true });
  setCaretToEnd(hiddenInput);
}


function blurInput() {
  document.body.classList.remove('noscroll');
}

function formatTime(seconds) {
  if (seconds < 60) {
    return seconds.toString(); // просто число, если меньше 60
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}



function startTimer() {
  document.getElementById("modePanel")?.classList.add("hidden");
  startTime = Date.now();
  timerInterval = setInterval(() => {
    remainingTime--;
    timerDisplay.textContent = formatTime(remainingTime);
    if (remainingTime <= 0) {
      finishGame("timeout");
    }
  }, 1000);
}

function handleKey(char) {
  const letters = document.querySelectorAll(".letter");
  if (currentIndex >= letters.length) return;

  if (!timerStarted) {
    timerStarted = true;
    startTimer();
    document.body.classList.add("typing-started");
  }

  const current = letters[currentIndex];
  if (char === current.textContent) {
    current.classList.remove("pending", "incorrect");
    current.classList.add("correct");
  } else {
    current.classList.remove("pending", "correct");
    current.classList.add("incorrect");
    incorrectCount++;
  }

  currentIndex++;
  updateCursor();

  if (currentIndex >= letters.length) {
    finishGame("completed");
  }

  if (gameMode === "words") {
    const letters = document.querySelectorAll(".letter");
  
    let currentWordIndex = 0;
  
    // Если мы достигли конца текста — значит завершили последнее слово
    if (currentIndex >= letters.length) {
      currentWordIndex = wordCount;
    } else {
      // Подсчитываем количество пробелов до текущего индекса
      for (let i = 0; i < currentIndex; i++) {
        if (letters[i].textContent === " ") currentWordIndex++;
      }
      currentWordIndex++; // добавляем +1 к счётчику для текущего слова
    }
  
    const wordCounterEl = document.getElementById("wordCounter");
    if (wordCounterEl) {
      wordCounterEl.textContent = `${Math.min(currentWordIndex, wordCount)} / ${wordCount}`;
    }
  
    if (currentWordIndex >= wordCount) {
      finishGame("completed");
    }
  }
  
  
  
}

function handleBackspace() {
  if (currentIndex === 0) return;
  currentIndex--;
  const letters = document.querySelectorAll(".letter");
  letters[currentIndex].classList.remove("correct", "incorrect");
  letters[currentIndex].classList.add("pending");
  updateCursor();
}

hiddenInput.addEventListener("beforeinput", (e) => {
  if (gameEnded) {
    e.preventDefault();
    return;
  }
  if (e.inputType === "deleteContentBackward") {
    handleBackspace();
  } else if (e.data) {
    handleKey(e.data);
  }
  hiddenInput.innerText = placeholder;
  setCaretToEnd(hiddenInput);
});

hiddenInput.addEventListener("keydown", (e) => {
  if (gameEnded) {
    e.preventDefault();
    return;
  }
  if (e.key === "Backspace") {
    e.preventDefault();
    handleBackspace();
  } else if (e.key.length === 1) {
    e.preventDefault();
    handleKey(e.key);
  }
  hiddenInput.innerText = placeholder;
  setCaretToEnd(hiddenInput);
});

function finishGame(reason) {
  endTime = Date.now();
  document.getElementById("modePanel")?.classList.remove("hidden");

  clearInterval(timerInterval);
  gameEnded = true;

  const totalTimeSec = (endTime - startTime) / 1000;
  const letters = document.querySelectorAll(".letter");
  const typedChars = currentIndex;

  let correctChars = 0;
let incorrectChars = 0;
letters.forEach(letter => {
  if (letter.classList.contains("correct")) correctChars++;
  if (letter.classList.contains("incorrect")) incorrectChars++;
});

  const accuracy = typedChars > 0 ? (correctChars / typedChars) * 100 : 0;
  const wpm = typedChars > 0 ? (typedChars / 5) / (totalTimeSec / 60) : 0;

  document.getElementById("wpmValue").textContent = "WPM: " + wpm.toFixed(1);
  document.getElementById("accValue").textContent = "Accuracy: " + accuracy.toFixed(1) + "%";
  document.getElementById("accValue").title =
  `${accuracy.toFixed(2)}%\n${correctChars} correct\n${incorrectChars} incorrect`;

  document.getElementById("errorValue").textContent = "Errors: " + incorrectCount;
  document.getElementById("timeValue").textContent = "Time: " + totalTimeSec.toFixed(1) + "s";

  const symbolEl = document.getElementById("resultSymbol");
  symbolEl.textContent = reason === "completed" ? "✅" : "❌";

  const panel = document.getElementById("resultPanel");
  const content = document.getElementById("resultContent");

  // Показываем панель с анимацией
  panel.classList.remove("hide");
  content.classList.remove("hide");
  panel.classList.add("show");
  content.classList.add("show");
  panel.style.display = "flex";

  // 🔐 ГАРАНТИРОВАННОЕ ЗАКРЫТИЕ КЛАВИАТУРЫ
  requestAnimationFrame(() => {
    setTimeout(() => {
      hiddenInput.blur();
      window.getSelection()?.removeAllRanges();
    }, 50); // Минимальная задержка — даёт сработать panel.style.display
  });
}






async function resetGame(shouldSetCaret = true) {
  document.getElementById("modePanel")?.classList.remove("hidden");

  gameEnded = false;
  timerStarted = false;
  clearInterval(timerInterval);
  currentIndex = 0;
  incorrectCount = 0;
  lastValidTop = null;
  remainingTime = defaultTime;
  document.body.classList.remove("typing-started");

  await initText(); // 💡 всё создаётся в одном месте

  if (shouldSetCaret) {
    initInput();
  } else {
    hiddenInput.blur();
    window.getSelection()?.removeAllRanges();
  }
}




// Обработчик для кнопки закрытия панели результата
document.getElementById("closeResultBtn").addEventListener("click", () => {
  const panel = document.getElementById("resultPanel");
  const content = document.getElementById("resultContent");

  // Убираем классы показа
  panel.classList.remove("show");
  content.classList.remove("show");

  // Скрываем счётчик слов, если режим "words"
  const wordCounterEl = document.getElementById("wordCounter");
if (gameMode === "words" && wordCounterEl) {
  wordCounterEl.textContent = `0 / ${wordCount}`;
}
  // Добавляем анимации скрытия
  panel.classList.add("hide");
  content.classList.add("hide");

  // Гарантированно закрываем клавиатуру
  closeKeyboard();

  // Через 300 мс (после анимации) — скрываем полностью и сбрасываем
  setTimeout(() => {
    panel.style.display = "none";
    panel.classList.remove("hide");
    content.classList.remove("hide");

    remainingTime = defaultTime;
    timerDisplay.textContent = formatTime(remainingTime);
    resetGame(true);      // ✅ сброс и установка курсора
    focusInput();         // ✅ открываем клавиатуру
  }, 300);
});




function renderModeOptions() {
  const container = document.getElementById("modeOptions");
  container.innerHTML = "";

  let options = [];
  if (gameMode === "time") {
    options = timeOptions;
  } else if (gameMode === "words") {
    options = wordOptions;
  } else if (gameMode === "quote") {
    options = [
      "\"To be, or not to be?\"",
      "'Hello, world!'",
      "What is your name?"
    ];
  }

  options.forEach((val, index) => {
    const btn = document.createElement("button");
    btn.textContent = val;
    btn.classList.toggle("active", val === defaultTime || val === wordCount);

    btn.onclick = () => {
      document.querySelectorAll("#modeOptions button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    
      if (gameMode === "words") {
        wordCount = val;
      
        const wordCounterEl = document.getElementById("wordCounter");
        if (wordCounterEl) {
          wordCounterEl.textContent = `0 / ${val}`;
          wordCounterEl.style.display = "block";
        }
      }

      if (gameMode === "time") {
        defaultTime = val;
        remainingTime = val;
        timerDisplay.textContent = formatTime(val);;
      } else if (gameMode === "words") {
        wordCount = val;
      }
    
      resetGame(true); // ⬅️ Сброс игры полностью (обновляем текст, курсор, состояние)
    };
    
    container.appendChild(btn);
  });
}

function switchGameMode(mode) {
  gameMode = mode;
  document.querySelectorAll("#gameModes button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  // Показываем или прячем таймер
  timerDisplay.style.display = (mode === "time") ? "block" : "none";

  // Обновляем опции
  renderModeOptions();

  // ✅ Сразу показываем счётчик для words
  let wordCounterEl = document.getElementById("wordCounter");
  if (!wordCounterEl) {
    wordCounterEl = document.createElement("div");
    wordCounterEl.id = "wordCounter";
    wordCounterEl.style.marginBottom = "10px";
    wordCounterEl.style.color = "#FFD700";
    wordCounterEl.style.fontSize = "1.5rem";
    timerDisplay.insertAdjacentElement("afterend", wordCounterEl);
  }

  if (mode === "words") {
    wordCounterEl.style.display = "block";
    wordCounterEl.textContent = `0 / ${wordCount}`;
  } else {
    wordCounterEl.style.display = "none";
  }

  resetGame(false); // сброс без фокуса
}



function openKeyboard() {
  hiddenInput.focus({ preventScroll: true });
  setCaretToEnd(hiddenInput);
}

function closeKeyboard() {
  hiddenInput.blur();
  window.getSelection()?.removeAllRanges(); // гарантированно убирает курсор
  console.log("Keyboard closed");
}

// HOME — просто возвращаем на главный экран
document.getElementById("homeBtn").addEventListener("click", () => {
  document.getElementById("modePanel").classList.remove("hidden");
  document.getElementById("resultPanel").style.display = "none";

  // ⬇️ Сброс таймера и режима
  // defaultTime = defaultTime; // или 30, или что угодно по умолчанию
  remainingTime = defaultTime;
  timerDisplay.textContent = formatTime(defaultTime);

  resetGame(false); // без автофокуса
  closeKeyboard();
});


// RESET — сбрасываем с новым текстом
document.getElementById("resetBtn").addEventListener("click", () => {
  // можно обновить sampleText здесь, если у тебя массив
  // sampleText = getRandomText();

  remainingTime = defaultTime;
  timerDisplay.textContent = formatTime(defaultTime);
  resetGame(true);
  focusInput(); // откроем клавиатуру для новой игры
});


document.querySelectorAll("#gameModes button").forEach(btn => {
  btn.onclick = () => switchGameMode(btn.dataset.mode);
});

renderModeOptions();
initText();

textContainer.addEventListener("click", () => {
  // Просто фокусируем, ничего не перезапускаем
  focusInput();
});


textContainer.addEventListener("touchstart", (e) => {
  focusInput();
});

hiddenInput.addEventListener("blur", blurInput);
focusInput();


window.addEventListener("resize", () => {
  updateCursor();
});

window.addEventListener("scroll", () => {
  updateCursor();
});

window.visualViewport?.addEventListener("resize", () => {
  updateCursor();
});

loadWords();
