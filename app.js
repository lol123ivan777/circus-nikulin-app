const app = document.getElementById("app");
const tg = window.Telegram?.WebApp;
const curtain = document.getElementById("curtain");

let scheduleData = null;

/* ---------- TELEGRAM INIT ---------- */
if (tg) {
  tg.ready();
  tg.expand();

  tg.MainButton.setText("🎟 Купить билеты");
  tg.MainButton.onClick(() => {
    tg.openLink("https://circusnikulin.ru/tickets");
  });
  tg.MainButton.show();
}

/* ---------- CURTAIN TRANSITION ---------- */

function transition(type, renderFn) {
  curtain.className = "";
  curtain.style.pointerEvents = "auto";

  // 1. МЕНЯЕМ КОНТЕНТ СРАЗУ
  renderFn();

  // 2. В СЛЕДУЮЩЕМ КАДРЕ — ЗАКРЫВАЕМ ШТОРУ
  requestAnimationFrame(() => {
    curtain.classList.add(type + "-close");
  });

  // 3. ПОТОМ ОТКРЫВАЕМ
  setTimeout(() => {
    curtain.className = "";
    curtain.classList.add(type + "-open");

    setTimeout(() => {
      curtain.className = "";
      curtain.style.pointerEvents = "none";
    }, 950);

  }, 950);
}

function goForward(fn) {
  transition("curtain-left", fn);
}

function goBack(fn) {
  transition("curtain-right", fn);
}

function goUp(fn) {
  transition("curtain-up", fn);
}

/* ---------- HELPERS ---------- */
function showMainButton() {
  tg?.MainButton.show();
}
function hideMainButton() {
  tg?.MainButton.hide();
}

function backButton(action) {
  return `<div class="back" onclick="${action}">← Назад</div>`;
}
function backBottom(action) {
  return `<div class="back back-bottom" onclick="${action}">← Назад</div>`;
}

/* ---------- HOME ---------- */
function renderHome() {
  showMainButton();

  app.innerHTML = `
    <div class="cards-grid">
      <div class="image-card" style="background-image:url('assets/cards/artistscard.png')" onclick="goForward(openArtists)"></div>
      <div class="image-card" style="background-image:url('assets/cards/schedulecard.png')" onclick="goForward(openScheduleRoot)"></div>
      <div class="image-card" style="background-image:url('assets/cards/aboutcard.png')" onclick="goForward(openAboutRoot)"></div>
      <div class="image-card" style="background-image:url('assets/cards/routecard.png')" onclick="goForward(openRoute)"></div>
      <div class="image-card" style="background-image:url('assets/cards/rulescard.png')" onclick="goForward(openRules)"></div>
      <div class="image-card" style="background-image:url('assets/cards/contactscard.png')" onclick="goForward(openContacts)"></div>
    </div>
  `;
}

/* ---------- ABOUT ---------- */
function openAboutRoot() {
  openIndex("data/about2/index.json", "goBack(renderHome)");
}

/* ---------- GENERIC JSON NAV ---------- */
async function openIndex(path, backAction) {
  hideMainButton();
  const res = await fetch("/" + path);
  const data = await res.json();

  app.innerHTML = `
    ${backButton(backAction)}
    <h1>${data.title}</h1>
    <div class="list">
      ${data.sections.map(s => `
        <div class="card clickable" onclick="goForward(() => openIndexOrPage('${s.path}', '${path}'))">
          ${s.title}
        </div>
      `).join("")}
    </div>
    ${backBottom(backAction)}
  `;
}

async function openIndexOrPage(path, parentPath) {
  const res = await fetch("/" + path);
  const data = await res.json();

  if (data.sections) {
  openIndex(path, `goBack(() => openIndex('${parentPath}', 'goBack(renderHome)'))`);
  return;
}

  app.innerHTML = `
    ${backButton(`goBack(() => openIndex('${parentPath}', 'goBack(renderHome)'))`)}
    <h1>${data.title}</h1>
    <div class="card text">
      ${data.text.replace(/\n/g, "<br><br>")}
    </div>
    ${backBottom(`goBack(() => openIndex('${parentPath}', 'goBack(renderHome)'))`)}
  `;
}

