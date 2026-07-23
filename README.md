<p align="center">
  <img src="public/logo.svg" alt="KeyFixer Logo" width="300" />
</p>

# ⌨️ KeyFixer - Multi-Platform Keyboard Layout Switcher

<p dir="auto" align="center">
  <a href="#english">English</a> | <a href="#arabic">العربية</a>
</p>

---

<h2 id="english">🇬🇧 English</h2>

**KeyFixer** is a privacy-first, fully offline tool that instantly fixes text typed with the wrong keyboard layout. Have you ever forgotten to switch your keyboard language and typed an entire sentence as gibberish? KeyFixer maps the physical keystrokes back to their intended characters instantly.

### The Problem
You intend to type **"سورية حرة"** (Arabic), but you forget to switch from English, so you end up typing **"smnd] pn]"**. 
Or you intend to type **"hello"** (English), but you are in Arabic mode, so you type **"اثممخ"**.

### What KeyFixer Does
KeyFixer maps physical keystrokes back to their intended characters based on standard QWERTY key positions.

- `smnd] pn]` → `سورية حرة`
- `اثممخ` → `hello`

### Features
- **Fully Offline & Private**: Text never leaves your device. No analytics, no API calls, no storage of typed text.
- **Collapsible Floating Window**: Document Picture-in-Picture window that stays on top of desktop apps, collapsing into a 260px pill when idle.
- **Auto-Detect**: Automatically determines conversion direction based on character composition in the text.
- **macOS Desktop App**: A native macOS menu bar app built with Tauri v2 and Rust, living in your system tray.
- **Chrome Extension**: Available as a lightweight Manifest V3 Chrome Extension with a clean popup and context menu options for in-page fixing.
- **Platform-Specific Layouts**: Supports **Windows (Arabic 101)** and **macOS Arabic** layout mappings.
- **Web App**: A modern, responsive React/Vite web application that serves as a demo and standalone tool.

### 🖼️ macOS Native App (System Tray / Menu Bar)
KeyFixer runs silently in your macOS menu bar as a background Accessory application:
- **Zero Dock Clutter**: Lives entirely in the system tray, leaving your Dock clean.
- **Toggle Visibility**: Left-click the menu bar icon to slide the window open/closed.
- **Auto Dark & Light Mode**: Seamlessly adapts to macOS appearance settings.
- **Hide-on-Close**: Closing the window hides it instead of terminating the app. Right-click the icon to Quit.

### Supported Platforms
- Windows Arabic 101
- macOS Arabic layout mapping

### 📥 Downloads

