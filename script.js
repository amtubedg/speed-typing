// Тестовый текст – измените по своему усмотрению
const sampleText = "Быстрая коричневая лиса перепрыгнула через ленивую собаку.";

let currentIndex = 0;
let timerStarted = false;
let remainingTime = 30;
let timerInterval = null;

const textContainer = document.getElementById('text');
const timerDisplay = document.getElementById('timer');
const hiddenInput = document.getElementById('hiddenInput');

// Функция инициализации: разбиваем текст на символы и оборачиваем в <span>
function initText() {
  textContainer.innerHTML = "";
  currentIndex = 0;
  sampleText.split('').forEach(char => {
    const span = document.createElement('span');
    span.textContent = char;
    span.classList.add('pending');
    textContainer.appendChild(span);
  });
  updateActiveCursor();
}

// Функция для обновления активного курсора на текущем символе
function updateActiveCursor() {
  // Удаляем класс active у всех спанов
  const spans = textContainer.querySelectorAll('span');
  spans.forEach(span => span.classList.remove('active'));
  // Добавляем класс active текущему символу, если он существует
  if (currentIndex < spans.length) {
    spans[currentIndex].classList.add('active');
  }
}

// Функция для запуска таймера (30 секунд)
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
    updateActiveCursor();
    return;
  }
  
  // Игнорируем клавиши, не являющиеся одиночными символами (Shift, Ctrl, Alt и пр.)
  if (e.key.length !== 1) return;
  
  // При первом вводе запускаем таймер
  if (!timerStarted) {
    timerStarted = true;
    startTimer();
  }
  
  const spans = textContainer.querySelectorAll('span');
  // Если все символы уже введены – прекращаем обработку
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
  updateActiveCursor();
}

// Функция для установки фокуса на скрытый input (открытие клавиатуры)
function focusHiddenInput() {
  hiddenInput.focus();
}

initText();

// Слушаем нажатия клавиш через скрытый input
hiddenInput.addEventListener('keydown', handleKeyDown);

// При клике по документу устанавливаем фокус на скрытый input (важно для мобильных)
document.addEventListener('click', focusHiddenInput);

// Пытаемся установить фокус сразу после загрузки (на некоторых устройствах автодоступ может не сработать)
focusHiddenInput();
