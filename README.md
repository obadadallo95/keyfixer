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
- **Auto-Detect**: Automatically determines conversion direction based on character composition in the text.
- **Chrome Extension**: Available as a lightweight Manifest V3 Chrome Extension with a clean popup and context menu options for in-page fixing.
- **Platform-Specific Layouts**: Supports **Windows (Arabic 101)** and **macOS Arabic** layout mappings.
- **Web App**: A modern, responsive React/Vite web application that serves as a demo and standalone tool.

### Supported Platforms
- Windows Arabic 101
- macOS Arabic layout mapping

### Installation

#### Web App
1. `npm install`
2. `npm run dev`

#### Chrome Extension
1. `npm run build:extension`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode".
4. Click "Load unpacked" and select the `extension/dist` folder.

### Documentation
See the [docs/](docs/) directory for detailed architecture, testing, layout mappings, and privacy information.

---

<h2 id="arabic" dir="rtl" align="right">🇸🇦 العربية</h2>

<div dir="rtl" align="right">

**KeyFixer** أداة مجانية ومفتوحة المصدر، تعمل بشكل محلي بالكامل لمعالجة وتصحيح النصوص التي تمت كتابتها بلغة لوحة المفاتيح الخاطئة.

### المشكلة
تود كتابة **"سورية حرة"** ولكنك تنسى تغيير لغة لوحة المفاتيح من الإنجليزية، فتكتب **"smnd] pn]"**. 
أو تود كتابة **"hello"** وتكون لوحة المفاتيح باللغة العربية فتكتب **"اثممخ"**.

### ماذا يفعل KeyFixer؟
يقوم KeyFixer بتحويل الأحرف بناءً على المواقع الفيزيائية للمفاتيح على لوحة المفاتيح (QWERTY) لاستعادة النص الأصلي المقصود.

- `smnd] pn]` → `سورية حرة`
- `اثممخ` → `hello`

### المميزات
- **خصوصية تامة**: تعمل الأداة بشكل محلي بالكامل 100%. لا يتم حفظ أو إرسال أي نص خارج جهازك.
- **كشف الاتجاه تلقائياً**: تحديد اتجاه التحويل تلقائياً اعتماداً على نوع الأحرف الموجودة في النص.
- **إضافة جوجل كروم**: إضافة خفيفة وسريعة توفر نافذة منبثقة بسيطة، وقائمة جانبية (Context Menu) لتصحيح النصوص فوراً داخل صفحات الويب.
- **تعدد الأنظمة**: دعم خرائط الأحرف لكل من **Windows (Arabic 101)** و **macOS**.
- **تطبيق ويب**: واجهة حديثة وسريعة تعمل كتطبيق مستقل أو لتجربة الأداة.

### التثبيت والتطوير
انظر قسم التثبيت باللغة الإنجليزية في الأعلى لتشغيل تطبيق الويب أو إضافة المتصفح، أو قم بزيارة مجلد `docs/` لمزيد من التفاصيل.

</div>

