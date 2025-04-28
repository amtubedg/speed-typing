let sampleText = "sun apple dream book cloud run forest idea moon world smart hope dance fire chill light sound smile tiger bright magic ghost rock happy plan flash open rain king power move time box blue night quick dark slow gold cat jump heart clean green storm love trust trick sweet leaf";
let sampleWords = []; // массив слов
const placeholder = "\u200B";  // zero-width space

let currentLineIndex = 0;

let gameEnded = false;
let currentIndex = 0;
let timerStarted = false;
let remainingTime = 30;
let timerInterval = null;
let incorrectCount = 0;
let startTime = null;
let endTime = null;

let allowUppercase = true;   // Разрешить большие буквы (по умолчанию да)
let allowSymbols = false;    // Разрешить символы (по умолчанию нет)


let totalWords = 0;
let quoteMode = "short";
let gameMode = "time";          // режим по умолчанию
let timeOptions = [15, 30, 60, 120];
let wordOptions = [10, 25, 50, 100];
let defaultTime = 30;
let wordCount = 25;

const textContainer = document.getElementById("text");
const timerDisplay = document.getElementById("timer");
const hiddenInput = document.getElementById("hiddenInput");

window.addEventListener('DOMContentLoaded', () => {
  // Восстановить тему
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.value = savedTheme; // <-- Вот это ты забывал поставить!
  }
  
  // Восстановить настройки
  const savedUppercase = localStorage.getItem("allowUppercase");
  const savedSymbols = localStorage.getItem("allowSymbols");
  const savedGameMode = localStorage.getItem("selectedGameMode");
  const savedWordCount = localStorage.getItem("selectedWordCount");
  const savedTime = localStorage.getItem("selectedTime");
  const savedQuoteMode = localStorage.getItem("selectedQuoteMode");

  if (savedUppercase !== null) {
    allowUppercase = savedUppercase === "true";
  }
  if (savedSymbols !== null) {
    allowSymbols = savedSymbols === "true";
  }
  if (savedGameMode) {
    gameMode = savedGameMode;
  }
  if (savedWordCount) {
    wordCount = parseInt(savedWordCount, 10);
  }
  if (savedTime) {
    defaultTime = parseInt(savedTime, 10);
    remainingTime = defaultTime;
  }
  if (savedQuoteMode) {
    quoteMode = savedQuoteMode;
  }

  document.getElementById("uppercaseToggle").addEventListener("change", (e) => {
    allowUppercase = e.target.checked;
    localStorage.setItem("allowUppercase", allowUppercase ? "true" : "false");
    resetGame(false);
  });

  document.getElementById("symbolsToggle").addEventListener("change", (e) => {
    allowSymbols = e.target.checked;
    localStorage.setItem("allowSymbols", allowSymbols ? "true" : "false");
    resetGame(false);
  });

  renderModeOptions();
  resetGame(false);
});


function applyTheme(theme) {
  if (theme === 'light') {
    
    document.querySelector('.logo img').style.filter = 'none';
    document.documentElement.style.setProperty('--background-color', '#FAFAFA');       // фон чуть сероватый, НЕ белый
    document.documentElement.style.setProperty('--text-color', '#212121');              // очень тёмный серый, идеально читаемый
    document.documentElement.style.setProperty('--text-color-done', '#7B1FA2');
    document.documentElement.style.setProperty('--text-color-header', '#350742');              
    document.documentElement.style.setProperty('--panel-background', '#FFFFFF');        // панели белые
    document.documentElement.style.setProperty('--button-background', '#E0E0E0');       // кнопки светло-серые
    document.documentElement.style.setProperty('--input-background', '#ECECEC');        // поле ввода очень светло-серое
    document.documentElement.style.setProperty('--accent-color', '#7B1FA2');            // фиолетовый акцент как у тебя в теме
    document.documentElement.style.setProperty('--mode-options', '#F3E5F5');            // кнопки режимов в очень светло-фиолетовом
    document.documentElement.style.setProperty('--mode-options-hover', '#D1C4E9');      // наведение чуть темнее
    document.documentElement.style.setProperty('--mode-btn-text-color', '#212121');     // текст на кнопках тёмный
    document.documentElement.style.setProperty('--reset-button-bg', '#E0E0E0'); // светлая кнопка
    document.documentElement.style.setProperty('--close-settings', '#212121');
    document.documentElement.style.setProperty('--cursor-color', 'rgba(100, 2, 131, 1)'); // цвет курсора
    document.documentElement.style.setProperty('--closebtn-color', 'rgb(255, 255, 255)'); // цвет курсора
    

  } else {

    document.querySelector('.logo img').style.filter = 'brightness(0) invert(1)';
    document.documentElement.style.setProperty('--background-color', '#3C1C41');
    document.documentElement.style.setProperty('--text-color', '#F0F0F0');
    document.documentElement.style.setProperty('--text-color-header', '#F0F0F0');  
    document.documentElement.style.setProperty('--text-color-done', '#FAFAFA');
    document.documentElement.style.setProperty('--close-settings', '#ffffff');
    document.documentElement.style.setProperty('--panel-background', '#512459');
    document.documentElement.style.setProperty('--button-background', '#5E2C6B');
    document.documentElement.style.setProperty('--input-background', '#5E2C6B');
    document.documentElement.style.setProperty('--accent-color', '#BA68C8');
    document.documentElement.style.setProperty('--mode-options', '#5E2C6B');
    document.documentElement.style.setProperty('--mode-options-hover', '#CE93D8');
    document.documentElement.style.setProperty('--mode-btn-text-color', '#F0F0F0');
    document.documentElement.style.setProperty('--reset-button-bg', '#4A3E56'); // тёмная кнопка
    document.documentElement.style.setProperty('--cursor-color', 'rgba(255, 215, 0, 1)');
    document.documentElement.style.setProperty('--closebtn-color', '#F0F0F0'); // цвет курсора
    
  }
}






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

