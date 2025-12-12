const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const app = document.getElementById("app");

const state = {
  view: "home",
  artistsPage: 0,
  artistsPerPage: 5,
  scheduleMonth: "dec2025", // dec2025 | jan2026
  cache: {
    artists: null,
    schedule: null
  }
};

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function render(html) {
  app.innerHTML = html;
  syncBackButton();
}

function syncBackButton() {
  if (!tg) return;
  if (state.view === "home") {
    tg.BackButton.hide();
    tg.BackButton.offClick?.(onBack);
  } else {
    tg.BackButton.show();
    tg.BackButton.offClick?.(onBack);
    tg.BackButton.onClick(onBack);
  }
}

function onBack() {
  goHome();
}

/* -------------------- DATA LOADERS -------------------- */

async function loadArtists() {
  if (state.cache.artists) return state.cache.artists;
  const res = await fetch("/data/artists.json", { cache: "no-store" });
  if (!res.ok) throw new Error("artists.json not found");
  const data = await res.json();
  state.cache.artists = data;
  return data;
}

async function loadSchedule() {
  if (state.cache.schedule) return state.cache.schedule;
  const res = await fetch("/data/schedule.json", { cache: "no-store" });
  if (!res.ok) throw new Error("schedule.json not found");
  const data = await res.json();
  state.cache.schedule = data;
  return data;
}

/* -------------------- NAV -------------------- */

function goHome() {
  state.view = "home";
  renderHome();
}

function openTickets() {
  // В Mini App лучше так:
  const url = "https://circusnikulin.ru/tickets";
  if (tg) tg.openLink(url);
  else window.open(url, "_blank");
}

function openContacts() {
  state.view = "contacts";
  renderContacts();
}

function openArtists(page = 0) {
  state.view = "artists";
  state.artistsPage = page;
  renderArtists().catch(showError);
}

function openSchedule(monthKey = "dec2025") {
  state.view = "schedule";
  state.scheduleMonth = monthKey;
  renderSchedule().catch(showError);
}

/* -------------------- VIEWS -------------------- */

function renderHome() {
  render(`
    <div class="h1">🎪 Цирк Никулина</div>
    <div class="sub">Выберите раздел 👇</div>

    <div class="grid">
      <button class="btn" id="btnSchedule">📅 Расписание</button>
      <button class="btn" id="btnArtists">🤹‍♂️ Артисты</button>
      <button class="btn" id="btnTickets">🎟️ Билеты</button>
      <button class="btn" id="btnContacts">📍 Контакты</button>
    </div>

    <button class="btn btn-wide" id="btnTicketsWide">🎟️ БИЛЕТЫ</button>
    <div class="small" style="margin-top:10px;">Мини-апа: без спама, без боли, почти без магии.</div>
  `);

  document.getElementById("btnSchedule").onclick = () => openSchedule("dec2025");
  document.getElementById("btnArtists").onclick = () => openArtists(0);
  document.getElementById("btnTickets").onclick = openTickets;
  document.getElementById("btnContacts").onclick = openContacts;
  document.getElementById("btnTicketsWide").onclick = openTickets;
}

async function renderArtists() {
  const artists = await loadArtists();
  const start = state.artistsPage * state.artistsPerPage;
  const end = start + state.artistsPerPage;
  const pageItems = artists.slice(start, end);

  const totalPages = Math.ceil(artists.length / state.artistsPerPage);

  render(`
    <div class="panel">
      <div class="h1" style="font-size:28px;margin:0;">🤹‍♂️ Артисты</div>
      <div class="small">Страница ${state.artistsPage + 1} из ${totalPages}</div>

      <div class="list">
        ${pageItems.map(a => `
          <div class="item">
            <div><b>${escapeHtml(a.title || "")}</b></div>
            <div class="small">${escapeHtml(a.author || "")}</div>
          </div>
        `).join("")}
      </div>

      <div class="pager">
        <button class="pbtn" id="prevArtists" ${state.artistsPage === 0 ? "disabled" : ""}>⬅️ Назад</button>
        <button class="pbtn" id="nextArtists" ${state.artistsPage >= totalPages - 1 ? "disabled" : ""}>Вперёд ➡️</button>
      </div>

      <div class="row">
        <button class="pbtn" id="homeBtn">🏠 На главную</button>
      </div>
    </div>
  `);

  document.getElementById("homeBtn").onclick = goHome;
  document.getElementById("prevArtists").onclick = () => openArtists(Math.max(0, state.artistsPage - 1));
  document.getElementById("nextArtists").onclick = () => openArtists(Math.min(totalPages - 1, state.artistsPage + 1));
}

