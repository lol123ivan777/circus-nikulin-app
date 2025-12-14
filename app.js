const app = document.getElementById("app");
const curtain = document.getElementById("curtain");
const tg = window.Telegram?.WebApp;

let scheduleData = null;

/* ---------- TELEGRAM ---------- */
if (tg) {
  tg.ready();
  tg.expand();

  tg.MainButton.setText("🎟 Купить билеты");
  tg.MainButton.onClick(() => {
    tg.openLink("https://circusnikulin.ru/tickets");
  });
  tg.MainButton.show();
}

/* ---------- CURTAIN ENGINE ---------- */
function transition(type, renderFn) {
  document.body.classList.add("transitioning");

  curtain.className = "";
  curtain.style.pointerEvents = "auto";

  requestAnimationFrame(() => {
    curtain.classList.add(type + "-close");
  });

  setTimeout(() => {
    renderFn();

    curtain.className = "";
    curtain.classList.add(type + "-open");

    setTimeout(() => {
      curtain.className = "";
      curtain.style.pointerEvents = "none";
      document.body.classList.remove("transitioning");
    }, 950);

  }, 950);
}

const goForward = fn => transition("curtain-left", fn);
const goBack = fn => transition("curtain-right", fn);
const goUp = fn => transition("curtain-up", fn);

/* ---------- HELPERS ---------- */
const showMainButton = () => tg?.MainButton.show();
const hideMainButton = () => tg?.MainButton.hide();

const backButton = action =>
  `<div class="back" onclick="${action}">← Назад</div>`;

const backBottom = action =>
  `<div class="back back-bottom" onclick="${action}">← Назад</div>`;

/* ---------- HOME ---------- */
function renderHome() {
  showMainButton();

  app.innerHTML = `
    <div class="cards-grid">
      <div class="image-card" style="background-image:url('assets/cards/artistscard.png')" onclick="goForward(openArtists)"></div>
      <div class="image-card" style="background-image:url('assets/cards/schedulecard.png')" onclick="goForward(openScheduleRoot)"></div>
      <div class="image-card" style="background-image:url('assets/cards/aboutcard.png')" onclick="goForward(openAboutRoot)"></div>
      <div class="image-card" style="background-image:url('assets/cards/routecard.png')" onclick="goForward(openRoute)"></div>
      <div class="image-card" style="background-image:url('assets/cards/rulescard.png')" onclick="goForward(openRules)"></div>
      <div class="image-card" style="background-image:url('assets/cards/contactscard.png')" onclick="goForward(openContacts)"></div>
    </div>
  `;
}

/* ---------- ABOUT ---------- */
function openAboutRoot() {
  goForward(() =>
    openIndex("data/about2/index.json", "goBack(renderHome)")
  );
}

/* ---------- GENERIC JSON NAV ---------- */
async function openIndex(path, backAction) {
  hideMainButton();
  const data = await (await fetch("/" + path)).json();

  app.innerHTML = `
    ${backButton(backAction)}
    <h1>${data.title}</h1>
    <div class="list">
      ${data.sections.map(s => `
        <div class="card clickable"
          onclick="openIndexOrPage('${s.path}', '${path}')">
          ${s.title}
        </div>
      `).join("")}
    </div>
    ${backBottom(backAction)}
  `;
}

async function openIndexOrPage(path, parentPath) {
  const data = await (await fetch("/" + path)).json();

  if (data.sections) {
    goForward(() =>
      openIndex(
        path,
        `goBack(() => openIndex('${parentPath}', 'goBack(renderHome)'))`
      )
    );
    return;
  }

  goForward(() => {
    app.innerHTML = `
      ${backButton(`goBack(() => openIndex('${parentPath}', 'goBack(renderHome)'))`)}
      <h1>${data.title}</h1>
      <div class="card text">
        ${data.text.replace(/\n/g, "<br><br>")}
      </div>
      ${backBottom(`goBack(() => openIndex('${parentPath}', 'goBack(renderHome)'))`)}
    `;
  });
}