#### macOS Native App (.dmg)
Download the latest native Apple Silicon installer from [GitHub Release v1.1.0](https://github.com/obadadallo95/keyfixer/releases/tag/v1.1.0).

> 💡 **Gatekeeper Setup**: Since the app is open-source and unsigned, macOS will block its first launch. To open it:
> 1. Drag `KeyFixer.app` to your **Applications** folder.
> 2. **Right-click** (or Control-click) the app icon and select **Open**.
> 3. Click **Open** on the confirmation dialog.

#### Chrome Extension
Download the pre-built Chrome Extension package from [GitHub Release v1.0.0](https://github.com/obadadallo95/keyfixer/releases/tag/v1.0.0).

> **Note**: KeyFixer is **NOT** published on the Chrome Web Store. The extension is distributed directly as an open-source release bundle.

##### Installation Steps (Load Unpacked)
1. Download `keyfixer-chrome-extension-v1.0.0.zip` and extract it.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** toggle in the top-right.
4. Click **Load unpacked** and select the extracted folder.

### Installation & Development

#### Web App
1. `npm install`
2. `npm run dev`

#### macOS Desktop App (Tauri)
1. Ensure Rust toolchain is installed (`rustup`).
2. Run development build: `npm run dev:desktop` or `npx tauri dev`
3. Package production build: `npm run build:desktop` or `npx tauri build`

#### Chrome Extension Build from Source
1. `npm run build:extension`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode".
4. Click "Load unpacked" and select the `extension/dist` folder.

### Documentation
See the [docs/](docs/) directory for detailed architecture, testing, layout mappings, privacy information, and [macOS Desktop App Setup](docs/desktop-app.md).

---

<h2 id="arabic" dir="rtl" align="right">🇸🇦 العربية</h2>

<div dir="rtl" align="right">

**KeyFixer** أداة مجانية ومفتوحة المصدر، تعمل بشكل محلي بالكامل لمعالجة وتصحيح النصوص التي تمت كتابتها بلغة لوحة المفاتيح الخاطئة.

### 📥 روابط التحميل

#### تطبيق ماك المكتبي (.dmg)
قم بتحميل ملف التثبيت المباشر لأجهزة ماك (Apple Silicon) من صفحة الاصدارات [GitHub Release v1.1.0](https://github.com/obadadallo95/keyfixer/releases/tag/v1.1.0).

> 💡 **تنبيه لنظام الحماية (Gatekeeper):** بما أن الأداة مفتوحة المصدر وغير موقّعة بحساب مطور مدفوع، سيقوم نظام ماك بحظر تشغيلها لأول مرة. لتشغيلها بأمان:
> 1. اسحب ملف `KeyFixer.app` إلى مجلد **Applications (التطبيقات)**.
> 2. **انقر بالزر الأيمن (Right-click)** على أيقونة التطبيق واختر **Open**.
> 3. اضغط على زر **Open** في نافذة التأكيد التي تظهر لك.

#### إضافة متصفح كروم
قم بتحميل حزمة إضافة كروم من صفحة [GitHub Release v1.0.0](https://github.com/obadadallo95/keyfixer/releases/tag/v1.0.0).

> **تنبيه**: إضافة KeyFixer **غير** مرفوعة على متجر Chrome Web Store الرسمي. يتم توفير الإضافة كحزمة مفتوحة المصدر جاهزة للتحميل المباشر.

##### خطوات التثبيت (تحميل حزمة مفكوكة)
1. قم بتحميل الملف وفك الضغط عنه.
2. افتح متصفح كروم واذهب إلى العنوان: `chrome://extensions/`.
3. قم بتفعيل **وضع المطور (Developer mode)** في الزاوية العلوية.
4. اضغط على **تحميل حزمة مفكوكة (Load unpacked)** واختر المجلد المفكوك.

### المشكلة
تود كتابة **"سورية حرة"** ولكنك تنسى تغيير لغة لوحة المفاتيح من الإنجليزية، فتكتب **"smnd] pn]"**. 
أو تود كتابة **"hello"** وتكون لوحة المفاتيح باللغة العربية فتكتب **"اثممخ"**.

### ماذا يفعل KeyFixer؟
يقوم KeyFixer بتحويل الأحرف بناءً على المواقع الفيزيائية للمفاتيح على لوحة المفاتيح (QWERTY) لاستعادة النص الأصلي المقصود.

- `smnd] pn]` → `سورية حرة`
- `اثممخ` → `hello`

### المميزات
- **خصوصية تامة**: تعمل الأداة بشكل محلي بالكامل 100%. لا يتم حفظ أو إرسال أي نص خارج جهازك.
- **تطبيق macOS المكتبي**: يعمل بهدوء في شريط المهام العلوي (Menu Bar) دون إشغال الشريط السفلي (Dock)، ويدعم كتم الصوت وتغيير المظهر تلقائياً.
- **كشف الاتجاه تلقائياً**: تحديد اتجاه التحويل تلقائياً اعتماداً على نوع الأحرف الموجودة في النص.
- **إضافة جوجل كروم**: إضافة خفيفة وسريعة توفر نافذة منبثقة بسيطة، وقائمة جانبية (Context Menu) لتصحيح النصوص فوراً داخل صفحات الويب.
- **تعدد الأنظمة**: دعم خرائط الأحرف لكل من **Windows (Arabic 101)** و **macOS**.
- **تطبيق ويب**: واجهة حديثة وسريعة تعمل كتطبيق مستقل أو لتجربة الأداة.

### التثبيت والتطوير
انظر قسم التثبيت باللغة الإنجليزية في الأعلى لتشغيل تطبيق الويب أو إضافة المتصفح، أو قم بزيارة مجلد `docs/` لمزيد من التفاصيل.

</div>


