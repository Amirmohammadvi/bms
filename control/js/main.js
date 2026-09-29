/* ============================================================
   Bank BMS - WinCC Unified Custom Web Control
   PLC test property: InstantPower (number)
   ============================================================ */

(function () {
  "use strict";

  function updateInstantPower(value) {
    const el = document.getElementById("instantPower");
    if (!el) return;

    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      el.textContent = numericValue.toFixed(1);
    } else {
      el.textContent = "--";
    }
  }

  function setProperty(data) {
    if (!data || !data.key) return;

    switch (data.key) {
      case "InstantPower":
        updateInstantPower(data.value);
        break;
    }
  }

  /*
   * WebCC connection.
   * WinCC Unified will provide the value of the InstantPower
   * contract property. That property can be connected to a PLC tag
   * from the Custom Web Control's Interfaces in TIA Portal.
   */
  WebCC.start(
    function (result) {
      if (result) {
        console.log("Bank BMS Custom Web Control connected successfully.");

        updateInstantPower(WebCC.Properties.InstantPower);

        WebCC.onPropertyChanged.subscribe(setProperty);
      } else {
        console.warn("Bank BMS Custom Web Control connection failed.");
        updateInstantPower(null);
      }
    },
    {
      methods: {},
      events: {},
      properties: {
        InstantPower: 0
      }
    },
    [],
    10000
  );

  window.BankBMS = {
    updateInstantPower: updateInstantPower
  };
})();

