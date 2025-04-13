const sampleText = "Axper gri tenami de la eeee ara e chgitem e, kroasannery halum en manric";
const placeholder = "\u200B";  // zero-width space

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

function initText() {
  textContainer.innerHTML = "";
  currentIndex = 0;

  const words = sampleText.split(" ");
  words.forEach((word, i) => {
    const wordSpan = document.createElement("span");
    wordSpan.classList.add("wordContainer");

    for (let letter of word) {
      const span = document.createElement("span");
      span.classList.add("letter", "pending");
      span.textContent = letter;
      wordSpan.appendChild(span);
    }

    textContainer.appendChild(wordSpan);

    if (i < words.length - 1) {
      const space = document.createElement("span");
      space.classList.add("letter", "pending", "space");
      // Используем обычный пробел
      space.textContent = " ";
      textContainer.appendChild(space);
    }
  });

  updateCursor();
  initInput();
}

let lastValidTop = null;

function updateCursor() {
  document.querySelectorAll(".letter").forEach(el => el.classList.remove("active"));
  const letters = document.querySelectorAll(".letter");
  const cursor = document.getElementById("cursor");

  if (currentIndex < letters.length) {
    const current = letters[currentIndex];
    current.classList.add("active");

    const rect = current.getBoundingClientRect();

    // Сохраняем реальную позицию первой строки
    if (lastValidTop === null) {
      lastValidTop = rect.top;
    }

    // Если символ ниже предыдущего — обновляем курсор вниз
    if (rect.top > lastValidTop) {
      lastValidTop = rect.top;
    }

    cursor.style.left = `${rect.left}px`;
    cursor.style.top = `${lastValidTop}px`; // остаётся на строке или переходит вниз
    cursor.style.height = `${rect.height}px`;
    cursor.style.display = "block";
  } else {
    cursor.style.display = "none";
  }
}


function focusInput() {
  setTimeout(() => {
    hiddenInput.focus({ preventScroll: true });
    setCaretToEnd(hiddenInput);
  }, 0);
}

function blurInput() {
  document.body.classList.remove('noscroll');
}

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    remainingTime--;
    timerDisplay.textContent = remainingTime;
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
  if (e.inputType === "deleteContentBackward") {
    handleBackspace();
  } else if (e.data) {
    handleKey(e.data);
  }
  hiddenInput.innerText = placeholder;
  setCaretToEnd(hiddenInput);
});

hiddenInput.addEventListener("keydown", (e) => {
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

// Функция для завершения игры – вызовется при достижении конца текста или по таймеру
function finishGame(reason) {
  endTime = Date.now();
  clearInterval(timerInterval);
  const totalTimeSec = (endTime - startTime) / 1000;
  const letters = document.querySelectorAll(".letter");
  const typedChars = currentIndex; // сколько символов набрано

  let correctChars = 0;
  letters.forEach(letter => {
    if (letter.classList.contains("correct")) correctChars++;
  });
  const accuracy = typedChars > 0 ? (correctChars / typedChars) * 100 : 0;
  const wpm = typedChars > 0 ? (typedChars / 5) / (totalTimeSec / 60) : 0;

  // Выводим результаты в панели
  document.getElementById("wpmValue").textContent = "WPM: " + wpm.toFixed(1);
  document.getElementById("accValue").textContent = "Accuracy: " + accuracy.toFixed(1) + "%";
  document.getElementById("timeValue").textContent = "Time: " + totalTimeSec.toFixed(1) + "s";

  // Отображаем символ: если reason === "completed" – птичка, если "timeout" – крестик
  const symbolEl = document.getElementById("resultSymbol");
  if (reason === "completed") {
    // Можно использовать эмодзи птички, например:
    symbolEl.textContent = "✅";
  } else if (reason === "timeout") {
    symbolEl.textContent = "❌";
  }

  document.getElementById("resultPanel").style.display = "flex";
}

// Обработчик закрытия панели результата
document.getElementById("closeResultBtn").onclick = function() {
  document.getElementById("resultPanel").style.display = "none";
  resetGame();
};

function resetGame() {
  timerStarted = false;
  clearInterval(timerInterval);
  currentIndex = 0;
  incorrectCount = 0;        // сброс неправильных букв
  lastValidTop = null;
  remainingTime = defaultTime; // <-- восстанавливаем время до defaultTime
  document.body.classList.remove("typing-started");
  initText();
  focusInput();
}
// Обработчик для кнопки закрытия панели результата
document.getElementById("closeResultBtn").addEventListener("click", () => {
  // Скрываем панель результата
  document.getElementById("resultPanel").style.display = "none";
  // Восстанавливаем время
  remainingTime = defaultTime;
  timerDisplay.textContent = defaultTime;
  // Перезапускаем игру (это может включать resetGame)
  resetGame();
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
    btn.classList.toggle("active", index === 1);
    btn.onclick = () => {
      document.querySelectorAll("#modeOptions button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (gameMode === "time") {
        defaultTime = val;
        remainingTime = val;
        timerDisplay.textContent = val;
      } else if (gameMode === "words") {
        wordCount = val;
        // Дополнительная логика для режима слов, если требуется
      }
    };
    container.appendChild(btn);
  });
}

function switchGameMode(mode) {
  gameMode = mode;
  document.querySelectorAll("#gameModes button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });
  renderModeOptions();
  resetGame();
}

document.querySelectorAll("#gameModes button").forEach(btn => {
  btn.onclick = () => switchGameMode(btn.dataset.mode);
});

renderModeOptions();
initText();

textContainer.addEventListener("click", focusInput);
textContainer.addEventListener("touchstart", focusInput);

hiddenInput.addEventListener("blur", blurInput);
focusInput();
