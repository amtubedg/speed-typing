// Тестовый текст – измените по своему желанию
const sampleText = "Быстрая коричневая лиса перепрыгнула через ленивую собаку.";

let currentIndex = 0;
let timerStarted = false;
let remainingTime = 30;
let timerInterval = null;

const textContainer = document.getElementById('text');
const timerDisplay = document.getElementById('timer');

// Инициализация текста: разбиваем текст на символы и оборачиваем каждый символ в <span>
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

// Функция для запуска таймера (30 секунд)
function startTimer() {
  timerInterval = setInterval(() => {
    remainingTime--;
    timerDisplay.textContent = remainingTime;
    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      document.removeEventListener('keydown', handleKeyDown);
      alert('Время вышло!');
    }
  }, 1000);
}

// Обработка нажатий клавиш
function handleKeyDown(e) {
  // Обработка клавиши Backspace – возвращаем предыдущий символ в состояние pending
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
  
  // Игнорируем клавиши, не являющиеся одиночными символами (Shift, Ctrl, и т.п.)
  if (e.key.length !== 1) return;
  
  // При первом вводе запускаем таймер
  if (!timerStarted) {
    timerStarted = true;
    startTimer();
  }
  
  const spans = textContainer.querySelectorAll('span');
  // Если все символы уже введены – прекращаем дальнейшую обработку
  if (currentIndex >= spans.length) return;
  
  const currentSpan = spans[currentIndex];
  const expectedChar = currentSpan.textContent;
  
  // Сравнение введённого символа с ожидаемым
  if (e.key === expectedChar) {
    currentSpan.classList.remove('pending');
    currentSpan.classList.add('correct');
  } else {
    currentSpan.classList.remove('pending');
    currentSpan.classList.add('incorrect');
  }
  
  currentIndex++;
}

initText();
document.addEventListener('keydown', handleKeyDown);
