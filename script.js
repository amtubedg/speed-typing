const sampleText = "The quick brown";
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

function initText() {
  textContainer.innerHTML = "";
  currentIndex = 0;

  const words = sampleText.split(" ");

  words.forEach((word, i) => {
    // Создаём контейнер для "слово + пробел"
    const groupSpan = document.createElement("span");
    groupSpan.classList.add("wordGroup");
    // Не даём браузеру разрывать этот блок внутри
    groupSpan.style.whiteSpace = "nowrap";

    // По буквам добавляем символы самого слова
    for (let letter of word) {
      const letterSpan = document.createElement("span");
      letterSpan.classList.add("letter", "pending");
      letterSpan.textContent = letter;
      groupSpan.appendChild(letterSpan);
    }

    // Если это не последнее слово, добавляем пробел как «букву»
    // но в тот же блок, чтобы слово и пробел были «склеены»
    if (i < words.length - 1) {
      const spaceSpan = document.createElement("span");
      spaceSpan.classList.add("letter", "pending", "space");
      spaceSpan.textContent = " "; 
      groupSpan.appendChild(spaceSpan);
    }

    // И кладём готовый блок в textContainer
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
  clearInterval(timerInterval);
  gameEnded = true;

  const totalTimeSec = (endTime - startTime) / 1000;
  const letters = document.querySelectorAll(".letter");
  const typedChars = currentIndex;

  let correctChars = 0;
  letters.forEach(letter => {
    if (letter.classList.contains("correct")) correctChars++;
  });

  const accuracy = typedChars > 0 ? (correctChars / typedChars) * 100 : 0;
  const wpm = typedChars > 0 ? (typedChars / 5) / (totalTimeSec / 60) : 0;

  document.getElementById("wpmValue").textContent = "WPM: " + wpm.toFixed(1);
  document.getElementById("accValue").textContent = "Accuracy: " + accuracy.toFixed(1) + "%";
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






function resetGame(shouldSetCaret = true) {
  gameEnded = false;
  timerStarted = false;
  clearInterval(timerInterval);
  currentIndex = 0;
  incorrectCount = 0;
  lastValidTop = null;
  remainingTime = defaultTime;
  document.body.classList.remove("typing-started");

  textContainer.innerHTML = "";
  currentIndex = 0;

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

  if (shouldSetCaret) {
    initInput(); // только если разрешено
  } else {
    hiddenInput.blur(); // сброс на всякий случай
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
    resetGame(false); // не открывать клавиатуру после закрытия
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
    btn.classList.toggle("active", index === 1);
    btn.onclick = () => {
      document.querySelectorAll("#modeOptions button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    
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
  renderModeOptions();
  // hiddenInput.blur(); // убираем фокус, чтобы клавиатура закрылась
  resetGame(false);       // сброс игры без вызова focusInput()
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



document.querySelectorAll("#gameModes button").forEach(btn => {
  btn.onclick = () => switchGameMode(btn.dataset.mode);
});

renderModeOptions();
initText();

textContainer.addEventListener("click", () => {
  if (!timerStarted) {
    resetGame(true); // игра не начата — сброс и запуск
  }
  focusInput(); // всегда фокусируем
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
