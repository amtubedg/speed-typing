// Тестовый текст – измените по своему усмотрению
const sampleText = "Быстрая коричневая лиса перепрыгнула через ленивую собаку.";

let currentIndex = 0;
let timerStarted = false;
let remainingTime = 30;
let timerInterval = null;

const textContainer = document.getElementById('text');
const timerDisplay = document.getElementById('timer');
const hiddenInput = document.getElementById('hiddenInput');

// Инициализация текста: разбиваем строку на символы и оборачиваем каждый символ в <span>
function initText() {
  textContainer.innerHTML = "";
  currentIndex = 0;
  sampleText.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    span.classList.add('pending');
    textContainer.appendChild(span);
  });
}

// Функция запуска таймера (30 секунд)
function startTimer() {
  timerInterval = setInterval(() => {
    remainingTime--;
    timerDisplay.textContent = remainingTime;
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      hiddenInput.removeEventListener('keydown', handleKeyDown);
      alert('Время вышло!');
    }
  }, 1000);
}

// Обработка нажатий клавиш в input
function handleKeyDown(e) {
  // Если нажата клавиша Backspace, возвращаем предыдущий символ в состояние pending
  if (e.key === "Backspace") {
    if (currentIndex > 0) {
      currentIndex--;
      const spans = textContainer.querySelectorAll('span');
      const currentSpan = spans[currentIndex];
      currentSpan.classList.remove('correct', 'incorrect');
      currentSpan.classList.add('pending');
    }
    return;
  }
  
  // Игнорируем клавиши, не являющиеся одиночными символами (например, Shift, Ctrl, Alt)
  if (e.key.length !== 1) return;
  
  // Запуск таймера при первом вводе
  if (!timerStarted) {
    timerStarted = true;
    startTimer();
  }
  
  const spans = textContainer.querySelectorAll('span');
  // Если все символы уже введены – прекращаем обработку
  if (currentIndex >= spans.length) return;
  
  const currentSpan = spans[currentIndex];
  const expectedChar = currentSpan.textContent;
  
  // Сравнение символа: если введён символ соответствует ожидаемому, отмечаем как correct, иначе – как incorrect
  if (e.key === expectedChar) {
    currentSpan.classList.remove('pending');
    currentSpan.classList.add('correct');
  } else {
    currentSpan.classList.remove('pending');
    currentSpan.classList.add('incorrect');
  }
  
  currentIndex++;
}

// Функция для установки фокуса на скрытый input (открытие клавиатуры)
function focusHiddenInput() {
  hiddenInput.focus();
}

initText();

// Слушаем нажатия клавиш через скрытый input
hiddenInput.addEventListener('keydown', handleKeyDown);

// При клике по документу переводим фокус на скрытый input (важно для мобильных)
// Это гарантирует, что клавиатура появится после касания экрана
document.addEventListener('click', focusHiddenInput);

// Устанавливаем фокус сразу после загрузки (если браузер позволяет автоподъём клавиатуры)
focusHiddenInput();