/* ---------- ARTISTS ---------- */
async function openArtists() {
  hideMainButton();
  const artists = await (await fetch("/data/artists.json")).json();

  app.innerHTML = `
    ${backButton("goBack(renderHome)")}
    <h1>Артисты</h1>
    <div class="list">
      ${artists.map(a => `
        <div class="artist-card">
          <div class="artist-title">${a.title}</div>
          <div class="artist-lead">${a.lead}</div>
        </div>
      `).join("")}
    </div>
    ${backBottom("goBack(renderHome)")}
  `;
}

/* ---------- SCHEDULE ---------- */
async function openScheduleRoot() {
  hideMainButton();

  if (!scheduleData) {
    scheduleData = await (await fetch("/data/schedule.json")).json();
  }

  app.innerHTML = `
    ${backButton("goBack(renderHome)")}
    <h1>Расписание</h1>
    <div class="list">
      ${Object.entries(scheduleData).map(([key, m]) => `
        <div class="card clickable"
          onclick="goForward(() => openScheduleMonth('${key}'))">
          ${m.title}
        </div>
      `).join("")}
    </div>
    ${backBottom("goBack(renderHome)")}
  `;
}

function openScheduleMonth(key) {
  const m = scheduleData[key];

  app.innerHTML = `
    ${backButton("goBack(openScheduleRoot)")}
    <h1>${m.title}</h1>
    <div class="grid">
      ${m.days.map(d => `
        <div class="card">
          <div class="day-title">${d.day} · ${d.weekday}</div>
          ${
            d.slots === "OFF"
              ? `<div class="soldout">Выходной</div>`
              : d.slots.map(s =>
                  s.status === "soldout"
                    ? `<div class="soldout">${s.time} · нет билетов</div>`
                    : `<a href="${s.url}" target="_blank">
                        <button class="time-btn">${s.time}</button>
                      </a>`
                ).join("")
          }
        </div>
      `).join("")}
    </div>
    ${backBottom("goBack(openScheduleRoot)")}
  `;
}

/* ---------- ROUTE / RULES / CONTACTS ---------- */
async function openRoute() {
  hideMainButton();
  const d = await (await fetch("/data/route.json")).json();

  app.innerHTML = `
    ${backButton("goBack(renderHome)")}
    <h1>${d.title}</h1>
    <div class="card">${d.text}</div>
    ${backBottom("goBack(renderHome)")}
  `;
}

async function openRules() {
  hideMainButton();
  const d = await (await fetch("/data/rules.json")).json();

  app.innerHTML = `
    ${backButton("goBack(renderHome)")}
    <h1>${d.title}</h1>
    <ul class="card">
      ${d.items.map(i => `<li>${i}</li>`).join("")}
    </ul>
    ${backBottom("goBack(renderHome)")}
  `;
}

async function openContacts() {
  hideMainButton();
  const data = await (await fetch("/data/contacts.json")).json();

  app.innerHTML = `
    ${backButton("goBack(renderHome)")}
    <h1>${data.title}</h1>
    <div class="contacts-list">
      ${data.sections.map(s => `
        <div class="contact-block">
          <div class="contact-title">${s.title}</div>
          ${s.items.map(i => {
            if (i.type === "text") return `<div>${i.value}</div>`;
            if (i.type === "phone") return `<a class="contact-link" href="tel:${i.value}">${i.value}</a>`;
            if (i.type === "email") return `<a class="contact-link" href="mailto:${i.value}">${i.value}</a>`;
            if (i.type === "link") return `<a class="contact-link" href="${i.url}" target="_blank">${i.label}</a>`;
            return "";
          }).join("")}
        </div>
      `).join("")}
    </div>
    ${backBottom("goBack(renderHome)")}
  `;
}

/* ---------- INIT ---------- */
goUp(renderHome);