let sampleQuotes = []; // сюда загрузим цитаты

async function loadQuotes() {
  const res = await fetch("quotes.txt");
  const text = await res.text();
  sampleQuotes = text.trim().split('\n').filter(q => q.length > 0);
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

function getFilteredWords() {
  const cleanWords = sampleWords.filter(word => /^[a-zA-Z]+$/.test(word)); // Только буквы
  const symbolWords = sampleWords.filter(word => /[^a-zA-Z]/.test(word));  // Есть символы

  let finalWords = [];

  if (allowSymbols) {
    const symbolPercentage = 0.50; // 25% слов с символами
    const totalNeeded = (gameMode === "words") ? wordCount : 500;

    const symbolCount = Math.floor(totalNeeded * symbolPercentage);
    const cleanCount = totalNeeded - symbolCount;

    const shuffledClean = cleanWords.sort(() => Math.random() - 0.5);
    const shuffledSymbol = symbolWords.sort(() => Math.random() - 0.5);

    finalWords = shuffledClean.slice(0, cleanCount).concat(shuffledSymbol.slice(0, symbolCount));
    finalWords = finalWords.sort(() => Math.random() - 0.5); // Перемешиваем финально
  } else {
    const filtered = sampleWords.filter(word => /^[a-zA-Z]+$/.test(word));
    finalWords = filtered.sort(() => Math.random() - 0.5);
  }

  // Фильтрация на заглавные буквы
  if (!allowUppercase) {
    finalWords = finalWords.map(word => word.toLowerCase());
  }

  return finalWords;
}



async function initText() {
  textContainer.innerHTML = "";
  currentIndex = 0;

  if (!allowUppercase) {
    sampleText = sampleText.toLowerCase();
  }
  
  if (!allowSymbols) {
    sampleText = sampleText.replace(/[^a-zA-Z\s]/g, "");
  }

  
  if (gameMode === "words" || gameMode === "time") {
    await loadWordsIfNeeded();
    const filteredWords = getFilteredWords();
    const shuffled = filteredWords.slice(); // Уже перемешаны в функции
    const selected = (gameMode === "words") ? shuffled.slice(0, wordCount) : shuffled.slice(0, 500);
    sampleText = selected.join(" ");
  }
  
  

  if (gameMode === "quote") {
    if (sampleQuotes.length === 0) {
      await loadQuotes();
    }
    const shuffled = sampleQuotes.slice().sort(() => Math.random() - 0.5);
    if (quoteMode === "short") {
      sampleText = shuffled.slice(0, 1).join(" ");
    } else if (quoteMode === "medium") {
      sampleText = shuffled.slice(0, 4).join(" ");
    } else if (quoteMode === "long") {
      sampleText = shuffled.slice(0, 7).join(" ");
    }
  }

  totalWords = sampleText.trim().split(/\s+/).length; // ← считаем слова!

  const words = sampleText.split(" ");
  const tempSpans = [];

  for (let i = 0; i < words.length; i++) {
    const wordGroup = document.createElement("span");
    wordGroup.classList.add("wordGroup");

    for (let char of words[i]) {
      const span = document.createElement("span");
      span.classList.add("letter", "pending");
      span.textContent = char;
      wordGroup.appendChild(span);
    }

    if (i < words.length - 1) {
      const space = document.createElement("span");
      space.classList.add("letter", "pending", "space");
      space.textContent = " ";
      wordGroup.appendChild(space);
    }

    textContainer.appendChild(wordGroup);
    tempSpans.push(wordGroup);
  }

  textContainer.innerHTML = "";
  for (let group of tempSpans) {
    textContainer.appendChild(group);
  }

  currentLineIndex = 0;
  lastValidTop = 0;
  textContainer.style.transform = "translateY(0)";
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
  // Фокусируем только программно, без scroll и без клавиатуры
  if (document.activeElement !== hiddenInput) {
    hiddenInput.focus({ preventScroll: true });
    setCaretToEnd(hiddenInput);
  }

  // ⛔️ Убираем клавиатуру, если это мобильное устройство
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    // Отключаем виртуальную клавиатуру
    hiddenInput.setAttribute("readonly", "true");

    // Через тик (0 мс) снова убираем readonly — чтобы продолжал принимать события
    setTimeout(() => {
      hiddenInput.removeAttribute("readonly");
    }, 0);
  }
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

  if (gameMode === "time") {
    timerInterval = setInterval(() => {
      remainingTime--;
      timerDisplay.textContent = formatTime(remainingTime);
      if (remainingTime <= 0) {
        finishGame("timeout");
      }
    }, 1000);
  }
}

