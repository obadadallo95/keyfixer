<p align="center">
  <img src="public/logo.svg" alt="KeyFixer Logo" width="300" />
</p>

# KeyFixer — Arabic/English Keyboard Layout Fixer

<p align="center">
  <a href="#english">English</a> · <a href="#arabic">العربية</a>
</p>

KeyFixer is a privacy-first utility that instantly restores text typed with the wrong Arabic or English keyboard layout. Conversion happens entirely on the device—without accounts, cloud processing, analytics, advertising, or tracking.

## English

### Highlights

- Converts Arabic ↔ English text using the physical keyboard-key positions.
- Automatically detects the required conversion direction.
- Runs fully offline and does not collect or transmit entered text.
- Opens or hides quickly from anywhere on macOS with `⌥⌘K`.
- Writes corrected text to the clipboard only when the user presses **Copy**.
- Includes macOS, web, and Chrome extension interfaces.
- Supports macOS Arabic and Windows Arabic 101 keyboard mappings.

Example:

```text
lh h[lg hg;jhf] → ما اجمل الكتابة
اثممخ → hello
```

### macOS app

The current source version is **1.1.1**. The signed Mac App Store build was submitted to Apple on August 1, 2026 and is awaiting review.

The older direct-distribution Apple Silicon build remains available from [GitHub Release v1.1.0](https://github.com/obadadallo95/keyfixer/releases/tag/v1.1.0). Gatekeeper instructions on that release apply only to the legacy direct download—not to the Mac App Store version.

### Development

```bash
npm install
npm run dev              # Web app
npm run dev:desktop      # Desktop frontend
npm run build:web
npm run build:desktop
npm run build:extension
```

Building the Mac App Store package additionally requires the developer's private Apple certificates and provisioning profile; those signing assets are intentionally excluded from this repository. See [docs/mac-app-store.md](docs/mac-app-store.md).

### Support and legal

- [Support and contact](https://obadadallo.web.app/contact/)
- [Privacy Policy](docs/privacy.md)
- [Terms of Use](docs/terms.md)
- [Apple Standard EULA](https://www.apple.com/legal/internet-services/itunes/dev/stdeula/)

## <span id="arabic">العربية</span>

<div dir="rtl">

KeyFixer أداة لتصحيح النص المكتوب بتخطيط لوحة مفاتيح عربي أو إنجليزي غير مقصود. تتم المعالجة محليًا بالكامل على الجهاز، دون حسابات أو إرسال النص إلى خوادم أو خدمات تحليل وإعلانات وتتبع.

### أهم المزايا

- تحويل فوري بين تخطيطي الكتابة العربية والإنجليزية.
- كشف تلقائي لاتجاه التحويل المناسب.
- عمل محلي بالكامل دون جمع النصوص أو إرسالها.
- إظهار التطبيق أو إخفاؤه من أي مكان على macOS عبر الاختصار `⌥⌘K`.
- نسخ النتيجة إلى الحافظة فقط عند ضغط زر **نسخ**.
- واجهات لتطبيق macOS والويب وإضافة Chrome.
- دعم تخطيط macOS العربي وWindows Arabic 101.

مثال:

```text
lh h[lg hg;jhf] → ما اجمل الكتابة
اثممخ → hello
```

### تطبيق macOS

إصدار المصدر الحالي هو **1.1.1**. تم إرسال النسخة الموقعة إلى Mac App Store بتاريخ 1 أغسطس 2026، وهي الآن بانتظار مراجعة Apple.

تبقى النسخة المباشرة القديمة لأجهزة Apple Silicon متاحة ضمن [GitHub Release v1.1.0](https://github.com/obadadallo95/keyfixer/releases/tag/v1.1.0). تعليمات Gatekeeper الخاصة بذلك الإصدار تنطبق على التحميل المباشر القديم فقط، ولا تنطبق على نسخة Mac App Store.

### الدعم والمعلومات القانونية

- [الدعم والتواصل](https://obadadallo.web.app/contact/)
- [سياسة الخصوصية](docs/privacy.md)
- [شروط الاستخدام](docs/terms.md)
- [اتفاقية Apple القياسية](https://www.apple.com/legal/internet-services/itunes/dev/stdeula/)

</div>

## Documentation

See [docs/](docs/) for architecture, testing, privacy, keyboard mappings, and macOS release documentation.
