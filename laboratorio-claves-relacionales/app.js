const people = {
  101: { name: "Ana", orders: 2 },
  102: { name: "Leo", orders: 2 },
  103: { name: "Sofía", orders: 1 }
};

let soundEnabled = false;
let audioContext;

function playTone(kind = "success") {
  if (!soundEnabled) return;
  audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.frequency.value = kind === "success" ? 620 : 190;
  oscillator.type = kind === "success" ? "sine" : "triangle";
  gain.gain.setValueAtTime(.08, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + .16);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + .16);
}

const soundToggle = document.querySelector("#soundToggle");
soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggle.setAttribute("aria-pressed", String(soundEnabled));
  if (soundEnabled) playTone();
});

const customerRows = [...document.querySelectorAll(".customer-row")];
const orderRows = [...document.querySelectorAll(".order-row")];
const selectionMessage = document.querySelector("#selectionMessage");

customerRows.forEach((row) => {
  row.addEventListener("click", () => {
    const id = row.dataset.customer;
    customerRows.forEach((item) => {
      const isSelected = item === row;
      item.classList.toggle("selected", isSelected);
      item.setAttribute("aria-pressed", String(isSelected));
    });
    orderRows.forEach((order) => order.classList.toggle("match", order.dataset.owner === id));
    const person = people[id];
    selectionMessage.innerHTML = `<span>●</span> ${person.name} (cliente ${id}) está conectado${person.name.endsWith("a") ? "a" : ""} con <b>${person.orders} ${person.orders === 1 ? "pedido" : "pedidos"}</b>.`;
    playTone();
  });
});

const missions = [
  {
    tag: "MISIÓN 01",
    title: "Elige la clave primaria",
    prompt: "¿Qué columna identifica de forma única a cada libro?",
    correct: "libro_id",
    choices: [
      ["titulo", "Cien años de soledad"],
      ["libro_id", "LIB-042"],
      ["autor", "G. García Márquez"]
    ],
    success: "¡Exacto! libro_id no se repite y distingue cada libro.",
    wrong: "Esa columna podría repetirse. Busca el identificador único."
  },
  {
    tag: "MISIÓN 02",
    title: "Encuentra la clave foránea",
    prompt: "En Préstamos, ¿qué columna debe apuntar al libro prestado?",
    correct: "libro_id",
    choices: [
      ["prestamo_id", "PRE-109"],
      ["fecha", "11/10/2026"],
      ["libro_id", "LIB-042"]
    ],
    success: "¡Muy bien! libro_id conecta el préstamo con Libros.",
    wrong: "Pista: debe guardar el mismo tipo de valor que la PK de Libros."
  },
  {
    tag: "MISIÓN 03",
    title: "Protege la integridad",
    prompt: "Si no existe LIB-999 en Libros, ¿se permite un préstamo con ese valor?",
    correct: "no",
    choices: [
      ["si", "Sí, se guarda igual"],
      ["no", "No, quedaría huérfano"],
      ["depende", "Solo si el título existe"]
    ],
    success: "¡Conexión protegida! La FK debe referenciar una PK existente.",
    wrong: "Eso rompería la integridad referencial: el préstamo apuntaría a nada."
  }
];

let currentMission = 0;
let missionLocked = false;
const challengeStage = document.querySelector("#challengeStage");
const stepNumber = document.querySelector("#stepNumber");
const progressFill = document.querySelector("#progressFill");

function missionTemplate(mission) {
  return `
    <div class="challenge-copy">
      <span class="challenge-tag">${mission.tag}</span>
      <h3>${mission.title}</h3>
      <p>${mission.prompt}</p>
    </div>
    <div class="choice-grid" role="group" aria-label="Opciones de respuesta">
      ${mission.choices.map(([value, example]) => `<button class="choice" type="button" data-answer="${value}"><span>${value}</span><small>${example}</small></button>`).join("")}
    </div>
    <div class="feedback" aria-live="assertive"></div>`;
}

function renderMission() {
  missionLocked = false;
  stepNumber.textContent = `${currentMission + 1} de 3`;
  progressFill.style.width = `${((currentMission + 1) / missions.length) * 100}%`;
  challengeStage.innerHTML = missionTemplate(missions[currentMission]);
  challengeStage.querySelectorAll(".choice").forEach((button) => button.addEventListener("click", answerMission));
}

function answerMission(event) {
  if (missionLocked) return;
  const button = event.currentTarget;
  const mission = missions[currentMission];
  const feedback = challengeStage.querySelector(".feedback");
  if (button.dataset.answer === mission.correct) {
    missionLocked = true;
    button.classList.add("correct");
    feedback.className = "feedback success";
    feedback.innerHTML = `✓ ${mission.success} <button class="next-button" type="button">${currentMission === missions.length - 1 ? "Ver resultado" : "Siguiente →"}</button>`;
    feedback.querySelector("button").addEventListener("click", nextMission);
    playTone("success");
  } else {
    button.classList.remove("wrong");
    void button.offsetWidth;
    button.classList.add("wrong");
    feedback.className = "feedback error";
    feedback.textContent = `Intenta otra vez. ${mission.wrong}`;
    playTone("error");
  }
}

function nextMission() {
  currentMission += 1;
  if (currentMission < missions.length) {
    renderMission();
    return;
  }
  stepNumber.textContent = "3 de 3";
  progressFill.style.width = "100%";
  challengeStage.innerHTML = `
    <div class="completion">
      <div class="completion-icon" aria-hidden="true">✓</div>
      <h3>¡Relación completada!</h3>
      <p>Construiste una relación válida: cada préstamo puede encontrar exactamente qué libro referencia.</p>
      <div class="schema-result" aria-label="Resultado del esquema relacional">
        <span>LIBROS · <b>libro_id [PK]</b></span><i>1 ─── ∞</i><span>PRÉSTAMOS · <b>libro_id [FK]</b></span>
      </div>
    </div>`;
}

document.querySelector("#resetChallenge").addEventListener("click", () => {
  currentMission = 0;
  renderMission();
});

document.querySelectorAll(".quick-question").forEach((question) => {
  question.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const correct = button.dataset.option === question.dataset.correct;
      question.querySelectorAll("button").forEach((item) => item.classList.remove("correct", "wrong"));
      button.classList.add(correct ? "correct" : "wrong");
      question.querySelector("small").textContent = correct ? "✓ Correcto" : "Revisa la regla y prueba de nuevo.";
      playTone(correct ? "success" : "error");
    });
  });
});

const navLinks = [...document.querySelectorAll(".nav-link")];
const observedSections = [...document.querySelectorAll("[data-nav]")];
const navObserver = new IntersectionObserver((entries) => {
  const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.dataset.nav}`));
}, { rootMargin: "-25% 0px -60%", threshold: [0, .2, .5] });
observedSections.forEach((section) => navObserver.observe(section));

renderMission();
