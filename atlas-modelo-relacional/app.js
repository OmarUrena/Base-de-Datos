const concepts = {
  entity: { icon: "▭", label: "ENTIDAD", title: "Algo distinguible que queremos registrar", text: "Puede ser una persona, objeto, lugar, evento o concepto. Cada ocurrencia individual es una instancia de esa entidad.", example: "Libro", detail: "“Libro” es el tipo de entidad; “Pedro Páramo, L-001” es una instancia concreta." },
  attribute: { icon: "◯", label: "ATRIBUTO", title: "Una característica de la entidad", text: "Describe una propiedad relevante. Debe tener un nombre, un significado y un dominio de valores permitidos.", example: "título, año_publicación, estado", detail: "Cada atributo se convertirá normalmente en una columna de la tabla." },
  relationship: { icon: "◇", label: "RELACIÓN", title: "Una asociación entre entidades", text: "Expresa cómo participan dos o más entidades en el dominio. Se suele nombrar con un verbo que haga legible la regla.", example: "Socio realiza Préstamo", detail: "La relación preserva un hecho del mundo real: qué socio realizó cada préstamo." },
  cardinality: { icon: "1:N", label: "CARDINALIDAD", title: "La cantidad de instancias que pueden asociarse", text: "Indica los límites de participación: uno a uno, uno a muchos o muchos a muchos. También puede señalar si participar es opcional u obligatorio.", example: "Un Socio realiza muchos Préstamos", detail: "SOCIO 1 ─── N PRÉSTAMO: cada préstamo pertenece a un solo socio." }
};

const conceptStage = document.querySelector("#conceptStage");
function renderConcept(name) {
  const c = concepts[name];
  conceptStage.innerHTML = `<div class="concept-icon">${c.icon}</div><h3>${c.title}</h3><p>${c.text}</p><div class="concept-example"><small>${c.label} EN EL CASO</small><b>${c.example}</b><span>${c.detail}</span></div>`;
}
document.querySelectorAll(".concept-tab").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".concept-tab").forEach(tab => { const active = tab === button; tab.classList.toggle("active",active); tab.setAttribute("aria-selected",String(active)); });
  renderConcept(button.dataset.concept);
}));

const anatomyContent = {
  relation: ["Relación:", "el conjunto completo de datos sobre libros. En una implementación SQL se representa como una tabla."],
  attribute: ["Atributo:", "una propiedad con nombre. La columna título describe el título de cada libro."],
  tuple: ["Tupla:", "una combinación de valores que describe una instancia. La fila resaltada representa el libro L-002."],
  domain: ["Dominio:", "el conjunto de valores válidos. estado podría aceptar únicamente Disponible, Prestado o Reserva."]
};
const relTable = document.querySelector("#relTable");
document.querySelectorAll(".anatomy-button").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll(".anatomy-button").forEach(item => item.classList.toggle("active",item === button));
  relTable.className = `rel-table highlight-${button.dataset.part}`;
  const [term,description] = anatomyContent[button.dataset.part];
  document.querySelector("#anatomyCaption").innerHTML = `<b>${term}</b> ${description}`;
}));

