const sampleText = "Axpereees vonc es, tes vonc enq paytacnum sax !!";

let currentIndex = 0;
let timerStarted = false;
let remainingTime = 30;
let timerInterval = null;

const textContainer = document.getElementById('text');
const timerDisplay = document.getElementById('timer');
const hiddenInput = document.getElementById('hiddenInput');

function initText() {
  textContainer.innerHTML = "";
  currentIndex = 0;

  const words = sampleText.split(" ");

  words.forEach((word, index) => {
    const wordSpan = document.createElement('span');
    wordSpan.classList.add('wordContainer');

    for (let letter of word) {
      const span = document.createElement('span');
      span.textContent = letter;
      span.classList.add('letter', 'pending');
      wordSpan.appendChild(span);
    }

    textContainer.appendChild(wordSpan);

    if (index < words.length - 1) {
      const space = document.createElement('span');
      space.textContent = " ";
      space.classList.add('letter', 'pending', 'space');
      textContainer.appendChild(space);
    }
  });

  updateCursor();
}

function updateCursor() {
  const letters = document.querySelectorAll('.letter');
  letters.forEach(letter => letter.classList.remove('active'));

  if (currentIndex < letters.length) {
    letters[currentIndex].classList.add('active');
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

function processKey(key) {
  const letters = document.querySelectorAll('.letter');
  if (currentIndex >= letters.length) return;

  if (!timerStarted) {
    timerStarted = true;
    startTimer();
  }

  const current = letters[currentIndex];
  if (key === current.textContent) {
    current.classList.remove('pending', 'incorrect');
    current.classList.add('correct');
  } else {
    current.classList.remove('pending', 'correct');
    current.classList.add('incorrect');
  }

  currentIndex++;
  updateCursor();
}

function handleBackspace() {
  if (currentIndex === 0) return;

  currentIndex--;
  const letters = document.querySelectorAll('.letter');
  const current = letters[currentIndex];
  current.classList.remove('correct', 'incorrect');
  current.classList.add('pending');
  updateCursor();
}

function handleKeyDown(e) {
  e.preventDefault(); // чтобы не набивало значение в input

  if (e.key === "Backspace") {
    handleBackspace();
  } else if (e.key.length === 1) {
    processKey(e.key);
  }

  hiddenInput.value = ""; // очистим поле
}

function focusInput() {
  hiddenInput.focus();
}

initText();
hiddenInput.addEventListener("keydown", handleKeyDown);

textContainer.addEventListener("click", focusInput);
textContainer.addEventListener("touchstart", focusInput);
document.addEventListener("click", focusInput);
