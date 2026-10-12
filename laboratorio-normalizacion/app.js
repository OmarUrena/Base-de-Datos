const anomalies = {
  update: {
    label: "Anomalía de actualización",
    text: "Ana cambió de ciudad. Si su dirección aparece en diez pedidos, hay que cambiar diez filas. Si olvidamos una, la base de datos se contradice.",
    rows: [
      ["P-101", "Ana", "Mérida"],
      ["P-116", "Ana", "Caracas", "alert"],
      ["P-130", "Ana", "Mérida"]
    ],
    conclusion: "Una sola persona aparece con dos ciudades. El mismo hecho estaba almacenado varias veces."
  },
  insert: {
    label: "Anomalía de inserción",
    text: "Queremos registrar un producto nuevo, pero la tabla exige un pedido. Sin una compra inventada, no hay dónde guardar el producto.",
    rows: [
      ["P-101", "Teclado", "$25"],
      ["¿?", "Webcam nueva", "$42", "new"],
      ["P-130", "Mouse", "$12"]
    ],
    conclusion: "El producto depende de que exista un pedido, aunque conceptualmente debería existir por sí solo."
  },
  delete: {
    label: "Anomalía de eliminación",
    text: "Eliminamos el único pedido que contiene el producto Monitor. Al borrar esa fila también desaparecen su nombre y su precio.",
    rows: [
      ["P-101", "Teclado", "$25"],
      ["P-116", "Monitor", "$180", "alert"],
      ["P-130", "Mouse", "$12"]
    ],
    conclusion: "Una operación sobre pedidos destruye accidentalmente información del catálogo."
  }
};

const anomalyDemo = document.querySelector("#anomalyDemo");

function renderAnomaly(name) {
  const item = anomalies[name];
  anomalyDemo.innerHTML = `
    <span class="step-label">SÍNTOMA DETECTADO</span>
    <h3>${item.label}</h3>
    <p>${item.text}</p>
    <div class="demo-table" role="table" aria-label="Ejemplo de ${item.label.toLowerCase()}">
      <div class="demo-row demo-head" role="row"><span>pedido_id</span><span>dato</span><span>valor</span></div>
      ${item.rows.map(row => `<div class="demo-row" role="row"><span>${row[0]}</span><span class="${row[3] === "new" ? "cell-new" : ""}">${row[1]}</span><span class="${row[3] === "alert" ? "cell-alert" : row[3] === "new" ? "cell-new" : ""}">${row[2]}</span></div>`).join("")}
    </div>
    <div class="demo-conclusion"><b>Consecuencia:</b> ${item.conclusion}</div>`;
}

document.querySelectorAll(".anomaly-tab").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".anomaly-tab").forEach(tab => {
      const active = tab === button;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", String(active));
    });
    renderAnomaly(button.dataset.anomaly);
  });
});

