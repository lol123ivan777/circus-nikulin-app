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
  if (tg) tg.MainButton.show();
}

function hideMainButton() {
  if (tg) tg.MainButton.hide();
}

function openLink(url) {
  if (tg) {
    tg.openLink(url);
  } else {
    window.open(url, "_blank");
  }
}

/* ---------- HOME ---------- 

function renderHome() {
  showMainButton();

  app.innerHTML = `
    <h1>🎪 Цирк Никулина</h1>

    <div class="menu">

      <div
        class="card-image"
        style="background-image: url('assets/cards/artistscard.png')"
        onclick="openArtists()"
      ></div>

      <button onclick="openSchedule('december_2025')">📅 Расписание</button>
      <button onclick="openAbout()">🎪 О цирке</button>
      <button onclick="openRoute()">🗺 Как добраться</button>
      <button onclick="openRules()">📜 Правила посещения</button>
      <button onclick="openContacts()">📍 Контакты</button>

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
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>📅 ${month.title}</h1>

    <div class="menu">
      <button onclick="openSchedule('december_2025')">Декабрь 2025</button>
      <button onclick="openSchedule('january_2026')">Январь 2026</button>
    </div>

    <div class="grid">
      ${month.days.map(day => `
        <div class="card">
          <div class="day-title">${day.day} · ${day.weekday}</div>

          ${
            day.slots === "OFF"
              ? `<div class="soldout">Выходной</div>`
              : `
                <div class="times">
                  ${day.slots.map(slot =>
                    slot.status === "available"
                      ? `<button class="time-btn" onclick="openLink('${slot.url}')">${slot.time}</button>`
                      : `<div class="soldout">${slot.time} · билетов нет</div>`
                  ).join("")}
                </div>
              `
          }
        </div>
      `).join("")}
    </div>
  `;
}

/* ---------- ARTISTS ---------- */
function openArtists() {
  hideMainButton();

  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>🤹 Артисты</h1>
    <div class="card">Жанры и список подключим следующим шагом</div>
  `;
}

/* ---------- CONTACTS ---------- */
async function openContacts() {
  hideMainButton();

  const res = await fetch("/data/contacts.json");
  const c = await res.json();

  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>📍 Контакты</h1>

    <div class="card">
      📍 ${c.address}<br><br>
      ☎ ${c.phone}<br>
      🏢 Администрация: ${c.adminPhone}<br><br>
      🌐 <a href="${c.vk}" target="_blank">VK</a><br>
      ✈ <a href="${c.telegram}" target="_blank">Telegram</a><br><br>
      ✉ ${c.email}
    </div>
  `;
}

/* ---------- ABOUT ---------- */
async function openAbout() {
  hideMainButton();

  const res = await fetch("/data/about.json");
  const data = await res.json();

  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>🎪 ${data.title}</h1>
    <div class="card">${data.text}</div>
  `;
}

/* ---------- ROUTE ---------- */
async function openRoute() {
  hideMainButton();

  const res = await fetch("/data/route.json");
  const data = await res.json();

  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>🗺 ${data.title}</h1>
    <div class="card">${data.text.replace(/\n/g, "<br>")}</div>
  `;
}

/* ---------- RULES ---------- */
async function openRules() {
  hideMainButton();

  const res = await fetch("/data/rules.json");
  const data = await res.json();

  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>📜 ${data.title}</h1>
    <div class="card">
      <ul>
        ${data.items.map(i => `<li>${i}</li>`).join("")}
      </ul>
    </div>
  `;
}

/* ---------- INIT ---------- */
renderHome();