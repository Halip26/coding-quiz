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
const playAgainBtn = document.getElementById("playAgainBtn");

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

  questionEl.innerText = `Question ${currentQuiz + 1}/${currentQuizData.length}: ${current.question}`;
  a_text.innerText = current.a;
  b_text.innerText = current.b;
  c_text.innerText = current.c;
  d_text.innerText = current.d;
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
    if (answer === currentQuizData[currentQuiz].correct) {
      score++;
    }

    currentQuiz++;

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
    
    resultTitle.innerText = `Congratulations, ${studentName}!`;
    
    let message = `You answered ${score} out of ${currentQuizData.length} questions correctly (${percentage}%). `;
    
    if (percentage >= 80) {
      message += "Excellent work! You have a great understanding of the material!";
    } else if (percentage >= 60) {
      message += "Good job! Keep practicing to improve your skills!";
    } else {
      message += "Keep learning and practicing! You'll get better with time!";
    }
    
    resultMessage.innerText = message;
  }, 300);
}

playAgainBtn.addEventListener("click", () => {
  location.reload();
});
