/* ============================================================
   Fire alarm screen - demo mode (بدون اتصال WinCC)
   ============================================================ */
(function () {
  "use strict";

  const TYPES = {
    s: { label: "دود",      icon: "fa-smog" },
    h: { label: "حرارت",     icon: "fa-temperature-arrow-up" },
    m: { label: "شستی",      icon: "fa-hand" },
    f: { label: "جریان آب",  icon: "fa-droplet" },
  };
  const STATE_FA = { ok: "عادی", alarm: "آلارم", fault: "خطا", off: "غیرفعال" };

  // zone(name, دود, حرارت, شستی, جریان آب)
  const zone = (n, s = 0, h = 0, m = 0, f = 0) => {
    const dets = [];
    [["s", s], ["h", h], ["m", m], ["f", f]].forEach(([t, c]) => {
      for (let i = 1; i <= c; i++) dets.push({ t, i, s: "ok" });
    });
    return { n, dets };
  };

  const data = {
    parking: { label: "منفی ۱ (پارکینگ)", zones: [
      zone("پارکینگ بخش A", 4, 0, 1),
      zone("پارکینگ بخش B", 4, 0, 1),
      zone("موتورخانه", 2, 2, 1, 1),
      zone("اتاق برق و UPS", 2, 1, 1),
    ]},
    ground: { label: "همکف (شعبه)", zones: [
      zone("تالار باجه‌ها", 6, 0, 2),
      zone("خزانه", 2, 1, 1),
      zone("رئیس و معاون", 2, 0, 0),
      zone("ورودی و خودپرداز", 2, 0, 1),
      zone("اتاق سرور", 2, 2, 1),
      zone("راهروها و پله‌ها", 4, 0, 2),
    ]},
    f1: { label: "طبقه اول", zones: [
      zone("روابط عمومی و حقوقی", 4, 0, 1),
      zone("انفورماتیک (IT)", 3, 1, 1),
      zone("سالن اجتماعات", 3, 0, 1),
      zone("راهروها و پله‌ها", 3, 0, 2),
    ]},
    f2: { label: "طبقه دوم", zones: [
      zone("معاون و بازرس منطقه", 3, 0, 1),
      zone("اعتبارات و کارشناسان", 5, 0, 1),
      zone("خدمات اداری و حسابداری", 4, 0, 1),
      zone("نمازخانه", 1, 0, 0),
      zone("راهروها و پله‌ها", 3, 0, 2),
    ]},
    f3: { label: "طبقه سوم", zones: [
      zone("مدیر منطقه", 2, 0, 1),
      zone("حوزه حراست", 3, 0, 1),
      zone("سالن اجتماعات", 4, 0, 1),
      zone("راهروها و پله‌ها", 3, 0, 2),
    ]},
  };

  // چند وضعیت اولیه برای نمایش
  data.f2.zones[2].dets[1].s = "fault";
  data.f1.zones[2].dets[0].s = "off";

  let floor = "ground";
  let sirens = "off";          // off | on | silenced
  let evac = false;
  let lastAlarm = null;        // {zone, floor}
  const log = [];

  const $ = (id) => document.getElementById(id);
  const now = () => new Date().toLocaleTimeString("en-GB", { hour12: false });
  const allDets = () => Object.values(data).flatMap((f) => f.zones.flatMap((z) => z.dets));
  const hasAlarm = () => allDets().some((d) => d.s === "alarm");

  function zoneState(z) {
    const s = z.dets.map((d) => d.s);
    if (s.includes("alarm")) return "alarm";
    if (s.includes("fault")) return "fault";
    if (s.length && s.every((x) => x === "off")) return "off";
    return "ok";
  }
  function floorState(f) {
    const st = data[f].zones.map(zoneState);
    return st.includes("alarm") ? "alarm" : st.includes("fault") ? "fault" : "ok";
  }

  function addLog(txt, lvl) {
    log.unshift({ t: now(), txt, lvl });
    if (log.length > 30) log.pop();
  }

  /* ---------- render ---------- */
  function renderTabs() {
    $("frTabs").innerHTML = Object.entries(data).map(([k, f]) =>
      `<button class="fr-tab ${k === floor ? "active" : ""}" data-floor="${k}">${f.label}<span class="tdot ${floorState(k)}"></span></button>`
    ).join("");
  }

  function renderZones() {
    $("frZones").innerHTML = data[floor].zones.map((z, zi) => {
      const st = zoneState(z);
      const pill = { ok: "good", alarm: "bad", fault: "warn", off: "" }[st];
      return `
      <div class="fr-zone st-${st}">
        <div class="fr-zone-head">
          <span class="fr-zone-name">${z.n}</span>
          <span class="pill ${pill}" ${st === "off" ? 'style="background:#eef1f7;color:#8b97b8"' : ""}>${STATE_FA[st]}</span>
        </div>
        <div class="fr-dets">
          ${z.dets.map((d, di) => `
            <button class="fr-det ${d.s}" data-z="${zi}" data-d="${di}" title="${TYPES[d.t].label} ${d.i} — ${STATE_FA[d.s]}">
              <i class="fa-solid ${TYPES[d.t].icon}"></i>${d.t.toUpperCase()}${d.i}
            </button>`).join("")}
        </div>
      </div>`;
    }).join("");
  }

  function renderKpis() {
    const ds = allDets();
    $("frKpiTotal").textContent = ds.length;
    $("frKpiAlarm").textContent = ds.filter((d) => d.s === "alarm").length;
    $("frKpiFault").textContent = ds.filter((d) => d.s === "fault").length;
    $("frKpiOff").textContent = ds.filter((d) => d.s === "off").length;
    const el = $("frKpiSiren");
    el.textContent = { off: "خاموش", on: "فعال", silenced: "سکوت شده" }[sirens];
    el.style.color = sirens === "on" ? "var(--bad)" : sirens === "silenced" ? "var(--warn)" : "var(--good)";
  }

  function renderBanner() {
    const b = $("frBanner"), ds = allDets();
    let cls = "normal", icon = "fa-shield-halved", txt = "سیستم اعلام حریق در وضعیت عادی است", sub = "";
    if (hasAlarm() || evac) {
      cls = sirens === "silenced" ? "silenced" : "alarm";
      icon = "fa-fire";
      txt = evac && !hasAlarm() ? "تخلیه اضطراری فعال است" : "آلارم حریق!";
      if (lastAlarm && hasAlarm()) sub = `${lastAlarm.zone} — ${data[lastAlarm.floor].label}`;
    } else if (ds.some((d) => d.s === "fault")) {
      cls = "fault"; icon = "fa-triangle-exclamation";
      txt = "سیستم در وضعیت خطا (Trouble) است";
      sub = `${ds.filter((d) => d.s === "fault").length} دتکتور نیازمند بازدید`;
    }
    b.className = "fr-banner " + cls;
    $("frBannerIcon").className = "fa-solid " + icon;
    $("frBannerText").textContent = txt;
    $("frBannerSub").textContent = sub;
  }

  function renderStatus() {
    const al = hasAlarm() || evac;
    const rows = [
      ["پمپ اصلی آتش‌نشانی", "آماده به کار", "good"],
      ["جاکی پمپ", "آماده به کار", "good"],
      ["فشار خط اطفاء", "7.2 Bar", "good"],
      ["سطح مخزن آب آتش‌نشانی", "92%", "good"],
      ["آسانسورها", al ? "بازگشت به همکف" : "عادی", al ? "bad" : "good"],
      ["دمپرهای هوا (HVAC)", al ? "بسته" : "باز", al ? "bad" : "good"],
      ["درب‌های ضدحریق", al ? "آزاد شد" : "نگهدارنده فعال", al ? "bad" : "good"],
      ["منبع تغذیه پنل (باتری)", "100% — سالم", "good"],
    ];
    $("frStatus").innerHTML = rows.map(([n, v, c]) =>
      `<div class="floor-row"><span class="name" style="width:auto">${n}</span><span class="pill ${c}">${v}</span></div>`).join("");
  }

  function renderLog() {
    $("frLog").innerHTML = log.length
      ? log.slice(0, 8).map((l) => `<tr><td class="time">${l.t}</td><td class="lvl-${l.lvl}">${l.txt}</td></tr>`).join("")
      : `<tr><td style="color:var(--text-muted)">رویدادی ثبت نشده است.</td></tr>`;
  }

  function renderAll() { renderTabs(); renderZones(); renderKpis(); renderBanner(); renderStatus(); renderLog(); }

  /* ---------- actions ---------- */
  // دکمه‌های حساس: اولین کلیک «تایید؟»، کلیک دوم اجرا
  function confirmable(btn, fn) {
    btn.addEventListener("click", () => {
      if (btn.classList.contains("armed")) {
        clearTimeout(btn._t); btn.classList.remove("armed");
        btn.lastChild.textContent = " " + btn.dataset.label;
        fn();
      } else {
        btn.dataset.label = btn.textContent.trim();
        btn.classList.add("armed");
        btn.lastChild.textContent = " برای تایید دوباره کلیک کنید";
        btn._t = setTimeout(() => {
          btn.classList.remove("armed");
          btn.lastChild.textContent = " " + btn.dataset.label;
        }, 3000);
      }
    });
  }

  $("frSilence").addEventListener("click", () => {
    if (sirens !== "on") return;
    sirens = "silenced"; addLog("آژیرها توسط اپراتور خاموش شدند", "info"); renderAll();
  });

  confirmable($("frReset"), () => {
    allDets().forEach((d) => { if (d.s === "alarm") d.s = "ok"; });
    sirens = "off"; evac = false; lastAlarm = null;
    addLog("بازنشانی سیستم توسط اپراتور", "info"); renderAll();
  });

  $("frTest").addEventListener("click", () => {
    addLog("تست سیستم اعلام حریق انجام شد", "info"); renderLog();
  });

  confirmable($("frEvac"), () => {
    evac = true; sirens = "on";
    addLog("تخلیه اضطراری به صورت دستی فعال شد", "alarm"); renderAll();
  });

  $("frSim").addEventListener("click", () => {
    const zs = data[floor].zones;
    const cands = zs.flatMap((z, zi) => z.dets.map((d, di) => ({ z, d, zi, di }))).filter((x) => x.d.t === "s" && x.d.s === "ok");
    if (!cands.length) return;
    const c = cands[Math.floor(Math.random() * cands.length)];
    c.d.s = "alarm"; sirens = "on"; lastAlarm = { zone: c.z.n, floor };
    addLog(`آلارم دتکتور دود ${c.d.i} — ${c.z.n} (${data[floor].label})`, "alarm"); renderAll();
  });

  $("frTabs").addEventListener("click", (e) => {
    const b = e.target.closest(".fr-tab"); if (!b) return;
    floor = b.dataset.floor; renderTabs(); renderZones();
  });

  // کلیک روی دتکتور: غیرفعال / فعال (Bypass)
  $("frZones").addEventListener("click", (e) => {
    const b = e.target.closest(".fr-det"); if (!b) return;
    const z = data[floor].zones[b.dataset.z], d = z.dets[b.dataset.d];
    if (d.s === "alarm") return;
    d.s = d.s === "off" ? "ok" : "off";
    addLog(`${TYPES[d.t].label} ${d.i} — ${z.n}: ${d.s === "off" ? "غیرفعال شد" : "فعال شد"}`, "fault");
    renderAll();
  });

  /* ---------- init ---------- */
  addLog("خطای دتکتور دود ۲ — خدمات اداری و حسابداری", "fault");
  addLog("دتکتور دود ۱ — سالن اجتماعات (طبقه اول) غیرفعال است", "fault");
  renderAll();
})();
