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

/* ---------- ROUTER ---------- */
function renderHome() {
  tg.MainButton.show();

  app.innerHTML = `
    <h1>🎪 Цирк Никулина</h1>

    <div class="menu">
      <button onclick="openSchedule()">📅 Расписание</button>
      <button onclick="openArtists()">🤹 Артисты</button>
      <button onclick="openNews()">📰 Новости</button>
      <button onclick="openContacts()">📍 Контакты</button>
    </div>
  `;
}

/* ---------- NEWS ---------- */
async function openNews() {
  tg.MainButton.hide();

  const res = await fetch("/data/news.json");
  const news = await res.json();

  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>📰 Новости</h1>
    <div class="list">
      ${news.map(n => `
        <div class="card">
          <strong>${n.title}</strong><br>
          <small>${n.date}</small>
          <p>${n.text}</p>
        </div>
      `).join("")}
    </div>
  `;
}

/* ---------- PLACEHOLDERS ---------- */
function openSchedule() {
  tg.MainButton.hide();
  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>📅 Расписание</h1>
    <div class="list">
      <div class="card">Сюда подключим schedule.json</div>
    </div>
  `;
}

function openArtists() {
  tg.MainButton.hide();
  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>🤹 Артисты</h1>
    <div class="list">
      <div class="card">Сюда подключим artists.json</div>
    </div>
  `;
}

function openContacts() {
  tg.MainButton.hide();
  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>📍 Контакты</h1>
    <div class="list">
      <div class="card">
        Москва, Цветной бульвар<br>
        Телефон, почта, соцсети
      </div>
    </div>
  `;
}

/* ---------- INIT ---------- */
renderHome();