function handleKey(char) {
  const letters = document.querySelectorAll(".letter");
  if (currentIndex >= letters.length) return;
 
  if (!timerStarted) {
    timerStarted = true;
    
    if (gameMode === "time") {
      document.getElementById("timer").style.display = "block";
    } else if (gameMode === "words" || gameMode === "quote") {
      document.getElementById("wordCounter").style.display = "block";
    }
  
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

  if (gameMode === "words" || gameMode === "quote") {
    let completedWords = 0;
    for (let i = 0; i < currentIndex; i++) {
      if (letters[i].textContent === " ") completedWords++;
    }
    
    // If at the end, add the last word
    if (currentIndex === letters.length) completedWords++;

    const wordCounterEl = document.getElementById("wordCounter");
    if (wordCounterEl) {
      wordCounterEl.textContent = `${Math.min(completedWords, totalWords)} / ${totalWords}`;
    }
    
    // For words mode, check completed words
    if (gameMode === "words" && completedWords >= totalWords) {
      finishGame("completed");
      return;
    }
  }

  scrollTextUpIfNeeded();
  checkLineAdvance();
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

  document.getElementById("timer").style.display = "none";
  document.getElementById("wordCounter").style.display = "none";
  
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

  // const symbolEl = document.getElementById("resultSymbol");
  // symbolEl.textContent = reason === "completed" ? "✅" : "❌";

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

  document.getElementById("timer").style.display = "none";
  document.getElementById("wordCounter").style.display = "none";
  
  textContainer.style.transform = "translateY(0)";
  currentLineIndex = 0;
  
  gameEnded = false;
  timerStarted = false;
  clearInterval(timerInterval);
  currentIndex = 0;
  incorrectCount = 0;
  lastValidTop = 0;
  remainingTime = defaultTime;
  document.body.classList.remove("typing-started");

  await initText(); // 💡 всё создаётся в одном месте
  textContainer.scrollTop = 0; // сбрасываем прокрутку вверх

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
    // focusInput();         // ✅ открываем клавиатуру
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
    options = ["Short", "Medium", "Long"];
  }

  options.forEach((val) => {
    const btn = document.createElement("button");
    btn.textContent = val;
    btn.classList.toggle("active", 
      (gameMode === "time" && val === defaultTime) || 
      (gameMode === "words" && val === wordCount) ||
      (gameMode === "quote" && val.toLowerCase() === quoteMode)
    );

    btn.onclick = () => {
      document.querySelectorAll("#modeOptions button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (gameMode === "words") {
        wordCount = parseInt(val, 10);
        localStorage.setItem("selectedWordCount", wordCount);
        const wordCounterEl = document.getElementById("wordCounter");
        if (wordCounterEl) {
          wordCounterEl.textContent = `0 / ${val}`;
          wordCounterEl.style.display = "block";
        }
        resetGame(false);
      }

      if (gameMode === "time") {
        defaultTime = val;
        remainingTime = val;
        localStorage.setItem("selectedTime", defaultTime);
        timerDisplay.textContent = formatTime(val);
      }

      if (gameMode === "quote") {
        quoteMode = val.toLowerCase();
        localStorage.setItem("selectedQuoteMode", quoteMode);
        resetGame(false);
      }
    };

    container.appendChild(btn);
  });

  // 🔥 Управляем отображением готовых Toggle'ов
  const toggleOptions = document.getElementById("toggleOptions");
  if (gameMode === "words" || gameMode === "time") {
    toggleOptions.style.display = "flex";
  } else {
    toggleOptions.style.display = "none";
  }

  // Устанавливаем правильные значения при перерендере
  document.getElementById("uppercaseToggle").checked = allowUppercase;
  document.getElementById("symbolsToggle").checked = allowSymbols;
}





