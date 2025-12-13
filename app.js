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
    <div class="cards-grid">

      <div class="image-card"
        style="background-image:url('assets/cards/artistscard.png')"
        onclick="openArtists()">
      </div>

      <div class="image-card"
        style="background-image:url('assets/cards/schedulecard.png')"
        onclick="openSchedule('december_2025')">
      </div>

      <div class="image-card"
        style="background-image:url('assets/cards/aboutcard.png')"
        onclick="openAboutRoot()">
      </div>

      <div class="image-card"
        style="background-image:url('assets/cards/routecard.png')"
        onclick="openRoute()">
      </div>

      <div class="image-card"
        style="background-image:url('assets/cards/rulescard.png')"
        onclick="openRules()">
      </div>

      <div class="image-card"
        style="background-image:url('assets/cards/contactscard.png')"
        onclick="openContacts()">
      </div>

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
async function openArtists() {
  hideMainButton();

  const res = await fetch("/data/artists.json");
  const artists = await res.json();

  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>🤹 Артисты</h1>

    <div class="list">
      ${artists.map(a => `
        <div class="artist-card">
          <div class="artist-title">${a.title}</div>
          <div class="artist-lead">${a.lead}</div>
        </div>
      `).join("")}
    </div>
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