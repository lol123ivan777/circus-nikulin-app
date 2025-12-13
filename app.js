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

/* ---------- HOME -------------*/

function renderHome() {
  showMainButton();

  app.innerHTML = `
    <h1>🎪 Цирк Никулина</h1>

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
        onclick="openAbout()">
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

/* ---------- ARTISTS ---------- */
function openArtists() {
  hideMainButton();
  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>🤹 Артисты</h1>
    <div class="card">Дальше будет мясо: жанры, карточки, фильтры</div>
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

    <div class="grid">
      ${month.days.map(day => `
        <div class="card">
          <div class="day-title">${day.day} · ${day.weekday}</div>
          ${
            day.slots === "OFF"
              ? `<div class="soldout">Выходной</div>`
              : day.slots.map(slot =>
                  slot.status === "available"
                    ? `<button class="time-btn" onclick="tg.openLink('${slot.url}')">${slot.time}</button>`
                    : `<div class="soldout">${slot.time} · нет билетов</div>`
                ).join("")
          }
        </div>
      `).join("")}
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
      <ul>${data.items.map(i => `<li>${i}</li>`).join("")}</ul>
    </div>
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
      🏢 ${c.adminPhone}<br><br>
      ✈ <a href="${c.telegram}" target="_blank">Telegram</a><br>
      🌐 <a href="${c.vk}" target="_blank">VK</a>
    </div>
  `;
}

/* ---------- INIT ---------- */
renderHome();