function scrollTextUpIfNeeded() {
  const activeLetter = document.querySelector(".letter.active");
  if (!activeLetter) return;

  
  const lineHeight = 2.9 * parseFloat(getComputedStyle(document.documentElement).fontSize);
  const activeTop = activeLetter.offsetTop;

  // ❗ Вычисляем индекс строки точно — но не дёргаем scroll пока визуально строка не "закончена"
  const newLineIndex = Math.floor((activeTop + 1) / lineHeight); // +1 — сглаживает дроби

  // Двигаем только если перешли на новую строку
  if (newLineIndex > currentLineIndex) {
    currentLineIndex = newLineIndex;

    const scrollOffset = currentLineIndex * lineHeight;
    textContainer.style.transform = `translateY(-${scrollOffset}px)`;
  }
}



function checkLineAdvance() {
  const activeLetter = document.querySelector(".letter.active");
  if (!activeLetter) return;

  const lineGroups = Array.from(document.querySelectorAll(".lineGroup"));
  const activeLine = activeLetter.closest(".lineGroup");
  const lineIndex = lineGroups.indexOf(activeLine);

  if (lineIndex !== -1 && lineIndex !== currentLineIndex) {
    currentLineIndex = lineIndex;

    // Чёткий сдвиг вверх по строкам
    const lineHeight = 2.4 * parseFloat(getComputedStyle(document.documentElement).fontSize); // px
    textContainer.style.transform = `translateY(-${lineHeight * currentLineIndex}px)`;
  }
}


function switchGameMode(mode) {
  if (gameMode !== mode) {
    gameMode = mode;
    document.querySelectorAll("#gameModes button").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    if (mode === "time" || mode === "words" || mode === "quote") {
      renderModeOptions();  // ⬅️ обязательно перерендерим кнопки
    } else {
      document.getElementById("modeOptions").innerHTML = "";
    }

    document.getElementById("timer").style.display = "none";
    document.getElementById("wordCounter").style.display = "none";

    resetGame(false);
  }
}



