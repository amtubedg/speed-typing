// Исходный текст — убедитесь, что в нём есть пробелы
const sampleText = "This is a sample text for typing practice. It contains several words and spaces.";

let currentIndex = 0;       // общий индекс для всех символов (буквы и пробелы)
let timerStarted = false;
let remainingTime = 30;
let timerInterval = null;

const textContainer = document.getElementById('text');
const timerDisplay = document.getElementById('timer');
const hiddenInput = document.getElementById('hiddenInput');

function initText() {
  textContainer.innerHTML = "";
  currentIndex = 0;
  
  // Разбиваем строку на слова по пробелу
  const words = sampleText.split(" ");
  
  words.forEach((word, wordIndex) => {
    const wordSpan = document.createElement('span');
    wordSpan.classList.add('wordContainer');
    
    // Разбиваем слово на буквы
    for (let i = 0; i < word.length; i++) {
      const letterSpan = document.createElement('span');
      letterSpan.textContent = word[i];
      letterSpan.classList.add('letter', 'pending');
      wordSpan.appendChild(letterSpan);
    }
    
    textContainer.appendChild(wordSpan);
    
    // Если слово не последнее, добавляем пробел как отдельный элемент
    if (wordIndex < words.length - 1) {
      const spaceSpan = document.createElement('span');
      spaceSpan.textContent = " ";
      spaceSpan.classList.add('letter', 'pending', 'space');
      textContainer.appendChild(spaceSpan);
    }
  });
  
  updateActiveCursor();
}

function updateActiveCursor() {
  const allLetters = textContainer.querySelectorAll('.letter');
  allLetters.forEach(letter => letter.classList.remove('active'));
  
  if (currentIndex < allLetters.length) {
    allLetters[currentIndex].classList.add('active');
  }
}

function startTimer() {
  timerInterval = setInterval(() => {
    remainingTime--;
    timerDisplay.textContent = remainingTime;
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      hiddenInput.removeEventListener('keydown', handleKeyDown);
      hiddenInput.removeEventListener('input', handleInput);
      alert('Время вышло!');
    }
  }, 1000);
}

function processKey(key) {
  const allLetters = textContainer.querySelectorAll('.letter');
  if (currentIndex >= allLetters.length) return;
  
  const currentLetterSpan = allLetters[currentIndex];
  const expectedChar = currentLetterSpan.textContent;
  
  if (key === expectedChar) {
    currentLetterSpan.classList.remove('pending');
    currentLetterSpan.classList.add('correct');
  } else {
    currentLetterSpan.classList.remove('pending');
    currentLetterSpan.classList.add('incorrect');
  }
  
  currentIndex++;
  updateActiveCursor();
}

function handleKeyDown(e) {
  // Обработка Backspace
  if (e.key === "Backspace") {
    if (currentIndex > 0) {
      currentIndex--;
      const allLetters = textContainer.querySelectorAll('.letter');
      allLetters[currentIndex].classList.remove('correct', 'incorrect');
      allLetters[currentIndex].classList.add('pending');
    }
    updateActiveCursor();
    hiddenInput.value = "";
    return;
  }
  
  if (e.key.length !== 1) {
    hiddenInput.value = "";
    return;
  }
  
  if (!timerStarted) {
    timerStarted = true;
    startTimer();
  }
  
  processKey(e.key);
  hiddenInput.value = "";
}

function handleInput(e) {
  const text = hiddenInput.value;
  if (!text) return;
  for (let char of text) {
    processKey(char);
  }
  hiddenInput.value = "";
}

function focusHiddenInput() {
  hiddenInput.focus();
}

// Инициализация текста
initText();

// При нажатии на контейнер текста, а также при касании, фокусируем скрытый input
textContainer.addEventListener('click', focusHiddenInput);
textContainer.addEventListener('touchstart', focusHiddenInput);

// Дополнительно: фокус на document, если нажато вне
document.addEventListener('click', focusHiddenInput);

// Обработчики ввода
hiddenInput.addEventListener('keydown', handleKeyDown);
hiddenInput.addEventListener('input', handleInput);
