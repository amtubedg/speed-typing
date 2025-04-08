const sampleText = "This is a test text.  it on phone and PC.";

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
      space.textContent = " ";
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
      alert("Time is up!");
    }
  }, 1000);
}

function handleKey(char) {
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

initText();

textContainer.addEventListener("click", focusInput);
textContainer.addEventListener("touchstart", focusInput);
document.addEventListener("click", focusInput);

hiddenInput.addEventListener("blur", blurInput);
focusInput();
