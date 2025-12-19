// Quiz Data Collections (loaded from JSON)
let webDevQuizData = [];
let pythonQuizData = [];
let quizDataLoaded = false;

// Load quiz data from JSON file
async function loadQuizData() {
  try {
    const response = await fetch("assets/data/quizData.json");
    const data = await response.json();
    webDevQuizData = data.webDev;
    pythonQuizData = data.python;
    quizDataLoaded = true;
  } catch (error) {
    console.error("Error loading quiz data:", error);
    alert("Error loading quiz questions. Please refresh the page.");
  }
}

// Initialize quiz data on page load
loadQuizData();

// Global Variables
let studentName = "";
let studentAge = "";
let quizType = "";
let currentQuizData = [];
let currentQuiz = 0;
let score = 0;
let correctAnswerKey = "";
let shuffledAnswers = [];

// LocalStorage Keys
const STORAGE_KEYS = {
  STUDENT_NAME: "quizStudentName",
  STUDENT_AGE: "quizStudentAge",
  QUIZ_TYPE: "quizType",
  QUIZ_DATA: "quizData",
  CURRENT_QUIZ: "currentQuiz",
  SCORE: "quizScore",
  SHUFFLED_ANSWERS: "shuffledAnswers",
  PERCENTAGE: "quizPercentage",
  IS_COMPLETED: "quizCompleted",
};

// DOM Elements
const welcomeScreen = document.getElementById("welcomeScreen");
const quizScreen = document.getElementById("quizScreen");
const resultsScreen = document.getElementById("resultsScreen");

const nameStep = document.getElementById("nameStep");
const ageStep = document.getElementById("ageStep");
const quizTypeStep = document.getElementById("quizTypeStep");

const nameInput = document.getElementById("studentName");
const ageInput = document.getElementById("studentAge");
const nameNextBtn = document.getElementById("nameNextBtn");
const ageNextBtn = document.getElementById("ageNextBtn");
const quizTypeButtons = document.querySelectorAll(".quiz-type-btn");

const studentInfo = document.getElementById("studentInfo");
const questionEl = document.getElementById("question");
const a_text = document.getElementById("a_text");
const b_text = document.getElementById("b_text");
const c_text = document.getElementById("c_text");
const d_text = document.getElementById("d_text");
const answerEls = document.querySelectorAll(".answer");
const submitBtn = document.getElementById("submit");

const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");
const scoreFraction = document.getElementById("scoreFraction");
const percentageBadge = document.getElementById("percentageBadge");
const playAgainBtn = document.getElementById("playAgainBtn");

// LocalStorage Functions
function saveToLocalStorage() {
  localStorage.setItem(STORAGE_KEYS.STUDENT_NAME, studentName);
  localStorage.setItem(STORAGE_KEYS.STUDENT_AGE, studentAge);
  localStorage.setItem(STORAGE_KEYS.QUIZ_TYPE, quizType);
  localStorage.setItem(STORAGE_KEYS.QUIZ_DATA, JSON.stringify(currentQuizData));
  localStorage.setItem(STORAGE_KEYS.CURRENT_QUIZ, currentQuiz);
  localStorage.setItem(STORAGE_KEYS.SCORE, score);
  localStorage.setItem(
    STORAGE_KEYS.SHUFFLED_ANSWERS,
    JSON.stringify(shuffledAnswers)
  );
}

function saveResults(percentage) {
  localStorage.setItem(STORAGE_KEYS.PERCENTAGE, percentage);
  localStorage.setItem(STORAGE_KEYS.IS_COMPLETED, "true");
}

