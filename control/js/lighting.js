/* ============================================================
   Lighting screen - demo mode (بدون اتصال WinCC)
   ============================================================ */
(function () {
  "use strict";

  // kw = حداکثر توان مدار در ۱۰۰٪
  const data = {
    parking: { label: "منفی ۱ (پارکینگ)", zones: [
      { n: "ورودی و رمپ",     on: true,  lv: 70, auto: true,  lux: 180, occ: "—",     kw: 1.2 },
      { n: "پارکینگ بخش A",   on: true,  lv: 60, auto: true,  lux: 150, occ: "۳ نفر", kw: 2.0 },
      { n: "پارکینگ بخش B",   on: false, lv: 0,  auto: true,  lux: 20,  occ: "—",     kw: 2.0 },
      { n: "اتاق تاسیسات",    on: true,  lv: 100, auto: false, lux: 300, occ: "—",     kw: 0.6 },
    ]},
    ground: { label: "همکف (شعبه)", zones: [
      { n: "تالار باجه‌ها",   on: true, lv: 80,  auto: true,  lux: 520, occ: "۵ نفر", kw: 3.2 },
      { n: "ورودی و خودپرداز", on: true, lv: 100, auto: false, lux: 610, occ: "۲ نفر", kw: 1.1 },
      { n: "رئیس بانک",       on: true, lv: 75,  auto: true,  lux: 480, occ: "۱ نفر", kw: 0.6 },
      { n: "معاون بانک",      on: true, lv: 60,  auto: true,  lux: 450, occ: "—",     kw: 0.6 },
      { n: "تسهیلات",         on: true, lv: 80,  auto: true,  lux: 500, occ: "۲ نفر", kw: 1.0 },
      { n: "راهرو و سرویس‌ها", on: true, lv: 50,  auto: true,  lux: 200, occ: "—",     kw: 0.8 },
    ]},
    f1: { label: "طبقه اول", zones: [
      { n: "روابط عمومی",     on: true,  lv: 100, auto: true,  lux: 540, occ: "۳ نفر", kw: 0.9 },
      { n: "حقوقی",           on: true,  lv: 80,  auto: true,  lux: 500, occ: "۲ نفر", kw: 0.8 },
      { n: "انفورماتیک (IT)", on: true,  lv: 100, auto: false, lux: 560, occ: "—",     kw: 0.7 },
      { n: "کارشناس ساختمانی", on: true,  lv: 100, auto: true,  lux: 530, occ: "۱ نفر", kw: 0.6 },
      { n: "سالن اجتماعات",   on: false, lv: 0,   auto: true,  lux: 40,  occ: "۰ نفر", kw: 1.4 },
      { n: "راهرو",           on: true,  lv: 50,  auto: true,  lux: 210, occ: "—",     kw: 0.5 },
    ]},
    f2: { label: "طبقه دوم", zones: [
      { n: "معاون منطقه",     on: true, lv: 80, auto: true, lux: 490, occ: "۲ نفر", kw: 0.8 },
      { n: "بازرس منطقه",     on: true, lv: 80, auto: true, lux: 480, occ: "۱ نفر", kw: 0.7 },
      { n: "اعتبارات",        on: true, lv: 90, auto: true, lux: 540, occ: "۸ نفر", kw: 1.6 },
      { n: "خدمات اداری",     on: true, lv: 80, auto: true, lux: 500, occ: "۳ نفر", kw: 1.0 },
      { n: "حسابداری",        on: true, lv: 85, auto: true, lux: 510, occ: "۴ نفر", kw: 1.1 },
      { n: "نمازخانه",        on: true, lv: 60, auto: true, lux: 300, occ: "—",     kw: 0.4 },
    ]},
    f3: { label: "طبقه سوم", zones: [
      { n: "مدیر منطقه",      on: true, lv: 80, auto: true, lux: 500, occ: "۲ نفر",  kw: 0.9 },
      { n: "حوزه حراست",      on: true, lv: 85, auto: true, lux: 510, occ: "۳ نفر",  kw: 0.9 },
      { n: "سالن اجتماعات",   on: true, lv: 100, auto: false, lux: 620, occ: "۳۰ نفر", kw: 1.4 },
    ]},
  };

  const outdoor = [
    { n: "نمای ساختمان", icon: "fa-city",         on: false, auto: true },
    { n: "تابلوی بانک",   icon: "fa-signs-post",   on: false, auto: true },
    { n: "محوطه و ورودی", icon: "fa-tree-city",    on: true,  auto: true },
  ];

  const scenarios = ["عادی", "جلسه", "ارائه", "نظافت", "صرفه‌جویی", "خاموش"];

  let floor = "ground";
  let scenario = "عادی";

  const $ = (id) => document.getElementById(id);
  const fa = (n) => Number(n).toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

  const zonePower = (z) => (z.on ? z.kw * z.lv / 100 : 0);
  const allZones = () => Object.values(data).flatMap((f) => f.zones);

  /* ---------- rendering ---------- */
  function renderTabs() {
    $("ltTabs").innerHTML = Object.entries(data).map(([k, f]) =>
      `<button class="lt-tab ${k === floor ? "active" : ""}" data-floor="${k}">${f.label}</button>`).join("");
  }

  function renderScenarios() {
    $("ltScenarios").innerHTML = scenarios.map((s) =>
      `<button class="lt-scn ${s === scenario ? "active" : ""}" data-s="${s}">${s}</button>`).join("");
  }

  function zoneHTML(z, i) {
    return `
    <div class="lt-zone ${z.on ? "on" : "off"}" data-i="${i}">
      <div class="lt-zone-head">
        <div class="lt-zone-name"><i class="fa-solid fa-lightbulb lt-bulb"></i>${z.n}</div>
        <button class="lt-switch ${z.on ? "on" : ""}" data-act="toggle" aria-label="روشن/خاموش"></button>
      </div>
      <div class="lt-dim">
        <i class="fa-regular fa-sun"></i>
        <input type="range" min="0" max="100" value="${z.lv}" data-act="dim" ${z.on ? "" : "disabled"} style="--v:${z.lv}%">
        <span class="pct">${z.lv}%</span>
      </div>
      <div class="lt-mode">
        <button data-act="mode" data-m="auto" class="${z.auto ? "active" : ""}">خودکار</button>
        <button data-act="mode" data-m="manual" class="${z.auto ? "" : "active"}">دستی</button>
      </div>
      <div class="lt-info">
        <div class="m"><i class="fa-solid fa-sun"></i>لوکس<b>${z.lux}</b></div>
        <div class="m"><i class="fa-solid fa-user-group"></i>حضور<b>${z.occ}</b></div>
        <div class="m"><i class="fa-solid fa-bolt"></i>توان<b>${fa(zonePower(z))} kW</b></div>
        <div class="m"><i class="fa-solid fa-plug"></i>ظرفیت<b>${fa(z.kw)} kW</b></div>
      </div>
    </div>`;
  }

  function renderZones() {
    $("ltZones").innerHTML = data[floor].zones.map(zoneHTML).join("");
  }

  function renderOutdoor() {
    $("ltOutdoor").innerHTML = outdoor.map((o, i) => `
      <div class="lt-out-row" data-i="${i}">
        <span class="n"><i class="fa-solid ${o.icon}"></i>${o.n}</span>
        <span style="display:flex;align-items:center;gap:10px;">
          <span class="pill ${o.auto ? "good" : "warn"}">${o.auto ? "خودکار" : "دستی"}</span>
          <button class="lt-switch ${o.on ? "on" : ""}" data-act="out-toggle" aria-label="روشن/خاموش"></button>
        </span>
      </div>`).join("");
  }

  function renderShare() {
    const totals = Object.entries(data).map(([k, f]) =>
      [f.label, f.zones.reduce((s, z) => s + zonePower(z), 0)]);
    const max = Math.max(...totals.map((t) => t[1]), 0.1);
    $("ltShare").innerHTML = totals.map(([l, v]) => `
      <div class="bar-row">
        <span class="lbl" style="width:96px">${l}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(v / max) * 100}%"></div></div>
        <span class="bar-val" style="width:40px">${fa(v)}</span>
      </div>`).join("");
  }

  function renderKpis() {
    const zs = allZones();
    const on = zs.filter((z) => z.on);
    const power = zs.reduce((s, z) => s + zonePower(z), 0);
    const avg = on.length ? Math.round(on.reduce((s, z) => s + z.lv, 0) / on.length) : 0;
    $("ltKpiPower").textContent = fa(power);
    $("ltKpiOn").textContent = on.length;
    $("ltKpiTotal").textContent = "/ " + zs.length;
    $("ltKpiAvg").textContent = avg;
    $("ltKpiAuto").textContent = zs.filter((z) => z.auto).length;
    $("ltKpiAutoTotal").textContent = "/ " + zs.length;
    renderShare();
  }

  /* ---------- actions ---------- */
  function applyScenario(s) {
    scenario = s;
    data[floor].zones.forEach((z) => {
      const meeting = /اجتماعات/.test(z.n);
      if (s === "خاموش") { z.on = false; z.lv = 0; return; }
      z.on = true;
      if (s === "عادی") z.lv = 80;
      else if (s === "جلسه") z.lv = meeting ? 100 : 50;
      else if (s === "ارائه") z.lv = meeting ? 30 : 60;
      else if (s === "نظافت") z.lv = 100;
      else if (s === "صرفه‌جویی") z.lv = 40;
    });
    renderScenarios(); renderZones(); renderKpis();
  }

  function setAll(on) {
    data[floor].zones.forEach((z) => { z.on = on; z.lv = on ? (z.lv || 80) : 0; });
    renderZones(); renderKpis();
  }

  /* ---------- events ---------- */
  $("ltTabs").addEventListener("click", (e) => {
    const b = e.target.closest(".lt-tab"); if (!b) return;
    floor = b.dataset.floor;
    renderTabs(); renderZones();
  });

  $("ltScenarios").addEventListener("click", (e) => {
    const b = e.target.closest(".lt-scn"); if (b) applyScenario(b.dataset.s);
  });
  $("ltAllOn").addEventListener("click", () => setAll(true));
  $("ltAllOff").addEventListener("click", () => setAll(false));

  $("ltZones").addEventListener("click", (e) => {
    const card = e.target.closest(".lt-zone"); if (!card) return;
    const z = data[floor].zones[card.dataset.i];
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "toggle") {
      z.on = !z.on;
      if (z.on && z.lv === 0) z.lv = 80;
      if (!z.on) z.lv = 0;
      z.auto = false;
    } else if (act === "mode") {
      z.auto = e.target.dataset.m === "auto";
    } else return;
    renderZones(); renderKpis();
  });

  // اسلایدر: فقط همان کارت را آپدیت می‌کنیم تا درگ قطع نشود
  $("ltZones").addEventListener("input", (e) => {
    if (e.target.dataset.act !== "dim") return;
    const card = e.target.closest(".lt-zone");
    const z = data[floor].zones[card.dataset.i];
    z.lv = Number(e.target.value); z.auto = false;
    e.target.style.setProperty("--v", z.lv + "%");
    card.querySelector(".pct").textContent = z.lv + "%";
    const p = card.querySelectorAll(".lt-info .m b")[2];
    if (p) p.textContent = fa(zonePower(z)) + " kW";
    card.querySelectorAll(".lt-mode button").forEach((b) => b.classList.toggle("active", b.dataset.m === "manual"));
    renderKpis();
  });

  $("ltOutdoor").addEventListener("click", (e) => {
    const row = e.target.closest(".lt-out-row");
    if (!row || e.target.dataset.act !== "out-toggle") return;
    const o = outdoor[row.dataset.i];
    o.on = !o.on; o.auto = false;
    renderOutdoor();
  });

  /* ---------- init ---------- */
  renderTabs(); renderScenarios(); renderZones(); renderOutdoor(); renderKpis();
})();