const phases = [
  {
    badge: "ESTADO INICIAL",
    title: "Todo mezclado en una sola tabla",
    description: "Los productos están guardados como una lista dentro de una celda. Es difícil buscar, ordenar o calcular cantidades.",
    rule: "Problema: hay celdas con más de un valor.",
    html: `<div class="schema-area"><div class="schema-table wide">
      <div class="schema-title">VENTAS_DESORDENADAS <small>NO CUMPLE 1FN</small></div>
      <div class="schema-row schema-head cols-4"><span>pedido_id</span><span>cliente</span><span>ciudad</span><span>productos</span></div>
      <div class="schema-row cols-4"><span class="pk-cell">P-101</span><span>Ana</span><span>Mérida</span><span class="problem-cell">Teclado × 1; Mouse × 2</span></div>
      <div class="schema-row cols-4"><span class="pk-cell">P-102</span><span>Leo</span><span>Caracas</span><span class="problem-cell">Monitor × 1</span></div>
      <div class="schema-note">⚠ “productos” contiene listas: no es un valor atómico.</div>
    </div></div>`
  },
  {
    badge: "PRIMERA FORMA NORMAL",
    title: "Una celda, un solo valor",
    description: "Convertimos cada producto del pedido en una fila. Ahora la clave es compuesta: pedido_id + producto_id.",
    rule: "1FN: valores atómicos y sin grupos repetidos.",
    html: `<div class="schema-area"><div class="schema-table wide">
      <div class="schema-title">DETALLE_PEDIDO_GIGANTE <small>YA CUMPLE 1FN</small></div>
      <div class="schema-row schema-head cols-7"><span>pedido_id</span><span>producto_id</span><span>cliente</span><span>ciudad</span><span>producto</span><span>precio</span><span>cantidad</span></div>
      <div class="schema-row cols-7"><span class="pk-cell">P-101</span><span class="pk-cell">PR-7</span><span>Ana</span><span>Mérida</span><span>Teclado</span><span>$25</span><span>1</span></div>
      <div class="schema-row cols-7"><span class="pk-cell">P-101</span><span class="pk-cell">PR-9</span><span>Ana</span><span>Mérida</span><span>Mouse</span><span>$12</span><span>2</span></div>
      <div class="schema-row cols-7"><span class="pk-cell">P-102</span><span class="pk-cell">PR-4</span><span>Leo</span><span>Caracas</span><span>Monitor</span><span>$180</span><span>1</span></div>
      <div class="schema-note">⚠ Aún hay dependencias parciales: producto y precio dependen solo de producto_id; cliente y ciudad, solo de pedido_id.</div>
    </div></div>`
  },
  {
    badge: "SEGUNDA FORMA NORMAL",
    title: "Cada atributo depende de la clave completa",
    description: "Separamos los datos que dependían de solo una parte de la clave compuesta. La cantidad sí depende del pedido y del producto juntos.",
    rule: "2FN: estar en 1FN y eliminar dependencias parciales.",
    html: `<div class="schema-area multi">
      <div class="table-cluster">
        <div class="schema-table"><div class="schema-title">PEDIDOS <small>PARCIAL: pedido_id</small></div><div class="schema-row schema-head cols-4"><span>pedido_id</span><span>fecha</span><span>cliente_id</span><span>cliente_ciudad</span></div><div class="schema-row cols-4"><span class="pk-cell">P-101</span><span>10/10</span><span>C-01</span><span class="problem-cell">Mérida</span></div></div>
        <div class="schema-table"><div class="schema-title">PRODUCTOS <small>PARCIAL: producto_id</small></div><div class="schema-row schema-head cols-3"><span>producto_id</span><span>nombre</span><span>precio</span></div><div class="schema-row cols-3"><span class="pk-cell">PR-7</span><span>Teclado</span><span>$25</span></div></div>
      </div>
      <span class="schema-arrow">+</span>
      <div class="schema-table"><div class="schema-title">DETALLE_PEDIDO <small>DEPENDE DE AMBAS</small></div><div class="schema-row schema-head cols-3"><span>pedido_id</span><span>producto_id</span><span>cantidad</span></div><div class="schema-row cols-3"><span class="fk-cell">P-101</span><span class="fk-cell">PR-7</span><span>1</span></div><div class="schema-row cols-3"><span class="fk-cell">P-101</span><span class="fk-cell">PR-9</span><span>2</span></div></div>
    </div>`
  },
  {
    badge: "TERCERA FORMA NORMAL",
    title: "Nada depende de otro atributo no clave",
    description: "La ciudad depende del cliente, no directamente del pedido. Creamos Clientes y dejamos cliente_id como clave foránea en Pedidos.",
    rule: "3FN: estar en 2FN y eliminar dependencias transitivas.",
    html: `<div class="schema-area multi">
      <div class="schema-table"><div class="schema-title">CLIENTES <small>NUEVA TABLA</small></div><div class="schema-row schema-head cols-3"><span>cliente_id</span><span>nombre</span><span>ciudad</span></div><div class="schema-row cols-3"><span class="pk-cell">C-01</span><span>Ana</span><span>Mérida</span></div></div>
      <span class="schema-arrow">←</span>
      <div class="schema-table"><div class="schema-title">PEDIDOS <small>EN 3FN</small></div><div class="schema-row schema-head cols-3"><span>pedido_id</span><span>fecha</span><span>cliente_id</span></div><div class="schema-row cols-3"><span class="pk-cell">P-101</span><span>10/10</span><span class="fk-cell">C-01</span></div></div>
      <span class="schema-arrow">+</span>
      <div class="table-cluster"><div class="schema-table"><div class="schema-title">PRODUCTOS <small>EN 3FN</small></div><div class="schema-row schema-head cols-3"><span>producto_id</span><span>nombre</span><span>precio</span></div><div class="schema-row cols-3"><span class="pk-cell">PR-7</span><span>Teclado</span><span>$25</span></div></div><div class="schema-table"><div class="schema-title">DETALLE_PEDIDO <small>TABLA PUENTE</small></div><div class="schema-row schema-head cols-3"><span>pedido_id</span><span>producto_id</span><span>cantidad</span></div><div class="schema-row cols-3"><span class="fk-cell">P-101</span><span class="fk-cell">PR-7</span><span>1</span></div></div></div>
    </div>`
  }
];

