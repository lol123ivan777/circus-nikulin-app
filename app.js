const app = document.getElementById("app");
const tg = window.Telegram?.WebApp;
const curtain = document.getElementById("curtain");

let scheduleData = null;

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

/* ---------- CURTAIN CONTROL ---------- */
function playCurtain(type, callback) {
  curtain.className = "";
  curtain.style.pointerEvents = "auto";

  requestAnimationFrame(() => {
    curtain.classList.add(type);
  });

  setTimeout(() => {
    curtain.className = "";
    curtain.style.pointerEvents = "none";
    callback && callback();
  }, 1900);
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

function backBottom(action) {
  return `<div class="back back-bottom" onclick="${action}">← Назад</div>`;
}

/* ---------- HOME ---------- */
function renderHome() {
  showMainButton();

  app.innerHTML = `
    <div class="cards-grid">

      <div class="image-card"
        style="background-image:url('assets/cards/artistscard.png')"
        onclick="goLeft(openArtists)">
      </div>

      <div class="image-card"
        style="background-image:url('assets/cards/schedulecard.png')"
        onclick="goLeft(openScheduleRoot)">
      </div>

      <div class="image-card"
        style="background-image:url('assets/cards/aboutcard.png')"
        onclick="goLeft(openAboutRoot)">
      </div>

      <div class="image-card"
        style="background-image:url('assets/cards/routecard.png')"
        onclick="goLeft(openRoute)">
      </div>

      <div class="image-card"
        style="background-image:url('assets/cards/rulescard.png')"
        onclick="goLeft(openRules)">
      </div>

      <div class="image-card"
        style="background-image:url('assets/cards/contactscard.png')"
        onclick="goLeft(openContacts)">
      </div>

    </div>
  `;
}

/* ---------- NAV HELPERS ---------- */
function goLeft(fn) {
  playCurtain("curtain-left", fn);
}

function goRight(fn) {
  playCurtain("curtain-right", fn);
}

/* ---------- ABOUT ---------- */
function openAboutRoot() {
  openIndex("data/about2/index.json", "goRight(renderHome)");
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
          onclick="goLeft(() => openIndexOrPage('${s.path}', '${path}'))">
          ${s.title}
        </div>
      `).join("")}
    </div>

    ${backBottom(backAction)}
  `;
}

async function openIndexOrPage(path, parentPath) {
  const res = await fetch("/" + path);
  const data = await res.json();

  if (data.sections) {
    openIndex(path, `goRight(() => openIndex('${parentPath}', 'goRight(renderHome)'))`);
    return;
  }

  app.innerHTML = `
    ${backButton(`goRight(() => openIndex('${parentPath}', 'goRight(renderHome)'))`)}
    <h1>${data.title}</h1>
    <div class="card text">
      ${data.text.replace(/\n/g, "<br><br>")}
    </div>
    ${backBottom(`goRight(() => openIndex('${parentPath}', 'goRight(renderHome)'))`)}
  `;
}

/* ---------- ARTISTS ---------- */
async function openArtists() {
  hideMainButton();

  const res = await fetch("/data/artists.json");
  const artists = await res.json();

  app.innerHTML = `
    ${backButton("goRight(renderHome)")}
    <h1>🤹 Артисты</h1>

    <div class="list">
      ${artists.map(a => `
        <div class="artist-card">
          <div class="artist-title">${a.title}</div>
          <div class="artist-lead">${a.lead}</div>
        </div>
      `).join("")}
    </div>

    ${backBottom("goRight(renderHome)")}
  `;
}

/* ---------- SCHEDULE ROOT ---------- */
async function openScheduleRoot() {
  hideMainButton();

  if (!scheduleData) {
    const res = await fetch("/data/schedule.json");
    scheduleData = await res.json();
  }

  app.innerHTML = `
    ${backButton("goRight(renderHome)")}
    <h1>📅 Расписание</h1>

    <div class="list">
      ${Object.entries(scheduleData).map(([key, month]) => `
        <div class="card clickable"
          onclick="goLeft(() => openScheduleMonth('${key}'))">
          ${month.title}
        </div>
      `).join("")}
    </div>

    ${backBottom("goRight(renderHome)")}
  `;
}

/* ---------- SCHEDULE MONTH ---------- */
function openScheduleMonth(monthKey) {
  const month = scheduleData[monthKey];

  app.innerHTML = `
    ${backButton("goRight(openScheduleRoot)")}
    <h1>${month.title}</h1>

    <div class="grid">
      ${month.days.map(day => `
        <div class="card">
          <div class="day-title">${day.day} · ${day.weekday}</div>
          ${
            day.slots === "OFF"
              ? `<div class="soldout">Выходной</div>`
              : day.slots.map(slot =>
                  slot.status === "soldout"
                    ? `<div class="soldout">${slot.time} · нет билетов</div>`
                    : `<a href="${slot.url}" target="_blank"><button class="time-btn">${slot.time}</button></a>`
                ).join("")
          }
        </div>
      `).join("")}
    </div>

    ${backBottom("goRight(openScheduleRoot)")}
  `;
}

/* ---------- ROUTE ---------- */
async function openRoute() {
  hideMainButton();
  const res = await fetch("/data/route.json");
  const data = await res.json();

  app.innerHTML = `
    ${backButton("goRight(renderHome)")}
    <h1>${data.title}</h1>
    <div class="card">${data.text.replace(/\n/g, "<br><br>")}</div>
    ${backBottom("goRight(renderHome)")}
  `;
}

/* ---------- RULES ---------- */
async function openRules() {
  hideMainButton();
  const res = await fetch("/data/rules.json");
  const data = await res.json();

  app.innerHTML = `
    ${backButton("goRight(renderHome)")}
    <h1>${data.title}</h1>
    <ul class="card">${data.items.map(i => `<li>${i}</li>`).join("")}</ul>
    ${backBottom("goRight(renderHome)")}
  `;
}

/* ---------- CONTACTS ---------- */
async function openContacts() {
  hideMainButton();
  const res = await fetch("/data/contacts.json");
  const data = await res.json();

  app.innerHTML = `
    ${backButton("goRight(renderHome)")}
    <h1>📍 ${data.title}</h1>

    <div class="contacts-list">
      ${data.sections.map(section => `
        <div class="contact-block">
          <div class="contact-title">${section.title}</div>
          <div class="contact-text">
            ${section.items.map(item => {
              if (item.type === "text") return `<div>${item.value}</div>`;
              if (item.type === "phone") return `<div><a class="contact-link" href="tel:${item.value}">${item.value}</a></div>`;
              if (item.type === "link") return `<div><a class="contact-link" href="${item.url}" target="_blank">${item.label}</a></div>`;
              if (item.type === "email") return `<div><a class="contact-link" href="mailto:${item.value}">${item.value}</a></div>`;
            }).join("")}
          </div>
        </div>
      `).join("")}
    </div>

    ${backBottom("goRight(renderHome)")}
  `;
}

/* ---------- INIT ---------- */
renderHome();
playCurtain("curtain-up");