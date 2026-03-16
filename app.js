const sentences = [
  {
    text: "She didn't went to school yesterday.",
    isCorrect: false,
    explanation: "After 'didn't', use the base verb: 'go'.",
    corrected: "She didn't go to school yesterday.",
  },
  {
    text: "I have visited London last year.",
    isCorrect: false,
    explanation: "With a finished time (last year), use the past simple.",
    corrected: "I visited London last year.",
  },
  {
    text: "There isn’t enough chairs in the room.",
    isCorrect: false,
    explanation: "'Chairs' is plural, so use 'aren't'.",
    corrected: "There aren’t enough chairs in the room.",
  },
  {
    text: "If I were you, I would study more.",
    isCorrect: true,
    explanation: "Second conditional: 'If I were you, I would…' is correct.",
    corrected: null,
  },
  {
    text: "He don't like spicy food.",
    isCorrect: false,
    explanation: "For 'he/she/it' use 'doesn't'.",
    corrected: "He doesn't like spicy food.",
  },
  {
    text: "We have been waiting for two hours.",
    isCorrect: true,
    explanation: "Present perfect continuous is correct here.",
    corrected: null,
  },
  {
    text: "She is used to get up early.",
    isCorrect: false,
    explanation: "Use 'used to getting' or 'used to get' depending on meaning.",
    corrected: "She is used to getting up early.",
  },
  {
    text: "There is a lot of informations in this article.",
    isCorrect: false,
    explanation: "'Information' is uncountable; no 's'.",
    corrected: "There is a lot of information in this article.",
  },
  {
    text: "By this time tomorrow, I will have finished my homework.",
    isCorrect: true,
    explanation: "Future perfect with a time expression is correct.",
    corrected: null,
  },
  {
    text: "She can to swim very well.",
    isCorrect: false,
    explanation: "After 'can', use the base verb.",
    corrected: "She can swim very well.",
  },
];

const initialPoints = 10;
const teams = [
  { id: "team-a", name: "Team A", cssClass: "team-a", points: initialPoints },
  { id: "team-b", name: "Team B", cssClass: "team-b", points: initialPoints },
  { id: "team-c", name: "Team C", cssClass: "team-c", points: initialPoints },
  { id: "team-d", name: "Team D", cssClass: "team-d", points: initialPoints },
  { id: "team-e", name: "Team E", cssClass: "team-e", points: initialPoints },
];

let currentSentenceIndex = 0;
let hasRevealed = false;
let roundTimer = null;
let roundSecondsLeft = 0;

const sentenceEl = document.getElementById("current-sentence");
const feedbackEl = document.getElementById("answer-feedback");
const counterEl = document.getElementById("sentence-counter");
const timerPillEl = document.getElementById("timer-pill");
const teamsBodyEl = document.getElementById("teams-body");
const revealBtn = document.getElementById("reveal-btn");
const nextBtn = document.getElementById("next-btn");
const settingsBtn = document.getElementById("settings-btn");
const podiumEl = document.getElementById("podium");
const podiumListEl = document.getElementById("podium-list");
const settingsModalEl = document.getElementById("settings-modal");
const closeSettingsBtn = document.getElementById("close-settings-btn");
const darkModeToggleEl = document.getElementById("dark-mode-toggle");

function formatPoints(points) {
  return `${points} pts`;
}

function createTeamRow(team) {
  const tr = document.createElement("tr");
  tr.dataset.teamId = team.id;

  const teamCell = document.createElement("td");
  const teamLabel = document.createElement("div");
  teamLabel.className = `team-label ${team.cssClass}`;

  const colorBar = document.createElement("div");
  colorBar.className = "team-color";

  const nameSpan = document.createElement("span");
  nameSpan.textContent = team.name;

  teamLabel.appendChild(colorBar);
  teamLabel.appendChild(nameSpan);
  teamCell.appendChild(teamLabel);

  const answerCell = document.createElement("td");
  const toggle = document.createElement("div");
  toggle.className = "answer-toggle";

  const trueBtn = document.createElement("button");
  trueBtn.type = "button";
  trueBtn.className = "answer-button true";
  trueBtn.textContent = "TRUE";

  const falseBtn = document.createElement("button");
  falseBtn.type = "button";
  falseBtn.className = "answer-button false";
  falseBtn.textContent = "FALSE";

  trueBtn.addEventListener("click", () => setTeamAnswer(team.id, true));
  falseBtn.addEventListener("click", () => setTeamAnswer(team.id, false));

  toggle.appendChild(trueBtn);
  toggle.appendChild(falseBtn);
  answerCell.appendChild(toggle);

  const betCell = document.createElement("td");
  const betInput = document.createElement("input");
  betInput.type = "number";
  betInput.min = "0";
  betInput.step = "1";
  betInput.value = "0";
  betInput.className = "bet-input";
  betInput.addEventListener("input", () => clampBetInput(team.id));
  betCell.appendChild(betInput);

  const pointsCell = document.createElement("td");
  const pointsPill = document.createElement("div");
  pointsPill.className = "points-pill";
  pointsPill.textContent = formatPoints(team.points);
  pointsCell.appendChild(pointsPill);

  tr.appendChild(teamCell);
  tr.appendChild(answerCell);
  tr.appendChild(betCell);
  tr.appendChild(pointsCell);

  return tr;
}

