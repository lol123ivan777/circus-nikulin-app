// -------------------- INIT --------------------
const app = document.getElementById("app");
const curtain = document.getElementById("curtain");
const tg = window.Telegram?.WebApp;

let scheduleData = null;
const historyStack = [];

// -------------------- TELEGRAM --------------------
if (tg) {
  tg.ready();
  tg.expand();

  tg.MainButton.setText("🎟 Купить билеты");
  tg.MainButton.onClick(() => {
    tg.openLink("https://circusnikulin.ru/tickets");
  });
}

// -------------------- CURTAIN --------------------
function transition(type, renderFn) {
  curtain.className = "";
  curtain.style.pointerEvents = "auto";

  // контент меняем СРАЗУ
  renderFn();

  requestAnimationFrame(() => {
    curtain.classList.add(type + "-close");
  });

  setTimeout(() => {
    curtain.className = "";
    curtain.classList.add(type + "-open");

    setTimeout(() => {
      curtain.className = "";
      curtain.style.pointerEvents = "none";
    }, 950);

  }, 950);
}

function goForward(renderFn) {
  transition("curtain-left", renderFn);
}

function goBack() {
  if (historyStack.length > 1) {
    historyStack.pop();
    transition("curtain-right", historyStack[historyStack.length - 1]);
  }
}

function goUp(renderFn) {
  transition("curtain-up", renderFn);
}

// -------------------- NAV HELPERS --------------------
function push(renderFn) {
  historyStack.push(renderFn);
  renderFn();
}

function backButton() {
  return `<div class="back" onclick="goBack()">← Назад</div>`;
}

function backBottom() {
  return `<div class="back back-bottom" onclick="goBack()">← Назад</div>`;
}

// -------------------- HOME --------------------
function renderHome() {
  tg?.MainButton.show();

  app.innerHTML = `
    <div class="cards-grid">
      <div class="image-card" style="background-image:url('assets/cards/artistscard.png')" onclick="goForward(() => push(openArtists))"></div>
      <div class="image-card" style="background-image:url('assets/cards/schedulecard.png')" onclick="goForward(() => push(openScheduleRoot))"></div>
      <div class="image-card" style="background-image:url('assets/cards/aboutcard.png')" onclick="goForward(() => push(openAbout))"></div>
      <div class="image-card" style="background-image:url('assets/cards/routecard.png')" onclick="goForward(() => push(openRoute))"></div>
      <div class="image-card" style="background-image:url('assets/cards/rulescard.png')" onclick="goForward(() => push(openRules))"></div>
      <div class="image-card" style="background-image:url('assets/cards/contactscard.png')" onclick="goForward(() => push(openContacts))"></div>
    </div>
  `;
}

// -------------------- ABOUT --------------------
async function openAbout() {
  tg?.MainButton.hide();
  const d = await fetch("/data/about.json").then(r => r.json());

  app.innerHTML = `
    ${backButton()}
    <h1>${d.title}</h1>
    <div class="card text">${d.text.replace(/\n/g, "<br><br>")}</div>
    ${backBottom()}
  `;
}

// -------------------- ARTISTS --------------------
async function openArtists() {
  tg?.MainButton.hide();
  const artists = await fetch("/data/artists.json").then(r => r.json());

  app.innerHTML = `
    ${backButton()}
    <h1>Артисты</h1>
    <div class="list">
      ${artists.map(a => `
        <div class="artist-card">
          <div class="artist-title">${a.title}</div>
          <div class="artist-lead">${a.lead}</div>
        </div>
      `).join("")}
    </div>
    ${backBottom()}
  `;
}

// -------------------- SCHEDULE --------------------
async function openScheduleRoot() {
  tg?.MainButton.hide();

  if (!scheduleData) {
    scheduleData = await fetch("/data/schedule.json").then(r => r.json());
  }

  app.innerHTML = `
    ${backButton()}
    <h1>Расписание</h1>
    <div class="list">
      ${Object.entries(scheduleData).map(([key, m]) => `
        <div class="card clickable" onclick="goForward(() => push(() => openScheduleMonth('${key}')))">
          ${m.title}
        </div>
      `).join("")}
    </div>
    ${backBottom()}
  `;
}

function openScheduleMonth(key) {
  const m = scheduleData[key];

  app.innerHTML = `
    ${backButton()}
    <h1>${m.title}</h1>
    <div class="grid">
      ${m.days.map(d => `
        <div class="card">
          <div class="day-title">${d.day} · ${d.weekday}</div>
          ${
            d.slots === "OFF"
              ? `<div class="soldout">Выходной</div>`
              : d.slots.map(s =>
                  s.status === "soldout"
                    ? `<div class="soldout">${s.time} · нет билетов</div>`
                    : `<a href="${s.url}" target="_blank"><button class="time-btn">${s.time}</button></a>`
                ).join("")
          }
        </div>
      `).join("")}
    </div>
    ${backBottom()}
  `;
}

// -------------------- ROUTE --------------------
async function openRoute() {
  tg?.MainButton.hide();
  const d = await fetch("/data/route.json").then(r => r.json());

  app.innerHTML = `
    ${backButton()}
    <h1>${d.title}</h1>
    <div class="card text">${d.text}</div>
    ${backBottom()}
  `;
}

// -------------------- RULES --------------------
async function openRules() {
  tg?.MainButton.hide();
  const d = await fetch("/data/rules.json").then(r => r.json());

  app.innerHTML = `
    ${backButton()}
    <h1>${d.title}</h1>
    <ul class="card text">
      ${d.items.map(i => `<li>${i}</li>`).join("")}
    </ul>
    ${backBottom()}
  `;
}

// -------------------- CONTACTS --------------------
async function openContacts() {
  tg?.MainButton.hide();
  const data = await fetch("/data/contacts.json").then(r => r.json());

  app.innerHTML = `
    ${backButton()}
    <h1>${data.title}</h1>
    <div class="contacts-list">
      ${data.sections.map(s => `
        <div class="contact-block">
          <div class="contact-title">${s.title}</div>
          <div class="contact-text">
            ${s.items.map(i => {
              if (i.type === "text") return `<div>${i.value}</div>`;
              if (i.type === "phone") return `<div><a class="contact-link" href="tel:${i.value}">${i.value}</a></div>`;
              if (i.type === "email") return `<div><a class="contact-link" href="mailto:${i.value}">${i.value}</a></div>`;
              if (i.type === "link") return `<div><a class="contact-link" href="${i.url}" target="_blank">${i.label}</a></div>`;
            }).join("")}
          </div>
        </div>
      `).join("")}
    </div>
    ${backBottom()}
  `;
}

// -------------------- START --------------------
goUp(() => push(renderHome));