function recalculateActiveLine() {
  const activeLetter = document.querySelector(".letter.active");
  if (!activeLetter) return;

  const activeTop = activeLetter.offsetTop;
  const lineHeight = 2.4 * parseFloat(getComputedStyle(document.documentElement).fontSize);

  const newLineIndex = Math.floor(activeTop / lineHeight);
  currentLineIndex = newLineIndex;
  textContainer.style.transform = `translateY(-${currentLineIndex * lineHeight}px)`;
  lastValidTop = activeTop;
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

// // HOME — просто возвращаем на главный экран
// document.getElementById("homeBtn").addEventListener("click", () => {
//   document.getElementById("modePanel").classList.remove("hidden");
//   document.getElementById("resultPanel").style.display = "none";

//   // ⬇️ Сброс таймера и режима
//   // defaultTime = defaultTime; // или 30, или что угодно по умолчанию
//   remainingTime = defaultTime;
//   timerDisplay.textContent = formatTime(defaultTime);

//   updateCursor(); // без автофокуса
//   closeKeyboard();
// });


document.getElementById("resetBtn").addEventListener("click", () => {
  remainingTime = defaultTime;
  timerDisplay.textContent = formatTime(defaultTime);

  // ✅ Обнуляем счётчик слов для режима "words"
  const wordCounterEl = document.getElementById("wordCounter");
  if (gameMode === "words" && wordCounterEl) {
    wordCounterEl.textContent = `0 / ${wordCount}`;
  }

  resetGame(false);
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

window.addEventListener("scroll", () => {
  updateCursor();
});

window.visualViewport?.addEventListener("resize", () => {
  updateCursor();
});

window.addEventListener("resize", () => {
  recalculateActiveLine();  // 💡 новая функция
  updateCursor();
});

window.addEventListener('keydown', (e) => {
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  if (isMobile) return; // На мобильных клавиатура вызывается кликом вручную

  if (document.activeElement !== hiddenInput) {
    if (e.key.length === 1 || e.key === "Backspace") {
      e.preventDefault();
      hiddenInput.focus({ preventScroll: true });
      setCaretToEnd(hiddenInput);

      // ⬇️ И сразу обрабатываем первую нажатую клавишу:
      if (e.key === "Backspace") {
        handleBackspace();
      } else {
        handleKey(e.key);
      }

      hiddenInput.innerText = placeholder;
      setCaretToEnd(hiddenInput);
    }
  }
});


// Убираем фокус с кнопок после клика (чтобы не открывалась клавиатура)
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    // НЕ фокусируем клавиатуру при нажатии на эти кнопки
    const noFocusButtons = ["resetBtn", "homeBtn", "closeResultBtn"];
    const isGameMode = btn.closest("#gameModes") !== null;
    const isModeOption = btn.closest("#modeOptions") !== null;
    if (isMobile) {
      if (!noFocusButtons.includes(btn.id) && !isGameMode && !isModeOption) {
        hiddenInput.focus({ preventScroll: true });
        focusInput();
      } else {
        hiddenInput.blur();
      }
    } else {
      const input = document.getElementById("hiddenInput");
      if (input) {
        input.focus({ preventScroll: true });
        setCaretToEnd(input);
      }
     else {
      hiddenInput.blur();
    }
    }
    
  });
});

function reloadGame() {
  resetGame(false); // сброс текста и состояния
}

// Theme переключение + сохранение
document.getElementById('themeToggle').addEventListener('change', (e) => {
  const theme = e.target.value;
  localStorage.setItem('theme', theme);
  applyTheme(theme);
  reloadGame();

});





// Font Size переключение + сохранение
document.getElementById('fontSizeToggle').addEventListener('change', (e) => {
  const size = e.target.value;
  localStorage.setItem('fontSize', size);
  applyFontSize(size);
  reloadGame();

});

function applyFontSize(size) {
  const textArea = document.getElementById('text');
  const wrapper = document.getElementById('lineScrollWrapper');

  if (size === 'small') {
    textArea.style.fontSize = 'calc(1em + 0.4rem)';
    wrapper.style.height = 'calc(2.8rem * 3)';
  } else if (size === 'medium') {
    textArea.style.fontSize = '';
    wrapper.style.height = 'calc(2.9rem * 3)';
  } else if (size === 'large') {
    textArea.style.fontSize = 'calc(1em + 1.8rem)';
    wrapper.style.height = 'calc(3.6rem * 3)';
  }
}

// Language переключение + сохранение
// document.getElementById('languageToggle').addEventListener('change', (e) => {
//   const lang = e.target.value;
//   localStorage.setItem('language', lang);
//   console.log("Selected language:", lang);
//   reloadGame();

// });

// // Custom Time ввод + сохранение
// document.getElementById('customTime').addEventListener('input', (e) => {
//   const time = parseInt(e.target.value, 10);
//   localStorage.setItem('customTime', time);
//   console.log("Custom time set to:", time, "seconds");
//   reloadGame();

// });

// Show Stats переключение + сохранение
// document.getElementById('showStats').addEventListener('change', (e) => {
//   const show = e.target.checked;
//   localStorage.setItem('showStats', show ? 'true' : 'false');
//   const stats = document.getElementById('timer');
//   if (stats) {
//     stats.style.display = show ? 'block' : 'none';
//   }
//   reloadGame();

// });

// Закрывать настройки при клике вне панели
document.addEventListener('click', function(event) {
  const settingsPanel = document.getElementById('settingsPanel');
  const openBtn = document.getElementById('openSettingsPanel');
  
  if (settingsPanel.classList.contains('active') && 
      !settingsPanel.contains(event.target) && 
      event.target !== openBtn) {
    settingsPanel.classList.remove('active');
  }
});




// Открытие панели настроек
document.getElementById('openSettingsPanel').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('settingsPanel').classList.add('active');
});

// Закрытие панели настроек
document.getElementById('closeSettingsPanel').addEventListener('click', () => {
  document.getElementById('settingsPanel').classList.remove('active');
});



loadWords();