function loadFromLocalStorage() {
  const savedName = localStorage.getItem(STORAGE_KEYS.STUDENT_NAME);
  const savedAge = localStorage.getItem(STORAGE_KEYS.STUDENT_AGE);
  const savedQuizType = localStorage.getItem(STORAGE_KEYS.QUIZ_TYPE);
  const savedQuizData = localStorage.getItem(STORAGE_KEYS.QUIZ_DATA);
  const savedCurrentQuiz = localStorage.getItem(STORAGE_KEYS.CURRENT_QUIZ);
  const savedScore = localStorage.getItem(STORAGE_KEYS.SCORE);
  const savedShuffledAnswers = localStorage.getItem(
    STORAGE_KEYS.SHUFFLED_ANSWERS
  );
  const isCompleted = localStorage.getItem(STORAGE_KEYS.IS_COMPLETED);

  if (savedName && savedAge && savedQuizType && savedQuizData) {
    studentName = savedName;
    studentAge = savedAge;
    quizType = savedQuizType;
    currentQuizData = JSON.parse(savedQuizData);
    currentQuiz = parseInt(savedCurrentQuiz) || 0;
    score = parseInt(savedScore) || 0;

    if (savedShuffledAnswers) {
      shuffledAnswers = JSON.parse(savedShuffledAnswers);
    }

    return {
      hasSession: true,
      isCompleted: isCompleted === "true",
    };
  }

  return { hasSession: false, isCompleted: false };
}

function clearLocalStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

async function restoreSession() {
  const session = loadFromLocalStorage();

  if (session.hasSession) {
    // Ensure quiz data is loaded
    if (!quizDataLoaded) {
      await loadQuizData();
    }

    if (session.isCompleted) {
      // Show results screen
      const percentage =
        parseInt(localStorage.getItem(STORAGE_KEYS.PERCENTAGE)) || 0;
      welcomeScreen.classList.add("hidden");
      resultsScreen.classList.remove("hidden");

      resultTitle.innerText = `Congratulations, ${studentName}!`;
      scoreFraction.innerText = `You answered ${score} out of ${currentQuizData.length} questions correctly`;
      percentageBadge.innerText = `${percentage}%`;

      let message = "";
      if (percentage >= 80) {
        message =
          "Excellent work! You have a great understanding of the material!";
      } else if (percentage >= 60) {
        message = "Good job! Keep practicing to improve your skills!";
      } else {
        message = "Keep learning and practicing! You'll get better with time!";
      }
      resultMessage.innerText = message;

      console.log("Session restored: Quiz completed");
    } else {
      // Resume quiz
      welcomeScreen.classList.add("hidden");
      quizScreen.classList.remove("hidden");

      const quizTypeName = quizType === "webdev" ? "Web Development" : "Python";
      studentInfo.innerHTML = `<p><strong>${studentName}</strong> (${studentAge} years old) - ${quizTypeName} Quiz</p>`;

      loadQuiz();

      console.log(
        `Session restored: Resuming at question ${currentQuiz + 1}/${
          currentQuizData.length
        }`
      );
    }
  }
}

// Event Listeners - Welcome Screen
nameNextBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name === "") {
    alert("Please enter your name!");
    return;
  }
  studentName = name;
  nameStep.classList.add("fade-out");
  setTimeout(() => {
    nameStep.classList.add("hidden");
    ageStep.classList.remove("hidden");
    setTimeout(() => ageStep.classList.add("fade-in"), 10);
  }, 300);
});

nameInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") nameNextBtn.click();
});

ageNextBtn.addEventListener("click", () => {
  const age = ageInput.value.trim();
  if (age === "" || age < 1 || age > 120) {
    alert("Please enter a valid age!");
    return;
  }
  studentAge = age;
  ageStep.classList.add("fade-out");
  setTimeout(() => {
    ageStep.classList.add("hidden");
    quizTypeStep.classList.remove("hidden");
    setTimeout(() => quizTypeStep.classList.add("fade-in"), 10);
  }, 300);
});

ageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") ageNextBtn.click();
});

quizTypeButtons.forEach((btn) => {
  btn.addEventListener("click", async () => {
    quizType = btn.getAttribute("data-type");

    if (!quizDataLoaded) {
      await loadQuizData();
    }

    if (quizType === "webdev") {
      currentQuizData = shuffleArray([...webDevQuizData]);
    } else {
      currentQuizData = shuffleArray([...pythonQuizData]);
    }

    // Save initial session data
    saveToLocalStorage();

    startQuiz();
  });
});