/* ---------- ARTISTS ---------- */
async function openArtists() {
  hideMainButton();
  const res = await fetch("/data/artists.json");
  const artists = await res.json();

  app.innerHTML = `
    ${backButton("goBack(renderHome)")}
    <h1>🤹 Артисты</h1>
    <div class="list">
      ${artists.map(a => `
        <div class="artist-card">
          <div class="artist-title">${a.title}</div>
          <div class="artist-lead">${a.lead}</div>
        </div>
      `).join("")}
    </div>
    ${backBottom("goBack(renderHome)")}
  `;
}

/* ---------- SCHEDULE ---------- */
async function openScheduleRoot() {
  hideMainButton();
  if (!scheduleData) {
    const res = await fetch("/data/schedule.json");
    scheduleData = await res.json();
  }

  app.innerHTML = `
    ${backButton("goBack(renderHome)")}
    <h1>📅 Расписание</h1>
    <div class="list">
      ${Object.entries(scheduleData).map(([key, month]) => `
        <div class="card clickable" onclick="goForward(() => openScheduleMonth('${key}'))">
          ${month.title}
        </div>
      `).join("")}
    </div>
    ${backBottom("goBack(renderHome)")}
  `;
}

function openScheduleMonth(key) {
  const month = scheduleData[key];

  app.innerHTML = `
    ${backButton("goBack(openScheduleRoot)")}
    <h1>${month.title}</h1>
    <div class="grid">
      ${month.days.map(day => `
        <div class="card">
          <div class="day-title">${day.day} · ${day.weekday}</div>
          ${
            day.slots === "OFF"
              ? `<div class="soldout">Выходной</div>`
              : day.slots.map(s =>
                  s.status === "soldout"
                    ? `<div class="soldout">${s.time} · нет билетов</div>`
                    : `<a href="${s.url}" target="_blank"><button class="time-btn">${s.time}</button></a>`
                ).join("")
          }
        </div>
      `).join("")}
    </div>
    ${backBottom("goBack(openScheduleRoot)")}
  `;
}

/* ---------- ROUTE / RULES / CONTACTS ---------- */
async function openRoute() {
  hideMainButton();
  const d = await (await fetch("/data/route.json")).json();
  app.innerHTML = `${backButton("goBack(renderHome)")}<h1>${d.title}</h1><div class="card">${d.text}</div>${backBottom("goBack(renderHome)")}`;
}

async function openRules() {
  hideMainButton();
  const d = await (await fetch("/data/rules.json")).json();
  app.innerHTML = `${backButton("goBack(renderHome)")}<h1>${d.title}</h1><ul class="card">${d.items.map(i => `<li>${i}</li>`).join("")}</ul>${backBottom("goBack(renderHome)")}`;
}

async function openContacts() {
  hideMainButton();

  const res = await fetch("/data/contacts.json");
  const data = await res.json();

  app.innerHTML = `
    ${backButton("goBack(renderHome)")}
    <h1>📍 ${data.title}</h1>

    <div class="contacts-list">
      ${data.sections.map(section => `
        <div class="contact-block">
          <div class="contact-title">${section.title}</div>
          <div class="contact-text">
            ${section.items.map(item => {
              if (item.type === "text") {
                return `<div>${item.value}</div>`;
              }
              if (item.type === "phone") {
                return `
                  <div>
                    <span class="contact-label">${item.label}:</span>
                    <a class="contact-link" href="tel:${item.value}">${item.value}</a>
                  </div>
                `;
              }
              if (item.type === "link") {
                return `
                  <div>
                    <a class="contact-link" href="${item.url}" target="_blank">${item.label}</a>
                  </div>
                `;
              }
              if (item.type === "email") {
                return `
                  <div>
                    <span class="contact-label">${item.label}:</span>
                    <a class="contact-link" href="mailto:${item.value}">${item.value}</a>
                  </div>
                `;
              }
              return "";
            }).join("")}
          </div>
        </div>
      `).join("")}
    </div>

    ${backBottom("goBack(renderHome)")}
  `;
}

/* ---------- INIT ---------- */
goUp(renderHome);