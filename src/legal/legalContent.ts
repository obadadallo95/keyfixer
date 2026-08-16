/**
 * KeyFixer Legal Documents Source of Truth
 * Contains the exact finalized legal package for macOS and Windows
 */

export type LegalDocId = 'privacy' | 'terms' | 'purchase-refund' | 'impressum' | 'accessibility';

export interface LegalDocument {
  id: LegalDocId;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  // Special handling for Impressum in Arabic mode (German statutory primary + optional English)
  contentDe?: string;
}

export const LEGAL_DOCUMENTS: Record<LegalDocId, LegalDocument> = {
  privacy: {
    id: 'privacy',
    titleEn: 'Privacy Policy',
    titleAr: 'سياسة الخصوصية',
    contentEn: `# Privacy Policy

**Effective Date:** August 8, 2026  
**Last Updated:** August 16, 2026  
**Product:** KeyFixer for macOS and Windows  
**Developer:** Obada Dallo (Chemnitz, Germany)  
**Contact:** obada.dallo95@gmail.com  
**Website:** https://keyfixer.vercel.app/  

---

## 1. Overview
KeyFixer is a keyboard layout correction utility for macOS and Windows. We believe in privacy by design: all keyboard-layout text conversion occurs locally on your device. KeyFixer does not maintain user accounts, does not operate a text-processing backend, and does not upload your text to external servers.

---

## 2. Text Processing & Clipboard Access
- **Local Conversion:** All text conversion and layout correction algorithms execute locally on your device in volatile memory (RAM).
- **On-Demand Clipboard Interaction:** Clipboard interaction occurs only when you explicitly invoke KeyFixer (e.g., typing/pasting within the application window or using the **Inline Fix** shortcut \`⌥⌘K\` on macOS / \`Ctrl+Alt+K\` on Windows).
- **No Keystroke Logging or Background Monitoring:** KeyFixer does not continuously monitor your typing, is not a keylogger, does not create a typing history, and does not scan background documents or inactive windows.

---

## 3. Platform Permissions & Input Simulation
To perform **Inline Fix** (directly correcting selected text within other applications):
- **On macOS:** KeyFixer requests standard macOS Accessibility / \`PostEvent\` authorization solely to simulate the Copy (\`Cmd+C\`) and Paste (\`Cmd+V\`) workflow initiated when you explicitly press \`⌥⌘K\`.
- **On Windows:** KeyFixer executes standard local Win32 input simulation solely upon pressing \`Ctrl+Alt+K\`.
- **Scope Limitation:** KeyFixer does not observe user behavior, record screen activity, or inspect unselected application content on any platform.

---

## 4. In-App Purchases & Store Providers
- **Transactions Handled by Official App Stores:** Purchases (including **KeyFixer Pro Lifetime**) are processed exclusively through Apple's In-App Purchase system (StoreKit) on macOS and the Microsoft Store on Windows.
- **No Financial Data Collected by KeyFixer:** KeyFixer does not collect, receive, or store your credit card details, bank credentials, or store account passwords. Apple and Microsoft process all billing, payment data, and currency conversions in accordance with their respective privacy policies.
- **Entitlement Verification:** KeyFixer verifies purchase validity locally on-device using cryptographically signed transaction tokens from the relevant platform store.

---

## 5. Analytics, Diagnostics & Third-Party SDKs
- **No Third-Party Analytics:** KeyFixer does not integrate third-party advertising SDKs, analytics frameworks, or tracking tools.
- **Platform Diagnostics:** Anonymized crash logs and performance diagnostics may be provided to the developer through official platform portals (Apple App Store Connect / Microsoft Partner Center), subject to your operating system diagnostic and privacy settings.

---

## 6. Contact Information & Privacy Inquiries
For any questions regarding this Privacy Policy, please contact:
- **Developer:** Obada Dallo
- **Location:** Chemnitz, Germany
- **Email:** obada.dallo95@gmail.com`,
    contentAr: `# سياسة الخصوصية

**تاريخ السريان:** 8 أغسطس 2026  
**آخر تحديث:** 16 أغسطس 2026  
**المنتج:** تطبيق KeyFixer لأنظمة macOS و Windows  
**المطور:** عبادة دللو (Obada Dallo) — كيمنتس، ألمانيا  
**البريد الإلكتروني:** obada.dallo95@gmail.com  
**الموقع الإلكتروني:** https://keyfixer.vercel.app/  

---

## 1. نظرة عامة
KeyFixer هو تطبيق لتصحيح تخطيط لوحة المفاتيح لأنظمة macOS و Windows، وهو مصمم وفق مبدأ الخصوصية أولاً: تتم جميع عمليات معالجة وتحويل النصوص محلياً بالكامل على جهازك. لا يحتفظ KeyFixer بحسابات مستخدمين، ولا يدير خوادم خارجية لمعالجة النصوص، ولا يرفع نصوصك إلى أي خوادم أو جهات خارجية.

---

## 2. معالجة النصوص والوصول إلى الحافظة (Clipboard)
- **معالجة محلية بالكامل:** تتم جميع عمليات تصحيح النصوص داخل الذاكرة المؤقتة (RAM) على جهازك مباشرة.
- **التفاعل مع الحافظة عند الطلب فقط:** يحدث التفاعل مع الحافظة فقط عندما تطلب ذلك صراحة (مثل استخدام نافذة التطبيق الرئيسية أو الضغط على اختصار **التصحيح المباشر** \`⌥⌘K\` على الماك أو \`Ctrl+Alt+K\` على ويندوز).
- **عدم تسجيل المفاتيح أو المراقبة في الخلفية:** لا يراقب KeyFixer كتابتك في الخلفية بشكل مستمر، وليس برنامج تسجيل مفاتيح (Keylogger)، ولا ينشئ سجلاً لما تكتبه، ولا يفحص المستندات أو النوافذ المفتوحة في الخلفية.

---

## 3. أذونات النظام ومحاكاة الإدخال
لتنفيذ خاصية **التصحيح المباشر (Inline Fix)** واستبدال النص المحدد مباشرة داخل التطبيقات الأخرى:
- **على macOS:** يطلب KeyFixer إذن تسهيلات الاستخدام (Accessibility) حصرياً لتنفيذ عمليتي النسخ (\`Cmd+C\`) واللصق (\`Cmd+V\`) القياسيتين عند ضغطك المباشر على الاختصار \`⌥⌘K\`.
- **على Windows:** يستخدم التطبيق واجهات النظام الرسمية (Win32 API) محلياً فقط عند ضغطك على \`Ctrl+Alt+K\`.
- **حدود الاستخدام:** لا يُستخدم الإذن لمراقبة نشاطك، أو تسجيل الشاشة، أو فحص نصوص التطبيقات غير المحددة.

---

## 4. عمليات الشراء والمتاجر الرسمية
- **المعالجة عبر المتاجر الرسمية:** تتم جميع عمليات الشراء (بما فيها **KeyFixer Pro مدى الحياة**) حصرياً عبر أنظمة الدفع الرسمية: Apple StoreKit على نظام macOS ومتجر مايكروسوفت Microsoft Store على نظام Windows.
- **عدم استلام البيانات المالية:** لا يستلم KeyFixer ولا يخزن تفاصيل بطاقات الدفع، أو الحسابات المصرفية، أو كلمات مرور حساباتك. تتولى المتاجر الرسمية معالجة عمليات الدفع والفوترة وفق سياساتها الخاصة.
- **التحقق من التفعيل:** يتحقق التطبيق من تفعيل الميزات الاحترافية محلياً على جهازك عبر رموز المعاملات المشفرة الرسمية.

---

## 5. التحليلات والتشخيص وخدمات الطرف الثالث
- **لا توجد أدوات تتبع خارجية:** لا يحتوي KeyFixer على أي حزم برمجية أو إعلانات أو أدوات تتبع من طرف ثالث.
- **تقارير التشخيص الرسمية:** قد يتلقى المطور تقارير الأعطال مجهولة الهوية والمقدمة عبر منصات المطورين الرسمية التابعة لـ Apple أو Microsoft، وذلك وفقاً لإعدادات الخصوصية والتشخيص في نظامك.

---

## 6. معلومات التواصل
لأي استفسارات بخصوص سياسة الخصوصية، يرجى التواصل عبر:
- **المطور:** عبادة دللو (Obada Dallo)
- **الموقع:** كيمنتس، ألمانيا
- **البريد الإلكتروني:** obada.dallo95@gmail.com`,
  },

  terms: {
    id: 'terms',
    titleEn: 'Terms of Use',
    titleAr: 'شروط الاستخدام',
    contentEn: `# Terms of Use

**Effective Date:** August 8, 2026  
**Last Updated:** August 16, 2026  
**Product:** KeyFixer for macOS and Windows  
**Developer:** Obada Dallo (Chemnitz, Germany)  
**Distribution:** Mac App Store & Microsoft Store  
**Contact:** obada.dallo95@gmail.com  
**Website:** https://keyfixer.vercel.app/  

---

## 1. Scope & Acceptance
These Terms of Use ("Terms") govern your use of **KeyFixer for macOS and Windows** ("Software"), provided by Obada Dallo ("Developer"). By downloading or using KeyFixer from the Mac App Store or Microsoft Store, you agree to these Terms and the applicable platform store terms and conditions.

---

## 2. Product Structure & License
1. **Free Basic Tier:** KeyFixer provides free keyboard-layout text conversion within the main application window without requiring payment.
2. **Limited Local Pro Trial:** KeyFixer includes a limited local trial of the **Inline Fix** feature (currently configured as 25 successful Inline Fix operations) for evaluating direct in-app text correction.
3. **KeyFixer Pro Lifetime (In-App Purchase / Store License):**
   - KeyFixer Pro Lifetime is a one-time purchase with no recurring subscription fees. It unlocks unlimited use of the included Pro functionality while KeyFixer remains supported and operational on compatible macOS and Windows versions. It does not guarantee compatibility with future operating-system changes outside the developer's control.

---

## 3. Purchases, Billing & Entitlements
1. **Processed by Official App Stores:** All purchases are processed exclusively through Apple's StoreKit framework on macOS and Microsoft Store on Windows. The Developer does not process, receive, or store your payment details.
2. **Entitlement Verification:** Pro features are unlocked through cryptographically signed store verification.
3. **Restore Purchases:** You can restore or re-verify your previously purchased KeyFixer Pro Lifetime entitlement at any time on compatible computers linked to the same store account using the "Restore Purchases" / "Check Store License" option.
4. **Transaction Revocation:** If the store provider refunds, revokes, or reverses a KeyFixer Pro transaction, the associated Pro entitlement may be removed after store re-verification.

---

## 4. System Requirements & Permissions
1. **Supported Systems:** KeyFixer operates on supported versions of macOS (Apple Silicon & Intel) and Windows 10/11 as indicated on the store product page.
2. **Input Permissions:** 
   - On macOS: The Inline Fix feature requires system permission (\`PostEvent\` / Accessibility) solely to execute standard \`Cmd+C\` and \`Cmd+V\` commands when you explicitly press \`⌥⌘K\`.
   - On Windows: The Inline Fix feature executes local input commands when you explicitly press \`Ctrl+Alt+K\`.

---

## 5. Maintenance & Updates
The Developer provides reasonable maintenance and security updates where legally required to maintain software conformity. The Developer does not guarantee perpetual compatibility with future OS major versions that alter or deprecate underlying operating system APIs outside the Developer's control.

---

## 6. Statutory Consumer Rights & Governing Law
1. **Statutory Rights Unaffected:** Nothing in these Terms limits, restricts, or excludes mandatory statutory consumer rights, warranty rights, or statutory protections under applicable European Union or national consumer law.
2. **Governing Law:** These Terms are governed by the laws of the Federal Republic of Germany, without prejudice to mandatory consumer protection laws in your country of residence.

---

## 7. Contact
For any inquiries regarding these Terms:
- **Developer:** Obada Dallo
- **Location:** Chemnitz, Germany
- **Email:** obada.dallo95@gmail.com
- **Website:** https://keyfixer.vercel.app/`,
    contentAr: `# شروط الاستخدام

**تاريخ السريان:** 8 أغسطس 2026  
**آخر تحديث:** 16 أغسطس 2026  
**المنتج:** تطبيق KeyFixer لأنظمة macOS و Windows  
**المطور:** عبادة دللو (Obada Dallo) — كيمنتس، ألمانيا  
**التوزيع:** متجر Mac App Store ومتجر Microsoft Store  
**البريد الإلكتروني:** obada.dallo95@gmail.com  
**الموقع الإلكتروني:** https://keyfixer.vercel.app/  

---

## 1. نطاق الاتفاقية
تحكم هذه الشروط استخدامك لتطبيق **KeyFixer** ("التطبيق")، المقدم من المطور عبادة دللو ("المطور"). بتحميل أو استخدام التطبيق من متجر Mac App Store أو متجر مايكروسوفت Microsoft Store، فإنك توافق على هذه الشروط وعلى الشروط والأحكام المعتمدة للمتجر المعني.

---

## 2. هيكل المنتج والترخيص
1. **الميزات المجانية الأساسية:** يوفر KeyFixer تصحيح تخطيط لوحة المفاتيح مجاناً داخل نافذة التطبيق الرئيسية دون الحاجة لأي دفع.
2. **الفترة التجريبية المحلية المحدودة:** يتضمن KeyFixer تجربة محلية محدودة لميزة **التصحيح المباشر (Inline Fix)** (تتضمن حالياً 25 عملية تصحيح مباشر ناجحة) لتجربة التصحيح الفوري داخل التطبيقات الأخرى.
3. **KeyFixer Pro مدى الحياة (شراء لمرة واحدة):**
   - KeyFixer Pro مدى الحياة هو شراء لمرة واحدة دون رسوم اشتراك متكررة، ويتيح الاستخدام غير المحدود لميزات Pro المشمولة ما دام KeyFixer مدعومًا وقابلًا للتشغيل على إصدارات macOS و Windows المتوافقة. ولا يشكل ذلك ضمانًا بالتوافق مع تغييرات مستقبلية في نظام التشغيل تكون خارج سيطرة المطور.

---

## 3. المشتريات والتحقق من التراخيص
1. **المعالجة عبر المتاجر الرسمية:** تتم جميع عمليات الشراء داخل التطبيق حصرياً عبر متجر التطبيقات الرسمي (Apple StoreKit على نظام macOS ومتجر مايكروسوفت على نظام Windows). ولا يقوم المطور بمعالجة أو استلام بيانات الدفع الخاصة بك.
2. **التحقق من الترخيص:** يتم تفعيل ميزات Pro عبر التحقق المشفر الرسمي محلياً على جهازك.
3. **استعادة المشتريات (Restore Purchases):** يمكنك استعادة مشترياتك السابقة من KeyFixer Pro مدى الحياة في أي وقت على الأجهزة المتوافقة والمرتبطة بنفس حساب المتجر عبر خيار "استعادة المشتريات / التحقق من الترخيص".
4. **إلغاء الترخيص:** إذا قام المتجر باسترداد أو إلغاء أو عكس معاملة KeyFixer Pro، فقد تتم إزالة صلاحية Pro المرتبطة بها بعد إعادة التحقق.

---

## 4. متطلبات النظام والأذونات
1. **الأنظمة المدعومة:** يعمل KeyFixer على إصدارات macOS المدعومة (معالجات Apple Silicon و Intel) وإصدارات Windows 10/11 المتوافقة.
2. **أذونات الإدخال:**
   - على macOS: تتطلب ميزة التصحيح المباشر إذن النظام (\`PostEvent\` / Accessibility) حصرياً لتنفيذ أمري \`Cmd+C\` و \`Cmd+V\` عند ضغطك المباشر على الاختصار \`⌥⌘K\`.
   - على Windows: تنفذ الميزة محلياً عند الضغط على \`Ctrl+Alt+K\`.

---

## 5. الصيانة والتحديثات
يلتزم المطور بتقديم تحديثات الصيانة والأمان المعقولة حيثما يقتضي القانون ذلك لضمان مطابقة المنتج. ولا يضمن المطور التوافق مع إصدارات أنظمة التشغيل الرئيسية المستقبلية التي قد تغير أو تلغي واجهات برمجة النظام الأساسية الخارجة عن سيطرة المطور.

---

## 6. حقوق المستهلك والقانون المعمول به
1. **حماية حقوق المستهلك:** لا تحد هذه الشروط من أي حقوق قانونية إلزامية للمستهلك أو حقوق الضمان القانوني المعمول بها في الاتحاد الأوروبي أو في بلد إقامتك.
2. **القانون الحاكم:** تخضع هذه الشروط لقوانين جمهورية ألمانيا الاتحادية، مع عدم الإخلال بالحماية الإلزامية للمستهلك في بلد إقامتك المعتاد.

---

## 7. التواصل
لأي استفسارات بخصوص هذه الشروط:
- **المطور:** عبادة دللو (Obada Dallo)
- **الموقع:** كيمنتس، ألمانيا
- **البريد الإلكتروني:** obada.dallo95@gmail.com
- **الموقع الإلكتروني:** https://keyfixer.vercel.app/`,
  },

  'purchase-refund': {
    id: 'purchase-refund',
    titleEn: 'Purchase & Refund Policy',
    titleAr: 'سياسة الشراء والاسترجاع',
    contentEn: `# Purchase & Refund Policy

**Product:** KeyFixer for macOS and Windows  
**Product ID (macOS):** \`com.obadadallo.keyfixer.pro.lifetime\`  
**Product ID (Windows):** \`9PK3G83GP41D\`  
**Distribution:** Mac App Store & Microsoft Store  
**Developer:** Obada Dallo (Chemnitz, Germany)  
**Contact:** obada.dallo95@gmail.com  
**Website:** https://keyfixer.vercel.app/  

---

KeyFixer Pro Lifetime is purchased exclusively through official application stores (Apple's In-App Purchase system on macOS and Microsoft Store on Windows). KeyFixer does not process or hold customer payment information.

Refund requests for purchases are handled by the respective store provider:
- **Mac App Store:** Refund requests are handled by Apple. Users may submit an eligible refund request through Apple's official Report a Problem service. Refund requests for Mac App Store purchases are handled by Apple under its applicable terms and consumer-protection law.
- **Microsoft Store:** Refund requests are handled by Microsoft via your Microsoft Account order history.

If the store refunds, revokes, or reverses a KeyFixer Pro transaction, the associated Pro entitlement may be removed after store re-verification.

Nothing in this policy limits mandatory statutory consumer rights.`,
    contentAr: `# سياسة الشراء والاسترداد

**المنتج:** تطبيق KeyFixer لأنظمة macOS و Windows  
**معرف المنتج (macOS):** \`com.obadadallo.keyfixer.pro.lifetime\`  
**معرف المنتج (Windows):** \`9PK3G83GP41D\`  
**التوزيع:** متجر Mac App Store ومتجر Microsoft Store  
**المطور:** عبادة دللو (Obada Dallo) — كيمنتس، ألمانيا  
**البريد الإلكتروني:** obada.dallo95@gmail.com  
**الموقع الإلكتروني:** https://keyfixer.vercel.app/  

---

يتم شراء KeyFixer Pro مدى الحياة حصريًا عبر المتاجر الرسمية (نظام الشراء داخل التطبيق التابع لـ Apple على macOS ومتجر Microsoft Store على Windows)، ولا يقوم KeyFixer بمعالجة بيانات الدفع الخاصة بالمستخدم أو الاحتفاظ بها.

تتولى منصة المتجر المعنية معالجة طلبات الاسترداد:
- **Mac App Store:** تتولى Apple معالجة طلبات استرداد مشتريات Mac App Store من خلال خدمة «الإبلاغ عن مشكلة» الرسمية وفق شروطها وقوانين حماية المستهلك ذات الصلة.
- **Microsoft Store:** تتولى Microsoft معالجة طلبات الاسترداد عبر سجل طلبات حساب مايكروسوفت الخاص بك.

إذا قام المتجر باسترداد أو إلغاء أو عكس معاملة KeyFixer Pro، فقد تتم إزالة صلاحية Pro المرتبطة بها بعد إعادة التحقق.

لا تحد هذه السياسة من أي حقوق قانونية إلزامية للمستهلك.`,
  },

  impressum: {
    id: 'impressum',
    titleEn: 'Legal Notice',
    titleAr: 'المعلومات القانونية',
    contentEn: `# Legal Notice / Impressum

**Information pursuant to § 5 German Digital Services Act (DDG) and Art. 30 EU Digital Services Act (DSA):**

---

### Service Provider & Developer:
**Obada Dallo**  
Augsburger Straße 7  
09126 Chemnitz  
Germany  

---

### Contact Information:
- **Email:** obada.dallo95@gmail.com  
- **Phone:** +49 176 85649057  
- **Product Website:** https://keyfixer.vercel.app/  
- **Developer Portfolio:** https://obadadallo.web.app/  

---

### Value Added Tax (VAT) Identification:
- **VAT Identification Number (USt-IdNr.) pursuant to § 27a German VAT Act (UStG):**  
  [Insert VAT ID if assigned by the tax authority / applicable]  

---

### Consumer Dispute Resolution:
We are neither obliged nor willing to participate in dispute resolution proceedings before a consumer arbitration board.`,
    contentDe: `# Impressum / Anbieterkennzeichnung

**Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG) sowie Art. 30 EU Digital Services Act (DSA):**

---

### Diensteanbieter & Entwickler:
**Obada Dallo**  
Augsburger Straße 7  
09126 Chemnitz  
Deutschland  

---

### Kontakt:
- **E-Mail:** obada.dallo95@gmail.com  
- **Telefon:** +49 176 85649057  
- **Produkt-Website:** https://keyfixer.vercel.app/  
- **Entwickler-Portfolio:** https://obadadallo.web.app/  

---

### Umsatzsteuer-Identifikation:
- **Umsatzsteuer-Identifikationsnummer (USt-IdNr.) gemäß § 27a UStG:**  
  [USt-IdNr. eintragen, falls vom Finanzamt vergeben / zutreffend]  

---

### Verbraucherstreitbeilegung:
Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`,
    contentAr: `# Impressum / Anbieterkennzeichnung

**Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG) sowie Art. 30 EU Digital Services Act (DSA):**

---

### Diensteanbieter & Entwickler:
**Obada Dallo**  
Augsburger Straße 7  
09126 Chemnitz  
Deutschland  

---

### Kontakt:
- **E-Mail:** obada.dallo95@gmail.com  
- **Telefon:** +49 176 85649057  
- **Produkt-Website:** https://keyfixer.vercel.app/  
- **Entwickler-Portfolio:** https://obadadallo.web.app/  

---

### Umsatzsteuer-Identifikation:
- **Umsatzsteuer-Identifikationsnummer (USt-IdNr.) gemäß § 27a UStG:**  
  [USt-IdNr. eintragen, falls vom Finanzamt vergeben / zutreffend]  

---

### Verbraucherstreitbeilegung:
Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`,
  },

  accessibility: {
    id: 'accessibility',
    titleEn: 'Accessibility & Permissions',
    titleAr: 'الأذونات وتسهيلات الاستخدام',
    contentEn: `# Accessibility & Permission Disclosure

### Why KeyFixer needs Accessibility access

Inline Fix lets you correct selected text directly inside another app.

When you select text and press ⌥⌘K on macOS (or Ctrl+Alt+K on Windows), KeyFixer uses standard system keystroke synthesis solely to trigger the standard Copy and Paste actions required to replace that selection.

KeyFixer does not monitor your typing, record keystrokes, scan documents in the background, or upload the selected text. Text correction happens locally on your device.`,
    contentAr: `# إفصاح أذونات تسهيلات الاستخدام

### لماذا يحتاج KeyFixer إلى إذن تسهيلات الاستخدام؟

تتيح ميزة التصحيح المباشر تصحيح النص المحدد مباشرة داخل تطبيق آخر.

عندما تحدد نصًا وتضغط ⌥⌘K على macOS (أو Ctrl+Alt+K على Windows)، يستخدم KeyFixer محاكاة الإدخال القياسية فقط لتنفيذ عمليتي النسخ واللصق اللازمتين لاستبدال النص المحدد.

لا يراقب KeyFixer كتابتك، ولا يسجل ضغطات المفاتيح، ولا يفحص المستندات في الخلفية، ولا يرفع النص المحدد إلى أي خادم. تتم عملية التصحيح محليًا على جهازك.`,
  },
};