const cardinalities = {
  one: { eyebrow: "UNO A UNO · 1:1", title: "Una persona, un pasaporte", text: "Cada pasaporte pertenece a una sola persona y cada persona tiene, como máximo, un pasaporte vigente.", rule: "Implementación: una FK con restricción UNIQUE en una de las tablas, elegida según la opcionalidad.", diagram: `<div class="relation-diagram"><div class="diagram-entity"><small>ENTIDAD</small><b>PERSONA</b></div><div class="diagram-link"><b>1</b><span></span><i>1</i></div><div class="diagram-entity"><small>ENTIDAD</small><b>PASAPORTE</b></div></div>` },
  many: { eyebrow: "UNO A MUCHOS · 1:N", title: "Un socio, muchos préstamos", text: "Un socio puede realizar varios préstamos; cada préstamo corresponde a un único socio.", rule: "Implementación: socio_id viaja como FK a PRÉSTAMOS, la tabla del lado muchos.", diagram: `<div class="relation-diagram"><div class="diagram-entity"><small>ENTIDAD</small><b>SOCIO</b></div><div class="diagram-link"><b>1</b><span></span><i>N</i></div><div class="diagram-entity"><small>ENTIDAD</small><b>PRÉSTAMO</b></div></div>` },
  bridge: { eyebrow: "MUCHOS A MUCHOS · N:M", title: "Autores y libros", text: "Un autor puede escribir varios libros y un libro puede tener varios autores.", rule: "Implementación: se crea AUTOR_LIBRO con autor_id y libro_id como claves foráneas y, normalmente, clave primaria compuesta.", diagram: `<div class="relation-diagram bridge-diagram"><div class="diagram-entity"><small>ENTIDAD</small><b>AUTOR</b></div><div class="diagram-link"><b>N</b><span></span><i>1</i></div><div class="diagram-entity bridge-node"><small>TABLA PUENTE</small><b>AUTOR_LIBRO</b></div><div class="diagram-link"><b>1</b><span></span><i>M</i></div><div class="diagram-entity"><small>ENTIDAD</small><b>LIBRO</b></div><p class="bridge-caption">La relación N:M se resuelve como dos relaciones 1:N.</p></div>` }
};
const cardinalityStage = document.querySelector("#cardinalityStage");
function renderCardinality(name) { const c = cardinalities[name]; cardinalityStage.innerHTML = `<div class="cardinality-copy"><span>${c.eyebrow}</span><h3>${c.title}</h3><p>${c.text}</p><div class="placement-rule"><b>Al pasar a tablas:</b> ${c.rule}</div></div>${c.diagram}`; }
document.querySelectorAll(".cardinality-tab").forEach(button => button.addEventListener("click", () => { document.querySelectorAll(".cardinality-tab").forEach(tab => tab.classList.toggle("active",tab === button)); renderCardinality(button.dataset.cardinality); }));

