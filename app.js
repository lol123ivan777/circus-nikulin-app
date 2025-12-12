const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

const app = document.getElementById("app");

app.innerHTML = `
  <h1>🎪 Цирк Никулина</h1>

  <div class="menu">
    <button onclick="openSchedule()">📅 Расписание</button>
    <button onclick="openArtists()">🎭 Артисты</button>
    <button onclick="openTickets()">🎟 Билеты</button>
    <button onclick="openContacts()">☎️ Контакты</button>
  </div>
`;