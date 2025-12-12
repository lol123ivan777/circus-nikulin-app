const app = document.getElementById("app");
const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

/* ---------- MAIN BUTTON ---------- */
tg.MainButton.setText("🎟 Купить билеты");
tg.MainButton.onClick(() => {
  tg.openLink("https://circusnikulin.ru/tickets");
});
tg.MainButton.show();

/* ---------- STATE ---------- */
let artistPage = 0;
const ARTISTS_PER_PAGE = 5;

/* ---------- HOME ---------- */
function renderHome() {
  tg.MainButton.show();
  app.innerHTML = `
    <h1>🎪 Цирк Никулина</h1>
    <div class="menu">
      <button onclick="openSchedule('december_2025')">📅 Расписание</button>
      <button onclick="openArtists(0)">🤹 Артисты</button>
      <button onclick="openNews()">📰 Новости</button>
      <button onclick="openContacts()">📍 Контакты</button>
    </div>
  `;
}

/* ---------- SCHEDULE (ЕДИНСТВЕННАЯ ВЕРСИЯ) ---------- */

    async function openSchedule(month = "december_2025") {
  tg.MainButton.hide();

  const res = await fetch("/data/schedule.json");
  const data = await res.json();
  const monthData = data[month];

  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>📅 ${monthData.title}</h1>

    <div class="menu">
      <button onclick="openSchedule('december_2025')">Декабрь 2025</button>
      <button onclick="openSchedule('january_2026')">Январь 2026</button>
    </div>

    <div class="list">
      ${monthData.shows.map(day => `
        <div class="card">
          <strong>${day.day} · ${day.weekday}</strong><br>

          ${
            day.slots === "OFF"
              ? "<div class='soldout'>Выходной</div>"
              : day.slots.map(slot =>
                  slot.status === "available"
                    ? `<button class="time" onclick="tg.openLink('${slot.url}')">${slot.time}</button>`
                    : `<div class="soldout">${slot.time} · билетов нет</div>`
                ).join("")
          }
        </div>
      `).join("")}
    </div>
  `;
}

/* ---------- ARTISTS ---------- */
async function openArtists(page = 0) {
  tg.MainButton.hide();
  artistPage = page;

  const res = await fetch("/data/artists.json");
  const artists = await res.json();

  const start = page * ARTISTS_PER_PAGE;
  const end = start + ARTISTS_PER_PAGE;
  const slice = artists.slice(start, end);

  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>🤹 Артисты</h1>

    <div class="list">
      ${slice.map(a => `
        <div class="card">
          <strong>${a.title}</strong><br>
          ${a.lead}
        </div>
      `).join("")}
    </div>

    <div class="menu">
      ${start > 0 ? `<button onclick="openArtists(${page - 1})">⬅️ Назад</button>` : ""}
      ${end < artists.length ? `<button onclick="openArtists(${page + 1})">Вперёд ➡️</button>` : ""}
    </div>
  `;
}

/* ---------- NEWS (ШАБЛОН) ---------- */
function openNews() {
  tg.MainButton.hide();
  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>📰 Новости</h1>
    <div class="card">Здесь будут новости</div>
  `;
}

/* ---------- CONTACTS ---------- */
function openContacts() {
  tg.MainButton.hide();
  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>📍 Контакты</h1>
    <div class="card">
      Москва, Цветной бульвар<br>
      Телефон, почта, соцсети
    </div>
  `;
}

/* ---------- INIT ---------- */
renderHome();