const builderQuestions = [
  { tag: "ENTIDADES", title: "¿Cuáles son las entidades principales?", hint: "Busca sustantivos con identidad propia sobre los que guardaremos varios datos.", answers: [["Mascota, Veterinario y Consulta",true],["Nombre, fecha y especie",false],["Atiende y corresponde",false]], feedback: "Correcto: son objetos o eventos distinguibles del dominio.", unlock: "entities" },
  { tag: "ATRIBUTOS", title: "¿Qué opción contiene únicamente atributos de Mascota?", hint: "Los atributos describen a la entidad; no representan otra entidad completa.", answers: [["mascota_id, nombre, especie",true],["veterinario, consulta, atiende",false],["fecha, diagnóstico, veterinario_id",false]], feedback: "Exacto: identificador, nombre y especie describen a Mascota.", unlock: "attributes" },
  { tag: "RELACIÓN", title: "¿Cómo se relacionan Veterinario y Consulta?", hint: "Pregunta cuántas consultas puede atender un veterinario y cuántos veterinarios tiene cada consulta.", answers: [["1:N — atiende",true],["1:1 — posee",false],["N:M — incluye",false]], feedback: "Bien: un veterinario atiende muchas consultas; cada consulta registra uno.", unlock: "relation" },
  { tag: "CARDINALIDAD", title: "¿Cómo se relacionan Mascota y Consulta?", hint: "Una mascota puede volver varias veces a la clínica.", answers: [["1:N",true],["1:1",false],["N:M",false]], feedback: "Correcto: una mascota puede tener muchas consultas; cada consulta corresponde a una mascota.", unlock: "cardinality" },
  { tag: "TRADUCCIÓN", title: "¿Dónde deben quedar las claves foráneas?", hint: "En una relación 1:N, la clave del lado uno viaja al lado muchos.", answers: [["veterinario_id y mascota_id en CONSULTAS",true],["consulta_id en MASCOTAS y VETERINARIOS",false],["Todas las claves en una tabla nueva",false]], feedback: "Modelo completado: CONSULTAS es el lado muchos y referencia a ambas entidades.", unlock: "keys" }
];
let builderIndex = 0, builderScore = 0, builderLocked = false;
const unlocked = new Set();
const builderQuestion = document.querySelector("#builderQuestion");
function renderBuilderQuestion() {
  builderLocked = false; const q = builderQuestions[builderIndex];
  document.querySelector("#builderStep").textContent = `${builderIndex+1} de ${builderQuestions.length}`;
  document.querySelector("#builderProgress").style.width = `${((builderIndex+1)/builderQuestions.length)*100}%`;
  document.querySelector("#builderScore").textContent = `${builderScore} / 5`;
  builderQuestion.innerHTML = `<span class="question-tag">${q.tag}</span><h3>${q.title}</h3><p>${q.hint}</p><div class="builder-answers">${q.answers.map(([text,correct]) => `<button class="builder-answer" type="button" data-correct="${correct}">${text}</button>`).join("")}</div><div class="builder-feedback" aria-live="assertive"></div>`;
  builderQuestion.querySelectorAll(".builder-answer").forEach(button => button.addEventListener("click",answerBuilder));
}
function answerBuilder(event) {
  if(builderLocked) return; const button=event.currentTarget; const feedback=builderQuestion.querySelector(".builder-feedback");
  if(button.dataset.correct!=="true") { button.classList.add("wrong"); feedback.className="builder-feedback"; feedback.textContent="Esa opción mezcla conceptos. Revisa la pista y prueba otra vez."; return; }
  builderLocked=true; builderScore++; unlocked.add(builderQuestions[builderIndex].unlock); button.classList.add("correct");
  builderQuestion.querySelectorAll(".builder-answer").forEach(item=>item.disabled=true); renderPreview();
  feedback.className="builder-feedback success"; feedback.innerHTML=`✓ ${builderQuestions[builderIndex].feedback} <button class="next-question" type="button">${builderIndex===builderQuestions.length-1?"Ver modelo":"Continuar →"}</button>`;
  feedback.querySelector("button").addEventListener("click",nextBuilder); document.querySelector("#builderScore").textContent=`${builderScore} / 5`;
}
function renderPreview() {
  if (!unlocked.has("entities")) return;
  const mascota=`<div class="preview-table"><h4>MASCOTAS</h4>${unlocked.has("attributes")?'<span class="pk">mascota_id [PK]</span><span>nombre</span><span>especie</span>':'<span>atributos…</span>'}</div>`;
  const consulta=`<div class="preview-table"><h4>CONSULTAS</h4><span class="pk">consulta_id [PK]</span>${unlocked.has("keys")?'<span class="fk">mascota_id [FK]</span><span class="fk">veterinario_id [FK]</span>':''}<span>fecha</span><span>diagnóstico</span></div>`;
  const veterinario=`<div class="preview-table"><h4>VETERINARIOS</h4><span class="pk">veterinario_id [PK]</span><span>nombre</span></div>`;
  const mascotaLink=unlocked.has("cardinality")?'<span class="preview-link">1 ─ N</span>':'<span class="preview-link">· · ·</span>';
  const veterinarioLink=unlocked.has("relation")?'<span class="preview-link">N ─ 1</span>':'<span class="preview-link">· · ·</span>';
  document.querySelector("#previewCanvas").innerHTML=`${mascota}${mascotaLink}${consulta}${veterinarioLink}${veterinario}`;
  document.querySelector("#previewStatus").textContent=`${unlocked.size} elementos`;
}
function nextBuilder() { builderIndex++; if(builderIndex<builderQuestions.length) return renderBuilderQuestion(); builderQuestion.innerHTML=`<div class="completion-copy"><span>✓</span><h3>¡Modelo completado!</h3><p>Identificaste tres entidades, sus atributos, dos relaciones 1:N y la ubicación correcta de las claves foráneas.</p><button class="restart-button" type="button">Construir de nuevo</button></div>`; document.querySelector(".restart-button").addEventListener("click",()=>{builderIndex=0;builderScore=0;unlocked.clear();document.querySelector("#previewCanvas").innerHTML="<p>Responde para construir el modelo.</p>";document.querySelector("#previewStatus").textContent="0 elementos";renderBuilderQuestion();}); }

const navLinks=[...document.querySelectorAll(".nav-link")];
const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;navLinks.forEach(link=>link.classList.toggle("active",link.getAttribute("href")===`#${visible.target.dataset.section}`));},{rootMargin:"-25% 0px -60%",threshold:[0,.25,.5]});
document.querySelectorAll("[data-section]").forEach(section=>observer.observe(section));

renderConcept("entity"); renderCardinality("many"); renderBuilderQuestion();
