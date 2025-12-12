const app = document.getElementById("app");
const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

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
  <button onclick="openAbout()">🎪 О цирке</button>
  <button onclick="openRoute()">🗺 Как добраться</button>
  <button onclick="openRules()">📜 Правила посещения</button>
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
async function openContacts() {
  tg.MainButton.hide();

  const res = await fetch("/data/contacts.json");
  const c = await res.json();

  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>📍 Контакты</h1>

    <div class="card">
      📍 ${c.address}<br><br>
      ☎ ${c.phone}<br>
      🏢 Администрация: ${c.adminPhone}<br><br>
      🌐 <a href="${c.vk}">VK</a><br>
      ✈ <a href="${c.telegram}">Telegram</a><br><br>
      ✉ ${c.email}
    </div>
  `;
}

/---------------О ЦИРКЕ----------------

async function openAbout() {
  tg.MainButton.hide();

  const res = await fetch("/data/about.json");
  const data = await res.json();

  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>🎪 ${data.title}</h1>
    <div class="card">${data.text}</div>
  `;
}

/----------------как добраться-------

async function openRoute() {
  tg.MainButton.hide();

  const res = await fetch("/data/route.json");
  const data = await res.json();

  app.innerHTML = `
    <div class="back" onclick="renderHome()">← Назад</div>
    <h1>🗺 ${data.title}</h1>
    <div class="card">${data.text.replace(/\n/g, "<br>")}</div>
  `;
}

/----------правила-------


async function openRules() {
  tg.MainButton.hide();

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