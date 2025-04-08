const sampleText = "This is a sample text for typing. Type it exactly with spaces.";

let currentIndex = 0;
let timerStarted = false;
let remainingTime = 30;
let timerInterval = null;

const textContainer = document.getElementById("text");
const timerDisplay = document.getElementById("timer");
const hiddenInput = document.getElementById("hiddenInput");

function initText() {
  textContainer.innerHTML = "";
  currentIndex = 0;

  const words = sampleText.split(" ");

  words.forEach((word, index) => {
    const wordSpan = document.createElement("span");
    wordSpan.classList.add("wordContainer");

    for (let letter of word) {
      const span = document.createElement("span");
      span.textContent = letter;
      span.classList.add("letter", "pending");
      wordSpan.appendChild(span);
    }

    textContainer.appendChild(wordSpan);

    if (index < words.length - 1) {
      const space = document.createElement("span");
      space.textContent = " ";
      space.classList.add("letter", "pending", "space");
      textContainer.appendChild(space);
    }
  });

  updateCursor();
}

function updateCursor() {
  const letters = document.querySelectorAll(".letter");
  letters.forEach(letter => letter.classList.remove("active"));

  if (currentIndex < letters.length) {
    letters[currentIndex].classList.add("active");
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    remainingTime--;
    timerDisplay.textContent = remainingTime;
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      alert("Time is up!");
    }
  }, 1000);
}

function processKey(char) {
  const letters = document.querySelectorAll(".letter");
  if (currentIndex >= letters.length) return;

  if (!timerStarted) {
    timerStarted = true;
    startTimer();
  }

  const current = letters[currentIndex];
  if (char === current.textContent) {
    current.classList.remove("pending", "incorrect");
    current.classList.add("correct");
  } else {
    current.classList.remove("pending", "correct");
    current.classList.add("incorrect");
  }

  currentIndex++;
  updateCursor();
}

function handleBackspace() {
  if (currentIndex === 0) return;

  currentIndex--;
  const letters = document.querySelectorAll(".letter");
  const current = letters[currentIndex];
  current.classList.remove("correct", "incorrect");
  current.classList.add("pending");
  updateCursor();
}

function handleInputEvent(e) {
  const text = hiddenInput.innerText.trim();

  if (e.inputType === "deleteContentBackward") {
    handleBackspace();
  } else if (text.length > 0) {
    const char = text.charAt(0);
    processKey(char);
  }

  hiddenInput.innerText = ""; // очищаем поле после ввода
}

function focusInput() {
  hiddenInput.focus();
}

initText();

hiddenInput.addEventListener("beforeinput", handleInputEvent);
textContainer.addEventListener("click", focusInput);
textContainer.addEventListener("touchstart", focusInput);
document.addEventListener("click", focusInput);