/* ---------- scale-to-fit 1920x1080 ---------- */
  const stage = document.getElementById('stage');
  function fitStage(){
    const scale = Math.min(window.innerWidth/1920, window.innerHeight/1080);
    stage.style.transform = `scale(${scale})`;
    stage.style.left = ((window.innerWidth - 1920*scale)/2)+'px';
    stage.style.top = ((window.innerHeight - 1080*scale)/2)+'px';
  }
  window.addEventListener('resize', fitStage);
  fitStage();

  /* ---------- clock ---------- */
  function tick(){
    const now = new Date();
    document.getElementById('clock').textContent = now.toLocaleTimeString('en-GB',{hour12:false});
    try{
      document.getElementById('jalaliDate').textContent =
        new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn',{year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
    }catch(e){
      document.getElementById('jalaliDate').textContent = now.toLocaleDateString('en-GB');
    }
  }
  tick(); setInterval(tick,1000);

  /* ---------- nav switching ---------- */
  const navItems = document.querySelectorAll('.sidebar .nav-item[data-screen]');
  const screens = {
    dashboard: document.getElementById('screen-dashboard'),
    floors: document.getElementById('screen-floors'),
    motorroom: document.getElementById('screen-motorroom'),
    power: document.getElementById('screen-power'),
    lighting: document.getElementById('screen-lighting'),
    fire: document.getElementById('screen-fire'),
    generic: document.getElementById('screen-generic')
  };
  const alarmCounts = { dashboard:5, floors:4, motorroom:2, power:1, hvac:3, lighting:0, fire:0, security:1, access:0, reports:0, settings:0 };

  navItems.forEach(item=>{
    item.addEventListener('click', ()=>{
      navItems.forEach(n=>n.classList.remove('active'));
      item.classList.add('active');
      const key = item.dataset.screen;
      Object.values(screens).forEach(s=>s.classList.remove('active'));

      if(key==='dashboard'||key==='floors'||key==='motorroom'||key==='power'||key==='lighting'||key==='fire'){
        screens[key].classList.add('active');
        document.getElementById('screenTitle').textContent = item.textContent.trim();
      } else {
        screens.generic.classList.add('active');
        document.getElementById('screenTitle').textContent = item.dataset.title;
        document.getElementById('ph-title').textContent = item.dataset.title;
        const icon = document.getElementById('ph-icon');
        icon.className = 'fa-solid ' + item.dataset.icon;
      }
      document.getElementById('alarmBadge').textContent = alarmCounts[key] ?? 0;
    });
  });

  /* ---------- floors data & render ---------- */
  const floorsData = {
    ground:{
      title:'همکف - شعبه بانک',
      rooms:[
        {name:'رئیس بانک', temp:23.2, hum:45, light:'روشن', occ:'۱ نفر'},
        {name:'معاون بانک', temp:23.2, hum:45, light:'روشن', occ:'—'},
        {name:'تسهیلات', temp:23.4, hum:42, light:'روشن', occ:'—'},
        {name:'باجه‌داری (۸ باجه)', temp:23.1, hum:44, light:'روشن', occ:'۵ نفر'},
      ],
      hasLightSlider:true,
      footer:[['دمای طبقه','23.2 °C'],['رطوبت','44%'],['روشنایی','78%'],['پنجره‌ها','۲ باز / ۱۰ بسته'],['تعداد افراد','۲۴ نفر'],['مصرف برق','12.6 kW'],['وضعیت','عادی']]
    },
    f1:{
      title:'نمای طبقه اول',
      rooms:[
        {name:'روابط عمومی و بازاریابی', temp:22.6, hum:44, light:'۱۰۰٪', occ:'۳ نفر', power:'1.9 kW'},
        {name:'حقوقی', temp:22.9, hum:44, light:'روشن', occ:'۲ نفر', power:'1.6 kW'},
        {name:'انفورماتیک (IT)', temp:21.8, hum:45, light:'روشن', occ:'—', power:'2.3 kW',
          alerts:['هشدار دمای بالا: طبیعی','وضعیت UPS: آنلاین','برق اضطراری: آماده','درب اتاق: بسته','سنسور دود: طبیعی','نشت آب: طبیعی']},
        {name:'کارشناس ساختمانی', temp:22.2, hum:44, light:'۱۰۰٪', occ:'۱ نفر', power:'1.2 kW'},
        {name:'سالن اجتماعات', temp:22.3, hum:44, light:'روشن', occ:'۰ نفر', power:'—', co2:'620 ppm'},
      ],
      scenarios:['جلسه','ارائه','نظافت','خاموش'], activeScenario:'جلسه',
      footer:[['میانگین دما','22.9 °C'],['میانگین رطوبت','44%'],['مصرف برق طبقه','11.2 kW']]
    },
    f2:{
      title:'نمای طبقه - طبقه دوم',
      rooms:[
        {name:'معاون منطقه', temp:23.4, hum:45, light:'روشن', occ:'۲ نفر', power:'2.4 kW'},
        {name:'بازرس منطقه', temp:22.8, hum:42, light:'روشن', occ:'۱ نفر', power:'1.9 kW'},
        {name:'اعتبارات و کارشناسان', temp:22.6, hum:44, light:'روشن', occ:'۸ نفر', power:'3.7 kW'},
        {name:'خدمات اداری و تدارکات', temp:23.1, hum:45, light:'روشن', occ:'۳ نفر', power:'2.2 kW'},
        {name:'حسابداری', temp:22.9, hum:43, light:'روشن', occ:'۴ نفر', power:'2.6 kW'},
        {name:'نمازخانه', temp:23.0, hum:46, light:'روشن', occ:'—'},
      ],
      footer:[['میانگین دما','22.9 °C'],['میانگین رطوبت','44%'],['مصرف برق طبقه','15.6 kW'],['تعداد افراد','۱۸ نفر'],['وضعیت کلی','عادی']]
    },
    f3:{
      title:'نمای طبقه - طبقه سوم',
      rooms:[
        {name:'مدیر منطقه', temp:23.2, hum:45, light:'روشن', occ:'۲ نفر', power:'2.8 kW'},
        {name:'حوزه حراست', temp:22.8, hum:42, light:'روشن', occ:'۳ نفر', power:'2.1 kW'},
        {name:'سالن اجتماعات', temp:22.5, hum:48, light:'—', occ:'۳۰ نفر', co2:'550 ppm'},
      ],
      scenarios:['جلسه','ارائه','نظافت','خاموش'], activeScenario:'جلسه',
      footer:[['میانگین دما','23.0 °C'],['میانگین رطوبت','45%'],['مصرف برق طبقه','17.2 kW'],['تعداد افراد','۳۵ نفر'],['وضعیت کلی','عادی']]
    }
  };

  function roomCardHTML(r){
    let metrics = `
      <div class="m"><i class="fa-solid fa-temperature-half"></i>دما<b>${r.temp}°C</b></div>
      <div class="m"><i class="fa-solid fa-droplet"></i>رطوبت<b>${r.hum}%</b></div>
      <div class="m"><i class="fa-solid fa-lightbulb"></i>روشنایی<b>${r.light}</b></div>
      <div class="m"><i class="fa-solid fa-user-group"></i>حضور<b>${r.occ}</b></div>`;
    if(r.power) metrics += `<div class="m"><i class="fa-solid fa-bolt"></i>مصرف برق<b>${r.power}</b></div>`;
    if(r.co2) metrics += `<div class="m"><i class="fa-solid fa-wind"></i>CO₂<b>${r.co2}</b></div>`;
    let alertsHTML = '';
    if(r.alerts){
      alertsHTML = `<div class="alerts">` + r.alerts.map(a=>{
        const parts = a.split(':');
        return `<div class="a"><span>${parts[0]}</span><b style="color:var(--good)">${parts[1]||''}</b></div>`;
      }).join('') + `</div>`;
    }
    return `<div class="room-card"><h3>${r.name}</h3><div class="room-metrics">${metrics}</div>${alertsHTML}</div>`;
  }

  function renderFloor(key){
    const data = floorsData[key];
    document.getElementById('floorTitle').textContent = data.title;
    document.getElementById('roomGrid').innerHTML = data.rooms.map(roomCardHTML).join('');

    document.getElementById('floorFooter').innerHTML = data.footer.map(([lbl,val])=>
      `<div class="cell"><div class="lbl">${lbl}</div><div class="val">${val}</div></div>`
    ).join('');

    const slot = document.getElementById('scenarioSlot');
    if(data.scenarios){
      slot.innerHTML = `<div class="scenario-panel" style="margin-bottom:16px;">
        <span class="lbl">سناریوی روشنایی:</span>
        ${data.scenarios.map(s=>`<div class="scenario-btn ${s===data.activeScenario?'active':''}" data-s="${s}">${s}</div>`).join('')}
      </div>`;
      slot.querySelectorAll('.scenario-btn').forEach(btn=>{
        btn.addEventListener('click',()=>{
          slot.querySelectorAll('.scenario-btn').forEach(b=>b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
    } else if(data.hasLightSlider){
      slot.innerHTML = `<div class="scenario-panel" style="margin-bottom:16px;">
        <span class="lbl">حالت روشنایی طبقه:</span>
        <div class="scenario-btn active" data-s="عادی">عادی</div>
        <div class="scenario-btn" data-s="جلسه">جلسه</div>
        <div class="scenario-btn" data-s="نظافت">نظافت</div>
        <div class="scenario-btn" data-s="خاموش">خاموش</div>
        <div class="light-slider">میزان نور فعلی <input type="range" min="0" max="100" value="73"> <span id="lightPct">73%</span></div>
      </div>`;
      slot.querySelectorAll('.scenario-btn').forEach(btn=>{
        btn.addEventListener('click',()=>{
          slot.querySelectorAll('.scenario-btn').forEach(b=>b.classList.remove('active'));
          btn.classList.add('active');
        });
      });
      const range = slot.querySelector('input[type=range]');
      range.addEventListener('input', ()=>{ document.getElementById('lightPct').textContent = range.value+'%'; });
    } else {
      slot.innerHTML = '';
    }
  }

  document.querySelectorAll('.floor-tab').forEach(tab=>{
    tab.addEventListener('click', ()=>{
      document.querySelectorAll('.floor-tab').forEach(t=>t.classList.remove('active'));
      tab.classList.add('active');
      renderFloor(tab.dataset.floor);
    });
  });
  renderFloor('ground');
