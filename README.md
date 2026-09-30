# Bank BMS — WinCC Unified Custom Web Control

> **Status:** 🚧 Work in progress — screens, styling and PLC/TIA Portal bindings are still being added and refined.

A browser-based Building Management System (BMS) dashboard for a bank building, built as a **Custom Web Control** for **Siemens SIMATIC WinCC Unified**, running on top of a **TIA Portal** PLC project. The UI is fully static HTML/CSS/JS so it can be developed and previewed in any browser, then embedded into WinCC Unified and wired to live PLC tags.

Parts of this project (layout ideas, screens, styling and demo logic) were drafted with the help of AI assistants and then reviewed/adapted by the maintainer — this is an ongoing, actively evolving project, not a finished product.

## Table of contents
- [Overview](#overview)
- [Screens](#screens)
- [Project structure](#project-structure)
- [Connecting to TIA Portal / WinCC Unified](#connecting-to-tia-portal--wincc-unified)
- [Running it standalone (browser preview)](#running-it-standalone-browser-preview)
- [Roadmap](#roadmap)
- [License](#license)

## Overview
The control renders a 1920×1080 "stage" with a top status bar, a left navigation sidebar (RTL, Persian UI) and a content area that swaps between screens: dashboard KPIs, per-floor room monitoring, the motor (mechanical) room, HVAC, lighting, fire alarm, security/user management, and more. Live values (e.g. instantaneous power) are bound to PLC tags through Siemens' `webcc.min.js` bridge; everything else currently runs on demo/mock data until it is connected to real tags.

## Screens
| Screen | Status |
|---|---|
| Dashboard (KPIs, floor overview, charts, alarms) | ✅ implemented (demo data + 1 live tag) |
| Floors (room-by-room monitoring, scenarios) | ✅ implemented (demo data) |
| Motor room (chiller/pump schematic, equipment tiles) | 🚧 in progress (custom SVG diagram, click-to-inspect popups) |
| HVAC (AHUs, zone setpoints, chillers, trends) | ✅ implemented (demo data) |
| Lighting (zones, scenarios, dimmers, schedules) | ✅ implemented (demo data) |
| Fire alarm (zones, detectors, central controls, log) | ✅ implemented (demo data) |
| Security / user management (users, roles, login log) | ✅ implemented (demo data) |
| Login screen | ✅ implemented (UI only, no real auth yet) |
| Power, access control, reports, settings | ⏳ placeholder screens |

## Project structure
```
.
├── index.html          # main HMI markup, all screens live inside <main class="content">
├── styles.css           # all styling (design tokens in :root, one section per screen)
├── main.js              # navigation, clock/date, WebCC bootstrap, per-screen demo logic
├── screen_min.js         # window chrome helpers (fullscreen, close) used by WinCC
├── webcc_min.js          # Siemens WebCC bridge (do not modify)
├── load-svg.js          # loads the motor-room SVG schematic into the page
└── images/
    └── hmi-final.svg     # motor room schematic (linked, work in progress)
```
Each new screen (lighting, fire, HVAC, security, …) is authored as three small, self-contained pieces — an HTML `<section>`, a CSS block and a JS module — that get merged into `index.html` / `styles.css` / their own `<script>` tag, keeping the codebase easy to review section by section.

## Connecting to TIA Portal / WinCC Unified
This project is built as a **WinCC Unified Custom Web Control**, so it is added to a TIA Portal project rather than hosted as a normal website:

1. In **TIA Portal**, add a new **HTML-type Custom Web Control** and point it at this folder (or a zipped/uploaded copy of it).
2. Define the control's **interface** (properties / events / methods) in TIA Portal — e.g. the `InstantPower` numeric property already wired up in `main.js`.
3. Include Siemens' bridge script (`webcc_min.js`) and call `WebCC.start(...)`, declaring the same properties/events/methods as the TIA Portal interface. See the existing example in `main.js`:
   ```js
   WebCC.start(callback, {
     methods: {},
     events: {},
     properties: { InstantPower: 0 }
   }, [], 10000);
   ```
4. Map each declared property to a **PLC tag** inside the Custom Web Control's interface configuration in TIA Portal.
5. Place the Custom Web Control on a WinCC Unified screen; at runtime, WinCC feeds live tag values into the properties, and `WebCC.onPropertyChanged` pushes updates into the UI.
6. Repeat step 2–4 for every additional live value (temperatures, statuses, alarms, setpoints, user actions, etc.) as each screen moves from demo data to live tags.

Until each screen's tags are defined, its data intentionally stays as static/demo JavaScript objects so the visual design and interactions can be reviewed independently of the PLC program.

## Running it standalone (browser preview)
Because this is meant to run inside WinCC Unified, `WebCC.start()` will fail gracefully in a plain browser (no PLC/container present) — the UI still renders and all demo screens work normally. Just open `index.html` in a browser, or serve the folder with any static file server, to preview and iterate on the design.

## Roadmap
- Finish the motor room SVG schematic and add click-to-inspect popups for each pump/piece of equipment.
- Replace remaining placeholder screens (power, access control, reports, settings).
- Wire up more screens to real PLC tags/events as the TIA Portal program is developed.
- Add real authentication and role-based access once the backend/PLC side supports it.

## License
Not yet decided — add a license file before treating this as open source.

---

<div dir="rtl">

# Bank BMS — کنترل وب سفارشی WinCC Unified

> **وضعیت:** 🚧 در حال پیشرفت — صفحات، استایل‌ها و اتصال به تگ‌های PLC/TIA Portal همچنان در حال اضافه و بهبود هستند.

یک داشبورد مدیریت هوشمند ساختمان (BMS) تحت وب برای یک ساختمان بانکی، که به‌صورت **Custom Web Control** برای **Siemens SIMATIC WinCC Unified** ساخته شده و روی یک پروژه‌ی PLC در **TIA Portal** اجرا می‌شود. رابط کاربری به‌طور کامل HTML/CSS/JS استاتیک است تا بتوان آن را در هر مرورگری توسعه و پیش‌نمایش داد، سپس در WinCC Unified جاسازی و به تگ‌های زنده‌ی PLC وصل کرد.

بخش‌هایی از این پروژه (ایده‌های طراحی، صفحات، استایل‌دهی و منطق نمایشی) با کمک ابزارهای هوش مصنوعی پیش‌نویس شده و سپس توسط نگهدارنده‌ی پروژه بازبینی و تطبیق داده شده‌اند؛ این یک پروژه‌ی در حال تکامل و پیوسته است، نه یک محصول نهایی.

## فهرست مطالب
- [معرفی](#معرفی)
- [صفحات](#صفحات)
- [ساختار پروژه](#ساختار-پروژه)
- [اتصال به TIA Portal و WinCC Unified](#اتصال-به-tia-portal-و-wincc-unified)
- [اجرای مستقل (پیش‌نمایش در مرورگر)](#اجرای-مستقل-پیش‌نمایش-در-مرورگر)
- [نقشه‌ی راه](#نقشه‌ی-راه)
- [مجوز](#مجوز)

## معرفی
این کنترل یک «صحنه» با رزولوشن ۱۹۲۰×۱۰۸۰ رندر می‌کند که شامل نوار وضعیت بالا، منوی ناوبری سمت راست (راست‌به‌چپ، رابط فارسی) و یک ناحیه‌ی محتوا است که بین صفحات مختلف جابه‌جا می‌شود: شاخص‌های کلیدی داشبورد، پایش اتاق‌به‌اتاق طبقات، موتورخانه، HVAC، روشنایی، اعلام حریق، مدیریت امنیت/کاربران و موارد دیگر. مقادیر زنده (مثلاً مصرف لحظه‌ای برق) از طریق پل ارتباطی `webcc.min.js` زیمنس به تگ‌های PLC متصل می‌شوند؛ تا زمان اتصال کامل، بقیه‌ی داده‌ها به‌صورت نمایشی (Demo) هستند.

## صفحات
| صفحه | وضعیت |
|---|---|
| داشبورد (KPIها، نمای طبقات، نمودارها، هشدارها) | ✅ پیاده‌سازی شده (داده‌ی دمو + یک تگ زنده) |
| نمای طبقات (پایش اتاق‌به‌اتاق، سناریوها) | ✅ پیاده‌سازی شده (داده‌ی دمو) |
| موتورخانه (شماتیک چیلر/پمپ، تجهیزات) | 🚧 در حال انجام (شماتیک SVG اختصاصی، پاپ‌آپ با کلیک روی هر تجهیز) |
| HVAC (هواسازها، ست‌پوینت مناطق، چیلرها، روند) | ✅ پیاده‌سازی شده (داده‌ی دمو) |
| روشنایی (مناطق، سناریوها، دیمر، زمان‌بندی) | ✅ پیاده‌سازی شده (داده‌ی دمو) |
| اعلام حریق (مناطق، دتکتورها، کنترل مرکزی، لاگ) | ✅ پیاده‌سازی شده (داده‌ی دمو) |
| امنیت / مدیریت کاربران (کاربران، نقش‌ها، لاگ ورود) | ✅ پیاده‌سازی شده (داده‌ی دمو) |
| صفحه‌ی ورود (لاگین) | ✅ پیاده‌سازی شده (فقط ظاهری، بدون احراز هویت واقعی) |
| برق، دسترسی بانک، گزارش‌ها، تنظیمات | ⏳ صفحات جایگزین (Placeholder) |

## ساختار پروژه
```
.
├── index.html          # مارک‌آپ اصلی HMI؛ همه‌ی صفحات داخل <main class="content"> قرار دارند
├── styles.css           # تمام استایل‌ها (توکن‌های طراحی در :root، یک بخش برای هر صفحه)
├── main.js              # ناوبری، ساعت/تاریخ، راه‌اندازی WebCC، منطق نمایشی هر صفحه
├── screen_min.js         # ابزارهای کمکی پنجره (تمام‌صفحه، بستن) که توسط WinCC استفاده می‌شود
├── webcc_min.js          # پل ارتباطی WebCC زیمنس (تغییر ندهید)
├── load-svg.js          # بارگذاری شماتیک SVG موتورخانه در صفحه
└── images/
    └── hmi-final.svg     # شماتیک موتورخانه (لینک‌شده، در حال تکمیل)
```
هر صفحه‌ی جدید (روشنایی، حریق، HVAC، امنیت و ...) به‌صورت سه بخش کوچک و مستقل — یک `<section>` در HTML، یک بلوک CSS و یک ماژول JS — تهیه می‌شود که سپس داخل `index.html`، `styles.css` و یک `<script>` مجزا ادغام می‌شوند تا بازبینی کد بخش‌به‌بخش ساده بماند.

## اتصال به TIA Portal و WinCC Unified
این پروژه به‌صورت **Custom Web Control در WinCC Unified** ساخته شده، بنابراین به‌جای میزبانی به‌عنوان یک وب‌سایت معمولی، به یک پروژه‌ی TIA Portal اضافه می‌شود:

۱. در **TIA Portal**، یک **Custom Web Control از نوع HTML** جدید اضافه کن و آن را به این پوشه (یا نسخه‌ی فشرده/آپلودشده‌ی آن) متصل کن.
۲. **رابط (Interface)** کنترل — شامل Property/Event/Method — را در TIA Portal تعریف کن؛ برای نمونه، پراپرتی عددی `InstantPower` که هم‌اکنون در `main.js` متصل شده است.
۳. اسکریپت پل ارتباطی زیمنس (`webcc_min.js`) را وارد کن و `WebCC.start(...)` را با همان Property/Event/Methodهای تعریف‌شده در TIA Portal فراخوانی کن؛ نمونه‌ی موجود در `main.js`:
   ```js
   WebCC.start(callback, {
     methods: {},
     events: {},
     properties: { InstantPower: 0 }
   }, [], 10000);
   ```
۴. هر پراپرتی تعریف‌شده را در تنظیمات رابط Custom Web Control، در TIA Portal، به یک **تگ PLC** نگاشت کن.
۵. Custom Web Control را روی یک صفحه‌ی WinCC Unified قرار بده؛ در زمان اجرا، WinCC مقادیر زنده‌ی تگ‌ها را به پراپرتی‌ها می‌فرستد و `WebCC.onPropertyChanged` این مقادیر را در رابط کاربری به‌روزرسانی می‌کند.
۶. مراحل ۲ تا ۴ را برای هر مقدار زنده‌ی دیگر (دما، وضعیت‌ها، آلارم‌ها، ست‌پوینت‌ها، اقدامات کاربر و غیره) تکرار کن؛ به همین ترتیب هر صفحه به‌تدریج از داده‌ی دمو به تگ‌های زنده منتقل می‌شود.

تا زمانی که تگ‌های هر صفحه تعریف نشده‌اند، داده‌های آن صفحه عمداً به‌صورت آبجکت‌های ثابت/دمو در جاوااسکریپت باقی می‌مانند تا طراحی و تعامل‌های بصری مستقل از برنامه‌ی PLC قابل بررسی باشند.

## اجرای مستقل (پیش‌نمایش در مرورگر)
چون این پروژه قرار است داخل WinCC Unified اجرا شود، تابع `WebCC.start()` در یک مرورگر معمولی (بدون وجود PLC/کانتینر) به‌آرامی با شکست مواجه می‌شود، اما رابط کاربری همچنان رندر می‌شود و تمام صفحات دمو به‌درستی کار می‌کنند. کافی است `index.html` را در مرورگر باز کنی، یا این پوشه را با هر سرور فایل استاتیکی سرو کنی تا طراحی را پیش‌نمایش و بازبینی کنی.

## نقشه‌ی راه
- تکمیل شماتیک SVG موتورخانه و افزودن پاپ‌آپ با کلیک روی هر پمپ/تجهیز.
- جایگزینی صفحات Placeholder باقی‌مانده (برق، دسترسی بانک، گزارش‌ها، تنظیمات).
- اتصال صفحات بیشتر به تگ‌ها/رویدادهای واقعی PLC هم‌زمان با پیشرفت برنامه‌ی TIA Portal.
- افزودن احراز هویت واقعی و دسترسی بر اساس نقش، پس از پشتیبانی بک‌اند/PLC از آن.

## مجوز
هنوز مشخص نشده — پیش از انتشار به‌عنوان متن‌باز، فایل مجوز اضافه شود.

</div>