// Quiz Functions
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startQuiz() {
  welcomeScreen.classList.add("fade-out");
  setTimeout(() => {
    welcomeScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");
    setTimeout(() => quizScreen.classList.add("fade-in"), 10);

    const quizTypeName = quizType === "webdev" ? "Web Development" : "Python";
    studentInfo.innerHTML = `<p><strong>${studentName}</strong> (${studentAge} years old) - ${quizTypeName} Quiz</p>`;

    loadQuiz();
  }, 300);
}

function loadQuiz() {
  deselectAnswers();

  const current = currentQuizData[currentQuiz];

  questionEl.innerText = `Question ${currentQuiz + 1}/${
    currentQuizData.length
  }: ${current.question}`;

  // Check if we have saved shuffled answers for this question
  let currentShuffledAnswers;

  if (shuffledAnswers[currentQuiz]) {
    // Use saved shuffled answers
    currentShuffledAnswers = shuffledAnswers[currentQuiz];
  } else {
    // Create array of answers with their keys
    const answers = [
      { key: "a", text: current.a },
      { key: "b", text: current.b },
      { key: "c", text: current.c },
      { key: "d", text: current.d },
    ];

    // Shuffle answers
    currentShuffledAnswers = shuffleArray([...answers]);

    // Save shuffled answers for this question
    shuffledAnswers[currentQuiz] = currentShuffledAnswers;
  }

  // Find which position has the correct answer
  const correctAnswerPosition = currentShuffledAnswers.findIndex(
    (answer) => answer.key === current.correct
  );

  // Map correct answer position to a, b, c, or d
  const answerKeys = ["a", "b", "c", "d"];
  correctAnswerKey = answerKeys[correctAnswerPosition];

  // Display shuffled answers
  a_text.innerText = currentShuffledAnswers[0].text;
  b_text.innerText = currentShuffledAnswers[1].text;
  c_text.innerText = currentShuffledAnswers[2].text;
  d_text.innerText = currentShuffledAnswers[3].text;

  // Save current state to localStorage
  saveToLocalStorage();
}

function deselectAnswers() {
  answerEls.forEach((answerEl) => (answerEl.checked = false));
}

function getSelected() {
  let answer;
  answerEls.forEach((answerEl) => {
    if (answerEl.checked) {
      answer = answerEl.id;
    }
  });
  return answer;
}

submitBtn.addEventListener("click", () => {
  const answer = getSelected();

  if (answer) {
    if (answer === correctAnswerKey) {
      score++;
    }

    currentQuiz++;

    // Save progress to localStorage
    saveToLocalStorage();

    if (currentQuiz < currentQuizData.length) {
      loadQuiz();
    } else {
      showResults();
    }
  } else {
    alert("Please select an answer!");
  }
});

function showResults() {
  quizScreen.classList.add("fade-out");
  setTimeout(() => {
    quizScreen.classList.add("hidden");
    resultsScreen.classList.remove("hidden");
    setTimeout(() => resultsScreen.classList.add("fade-in"), 10);

    const percentage = Math.round((score / currentQuizData.length) * 100);

    // Save results to localStorage
    saveResults(percentage);

    resultTitle.innerText = `Congratulations, ${studentName}!`;
    scoreFraction.innerText = `You answered ${score} out of ${currentQuizData.length} questions correctly`;
    percentageBadge.innerText = `${percentage}%`;

    let message = "";

    if (percentage >= 80) {
      message =
        "Excellent work! You have a great understanding of the material!";
    } else if (percentage >= 60) {
      message = "Good job! Keep practicing to improve your skills!";
    } else {
      message = "Keep learning and practicing! You'll get better with time!";
    }

    resultMessage.innerText = message;
  }, 300);
}

playAgainBtn.addEventListener("click", () => {
  // Clear localStorage when starting a new quiz
  clearLocalStorage();
  location.reload();
});

// Initialize: Restore session on page load
window.addEventListener("DOMContentLoaded", () => {
  restoreSession();
});