function renderTeamsTable() {
  teamsBodyEl.innerHTML = "";
  teams.forEach((team) => {
    const row = createTeamRow(team);
    teamsBodyEl.appendChild(row);
  });
}

function getTeamRowElements(teamId) {
  const row = teamsBodyEl.querySelector(`tr[data-team-id="${teamId}"]`);
  if (!row) return null;

  const answerButtons = row.querySelectorAll(".answer-button");
  const betInput = row.querySelector(".bet-input");
  const pointsPill = row.querySelector(".points-pill");

  return { row, answerButtons, betInput, pointsPill };
}

function setTeamAnswer(teamId, answerIsTrue) {
  if (hasRevealed) return;
  const els = getTeamRowElements(teamId);
  if (!els) return;

  els.answerButtons.forEach((btn) => {
    btn.classList.remove("selected");
  });

  const target = Array.from(els.answerButtons).find((btn) =>
    answerIsTrue ? btn.classList.contains("true") : btn.classList.contains("false")
  );
  if (target) {
    target.classList.add("selected");
    target.dataset.selected = "true";
  }

  const other = Array.from(els.answerButtons).find((btn) => btn !== target);
  if (other) {
    delete other.dataset.selected;
  }

  const team = teams.find((t) => t.id === teamId);
  if (team) {
    team.currentAnswer = answerIsTrue;
  }
}

function clampBetInput(teamId) {
  const team = teams.find((t) => t.id === teamId);
  if (!team) return;
  const els = getTeamRowElements(teamId);
  if (!els || !els.betInput) return;

  let value = parseInt(els.betInput.value, 10);
  if (Number.isNaN(value) || value < 0) value = 0;
  if (value > team.points) value = team.points;
  els.betInput.value = String(value);
}

function updatePointsPill(team) {
  const els = getTeamRowElements(team.id);
  if (!els || !els.pointsPill) return;

  els.pointsPill.textContent = formatPoints(team.points);
  els.pointsPill.classList.remove("low", "high");
  if (team.points === 0) {
    els.pointsPill.classList.add("low");
  } else if (team.points >= initialPoints * 2) {
    els.pointsPill.classList.add("high");
  }
}

function setInputsEnabled(enabled) {
  teams.forEach((team) => {
    const els = getTeamRowElements(team.id);
    if (!els) return;
    els.answerButtons.forEach((btn) => {
      btn.disabled = !enabled;
    });
    els.betInput.disabled = !enabled;
  });
}

function startRoundTimer() {
  // simple highlight of activity, no countdown
  timerPillEl.textContent = "IN PROGRESS";
  timerPillEl.classList.add("counting");
  timerPillEl.classList.remove("ended");
}

function revealAnswer() {
  if (hasRevealed) return;

  const currentSentence = sentences[currentSentenceIndex];
  const correct = currentSentence.isCorrect;

  timerPillEl.textContent = "ANSWER SHOWN";
  timerPillEl.classList.remove("counting");
  timerPillEl.classList.add("ended");

  teams.forEach((team) => {
    const els = getTeamRowElements(team.id);
    if (!els) return;

    const bet = parseInt(els.betInput.value, 10) || 0;
    if (bet <= 0) return;

    const answer = team.currentAnswer;
    if (typeof answer !== "boolean") return;

    const wasCorrect = answer === correct;
    if (wasCorrect) {
      team.points += bet;
      els.row.classList.remove("team-row-incorrect");
      els.row.classList.add("team-row-correct");
    } else {
      team.points = Math.max(0, team.points - bet);
      els.row.classList.remove("team-row-correct");
      els.row.classList.add("team-row-incorrect");
    }
    updatePointsPill(team);
  });

  const icon = correct ? "✅" : "❌";
  const statusText = correct ? "The sentence is CORRECT." : "The sentence is INCORRECT.";
  const explanationLines = [currentSentence.explanation];
  if (currentSentence.corrected) {
    explanationLines.push(`Correct version: "${currentSentence.corrected}"`);
  }

  feedbackEl.innerHTML = `
    <strong>${icon} ${statusText}</strong><br />
    ${explanationLines.join("<br />")}
  `;
  feedbackEl.classList.remove("hidden", "correct", "incorrect");
  feedbackEl.classList.add(correct ? "correct" : "incorrect");

  hasRevealed = true;
  setInputsEnabled(false);
  revealBtn.disabled = true;
  nextBtn.disabled = currentSentenceIndex >= sentences.length - 1;

  if (currentSentenceIndex >= sentences.length - 1) {
    showPodium();
  }
}

