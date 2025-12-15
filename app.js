<div id="app" x-data="appState()" x-init="init()">
  <!-- Здесь будет контент -->
</div>

<div id="curtain"></div>

<script>
const tg = window.Telegram?.WebApp;

let scheduleData = null;

function appState() {
  return {
    history: [],  // Стек: [{render: renderHome, back: null}, ...]
    current: null,

    init() {
      if (tg) {
        tg.ready();
        tg.expand();
        tg.MainButton.setText("🎟 Купить билеты");
        tg.MainButton.onClick(() => tg.openLink("https://circusnikulin.ru/tickets"));
        tg.MainButton.show();
      }
      this.push(renderHome, null);  // Стартовый экран
    },

    push(renderFn, backTitle = '← Назад') {
      this.history.push({ render: renderFn, backTitle });
      this.renderCurrent();
    },

    pop() {
      if (this.history.length > 1) {
        this.history.pop();
        this.renderCurrent();
      }
    },

    renderCurrent() {
      const current = this.history[this.history.length - 1];
      if (current) {
        // Сохраняем MainButton состояние если нужно
        const wasMainVisible = tg?.MainButton.isVisible;
        current.render(this);  // Передаём state для управления кнопками назад
        if (this.history.length === 1) tg?.MainButton.show();
      }
    },

    // Твои transition функции (оставляем как есть)
    transition(type, renderFn) {
      // ... твой код curtain без изменений
      // В конце renderFn() вызываем this.renderCurrent() или напрямую render
    },

    goForward(renderFn) {
      this.transition("curtain-left", () => this.push(renderFn));
    },

    goBack() {
      this.transition("curtain-right", () => this.pop());
    },

    goUp(renderFn) {
      this.transition("curtain-up", renderFn);
    }
  }
}

/* ---------- РЕНДЕР ФУНКЦИИ ---------- */
// Теперь они принимают state для генерации кнопок назад

function renderHome(state) {
  tg?.MainButton.show();

  app.innerHTML = `
    <div class="cards-grid">
      <div class="image-card" style="background-image:url('assets/cards/artistscard.png')" @click="state.goForward(() => openArtists(state))"></div>
      <div class="image-card" style="background-image:url('assets/cards/schedulecard.png')" @click="state.goForward(() => openScheduleRoot(state))"></div>
      <!-- Остальные карточки аналогично -->
    </div>
  `;
}

function renderBackButton(state, customAction = null) {
  const action = customAction || 'state.goBack()';
  return `<div class="back" @click="${action}">← Назад</div>`;
}

function renderBackBottom(state, customAction = null) {
  const action = customAction || 'state.goBack()';
  return `<div class="back back-bottom" @click="${action}">← Назад</div>`;
}

/* Пример для артистов */
async function openArtists(state) {
  tg?.MainButton.hide();
  const artists = await fetch("/data/artists.json").then(r => r.json());

  app.innerHTML = `
    ${renderBackButton(state)}
    <h1>Артисты</h1>

    <div class="list">
      ${artists.map(a => `
        <div class="artist-card">
          <div class="artist-title">${a.title}</div>
          <div class="artist-lead">${a.lead}</div>
        </div>
      `).join("")}
    </div>

    ${renderBackBottom(state)}
  `;
}

/* Аналогично перепиши остальные функции: openScheduleRoot(state), openAboutRoot(state) и т.д. */
// Для вложенных: в goForward передавай функцию, которая пушит следующий экран.

async function openScheduleRoot(state) {
  tg?.MainButton.hide();

  if (!scheduleData) {
    scheduleData = await fetch("/data/schedule.json").then(r => r.json());
  }

  app.innerHTML = `
    ${renderBackButton(state)}
    <h1>Расписание</h1>

    <div class="list">
      ${Object.entries(scheduleData).map(([key, m]) => `
        <div class="card clickable" @click="state.goForward(() => openScheduleMonth(state, '${key}'))">
          ${m.title}
        </div>
      `).join("")}
    </div>

    ${renderBackBottom(state)}
  `;
}

function openScheduleMonth(state, key) {
  const m = scheduleData[key];

  app.innerHTML = `
    ${renderBackButton(state)}
    <h1>${m.title}</h1>

    <div class="grid">
      ${m.days.map(d => `
        <div class="card">
          <div class="day-title">\( {d.day} · \){d.weekday}</div>
          ${/* ... твой код с кнопками времени ... */}
        </div>
      `).join("")}
    </div>

    ${renderBackBottom(state)}
  `;
}

/* Для generic JSON nav — тоже легко адаптировать, передавая state в функции */

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  // Alpine сам инициализируется
});
</script>