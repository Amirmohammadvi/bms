/* ============================================================
   HVAC screen - demo mode (بدون اتصال WinCC)
   ============================================================ */
(function () {
  "use strict";

  const data = {
    ground: {
      label: "همکف (شعبه)",
      ahus: [
        { n: "هواساز همکف - ۱", on: true, mode: "cool", supply: 16.5, ret: 23.0, fan: 62, filter: 74, kw: 4.1 },
        { n: "هواساز همکف - ۲", on: true, mode: "cool", supply: 16.8, ret: 22.6, fan: 58, filter: 68, kw: 3.8 },
      ],
      zones: [
        { n: "تالار باجه‌ها", t: 22.6, sp: 22, mode: "cool" },
        { n: "خزانه",         t: 21.4, sp: 21, mode: "cool" },
        { n: "رئیس بانک",     t: 23.1, sp: 22, mode: "cool" },
        { n: "معاون بانک",    t: 22.9, sp: 22, mode: "cool" },
        { n: "تسهیلات",       t: 23.4, sp: 22, mode: "cool" },
        { n: "ورودی/خودپرداز", t: 24.2, sp: 23, mode: "cool" },
      ],
    },
    f1: {
      label: "طبقه اول",
      ahus: [
        { n: "هواساز طبقه ۱", on: true, mode: "cool", supply: 16.9, ret: 22.9, fan: 55, filter: 82, kw: 3.6 },
      ],
      zones: [
        { n: "روابط عمومی",     t: 22.6, sp: 22, mode: "cool" },
        { n: "حقوقی",           t: 22.9, sp: 22, mode: "cool" },
        { n: "انفورماتیک (IT)", t: 21.8, sp: 20, mode: "cool" },
        { n: "کارشناس ساختمانی", t: 22.2, sp: 22, mode: "cool" },
        { n: "سالن اجتماعات",   t: 22.3, sp: 22, mode: "off" },
      ],
    },
    f2: {
      label: "طبقه دوم",
      ahus: [
        { n: "هواساز طبقه ۲", on: true, mode: "cool", supply: 17.1, ret: 23.0, fan: 60, filter: 55, kw: 3.9 },
      ],
      zones: [
        { n: "معاون منطقه",   t: 23.4, sp: 22, mode: "cool" },
        { n: "بازرس منطقه",   t: 22.8, sp: 22, mode: "cool" },
        { n: "اعتبارات",      t: 22.6, sp: 22, mode: "cool" },
        { n: "خدمات اداری",   t: 23.1, sp: 22, mode: "cool" },
        { n: "حسابداری",      t: 22.9, sp: 22, mode: "cool" },
        { n: "نمازخانه",      t: 23.0, sp: 23, mode: "fan" },
      ],
    },
    f3: {
      label: "طبقه سوم",
      ahus: [
        { n: "هواساز طبقه ۳", on: false, mode: "off", supply: 0, ret: 0, fan: 0, filter: 48, kw: 0 },
      ],
      zones: [
        { n: "مدیر منطقه",    t: 23.2, sp: 22, mode: "cool" },
        { n: "حوزه حراست",    t: 22.8, sp: 22, mode: "cool" },
        { n: "سالن اجتماعات", t: 24.5, sp: 22, mode: "cool" },
      ],
    },
  };

  const chillers = [
    { n: "چیلر ۱", on: true,  temp: 6.8,  load: 64, kw: 42 },
    { n: "چیلر ۲", on: false, temp: 0,    load: 0,  kw: 0 },
    { n: "پمپ آب سرد ۱", on: true,  flow: 38 },
    { n: "پمپ آب سرد ۲", on: false, flow: 0 },
  ];

  let floor = "ground";
  let trendZoneIdx = 0;

  const $ = (id) => document.getElementById(id);
  const fa = (n, d = 1) => Number(n).toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });

  /* ---------- render ---------- */
  function renderTabs() {
    $("hvTabs").innerHTML = Object.entries(data).map(([k, f]) =>
      `<button class="hv-tab ${k === floor ? "active" : ""}" data-floor="${k}">${f.label}</button>`).join("");
  }

  function renderAhus() {
    $("hvAhuFloorLabel").textContent = data[floor].label;
    $("hvAhus").innerHTML = data[floor].ahus.map((a, i) => {
      const st = !a.on ? "off" : a.filter < 20 ? "fault" : "on";
      return `
      <div class="hv-ahu ${st === "off" ? "off" : st === "fault" ? "fault" : ""}" data-i="${i}">
        <div class="hv-ahu-head">
          <div class="hv-ahu-name"><i class="fa-solid fa-fan hv-fan-icon ${a.on ? "spin" : ""}"></i>${a.n}</div>
          <span class="pill ${a.on ? "good" : "bad"}">${a.on ? "روشن" : "خاموش"}</span>
        </div>
        <div class="hv-ahu-grid">
          <div class="row">دمای رفت <b>${a.on ? fa(a.supply) + "°C" : "—"}</b></div>
          <div class="row">دمای برگشت <b>${a.on ? fa(a.ret) + "°C" : "—"}</b></div>
          <div class="row">سرعت فن <b>${a.fan}%</b></div>
          <div class="row">فیلتر <b style="${a.filter < 30 ? "color:var(--warn)" : ""}">${a.filter}%</b></div>
          <div class="row">توان مصرفی <b>${fa(a.kw)} kW</b></div>
          <div class="row">حالت <b>${{ cool: "سرمایش", heat: "گرمایش", off: "خاموش" }[a.mode]}</b></div>
        </div>
        <div class="hv-ahu-actions">
          <button class="hv-btn ${a.on ? "off" : "on"}" data-act="ahu-toggle">${a.on ? "خاموش کردن" : "روشن کردن"}</button>
        </div>
      </div>`;
    }).join("");
  }

  function renderZones() {
    $("hvZoneFloorLabel").textContent = data[floor].label;
    $("hvZones").innerHTML = data[floor].zones.map((z, i) => {
      const diff = z.t - z.sp;
      const cls = diff > 0.8 ? "hot" : diff < -0.8 ? "cold" : "";
      return `
      <div class="hv-zone" data-i="${i}">
        <div class="hv-zone-name">${z.n}</div>
        <div class="hv-zone-temp"><span class="v ${cls}">${fa(z.t)}</span><small>°C</small></div>
        <div class="hv-zone-sp">ست‌پوینت: ${fa(z.sp)}°C</div>
        <div class="hv-sp-ctrl">
          <button class="hv-sp-btn" data-act="sp-down">−</button>
          <span class="hv-sp-val">${fa(z.sp)}°C</span>
          <button class="hv-sp-btn" data-act="sp-up">+</button>
        </div>
        <div class="hv-zone-mode">
          ${["cool", "heat", "fan", "off"].map((m) =>
            `<button class="hv-mode-btn ${z.mode === m ? "active " + m : ""}" data-act="mode" data-m="${m}">
              ${{ cool: "سرمایش", heat: "گرمایش", fan: "فن", off: "خاموش" }[m]}
            </button>`).join("")}
        </div>
      </div>`;
    }).join("");
  }

  function renderChillers() {
    $("hvChillers").innerHTML = chillers.map((c, i) => `
      <div class="hv-chiller-row">
        <span class="hv-chiller-col">
          <span class="n"><span class="status-dot ${c.on ? "dot-good" : "dot-bad"}"></span>${c.n}</span>
          <span class="stats">${"load" in c ? `بار: ${c.load}% · ${fa(c.kw)} kW · ${fa(c.temp)}°C` : `دبی: ${c.flow} m³/h`}</span>
        </span>
        <button class="hv-btn ${c.on ? "off" : "on"}" data-i="${i}" data-act="chiller-toggle">${c.on ? "خاموش" : "روشن"}</button>
      </div>`).join("");
  }

  function renderKpis() {
    const allZones = Object.values(data).flatMap((f) => f.zones);
    const allAhus = Object.values(data).flatMap((f) => f.ahus);
    const avgTemp = allZones.reduce((s, z) => s + z.t, 0) / allZones.length;
    const dev = allZones.filter((z) => Math.abs(z.t - z.sp) > 0.8).length;
    const power = allAhus.reduce((s, a) => s + a.kw, 0) + chillers.reduce((s, c) => s + (c.kw || 0), 0);
    $("hvKpiAhuOn").textContent = allAhus.filter((a) => a.on).length;
    $("hvKpiAhuTotal").textContent = "/ " + allAhus.length;
    $("hvKpiAvgTemp").textContent = fa(avgTemp);
    $("hvKpiDev").textContent = dev;
    $("hvKpiChiller").textContent = chillers.filter((c) => c.on && "load" in c).length;
    $("hvKpiPower").textContent = fa(power);
  }

  function renderTrend() {
    const z = data[floor].zones[trendZoneIdx] || data[floor].zones[0];
    $("hvTrendZoneLabel").textContent = z ? z.n : "";
    if (!z) return;

    // تولید یک روند دمای دمو حول دمای فعلی و ست‌پوینت
    const pts = 12;
    const tempPts = [];
    const spPts = [];
    for (let i = 0; i < pts; i++) {
      const wobble = Math.sin(i / 1.7) * 0.5 + (Math.random() - 0.5) * 0.2;
      tempPts.push(z.sp + (z.t - z.sp) * (i / (pts - 1)) + wobble);
      spPts.push(z.sp);
    }
    const w = 300, h = 130, pad = 10;
    const min = Math.min(...tempPts, ...spPts) - 1;
    const max = Math.max(...tempPts, ...spPts) + 1;
    const x = (i) => pad + (i / (pts - 1)) * (w - 2 * pad);
    const y = (v) => h - pad - ((v - min) / (max - min || 1)) * (h - 2 * pad);
    const toPath = (arr) => arr.map((v, i) => `${x(i)},${y(v)}`).join(" ");

    $("hvTrendSvg").innerHTML = `
      <polyline fill="none" stroke="#e0932e" stroke-width="2" stroke-dasharray="4 4" points="${toPath(spPts)}"/>
      <polyline fill="none" stroke="#1f7ae0" stroke-width="2.5" points="${toPath(tempPts)}"/>
      <circle cx="${x(pts - 1)}" cy="${y(tempPts[pts - 1])}" r="3.5" fill="#1f7ae0"/>
    `;
  }

  function renderAll() { renderTabs(); renderAhus(); renderZones(); renderChillers(); renderKpis(); renderTrend(); }

  /* ---------- events ---------- */
  $("hvTabs").addEventListener("click", (e) => {
    const b = e.target.closest(".hv-tab"); if (!b) return;
    floor = b.dataset.floor; trendZoneIdx = 0;
    renderTabs(); renderAhus(); renderZones(); renderTrend();
  });

  $("hvAhus").addEventListener("click", (e) => {
    const card = e.target.closest(".hv-ahu"); if (!card) return;
    if (e.target.dataset.act !== "ahu-toggle") return;
    const a = data[floor].ahus[card.dataset.i];
    a.on = !a.on;
    if (!a.on) { a.mode = "off"; a.fan = 0; a.supply = 0; a.ret = 0; a.kw = 0; }
    else { a.mode = "cool"; a.fan = 55; a.supply = 17; a.ret = 23; a.kw = 3.5; }
    renderAhus(); renderKpis();
  });

  $("hvZones").addEventListener("click", (e) => {
    const card = e.target.closest(".hv-zone"); if (!card) return;
    const z = data[floor].zones[card.dataset.i];
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (act === "sp-up") z.sp = Math.min(28, z.sp + 0.5);
    else if (act === "sp-down") z.sp = Math.max(16, z.sp - 0.5);
    else if (act === "mode") z.mode = e.target.dataset.m;
    else {
      trendZoneIdx = Number(card.dataset.i);
      renderTrend();
      return;
    }
    renderZones(); renderKpis();
    if (Number(card.dataset.i) === trendZoneIdx) renderTrend();
  });

  $("hvChillers").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act='chiller-toggle']"); if (!b) return;
    const c = chillers[b.dataset.i];
    c.on = !c.on;
    if ("load" in c) { c.load = c.on ? 55 : 0; c.kw = c.on ? 38 : 0; c.temp = c.on ? 7 : 0; }
    else { c.flow = c.on ? 35 : 0; }
    renderChillers(); renderKpis();
  });

  /* ---------- init ---------- */
  renderAll();
  setInterval(renderTrend, 6000); // به‌روزرسانی نمایشی نمودار روند
})();
