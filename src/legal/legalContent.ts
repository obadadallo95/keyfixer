/**
 * KeyFixer Legal Documents Source of Truth
 * Contains the finalized legal package for macOS (Mac App Store) and Windows in EN, AR, and DE.
 */

export type LegalDocId = 'privacy' | 'terms' | 'purchase-refund' | 'impressum' | 'accessibility';

export interface LegalDocument {
  id: LegalDocId;
  titleEn: string;
  titleAr: string;
  titleDe?: string;
  contentEn: string;
  contentAr: string;
  contentDe?: string;
}

export const LEGAL_DOCUMENTS: Record<LegalDocId, LegalDocument> = {
  privacy: {
    id: 'privacy',
    titleEn: 'Privacy Policy',
    titleAr: 'سياسة الخصوصية',
    titleDe: 'Datenschutzerklärung',
    contentEn: `# Privacy Policy

**Effective Date:** August 8, 2026  
**Last Updated:** August 17, 2026  
**Product:** KeyFixer for macOS and Windows  
**Developer:** Obada Dallo (Chemnitz, Germany)  
**Contact:** obada.dallo95@gmail.com  
**Website:** https://keyfixer.vercel.app/  

---

## 1. Overview
KeyFixer is a keyboard layout correction utility for macOS and Windows. We believe in privacy by design: all keyboard layout text conversion occurs 100% locally on your device in volatile memory (RAM). KeyFixer does not maintain user accounts, does not operate external text-processing servers, and never uploads your text.

---

## 2. Local Text Processing & Clipboard Isolation
- **100% Local Conversion:** All text conversion algorithms execute locally on your device in RAM.
- **Zero Text Storage:** Selected or converted text is processed strictly in transient memory and is never saved to disk, logged, or transmitted over the internet.
- **macOS Instant Fix (NSServices):** In the Mac App Store edition, Instant Fix (\`⌥⌘K\`) is powered by native macOS Services. It reads and returns text through dedicated service communication channels without overwriting or modifying your general clipboard (\`NSPasteboard.general\`).
- **No Background Monitoring or Keystroke Logging:** KeyFixer does not continuously monitor keystrokes, is not a keylogger, does not create a typing history, and does not inspect background applications or inactive windows.

---

## 3. Permissions & System Access
- **Mac App Store Edition:** Requires **zero Accessibility permissions** and zero input-monitoring permissions. All in-place text corrections run through Apple's native AppKit Services architecture within the standard macOS App Sandbox.
- **Direct / Windows Editions:** If running direct input simulation (\`Ctrl+Alt+K\` on Windows or legacy direct builds), simulated input is performed strictly on-demand when you explicitly invoke the shortcut.
- **No Behavioral Tracking:** KeyFixer does not record your screen, track application usage, or inspect unselected content.

---

## 4. In-App Purchases & Store Providers
- **Transactions Handled Exclusively by Official App Stores:** Purchases (including **KeyFixer Pro Lifetime**) are processed securely through Apple's StoreKit on macOS and the Microsoft Store on Windows.
- **No Financial Data Collected by KeyFixer:** KeyFixer does not receive, process, or store payment details, credit cards, or store passwords. Apple and Microsoft manage all billing in accordance with their respective privacy policies.
- **Local Entitlement Verification:** The application verifies Pro entitlements locally on-device using cryptographically signed transaction tokens from the platform store. StoreKit framework communication with Apple servers is used solely for license verification and purchase restoration.

---

## 5. Analytics & Diagnostic Logs
- **Zero Third-Party Trackers:** KeyFixer contains no third-party tracking, advertising SDKs, or analytics services.
- **Optional Platform Diagnostics:** Anonymous crash logs may be provided to the developer through official platform portals (Apple App Store Connect / Microsoft Partner Center) in accordance with your operating system settings.

---

## 6. Contact Information & Inquiries
For questions regarding this Privacy Policy:
- **Developer:** Obada Dallo
- **Location:** Chemnitz, Germany
- **Email:** obada.dallo95@gmail.com`,

    contentAr: `# سياسة الخصوصية

**تاريخ السريان:** 8 أغسطس 2026  
**آخر تحديث:** 17 أغسطس 2026  
**المنتج:** تطبيق KeyFixer لأنظمة macOS و Windows  
**المطور:** عبادة دللو (Obada Dallo) — كيمنتس، ألمانيا  
**البريد الإلكتروني:** obada.dallo95@gmail.com  
**الموقع الإلكتروني:** https://keyfixer.vercel.app/  

---

## 1. نظرة عامة
KeyFixer هو تطبيق لتصحيح تخطيط لوحة المفاتيح لأنظمة macOS و Windows، وهو مصمم وفق مبدأ الخصوصية أولاً: تتم جميع عمليات معالجة وتحويل النصوص محلياً بنسبة 100% على جهازك داخل الذاكرة المؤقتة (RAM). لا يمتلك KeyFixer حسابات مستخدمين، ولا يدير خوادم خارجية لمعالجة النصوص، ولا يرفع نصوصك إلى أي جهة.

---

## 2. معالجة النصوص وحماية الحافظة
- **معالجة محلية بالكامل:** تنفذ خوارزميات تصحيح النصوص محلياً على جهازك مباشرة داخل الذاكرة المؤقتة.
- **عدم تخزين النصوص:** تتم معالجة النص المحدد حصرياً أثناء عملية التحويل ولا يتم حفظه على القرص أو تسجيله أو نقله عبر الإنترنت أبدًا.
- **التصحيح الفوري عبر خدمات macOS (NSServices):** في نسخة Mac App Store، تعمل ميزة التصحيح الفوري (\`⌥⌘K\`) عبر خدمات نظام macOS الأصلية. تتم قراءة وإرجاع النص عبر قنوات الخدمة المخصصة دون تعديل أو مسح محتوى الحافظة العامة لجهازك (\`NSPasteboard.general\`).
- **عدم تسجيل المفاتيح أو المراقبة في الخلفية:** لا يراقب KeyFixer كتابتك في الخلفية، وليس برنامج تسجيل مفاتيح (Keylogger)، ولا ينشئ سجلاً لما تكتبه، ولا يفحص المستندات أو النوافذ المفتوحة.

---

## 3. الأذونات ووصول النظام
- **نسخة Mac App Store:** لا تتطلب **أي إذن لتسهيلات الاستخدام (Accessibility)** ولا أي إذن لمراقبة الإدخال. تعمل التصحيحات الفورية بالكامل عبر معمارية الخدمات الرسمية التابعة لـ Apple داخل بيئة الحماية المعزولة (App Sandbox).
- **نسخ ويندوز والإصدارات المباشرة:** تتم محاكاة الإدخال محلياً فقط عند ضغطك الصريح على الاختصار (\`Ctrl+Alt+K\` على ويندوز).
- **عدم تتبع النشاط:** لا يسجل التطبيق الشاشة ولا يراقب سلوكك ولا يفحص أي نصوص غير محددة.

---

## 4. عمليات الشراء والمتاجر الرسمية
- **المعالجة الحصرية عبر المتاجر الرسمية:** تتم جميع عمليات الشراء (بما فيها **KeyFixer Pro مدى الحياة**) بأمان عبر نظام Apple StoreKit على نظام macOS ومتجر مايكروسوفت Microsoft Store على نظام Windows.
- **عدم استلام البيانات المالية:** لا يستلم KeyFixer ولا يخزن تفاصيل بطاقات الدفع أو الحسابات المصرفية. تتولى المتاجر الرسمية معالجة الفوترة وفق سياساتها الخاصة.
- **التحقق من التراخيص:** يتحقق التطبيق من ترخيص Pro محلياً على جهازك عبر رموز المعاملات المشفرة الرسمية. يقتصر اتصال إطار StoreKit بخوادم Apple على التحقق من صحة الشراء واستعادة التراخيص.

---

## 5. التحليلات والتشخيص
- **لا توجد أدوات تتبع خارجية:** لا يحتوي التطبيق على أي إعلانات أو أدوات تتبع من طرف ثالث.
- **تقارير التشخيص الرسمية:** قد يتلقى المطور تقارير الأعطال مجهولة الهوية والمقدمة عبر منصات المطورين الرسمية (Apple App Store Connect / Microsoft Partner Center) وفقاً لإعدادات نظامك.

---

## 6. معلومات التواصل
لأي استفسارات بخصوص سياسة الخصوصية:
- **المطور:** عبادة دللو (Obada Dallo)
- **الموقع:** كيمنتس، ألمانيا
- **البريد الإلكتروني:** obada.dallo95@gmail.com`,

    contentDe: `# Datenschutzerklärung

**Gültig ab:** 8. August 2026  
**Zuletzt aktualisiert:** 17. August 2026  
**Produkt:** KeyFixer für macOS und Windows  
**Entwickler:** Obada Dallo (Chemnitz, Deutschland)  
**Kontakt:** obada.dallo95@gmail.com  
**Website:** https://keyfixer.vercel.app/  

---

## 1. Überblick
KeyFixer ist ein Dienstprogramm zur Korrektur von Tastaturlayouts für macOS und Windows. Datenschutz steht bei uns an erster Stelle: Die gesamte Textkonvertierung erfolgt zu 100 % lokal auf Ihrem Gerät im flüchtigen Arbeitsspeicher (RAM). KeyFixer führt keine Benutzerkonten, betreibt keine externen Server zur Textverarbeitung und überträgt Ihre Texte niemals ins Internet.

---

## 2. Lokale Textverarbeitung & Zwischenablage
- **100 % lokale Konvertierung:** Alle Konvertierungsalgorithmen werden lokal im Arbeitsspeicher Ihres Rechners ausgeführt.
- **Keine Speicherung von Texten:** Markierte oder konvertierte Texte werden flüchtig verarbeitet und niemals auf Datenträgern gespeichert, protokolliert oder versendet.
- **macOS Sofort-Korrektur (NSServices):** In der Mac App Store Edition basiert die Sofort-Korrektur (\`⌥⌘K\`) auf nativen macOS-Diensten. Sie liest und liefert Text über dedizierte Dienst-Kanäle, ohne Ihre allgemeine Zwischenablage (\`NSPasteboard.general\`) zu überschreiben.
- **Keine Hintergrundüberwachung oder Keylogger:** KeyFixer überwacht Tastatureingaben nicht im Hintergrund, ist kein Keylogger und scannt keine inaktiven Dokumente oder Fenster.

---

## 3. Berechtigungen & Systemzugriff
- **Mac App Store Edition:** Benötigt **keine Bedienungshilfen-Berechtigung (Accessibility)**. Alle Textkorrekturen laufen sicher über die native AppKit Services-Architektur innerhalb der regulären App Sandbox.
- **Windows- / Direkt-Version:** Eingabesimulationen erfolgen ausschließlich auf expliziten Tastendruck (\`Ctrl+Alt+K\` unter Windows).
- **Kein Tracking:** KeyFixer zeichnet weder Bildschirminhalte auf noch analysiert es nicht markierten Text.

---

## 4. In-App-Käufe & Store-Anbieter
- **Verarbeitung über offizielle Stores:** Käufe (**KeyFixer Pro Lifetime**) werden sicher über Apples StoreKit auf macOS und den Microsoft Store unter Windows abgewickelt.
- **Keine Erfassung von Zahlungsdaten:** KeyFixer erhält und speichert keine Kreditkarten- oder Bankdaten. Apple und Microsoft verarbeiten Zahlungen gemäß ihren eigenen Datenschutzrichtlinien.
- **Lokale Lizenzprüfung:** Die Freischaltung von Pro-Funktionen wird lokal auf dem Gerät anhand kryptografisch signierter Store-Zertifikate überprüft. StoreKit-Netzwerkzugriffe erfolgen ausschließlich zur Lizenzvalidierung und Wiederherstellung.

---

## 5. Analyse & Diagnosedaten
- **Keine Drittanbieter-Tracker:** KeyFixer bindet keine Werbe- oder Analyse-SDKs ein.
- **Optionale Plattformdiagnose:** Anonymisierte Absturzberichte können über offizielle Entwicklerportale (Apple App Store Connect / Microsoft Partner Center) bereitgestellt werden, sofern in Ihren Systemeinstellungen aktiviert.

---

## 6. Kontakt & Anfragen
Bei Fragen zu dieser Datenschutzerklärung:
- **Entwickler:** Obada Dallo
- **Ort:** Chemnitz, Deutschland
- **E-Mail:** obada.dallo95@gmail.com`,
  },

  terms: {
    id: 'terms',
    titleEn: 'Terms of Use',
    titleAr: 'شروط الاستخدام',
    titleDe: 'Nutzungsbedingungen',
    contentEn: `# Terms of Use

**Effective Date:** August 8, 2026  
**Last Updated:** August 17, 2026  
**Product:** KeyFixer for macOS and Windows  
**Developer:** Obada Dallo (Chemnitz, Germany)  
**Distribution:** Mac App Store & Microsoft Store  
**Contact:** obada.dallo95@gmail.com  
**Website:** https://keyfixer.vercel.app/  

---

## 1. Scope & Acceptance
These Terms of Use ("Terms") govern your use of **KeyFixer for macOS and Windows** ("Software"), developed by Obada Dallo ("Developer"). By downloading or using KeyFixer from the Mac App Store or Microsoft Store, you agree to these Terms and applicable platform store terms.

---

## 2. License & Features
1. **Free Tier:** KeyFixer provides free keyboard-layout text conversion within the main application window without requiring payment.
2. **Instant Fix Trial:** KeyFixer includes a free local trial of the **Instant Fix** feature (25 successful Instant Fix operations) for evaluating in-place text correction.
3. **KeyFixer Pro Lifetime:**
   - A one-time purchase with no recurring subscription fees. It unlocks unlimited Instant Fixes in supported applications while KeyFixer remains operational on compatible macOS and Windows versions.
4. **Compatibility & Fallback:**
   - Instant Fix operates in supported macOS applications and text fields via native macOS Services.
   - If an application does not expose text selection to macOS Services, the standard KeyFixer workflow (\`Copy → KeyFixer → Fix → Paste\`) remains fully functional.

---

## 3. Purchases & Restores
1. **Processed by Official App Stores:** All purchases and billing are processed exclusively through Apple StoreKit on macOS and the Microsoft Store on Windows.
2. **Restoring Purchases:** You can restore your KeyFixer Pro Lifetime license at any time on compatible devices associated with the same store account using "Restore Purchases".

---

## 4. Statutory Rights & Governing Law
1. **Consumer Rights:** Nothing in these Terms limits mandatory statutory consumer rights under applicable European Union or national law.
2. **Governing Law:** These Terms are governed by the laws of the Federal Republic of Germany.`,

    contentAr: `# شروط الاستخدام

**تاريخ السريان:** 8 أغسطس 2026  
**آخر تحديث:** 17 أغسطس 2026  
**المنتج:** تطبيق KeyFixer لأنظمة macOS و Windows  
**المطور:** عبادة دللو (Obada Dallo) — كيمنتس، ألمانيا  
**التوزيع:** متجر Mac App Store ومتجر Microsoft Store  
**البريد الإلكتروني:** obada.dallo95@gmail.com  
**الموقع الإلكتروني:** https://keyfixer.vercel.app/  

---

## 1. نطاق الاتفاقية
تحكم هذه الشروط استخدامك لتطبيق **KeyFixer** ("التطبيق")، المقدم من المطور عبادة دللو ("المطور"). بتحميل أو استخدام التطبيق من متجر Mac App Store أو متجر Microsoft Store، فإنك توافق على هذه الشروط والشروط المعتمدة للمتجر المعني.

---

## 2. الترخيص والميزات
1. **الميزات المجانية الأساسية:** يوفر KeyFixer تصحيح نصوص لوحة المفاتيح مجاناً داخل نافذة التطبيق دون الحاجة لدفع أي رسوم.
2. **التجربة المجانية للتصحيح الفوري:** يتضمن التطبيق تجربة محلية مجانية لميزة **التصحيح الفوري (Instant Fix)** (25 عملية تصحيح ناجحة).
3. **KeyFixer Pro مدى الحياة:**
   - شراء لمرة واحدة بدون أي اشتراكات دورية، يتيح الاستخدام غير المحدود للتصحيح الفوري داخل التطبيقات وحقول النص المدعومة.
4. **التوافق والطريقة البديلة:**
   - يعمل التصحيح الفوري في تطبيقات وحقول النص المدعومة على الماك عبر خدمات macOS الأصلية.
   - إذا كان هناك تطبيق لا يدعم خدمات النظام، يمكنك دائماً استخدام الطريقة المعتادة: (\`نسخ ← KeyFixer ← تصحيح ← لصق\`).

---

## 3. المشتريات واستعادتها
1. **المعالجة عبر المتاجر الرسمية:** تتم عمليات الدفع والفوترة حصرياً عبر Apple StoreKit على نظام macOS ومتجر Microsoft Store على نظام Windows.
2. **استعادة المشتريات:** يمكنك استعادة ترخيص Pro مدى الحياة في أي وقت على الأجهزة المرتبطة بنفس حساب المتجر عبر خيار "استعادة المشتريات".

---

## 4. حقوق المستهلك والقانون الحاكم
1. **حقوق المستهلك:** لا تحد هذه الشروط من أي حقوق قانونية إلزامية للمستهلك في الاتحاد الأوروبي أو في بلد إقامتك.
2. **القانون الحاكم:** تخضع هذه الشروط لقوانين جمهورية ألمانيا الاتحادية.`,

    contentDe: `# Nutzungsbedingungen

**Gültig ab:** 8. August 2026  
**Zuletzt aktualisiert:** 17. August 2026  
**Produkt:** KeyFixer für macOS und Windows  
**Entwickler:** Obada Dallo (Chemnitz, Deutschland)  
**Vertrieb:** Mac App Store & Microsoft Store  
**Kontakt:** obada.dallo95@gmail.com  
**Website:** https://keyfixer.vercel.app/  

---

## 1. Geltungsbereich & Zustimmung
Diese Nutzungsbedingungen regeln die Nutzung von **KeyFixer für macOS und Windows** („Software“), bereitgestellt von Obada Dallo („Entwickler“). Durch das Herunterladen oder die Nutzung von KeyFixer aus dem Mac App Store oder Microsoft Store stimmen Sie diesen Bedingungen zu.

---

## 2. Lizenz & Funktionsumfang
1. **Kostenlose Grundversion:** KeyFixer bietet die freie Tastaturlayout-Konvertierung im Hauptfenster der App ohne Kaufverpflichtung.
2. **Sofort-Korrektur Testphase:** Beinhaltet 25 kostenlose Sofort-Korrekturen zum Ausprobieren der direkten Textkorrektur in Apps.
3. **KeyFixer Pro Lifetime:**
   - Einmaliger Kauf ohne wiederkehrende Abogebühren für unbegrenzte Sofort-Korrekturen in unterstützten Apps.
4. **Kompatibilität & Standard-Ablauf:**
   - Die Sofort-Korrektur funktioniert in unterstützten macOS-Apps über native macOS-Dienste.
   - Falls eine App keine Dienste-Schnittstelle unterstützt, steht der bewährte Standard-Ablauf (\`Kopieren → KeyFixer → Korrigieren → Einfügen\`) uneingeschränkt zur Verfügung.

---

## 3. Käufe & Wiederherstellung
1. **Offizielle Abwicklung:** Alle Transaktionen werden ausschließlich über Apple StoreKit (macOS) bzw. den Microsoft Store (Windows) abgewickelt.
2. **Käufe wiederherstellen:** Sie können Ihre Pro Lifetime-Lizenz jederzeit auf kompatiblen Geräten mit demselben Store-Konto wiederherstellen.

---

## 4. Verbraucherrechte & Anwendbares Recht
1. **Verbraucherrechte:** Gesetzliche Verbraucher- und Gewährleistungsrechte bleiben unberührt.
2. **Recht:** Es gilt das Recht der Bundesrepublik Deutschland.`,
  },

  'purchase-refund': {
    id: 'purchase-refund',
    titleEn: 'Purchase & Refund Policy',
    titleAr: 'سياسة الشراء والاسترجاع',
    titleDe: 'Kauf- & Erstattungsrichtlinie',
    contentEn: `# Purchase & Refund Policy

**Product:** KeyFixer for macOS and Windows  
**Product ID (macOS):** \`com.obadadallo.keyfixer.pro.lifetime\`  
**Product ID (Windows):** \`keyfixer.pro.lifetime\` (Store ID: \`9N98VZCQLDL7\`)  
**Distribution:** Mac App Store & Microsoft Store  
**Developer:** Obada Dallo (Chemnitz, Germany)  
**Contact:** obada.dallo95@gmail.com  
**Website:** https://keyfixer.vercel.app/  

---

KeyFixer Pro Lifetime is purchased exclusively through official platform stores (Apple's In-App Purchase system on macOS and Microsoft Store on Windows). KeyFixer does not collect or hold customer billing information.

Refund requests are handled directly by the respective store:
- **Mac App Store:** Refund requests are handled by Apple. Users may submit an eligible refund request through Apple's official Report a Problem service.
- **Microsoft Store:** Refund requests are handled by Microsoft via your Microsoft Account order history.

If the store refunds, revokes, or reverses a KeyFixer Pro transaction, the associated Pro entitlement may be removed upon store re-verification. Nothing in this policy limits mandatory statutory consumer rights.`,

    contentAr: `# سياسة الشراء والاسترداد

**المنتج:** تطبيق KeyFixer لأنظمة macOS و Windows  
**معرف المنتج (macOS):** \`com.obadadallo.keyfixer.pro.lifetime\`  
**معرف المنتج (Windows):** \`keyfixer.pro.lifetime\` (معرف المتجر: \`9N98VZCQLDL7\`)  
**التوزيع:** متجر Mac App Store ومتجر Microsoft Store  
**المطور:** عبادة دللو (Obada Dallo) — كيمنتس، ألمانيا  
**البريد الإلكتروني:** obada.dallo95@gmail.com  
**الموقع الإلكتروني:** https://keyfixer.vercel.app/  

---

يتم شراء KeyFixer Pro مدى الحياة حصريًا عبر المتاجر الرسمية (نظام الشراء داخل التطبيق التابع لـ Apple على macOS ومتجر Microsoft Store على Windows)، ولا يقوم KeyFixer بمعالجة أو تخزين بيانات الدفع الخاصة بالمستخدم.

تتولى منصة المتجر المعنية معالجة طلبات الاسترداد:
- **Mac App Store:** تتولى Apple معالجة طلبات استرداد مشتريات Mac App Store من خلال خدمة «الإبلاغ عن مشكلة» الرسمية وفق شروطها.
- **Microsoft Store:** تتولى Microsoft معالجة طلبات الاسترداد عبر سجل طلبات حساب مايكروسوفت الخاص بك.

إذا قام المتجر باسترداد أو إلغاء أو عكس معاملة KeyFixer Pro، فقد تتم إزالة صلاحية Pro المرتبطة بها بعد إعادة التحقق. لا تحد هذه السياسة من أي حقوق قانونية إلزامية للمستهلك.`,

    contentDe: `# Kauf- & Erstattungsrichtlinie

**Produkt:** KeyFixer für macOS und Windows  
**Produkt-ID (macOS):** \`com.obadadallo.keyfixer.pro.lifetime\`  
**Produkt-ID (Windows):** \`keyfixer.pro.lifetime\` (Store-ID: \`9N98VZCQLDL7\`)  
**Vertrieb:** Mac App Store & Microsoft Store  
**Entwickler:** Obada Dallo (Chemnitz, Deutschland)  
**Kontakt:** obada.dallo95@gmail.com  
**Website:** https://keyfixer.vercel.app/  

---

KeyFixer Pro Lifetime wird ausschließlich über die offiziellen App-Stores erworben (Apples In-App-Kauf-System auf macOS und der Microsoft Store unter Windows). KeyFixer erfasst oder speichert keine Zahlungsinformationen.

Erstattungsanträge werden direkt über den jeweiligen Store abgewickelt:
- **Mac App Store:** Erstattungen werden von Apple über den offiziellen Dienst „Problem melden“ bearbeitet.
- **Microsoft Store:** Erstattungen werden von Microsoft über den Bestellverlauf Ihres Microsoft-Kontos abgewickelt.

Wird ein Kauf erstattet oder widerrufen, wird die Pro-Freischaltung nach Store-Prüfung entsprechend zurückgesetzt. Gesetzliche Verbraucherrechte bleiben unberührt.`,
  },

  impressum: {
    id: 'impressum',
    titleEn: 'Legal Notice',
    titleAr: 'المعلومات القانونية',
    titleDe: 'Impressum',
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

### Verbraucherstreitbeilegung:
Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.`,
  },

  accessibility: {
    id: 'accessibility',
    titleEn: 'Accessibility & Permissions',
    titleAr: 'الأذونات والوصول',
    titleDe: 'Bedienungshilfen & Berechtigungen',
    contentEn: `# Permissions & Services Architecture

### Mac App Store Edition: Zero Accessibility Permissions
The Mac App Store edition of KeyFixer uses Apple's native **NSServices** architecture to provide **Instant Fix (\`⌥⌘K\`)**.
- **No Accessibility Access Required:** KeyFixer does not request Accessibility permissions or PostEvent authorization.
- **Sandboxed & Private:** Runs securely within Apple's App Sandbox. Text conversion occurs 100% locally in memory on your Mac.
- **Isolated Pasteboard:** NSServices communication uses dedicated service pasteboards and never modifies your general clipboard.

### Direct / Windows Editions
Legacy direct macOS builds and Windows editions perform on-demand input simulation solely when you explicitly press the global shortcut. Text is always processed locally on your device.`,

    contentAr: `# معمارية الأذونات والخدمات

### نسخة Mac App Store: بدون أي إذن لتسهيلات الاستخدام
تعتمد نسخة Mac App Store من KeyFixer على معمارية خدمات نظام ماك الأصلية (**NSServices**) لتوفير ميزة **التصحيح الفوري (\`⌥⌘K\`)**.
- **بدون الحاجة لإذن تسهيلات الاستخدام:** لا يطلب التطبيق إذن Accessibility ولا إذن PostEvent.
- **حماية تامة وعزل محلي:** يعمل التطبيق بأمان داخل بيئة الحماية المعزولة (App Sandbox). تتم معالجة النصوص محلياً بنسبة 100% داخل الذاكرة على جهاز الماك.
- **حماية الحافظة العامة:** يتم تبادل النصوص عبر قنوات الخدمة المخصصة دون المساس بالحافظة العامة لجهازك.

### نسخ ويندوز والإصدارات المباشرة
تنفذ محاكاة الإدخال محلياً فقط عند ضغطك المباشر على الاختصار المحدد، وتتم معالجة النصوص محلياً على جهازك دائماً.`,

    contentDe: `# Berechtigungs- & Dienste-Architektur

### Mac App Store Edition: Keine Bedienungshilfen-Berechtigung
Die Mac App Store Edition von KeyFixer nutzt die native **NSServices**-Architektur von Apple für die **Sofort-Korrektur (\`⌥⌘K\`)**.
- **Keine Bedienungshilfen-Berechtigung erforderlich:** KeyFixer fordert weder Accessibility- noch PostEvent-Rechte an.
- **Sandboxed & Privat:** Läuft sicher in Apples App Sandbox. Die Textkonvertierung erfolgt zu 100 % lokal im RAM Ihres Macs.
- **Isolierte Zwischenablage:** Die Kommunikation erfolgt über dedizierte Dienst-Kanäle und verändert nicht Ihre allgemeine Zwischenablage.

### Windows- und Direkt-Versionen
Direkte Versionen führen Eingabesimulationen nur bei expliziter Betätigung des Tastenkürzels aus. Die Verarbeitung erfolgt stets lokal.`,
  },
};
