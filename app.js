const tg = window.Telegram.WebApp;

// говорим Telegram: «мы готовы»
tg.ready();

// раскрываем приложение на весь экран
tg.expand();

// пример: меняем цвет верхней панели
tg.setHeaderColor("#000000");
tg.setBackgroundColor("#000000");

// корневой контейнер
const app = document.getElementById("app");

app.innerHTML = `
  <h1>🎪 Цирк Никулина</h1>

  <div class="menu">
    <button onclick="openSchedule()">📅 Расписание</button>
    <button onclick="openArtists()">🤹‍♂️ Артисты</button>
    <button onclick="openTickets()">🎟 Билеты</button>
    <button onclick="openContacts()">📍 Контакты</button>
  </div>
`;

function openSchedule() {
  alert("Расписание — сюда позже загрузим данные");
}

function openArtists() {
  alert("Артисты — тут будет список");
}

function openTickets() {
  window.open("https://circusnikulin.ru/tickets", "_blank");
}

function openContacts() {
  alert("Контакты — тут красиво оформим");
}

async function loadSchedule() {
  const res = await fetch("/data/schedule.json");
  return res.json();
}

async function openSchedule() {
  const data = await loadSchedule();
  console.log(data);
}