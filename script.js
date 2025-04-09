const sampleText = "Axpeeeres la gri tenam karum es gres. Verjum el asuma te qani sxal arir. Կարաս հայերեն էլ փորձես է, или на русском";

let currentIndex = 0;
let timerStarted = false;
let remainingTime = 30;
let timerInterval = null;
let incorrectCount = 0;

let gameMode = "time";          // по умолчанию
let timeOptions = [15, 30, 60, 120];
let wordOptions = [10, 25, 50, 100];
let defaultTime = 30;
let wordCount = 25;


const textContainer = document.getElementById("text");
const timerDisplay = document.getElementById("timer");
const hiddenInput = document.getElementById("hiddenInput");

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
      space.textContent = "";
      textContainer.appendChild(space);
    }
  });

  updateCursor();
  hiddenInput.innerText = "";
}

function updateCursor() {
  document.querySelectorAll(".letter").forEach(el => el.classList.remove("active"));
  const letters = document.querySelectorAll(".letter");
  if (currentIndex < letters.length) {
    letters[currentIndex].classList.add("active");
  }
}
function focusInput() {
  setTimeout(() => {
    hiddenInput.focus({ preventScroll: true }); // ⚠️ важно!
  }, 0);
}

function blurInput() {
  document.body.classList.remove('noscroll');
}
function startTimer() {
  
  timerInterval = setInterval(() => {
    remainingTime--;
    timerDisplay.textContent = remainingTime;
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      alert("Ba axper jan");
    }
  }, 1000);
}

function handleKey(char) {
  const letters = document.querySelectorAll(".letter");
  if (currentIndex >= letters.length) return;

  if (!timerStarted) {
    timerStarted = true;
    startTimer();
    document.body.classList.add("typing-started"); // ✅ добавляем класс
  }
  

  const current = letters[currentIndex];
  if (char === current.textContent) {
    current.classList.remove("pending", "incorrect");
    current.classList.add("correct");
  } else {
    current.classList.remove("pending", "correct");
    current.classList.add("incorrect");
    // incorrectCount++;
  }

  currentIndex++;
  updateCursor();
}
function renderModeOptions() {
  const container = document.getElementById("modeOptions");
  container.innerHTML = "";

  let options = [];
  if (gameMode === "time") {
    options = timeOptions;
  } else if (gameMode === "words") {
    options = wordOptions;
  }

  options.forEach((val, index) => {
    const btn = document.createElement("button");
    btn.textContent = val;
    btn.classList.toggle("active", index === 1); // второй по умолчанию
    btn.onclick = () => {
      document.querySelectorAll("#modeOptions button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      if (gameMode === "time") {
        defaultTime = val;
        remainingTime = val;
        timerDisplay.textContent = val;
      } else if (gameMode === "words") {
        wordCount = val;
        loadWords();
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

function resetGame() {
  timerStarted = false;
  clearInterval(timerInterval);
  currentIndex = 0;
  document.body.classList.remove("typing-started");
  initText();
  focusInput();
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

  hiddenInput.innerText = ""; // очищаем поле
});

function focusInput() {
  hiddenInput.focus();
}

document.querySelectorAll("#gameModes button").forEach(btn => {
  btn.onclick = () => switchGameMode(btn.dataset.mode);
});

renderModeOptions();
initText();

textContainer.addEventListener("click", focusInput);
textContainer.addEventListener("touchstart", focusInput);
document.addEventListener("click", focusInput);

hiddenInput.addEventListener("blur", blurInput);
focusInput();