async function renderSchedule() {
  const schedule = await loadSchedule();
  const monthKey = state.scheduleMonth;

  const title = monthKey === "dec2025" ? "Декабрь 2025" : "Январь 2026";
  const items = schedule[monthKey] || [];

  render(`
    <div class="panel">
      <div class="h1" style="font-size:28px;margin:0;">📅 ${title}</div>
      <div class="small">Выберите месяц и смотрите время представлений.</div>

      <div class="pager">
        <button class="pbtn" id="decBtn">Декабрь 2025</button>
        <button class="pbtn" id="janBtn">Январь 2026</button>
      </div>

      <div class="list">
        ${items.map(it => `
          <div class="item">
            <b>${escapeHtml(it.day)}</b> — ${escapeHtml((it.time || []).join(" · ") || "ВЫХОДНОЙ")}
          </div>
        `).join("")}
      </div>

      <div class="row">
        <button class="pbtn" id="homeBtn">🏠 На главную</button>
        <button class="pbtn" id="ticketsBtn">🎟️ Билеты</button>
      </div>
    </div>
  `);

  document.getElementById("decBtn").onclick = () => openSchedule("dec2025");
  document.getElementById("janBtn").onclick = () => openSchedule("jan2026");
  document.getElementById("homeBtn").onclick = goHome;
  document.getElementById("ticketsBtn").onclick = openTickets;
}

function renderContacts() {
  // пока статикой. Потом можно грузить contacts.json
  render(`
    <div class="panel">
      <div class="h1" style="font-size:28px;margin:0;">📍 Контакты</div>

      <div class="list">
        <div class="item">
          <b>Адрес:</b><br/>
          127051, Россия, Москва, Цветной бульвар 13
        </div>
        <div class="item">
          <b>Телефон:</b><br/>
          +7 (495) 628-83-49
        </div>
        <div class="item">
          <b>Соцсети:</b><br/>
          VK: <a href="https://vk.com/circusnikulin" target="_blank">vk.com/circusnikulin</a><br/>
          TG: <a href="https://t.me/nikulin_circus" target="_blank">@nikulin_circus</a>
        </div>
      </div>

      <div class="row">
        <button class="pbtn" id="homeBtn">🏠 На главную</button>
        <button class="pbtn" id="ticketsBtn">🎟️ Билеты</button>
      </div>
    </div>
  `);

  // ссылки внутри Telegram лучше открывать через tg.openLink
  for (const a of app.querySelectorAll("a")) {
    const url = a.getAttribute("href");
    a.addEventListener("click", (e) => {
      if (!url) return;
      e.preventDefault();
      if (tg) tg.openLink(url);
      else window.open(url, "_blank");
    });
  }

  document.getElementById("homeBtn").onclick = goHome;
  document.getElementById("ticketsBtn").onclick = openTickets;
}

function showError(err) {
  console.error(err);
  render(`
    <div class="panel">
      <div class="h1" style="font-size:26px;margin:0;">😵 Что-то пошло не так</div>
      <div class="small" style="margin-top:10px;">
        ${escapeHtml(err?.message || String(err))}
      </div>
      <div class="row">
        <button class="pbtn" id="homeBtn">🏠 На главную</button>
      </div>
    </div>
  `);
  document.getElementById("homeBtn").onclick = goHome;
}

/* -------------------- BOOT -------------------- */
goHome();