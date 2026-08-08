/**
 * KeyFixer Legal Documents Source of Truth
 * Contains the exact finalized legal package from docs/legal/
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
**Last Updated:** August 8, 2026  
**Product:** KeyFixer for macOS  
**Developer:** Obada Dallo (Chemnitz, Germany)  
**Contact:** obada.dallo95@gmail.com  
**Website:** https://keyfixer.vercel.app/  

---

## 1. Overview
KeyFixer is a keyboard layout correction utility for macOS. We believe in privacy by design: all keyboard-layout text conversion occurs locally on your Mac. KeyFixer does not maintain user accounts, does not operate a text-processing backend, and does not upload your text to external servers.

---

## 2. Text Processing & Clipboard Access
- **Local Conversion:** All text conversion and layout correction algorithms execute locally on your device in volatile memory (RAM).
- **On-Demand Clipboard Interaction:** Clipboard interaction occurs only when you explicitly invoke KeyFixer (e.g., typing/pasting within the application window or using the **Inline Fix** shortcut \`⌥⌘K\`).
- **No Keystroke Logging or Background Monitoring:** KeyFixer does not continuously monitor your typing, is not a keylogger, does not create a typing history, and does not scan background documents or inactive windows.

---

## 3. macOS Accessibility & PostEvent Permission
To perform **Inline Fix** (directly correcting selected text within other applications), KeyFixer requests macOS system authorization (\`PostEvent\` / Accessibility).
- **Purpose:** This permission is used solely to execute the standard Copy (\`Cmd+C\`) and Paste (\`Cmd+V\`) workflow initiated when you explicitly press \`⌥⌘K\`.
- **Scope Limitation:** KeyFixer does not use this permission to observe user behavior, record screen activity, or inspect unselected application content.

---

## 4. In-App Purchases & Apple StoreKit
- **Transactions Handled by Apple:** Purchases (including **KeyFixer Pro Lifetime**) are processed exclusively through Apple’s In-App Purchase system (StoreKit).
- **No Financial Data Collected by KeyFixer:** KeyFixer does not collect, receive, or store your credit card details, bank credentials, or Apple Account passwords. Apple processes all billing, payment data, and currency conversions in accordance with Apple's Privacy Policy.
- **Entitlement Verification:** KeyFixer verifies purchase validity locally on-device using cryptographically signed StoreKit 2 transaction tokens.

---

## 5. Analytics, Diagnostics & Third-Party SDKs
- **No Third-Party Analytics:** KeyFixer does not integrate third-party advertising SDKs, analytics frameworks, or tracking tools.
- **Apple Diagnostics:** Anonymized crash logs and performance diagnostics may be provided to the developer by Apple through App Store Connect, subject to your macOS diagnostic and privacy settings.

---

## 6. Contact Information & Privacy Inquiries
For any questions regarding this Privacy Policy, please contact:
- **Developer:** Obada Dallo
- **Location:** Chemnitz, Germany
- **Email:** obada.dallo95@gmail.com`,
    contentAr: `# سياسة الخصوصية

**تاريخ السريان:** 8 أغسطس 2026  
**آخر تحديث:** 8 أغسطس 2026  
**المنتج:** تطبيق KeyFixer لنظام macOS  
**المطور:** عبادة دللو (Obada Dallo) — كيمنتس، ألمانيا  
**البريد الإلكتروني:** obada.dallo95@gmail.com  
**الموقع الإلكتروني:** https://keyfixer.vercel.app/  

---

## 1. نظرة عامة
KeyFixer هو تطبيق لتصحيح تخطيط لوحة المفاتيح على نظام macOS، وهو مصمم وفق مبدأ الخصوصية أولاً: تتم جميع عمليات معالجة وتحويل النصوص محلياً بالكامل على جهاز Mac الخاص بك. لا يحتفظ KeyFixer بحسابات مستخدمين، ولا يدير خوادم خارجية لمعالجة النصوص، ولا يرفع نصوصك إلى أي خوادم أو جهات خارجية.

---

## 2. معالجة النصوص والوصول إلى الحافظة (Clipboard)
- **معالجة محلية بالكامل:** تتم جميع عمليات تصحيح النصوص داخل الذاكرة المؤقتة (RAM) على جهازك مباشرة.
- **التفاعل مع الحافظة عند الطلب فقط:** يحدث التفاعل مع الحافظة فقط عندما تطلب ذلك صراحة (مثل استخدام نافذة التطبيق الرئيسية أو الضغط على اختصار **التصحيح المباشر** \`⌥⌘K\`).
- **عدم تسجيل المفاتيح أو المراقبة في الخلفية:** لا يراقب KeyFixer كتابتك في الخلفية بشكل مستمر، وليس برنامج تسجيل مفاتيح (Keylogger)، ولا ينشئ سجلاً لما تكتبه، ولا يفحص المستندات أو النوافذ المفتوحة في الخلفية.

---

## 3. إذن تسهيلات الاستخدام وإرسال الأحداث (Accessibility / PostEvent)
لتنفيذ خاصية **التصحيح المباشر (Inline Fix)** واستبدال النص المحدد مباشرة داخل التطبيقات الأخرى، يطلب KeyFixer إذن النظام من macOS.
- **الغرض الحصري:** يُستخدم هذا الإذن فقط لتنفيذ عمليتي النسخ (\`Cmd+C\`) واللصق (\`Cmd+V\`) القياسيتين عند ضغطك المباشر على الاختصار \`⌥⌘K\`.
- **حدود الاستخدام:** لا يُستخدم الإذن لمراقبة نشاطك، أو تسجيل الشاشة، أو فحص نصوص التطبيقات غير المحددة.

---

## 4. عمليات الشراء داخل التطبيق وApple StoreKit
- **معالجة الشراء عبر Apple:** تتم جميع عمليات الشراء (بما فيها **KeyFixer Pro مدى الحياة**) حصرياً عبر نظام الشراء داخل التطبيقات التابع لشركة Apple (StoreKit).
- **عدم استلام البيانات المالية:** لا يستلم KeyFixer ولا يخزن تفاصيل بطاقات الدفع، أو الحسابات المصرفية، أو كلمات مرور حساب Apple الخاص بك. تتولى Apple معالجة عمليات الدفع والفوترة وفق سياسة الخصوصية الخاصة بها.
- **التحقق من التفعيل:** يتحقق التطبيق من تفعيل الميزات الاحترافية محلياً على جهازك عبر رموز المعاملات المشفرة من StoreKit 2.

---

## 5. التحليلات والتشخيص وخدمات الطرف الثالث
- **لا توجد أدوات تتبع خارجية:** لا يحتوي KeyFixer على أي حزم برمجية أو إعلانات أو أدوات تتبع من طرف ثالث.
- **تقارير التشخيص من Apple:** قد يتلقى المطور تقارير الأعطال مجهولة الهوية والمقدمة عبر منصة Apple App Store Connect، وذلك وفقاً لإعدادات التشخيص والخصوصية التي تحددها في نظام macOS.

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
**Last Updated:** August 8, 2026  
**Product:** KeyFixer for macOS  
**Developer:** Obada Dallo (Chemnitz, Germany)  
**Distribution:** Mac App Store Exclusive  
**Contact:** obada.dallo95@gmail.com  
**Website:** https://keyfixer.vercel.app/  

---

## 1. Scope & Acceptance
These Terms of Use ("Terms") govern your use of **KeyFixer for macOS** ("Software"), provided by Obada Dallo ("Developer"). By downloading or using KeyFixer from the Mac App Store, you agree to these Terms and the applicable Apple Media Services Terms and Conditions.

---

## 2. Product Structure & License
1. **Free Basic Tier:** KeyFixer provides free keyboard-layout text conversion within the main application window without requiring payment.
2. **Limited Local Pro Trial:** KeyFixer includes a limited local trial of the **Inline Fix** feature (currently configured as 5 successful Inline Fix operations) for evaluating direct in-app text correction.
3. **KeyFixer Pro Lifetime (In-App Purchase):**
   - KeyFixer Pro Lifetime is a one-time purchase with no recurring subscription fees. It unlocks unlimited use of the included Pro functionality while KeyFixer remains supported and operational on compatible macOS versions. It does not guarantee compatibility with future operating-system changes outside the developer's control.

---

## 3. Purchases, Billing & Entitlements
1. **Processed by Apple:** All In-App Purchases are processed exclusively through Apple's StoreKit framework using your Apple Account. The Developer does not process, receive, or store your payment details.
2. **Entitlement Verification:** Pro features are unlocked through StoreKit 2 verification.
3. **Restore Purchases:** You can restore your previously purchased KeyFixer Pro Lifetime entitlement at any time on compatible Mac computers linked to the same Apple Account using the "Restore Purchases" option.
4. **Transaction Revocation:** If Apple refunds, revokes, or reverses a KeyFixer Pro transaction, the associated Pro entitlement may be removed after StoreKit re-verification.

---

## 4. System Requirements & Permissions
1. **Supported Systems:** KeyFixer operates on supported versions of macOS on Apple Silicon and compatible Intel hardware as indicated on the Mac App Store product page.
2. **Accessibility & PostEvent Permission:** The Inline Fix feature requires system permission (\`PostEvent\` / Accessibility) solely to execute standard \`Cmd+C\` and \`Cmd+V\` commands when you explicitly press \`⌥⌘K\`.

---

## 5. Maintenance & Updates
The Developer provides reasonable maintenance and security updates where legally required to maintain software conformity. The Developer does not guarantee perpetual compatibility with future macOS major versions that alter or deprecate underlying operating system APIs outside the Developer's control.

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
**آخر تحديث:** 8 أغسطس 2026  
**المنتج:** تطبيق KeyFixer لنظام macOS  
**المطور:** عبادة دللو (Obada Dallo) — كيمنتس، ألمانيا  
**التوزيع:** حصرياً عبر متجر Mac App Store  
**البريد الإلكتروني:** obada.dallo95@gmail.com  
**الموقع الإلكتروني:** https://keyfixer.vercel.app/  

---

## 1. نطاق الاتفاقية
تحكم هذه الشروط استخدامك لتطبيق **KeyFixer for macOS** ("التطبيق")، المقدم من المطور عبادة دللو ("المطور"). بتحميل أو استخدام التطبيق من متجر Mac App Store، فإنك توافق على هذه الشروط وعلى الشروط والأحكام المعتمدة لخدمات Apple Media Services.

---

## 2. هيكل المنتج والترخيص
1. **الميزات المجانية الأساسية:** يوفر KeyFixer تصحيح تخطيط لوحة المفاتيح مجاناً داخل نافذة التطبيق الرئيسية دون الحاجة لأي دفع.
2. **الفترة التجريبية المحلية المحدودة:** يتضمن KeyFixer تجربة محلية محدودة لميزة **التصحيح المباشر (Inline Fix)** (تتضمن حالياً 5 عمليات تصحيح مباشر ناجحة) لتجربة التصحيح الفوري داخل التطبيقات الأخرى.
3. **KeyFixer Pro مدى الحياة (شراء داخل التطبيق):**
   - KeyFixer Pro مدى الحياة هو شراء لمرة واحدة دون رسوم اشتراك متكررة، ويتيح الاستخدام غير المحدود لميزات Pro المشمولة ما دام KeyFixer مدعومًا وقابلًا للتشغيل على إصدارات macOS المتوافقة. ولا يشكل ذلك ضمانًا بالتوافق مع تغييرات مستقبلية في نظام التشغيل تكون خارج سيطرة المطور.

---

## 3. المشتريات والتحقق من التراخيص
1. **المعالجة عبر Apple:** تتم جميع عمليات الشراء داخل التطبيق حصرياً عبر نظام StoreKit التابع لشركة Apple باستخدام حساب Apple الخاص بك. ولا يقوم المطور بمعالجة أو استلام بيانات الدفع الخاصة بك.
2. **التحقق من الترخيص:** يتم تفعيل ميزات Pro عبر التحقق المشفر لـ StoreKit 2 محلياً على جهازك.
3. **استعادة المشتريات (Restore Purchases):** يمكنك استعادة مشترياتك السابقة من KeyFixer Pro مدى الحياة في أي وقت على أجهزة Mac المتوافقة والمرتبطة بنفس حساب Apple عبر خيار "استعادة المشتريات".
4. **إلغاء الترخيص:** إذا قامت Apple باسترداد أو إلغاء أو عكس معاملة KeyFixer Pro، فقد تتم إزالة صلاحية Pro المرتبطة بها بعد إعادة التحقق عبر StoreKit.

---

## 4. متطلبات النظام والأذونات
1. **الأنظمة المدعومة:** يعمل KeyFixer على إصدارات macOS المدعومة على معالجات Apple Silicon و Intel المتوافقة والموضحة في صفحة المتجر.
2. **إذن تسهيلات الاستخدام (Accessibility / PostEvent):** تتطلب ميزة التصحيح المباشر إذن النظام حصرياً لتنفيذ أمري \`Cmd+C\` و \`Cmd+V\` القياسيين عند ضغطك المباشر على الاختصار \`⌥⌘K\`.

---

## 5. الصيانة والتحديثات
يلتزم المطور بتقديم تحديثات الصيانة والأمان المعقولة حيثما يقتضي القانون ذلك لضمان مطابقة المنتج. ولا يضمن المطور التوافق مع إصدارات macOS الرئيسية المستقبلية التي قد تغير أو تلغي واجهات برمجة النظام الأساسية الخارجة عن سيطرة المطور.

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

**Product:** KeyFixer for macOS  
**Product ID:** \`com.obadadallo.keyfixer.pro.lifetime\`  
**Distribution:** Mac App Store Exclusive  
**Developer:** Obada Dallo (Chemnitz, Germany)  
**Contact:** obada.dallo95@gmail.com  
**Website:** https://keyfixer.vercel.app/  

---

KeyFixer Pro Lifetime is purchased exclusively through Apple's In-App Purchase system. KeyFixer does not process or hold customer payment information.

Refund requests for Mac App Store purchases are handled by Apple. Users may submit an eligible refund request through Apple's official Report a Problem service. Refund eligibility and decisions are determined by Apple under its applicable terms and consumer-protection law.

If Apple refunds, revokes, or reverses a KeyFixer Pro transaction, the associated Pro entitlement may be removed after StoreKit re-verification.

Nothing in this policy limits mandatory statutory consumer rights.`,
    contentAr: `# سياسة الشراء والاسترداد

**المنتج:** تطبيق KeyFixer لنظام macOS  
**معرف المنتج:** \`com.obadadallo.keyfixer.pro.lifetime\`  
**التوزيع:** حصرياً عبر متجر Mac App Store  
**المطور:** عبادة دللو (Obada Dallo) — كيمنتس، ألمانيا  
**البريد الإلكتروني:** obada.dallo95@gmail.com  
**الموقع الإلكتروني:** https://keyfixer.vercel.app/  

---

يتم شراء KeyFixer Pro مدى الحياة حصريًا عبر نظام الشراء داخل التطبيق التابع لشركة Apple، ولا يقوم KeyFixer بمعالجة بيانات الدفع الخاصة بالمستخدم أو الاحتفاظ بها.

تتولى Apple معالجة طلبات استرداد مشتريات Mac App Store. ويمكن للمستخدم تقديم طلب استرداد مؤهل من خلال خدمة «الإبلاغ عن مشكلة» الرسمية التابعة لـApple. وتحدد Apple أهلية طلبات الاسترداد والقرار بشأنها وفق شروطها المعمول بها وقوانين حماية المستهلك ذات الصلة.

إذا قامت Apple باسترداد أو إلغاء أو عكس معاملة KeyFixer Pro، فقد تتم إزالة صلاحية Pro المرتبطة بها بعد إعادة التحقق عبر StoreKit.

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

When you select text and press ⌥⌘K, KeyFixer uses macOS permission only to trigger the standard Copy (Cmd+C) and Paste (Cmd+V) actions required to replace that selection.

KeyFixer does not monitor your typing, record keystrokes, scan documents in the background, or upload the selected text. Text correction happens locally on your Mac.`,
    contentAr: `# إفصاح أذونات تسهيلات الاستخدام

### لماذا يحتاج KeyFixer إلى إذن تسهيلات الاستخدام؟

تتيح ميزة التصحيح المباشر تصحيح النص المحدد مباشرة داخل تطبيق آخر.

عندما تحدد نصًا وتضغط ⌥⌘K، يستخدم KeyFixer إذن macOS فقط لتنفيذ عمليتي النسخ (Cmd+C) واللصق (Cmd+V) اللازمتين لاستبدال النص المحدد.

لا يراقب KeyFixer كتابتك، ولا يسجل ضغطات المفاتيح، ولا يفحص المستندات في الخلفية، ولا يرفع النص المحدد إلى أي خادم. تتم عملية التصحيح محليًا على جهاز Mac.`,
  },
};
