const app = document.getElementById("app");
const tg = window.Telegram?.WebApp;

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

/* ---------- HOME ---------- */
function renderHome() {
  showMainButton();

  app.innerHTML = `
    <h1>🎪 Цирк Никулина</h1>

    <div class="cards-grid">
      <div class="image-card" onclick="openArtists()">Артисты</div>
      <div class="image-card" onclick="openSchedule('december_2025')">Расписание</div>
      <div class="image-card" onclick="openAboutRoot()">О цирке</div>
      <div class="image-card" onclick="openRoute()">Как добраться</div>
      <div class="image-card" onclick="openRules()">Правила</div>
      <div class="image-card" onclick="openContacts()">Контакты</div>
    </div>
  `;
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
        <div class="card clickable"
          onclick="openIndexOrPage('${s.path}', '${path}')">
          ${s.title}
        </div>
      `).join("")}
    </div>
  `;
}

async function openIndexOrPage(path, parentPath) {
  const res = await fetch("/" + path);
  const data = await res.json();

  // если есть sections — это index
  if (data.sections) {
    openIndex(path, `openIndex('${parentPath}', 'renderHome()')`);
    return;
  }

  // иначе это конечная страница
  app.innerHTML = `
    ${backButton(`openIndex('${parentPath}', 'renderHome()')`)}
    <h1>${data.title}</h1>
    <div class="card text">
      ${data.text.replace(/\n/g, "<br><br>")}
    </div>
  `;
}

/* ---------- ABOUT ROOT ---------- */
function openAboutRoot() {
  openIndex("data/about2/index.json", "renderHome()");
}

/* ---------- ARTISTS ---------- */
function openArtists() {
  hideMainButton();
  app.innerHTML = `
    ${backButton("renderHome()")}
    <h1>🤹 Артисты</h1>
    <div class="card">Скоро будет</div>
  `;
}

/* ---------- SCHEDULE ---------- */
async function openSchedule(monthKey) {
  hideMainButton();

  const res = await fetch("/data/schedule.json");
  const data = await res.json();
  const month = data[monthKey];

  app.innerHTML = `
    ${backButton("renderHome()")}
    <h1>${month.title}</h1>

    <div class="grid">
      ${month.days.map(day => `
        <div class="card">
          <b>${day.day} · ${day.weekday}</b><br>
          ${
            day.slots === "OFF"
              ? "Выходной"
              : day.slots.map(slot =>
                  slot.status === "available"
                    ? `<button onclick="tg.openLink('${slot.url}')">${slot.time}</button>`
                    : `<div>${slot.time} · нет билетов</div>`
                ).join("")
          }
        </div>
      `).join("")}
    </div>
  `;
}

/* ---------- ROUTE ---------- */
async function openRoute() {
  hideMainButton();
  const res = await fetch("/data/route.json");
  const data = await res.json();

  app.innerHTML = `
    ${backButton("renderHome()")}
    <h1>${data.title}</h1>
    <div class="card">${data.text.replace(/\n/g, "<br><br>")}</div>
  `;
}

/* ---------- RULES ---------- */
async function openRules() {
  hideMainButton();
  const res = await fetch("/data/rules.json");
  const data = await res.json();

  app.innerHTML = `
    ${backButton("renderHome()")}
    <h1>${data.title}</h1>
    <ul class="card">
      ${data.items.map(i => `<li>${i}</li>`).join("")}
    </ul>
  `;
}

/* ---------- CONTACTS ---------- */
async function openContacts() {
  hideMainButton();
  const res = await fetch("/data/contacts.json");
  const c = await res.json();

  app.innerHTML = `
    ${backButton("renderHome()")}
    <h1>Контакты</h1>
    <div class="card">
      📍 ${c.address}<br><br>
      ☎ ${c.phone}<br>
      🏢 ${c.adminPhone}<br><br>
      <a href="${c.telegram}" target="_blank">Telegram</a><br>
      <a href="${c.vk}" target="_blank">VK</a>
    </div>
  `;
}

/* ---------- INIT ---------- */
renderHome();