let currentPhase = 0;
const phaseContent = document.querySelector("#phaseContent");
const previousPhase = document.querySelector("#previousPhase");
const nextPhase = document.querySelector("#nextPhase");
const phaseCounter = document.querySelector("#phaseCounter");

function renderPhase(index) {
  currentPhase = index;
  const phase = phases[index];
  document.querySelectorAll(".phase-tab").forEach((tab, tabIndex) => {
    const active = tabIndex === index;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  phaseContent.innerHTML = `<div class="phase-intro"><div><h3>${phase.title}</h3><p>${phase.description}</p><p class="phase-rule">${phase.rule}</p></div><span class="phase-badge">${phase.badge}</span></div>${phase.html}`;
  phaseCounter.textContent = `Etapa ${index} de 3`;
  previousPhase.disabled = index === 0;
  nextPhase.disabled = index === phases.length - 1;
}

document.querySelectorAll(".phase-tab").forEach(button => button.addEventListener("click", () => renderPhase(Number(button.dataset.phase))));
previousPhase.addEventListener("click", () => renderPhase(Math.max(0, currentPhase - 1)));
nextPhase.addEventListener("click", () => renderPhase(Math.min(phases.length - 1, currentPhase + 1)));

const dependencyInfo = {
  pedido: ["pedido_id es la clave", "Determina la fecha y el cliente del pedido: pedido_id → fecha, cliente_id."],
  fecha: ["fecha depende de pedido_id", "Con el identificador de pedido conocemos su fecha. Es una dependencia directa y correcta."],
  cliente: ["cliente_id depende de pedido_id", "Cada pedido pertenece a un cliente: pedido_id → cliente_id."],
  nombre: ["Dependencia transitiva detectada", "<span class='dependency-chain'>pedido_id → cliente_id → cliente_nombre</span>. El nombre no depende directamente de la clave del pedido; debe vivir en Clientes."],
  ciudad: ["Dependencia transitiva detectada", "<span class='dependency-chain'>pedido_id → cliente_id → cliente_ciudad</span>. La ciudad describe al cliente, no al pedido; separarla nos lleva a 3FN."]
};

document.querySelectorAll(".attribute").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".attribute").forEach(item => item.classList.toggle("active", item === button));
    const [title, text] = dependencyInfo[button.dataset.attribute];
    document.querySelector("#dependencyExplanation").innerHTML = `<span>${title}</span><p>${text}</p>`;
  });
});

