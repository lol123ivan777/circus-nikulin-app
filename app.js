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

/* ---------- HOME ---------- */
function renderHome() {
  tg.MainButton.show();
  app.innerHTML = `
    <h1>🎪 Цирк Никулина</h1>

    <div class="menu">
      <button onclick="openSchedule('december_2025')">📅 Расписание</button>
      <button onclick="openArtists()">🤹 Артисты</button>
      <button onclick="openContacts()">📍 Контакты</button>
    </div>
  `;
}

/* ---------- SCHEDULE ---------- */
async function openSchedule(monthKey) {
  tg.MainButton.hide();

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
                  ${day.slots.map(slot => {
                    if (slot.status === "available") {
                      return `
                        <button class="time-btn"
                          onclick="tg.openLink('${slot.url}')">
                          ${slot.time}
                        </button>
                      `;
                    } else {
                      return `
                        <div class="soldout">
                          ${slot.time} · билетов нет
                        </div>
                      `;
                    }
                  }).join("")}
                </div>
              `
          }
        </div>
      `).join("")}
    </div>
  `;
}

/* ---------- ARTISTS (пока заглушка) ---------- */
function openArtists() {
  tg.MainButton.hide();
  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>🤹 Артисты</h1>
    <div class="card">Жанры и список подключим следующим шагом</div>
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
      Официальный сайт и соцсети
    </div>
  `;
}

/* ---------- INIT ---------- */
renderHome();