function nextSentence() {
  if (currentSentenceIndex >= sentences.length - 1) return;
  currentSentenceIndex += 1;
  hasRevealed = false;
  renderCurrentSentence();
  resetRoundInputs();
  timerPillEl.textContent = "READY";
  timerPillEl.classList.remove("counting", "ended");
}

function renderCurrentSentence() {
  const currentSentence = sentences[currentSentenceIndex];
  sentenceEl.textContent = `“${currentSentence.text}”`;
  counterEl.textContent = `Sentence ${currentSentenceIndex + 1} / ${sentences.length}`;

  feedbackEl.classList.add("hidden");
  feedbackEl.classList.remove("correct", "incorrect");
  feedbackEl.innerHTML = "";
}

function resetRoundInputs() {
  teams.forEach((team) => {
    team.currentAnswer = undefined;
    const els = getTeamRowElements(team.id);
    if (!els) return;

    els.answerButtons.forEach((btn) => {
      btn.classList.remove("selected");
      delete btn.dataset.selected;
    });

    els.row.classList.remove("team-row-correct", "team-row-incorrect");

    els.betInput.value = "0";
    els.betInput.disabled = false;
    els.answerButtons.forEach((btn) => {
      btn.disabled = false;
    });
  });

  revealBtn.disabled = false;
  nextBtn.disabled = true;
}

function resetGame() {
  currentSentenceIndex = 0;
  hasRevealed = false;
  if (roundTimer) {
    clearInterval(roundTimer);
    roundTimer = null;
  }

  teams.forEach((team) => {
    team.points = initialPoints;
    team.currentAnswer = undefined;
    const els = getTeamRowElements(team.id);
    if (!els) return;
    els.betInput.value = "0";
    updatePointsPill(team);
    els.row.classList.remove("team-row-correct", "team-row-incorrect");
  });

  timerPillEl.textContent = "READY";
  timerPillEl.classList.remove("counting", "ended");
  podiumEl.classList.add("hidden");
  podiumListEl.innerHTML = "";

  renderCurrentSentence();
  resetRoundInputs();
}

function applyRemoteEvent(event) {
  // no-op: multi-device mode removed
}

function showPodium() {
  const ranked = [...teams].sort((a, b) => b.points - a.points);
  podiumListEl.innerHTML = "";

  ranked.forEach((team, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${team.name}`;
    const scoreSpan = document.createElement("span");
    scoreSpan.textContent = formatPoints(team.points);
    li.appendChild(scoreSpan);

    if (index === 0) li.classList.add("podium-rank-1");
    else if (index === 1) li.classList.add("podium-rank-2");
    else if (index === 2) li.classList.add("podium-rank-3");

    podiumListEl.appendChild(li);
  });

  podiumEl.classList.remove("hidden");
}

function init() {
  renderTeamsTable();
  renderCurrentSentence();

  timerPillEl.textContent = "READY";

  revealBtn.addEventListener("click", revealAnswer);
  nextBtn.addEventListener("click", nextSentence);
  settingsBtn.addEventListener("click", () => {
    settingsModalEl.classList.remove("hidden");
  });
  closeSettingsBtn.addEventListener("click", () => {
    settingsModalEl.classList.add("hidden");
  });

  const savedTheme = localStorage.getItem("betting-game-theme");
  if (savedTheme === "dark") {
    document.body.classList.add("theme-dark");
    darkModeToggleEl.checked = true;
  }

  darkModeToggleEl.addEventListener("change", () => {
    const isDark = darkModeToggleEl.checked;
    if (isDark) {
      document.body.classList.add("theme-dark");
      localStorage.setItem("betting-game-theme", "dark");
    } else {
      document.body.classList.remove("theme-dark");
      localStorage.setItem("betting-game-theme", "light");
    }
  });
}

document.addEventListener("DOMContentLoaded", init);