const questions = [
  { tag: "OBSERVA LA CELDA", title: "La columna teléfonos contiene «0414…, 0424…». ¿Qué forma normal incumple?", text: "Cada estudiante puede tener varios teléfonos escritos como una lista.", answers: [["1FN", true], ["2FN", false], ["3FN", false], ["Ninguna", false]], explanation: "1FN exige que cada celda contenga un valor atómico." },
  { tag: "REVISA LA CLAVE", title: "La clave es (estudiante_id, materia_id). nombre_materia depende solo de materia_id. ¿Qué problema existe?", text: "El atributo no necesita la clave compuesta completa para ser determinado.", answers: [["Grupo repetido", false], ["Dependencia parcial", true], ["Dependencia transitiva", false], ["No hay problema", false]], explanation: "Es una dependencia parcial; separar Materias permite alcanzar 2FN." },
  { tag: "SIGUE LA FLECHA", title: "inscripción_id → estudiante_id → carrera_nombre. ¿Qué debes separar?", text: "carrera_nombre es determinado por estudiante_id, que no es la clave de Inscripciones.", answers: [["Una tabla Carreras", true], ["Una columna de lista", false], ["La clave primaria", false], ["Nada", false]], explanation: "La cadena muestra una dependencia transitiva. Carrera debe tener su propia tabla." },
  { tag: "DECISIÓN FINAL", title: "Una tabla cumple 1FN y su clave primaria tiene una sola columna. ¿Puede tener dependencias parciales?", text: "Recuerda que una dependencia parcial usa solo una parte de una clave compuesta.", answers: [["Sí, siempre", false], ["No", true], ["Solo con texto", false], ["Solo si hay FK", false]], explanation: "No. Una clave de una sola columna no puede dividirse en partes; por eso, estando en 1FN, cumple automáticamente 2FN." }
];

let questionIndex = 0;
let score = 0;
let answerLocked = false;
const challengeBody = document.querySelector("#challengeBody");

function renderQuestion() {
  answerLocked = false;
  const q = questions[questionIndex];
  document.querySelector("#questionCount").textContent = `Pregunta ${questionIndex + 1} de ${questions.length}`;
  document.querySelector("#challengeProgress").style.width = `${((questionIndex + 1) / questions.length) * 100}%`;
  document.querySelector("#scoreLabel").textContent = `${score} puntos`;
  challengeBody.innerHTML = `<span class="case-tag">${q.tag}</span><h3>${q.title}</h3><p>${q.text}</p><div class="answer-grid">${q.answers.map(([label, correct]) => `<button class="answer-option" type="button" data-correct="${correct}">${label}</button>`).join("")}</div><div class="answer-feedback" aria-live="assertive"></div>`;
  challengeBody.querySelectorAll(".answer-option").forEach(button => button.addEventListener("click", answerQuestion));
}

function answerQuestion(event) {
  if (answerLocked) return;
  const button = event.currentTarget;
  const correct = button.dataset.correct === "true";
  const feedback = challengeBody.querySelector(".answer-feedback");
  if (!correct) {
    button.classList.add("wrong");
    feedback.className = "answer-feedback error";
    feedback.textContent = "No exactamente. Revisa la pista y prueba otra opción.";
    return;
  }
  answerLocked = true;
  score += 25;
  button.classList.add("correct");
  challengeBody.querySelectorAll(".answer-option").forEach(option => option.disabled = true);
  feedback.className = "answer-feedback success";
  feedback.innerHTML = `✓ ${questions[questionIndex].explanation} <button class="continue-button" type="button">${questionIndex === questions.length - 1 ? "Ver resultado" : "Siguiente →"}</button>`;
  feedback.querySelector("button").addEventListener("click", nextQuestion);
  document.querySelector("#scoreLabel").textContent = `${score} puntos`;
}

function nextQuestion() {
  questionIndex += 1;
  if (questionIndex < questions.length) return renderQuestion();
  challengeBody.innerHTML = `<div class="result-badge">${score}</div><h3>¡Diagnóstico completado!</h3><p>Ya puedes reconocer valores no atómicos, dependencias parciales y dependencias transitivas. Ese es el corazón de las tres primeras formas normales.</p><div class="result-actions"><button class="solid" id="restartChallenge" type="button">Intentar de nuevo</button><a href="#taller">Repasar el taller</a></div>`;
  document.querySelector("#questionCount").textContent = "Reto completado";
  document.querySelector("#challengeProgress").style.width = "100%";
  document.querySelector("#restartChallenge").addEventListener("click", () => { questionIndex = 0; score = 0; renderQuestion(); });
}

const navLinks = [...document.querySelectorAll(".nav-link")];
const sectionObserver = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${visible.target.dataset.section}`));
}, { rootMargin: "-25% 0px -60%", threshold: [0, .25, .5] });
document.querySelectorAll("[data-section]").forEach(section => sectionObserver.observe(section));

renderAnomaly("update");
renderPhase(0);
renderQuestion();
