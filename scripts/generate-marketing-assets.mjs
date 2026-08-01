import fs from 'fs/promises';
import path from 'path';
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'store-assets/microsoft');

const iconPath = path.join(rootDir, 'src-tauri/icons/icon_512x512.png');
const ssPath = (name) => path.join(rootDir, `docs/assets/windows/${name}`);

const THEMES = [
  {
    id: '01-instant-correction',
    image: 'english-to-arabic.jpeg',
    ar: {
      head: 'صحّح تخطيط الكتابة فورًا',
      sub: 'حوّل النص المكتوب بلغة لوحة المفاتيح الخطأ دون إعادة الكتابة'
    },
    en: {
      head: 'Fix keyboard layouts instantly',
      sub: 'Convert text typed with the wrong keyboard layout without retyping'
    }
  },
  {
    id: '02-auto-detection',
    image: 'auto-detect.jpeg',
    ar: {
      head: 'كشف تلقائي لاتجاه التحويل',
      sub: 'يحدد KeyFixer اتجاه التصحيح المناسب تلقائيًا'
    },
    en: {
      head: 'Automatic direction detection',
      sub: 'KeyFixer detects the correct conversion direction automatically'
    }
  },
  {
    id: '03-windows-layout',
    image: 'english-to-arabic.jpeg',
    ar: {
      head: 'مصمم خصيصًا لويندوز',
      sub: 'دعم دقيق لتخطيط Windows Arabic 101'
    },
    en: {
      head: 'Designed for Windows',
      sub: 'Accurate support for the Windows Arabic 101 layout'
    }
  },
  {
    id: '04-private-offline',
    image: 'privacy-and-terms.jpeg',
    ar: {
      head: 'خصوصيتك أولًا',
      sub: 'تتم معالجة النص بالكامل على جهازك دون تتبع أو تخزين'
    },
    en: {
      head: 'Private and fully offline',
      sub: 'Your text is processed entirely on your device'
    }
  },
  {
    id: '05-quick-access',
    image: 'english-to-arabic.jpeg',
    ar: {
      head: 'وصول سريع من أي مكان',
      sub: 'افتح KeyFixer باستخدام Ctrl + Alt + K أو من شريط النظام'
    },
    en: {
      head: 'Quick access from anywhere',
      sub: 'Open KeyFixer with Ctrl + Alt + K or from the system tray'
    }
  }
];

const checklist = [];
function addChecklist(file, w, h, lang, field, req) {
  checklist.push(`| \`${file}\` | ${w}×${h} | ${lang} | ${field} | ${req ? 'Required' : 'Optional'} |`);
}

async function run() {
  await fs.mkdir(path.join(outDir, 'screenshots/ar'), { recursive: true });
  await fs.mkdir(path.join(outDir, 'screenshots/en'), { recursive: true });
  await fs.mkdir(path.join(outDir, 'poster'), { recursive: true });
  await fs.mkdir(path.join(outDir, 'box-art'), { recursive: true });
  await fs.mkdir(path.join(outDir, 'app-icons'), { recursive: true });
  await fs.mkdir(path.join(outDir, 'hero'), { recursive: true });

  const iconBuffer = await fs.readFile(iconPath);
  const iconB64 = `data:image/png;base64,${iconBuffer.toString('base64')}`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Screenshots (1366x768)
  for (const theme of THEMES) {
    const imgBuf = await fs.readFile(ssPath(theme.image));
    const imgB64 = `data:image/jpeg;base64,${imgBuf.toString('base64')}`;

    for (const lang of ['ar', 'en']) {
      const isAr = lang === 'ar';
      const dir = isAr ? 'rtl' : 'ltr';
      const font = isAr ? 'Segoe UI, Tahoma, sans-serif' : 'Segoe UI, sans-serif';
      
      const html = `
        <!DOCTYPE html>
        <html dir="${dir}">
        <head>
          <style>
            body {
              margin: 0; padding: 0; width: 1366px; height: 768px;
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              font-family: ${font};
              display: flex; flex-direction: column; align-items: center;
              box-sizing: border-box; padding-top: 60px;
              color: white; overflow: hidden;
            }
            .text-container {
              text-align: center; margin-bottom: 40px; max-width: 1100px;
            }
            h1 {
              font-size: 52px; margin: 0 0 12px 0; font-weight: 700;
              color: #f8fafc; text-shadow: 0 2px 4px rgba(0,0,0,0.3);
            }
            p {
              font-size: 26px; margin: 0; color: #94a3b8; font-weight: 400;
            }
            .image-container {
              flex: 1; display: flex; align-items: flex-start; justify-content: center;
              width: 100%;
            }
            img {
              max-height: 520px;
              border-radius: 8px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.05);
            }
          </style>
        </head>
        <body>
          <div class="text-container">
            <h1>${theme[lang].head}</h1>
            <p>${theme[lang].sub}</p>
          </div>
          <div class="image-container">
            <img src="${imgB64}" />
          </div>
        </body>
        </html>
      `;

      await page.setViewport({ width: 1366, height: 768 });
      await page.setContent(html);
      const outPath = path.join(outDir, `screenshots/${lang}/${theme.id}.png`);
      await page.screenshot({ path: outPath, type: 'png' });
      addChecklist(`screenshots/${lang}/${theme.id}.png`, 1366, 768, lang.toUpperCase(), 'Desktop Screenshots', true);
    }
  }

  // 2. Poster Art (720x1080, 1440x2160)
  for (const size of [{w: 720, h: 1080}, {w: 1440, h: 2160}]) {
    const scale = size.w / 720;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0; width: ${size.w}px; height: ${size.h}px;
            background: linear-gradient(180deg, #020617 0%, #0f172a 100%);
            font-family: 'Segoe UI', sans-serif;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: white; text-align: center;
          }
          img { width: ${240 * scale}px; margin-bottom: ${40 * scale}px; }
          h1 { font-size: ${72 * scale}px; margin: 0; font-weight: 700; color: #f8fafc; }
          p { font-size: ${28 * scale}px; margin: ${20 * scale}px 0 0 0; color: #f59e0b; font-weight: 500; text-transform: uppercase; letter-spacing: ${2 * scale}px; }
        </style>
      </head>
      <body>
        <img src="${iconB64}" />
        <h1>KeyFixer</h1>
        <p>Fix keyboard layouts</p>
      </body>
      </html>
    `;
    await page.setViewport({ width: size.w, height: size.h });
    await page.setContent(html);
    const outPath = path.join(outDir, `poster/poster-${size.w}x${size.h}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    addChecklist(`poster/poster-${size.w}x${size.h}.png`, size.w, size.h, 'Neutral', 'Poster Art', false);
  }

  // 3. Box Art (1080x1080, 2160x2160)
  for (const size of [{w: 1080, h: 1080}, {w: 2160, h: 2160}]) {
    const scale = size.w / 1080;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0; width: ${size.w}px; height: ${size.h}px;
            background: #0f172a;
            font-family: 'Segoe UI', sans-serif;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
          }
          .accent {
            position: absolute; width: ${size.w}px; height: ${size.h}px;
            background: radial-gradient(circle at center, rgba(245, 158, 11, 0.15) 0%, transparent 60%);
          }
          img { width: ${320 * scale}px; z-index: 1; }
          h1 { font-size: ${84 * scale}px; margin: ${40 * scale}px 0 0 0; font-weight: 700; color: #f8fafc; z-index: 1; }
        </style>
      </head>
      <body>
        <div class="accent"></div>
        <img src="${iconB64}" />
        <h1>KeyFixer</h1>
      </body>
      </html>
    `;
    await page.setViewport({ width: size.w, height: size.h });
    await page.setContent(html);
    const outPath = path.join(outDir, `box-art/box-art-${size.w}x${size.h}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    addChecklist(`box-art/box-art-${size.w}x${size.h}.png`, size.w, size.h, 'Neutral', '1:1 Box Art', false);
  }

  // 4. Hero Art (1920x1080, 3840x2160)
  for (const size of [{w: 1920, h: 1080}, {w: 3840, h: 2160}]) {
    const scale = size.w / 1920;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0; width: ${size.w}px; height: ${size.h}px;
            background: #0f172a; overflow: hidden;
            display: flex; align-items: center; justify-content: center;
          }
          .pattern {
            position: absolute; inset: 0; opacity: 0.05;
            background-image: radial-gradient(#cbd5e1 2px, transparent 2px);
            background-size: ${40 * scale}px ${40 * scale}px;
          }
          .glow {
            position: absolute; width: 100%; height: 100%;
            background: radial-gradient(circle at center, rgba(245, 158, 11, 0.2) 0%, #0f172a 70%);
          }
          .key-group {
            display: flex; gap: ${20 * scale}px; z-index: 1;
          }
          .key {
            width: ${120 * scale}px; height: ${120 * scale}px;
            background: rgba(30, 41, 59, 0.8);
            border: ${2 * scale}px solid rgba(255, 255, 255, 0.1);
            border-bottom-width: ${8 * scale}px;
            border-radius: ${12 * scale}px;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Segoe UI', sans-serif; font-size: ${48 * scale}px; font-weight: bold; color: #64748b;
            box-shadow: 0 ${10 * scale}px ${20 * scale}px rgba(0,0,0,0.5);
          }
          .key.active {
            color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); border-bottom-color: rgba(245, 158, 11, 0.6);
          }
        </style>
      </head>
      <body>
        <div class="pattern"></div>
        <div class="glow"></div>
        <div class="key-group">
          <div class="key">A</div>
          <div class="key active">ش</div>
          <div class="key">S</div>
          <div class="key">س</div>
        </div>
      </body>
      </html>
    `;
    await page.setViewport({ width: size.w, height: size.h });
    await page.setContent(html);
    const outPath = path.join(outDir, `hero/hero-${size.w}x${size.h}.png`);
    await page.screenshot({ path: outPath, type: 'png' });
    addChecklist(`hero/hero-${size.w}x${size.h}.png`, size.w, size.h, 'Neutral', '16:9 Super Hero Art', false);
  }

  await browser.close();

  // 5. App Icons (300x300, 150x150, 71x71)
  for (const size of [300, 150, 71]) {
    const pad = Math.floor(size * 0.15); // 15% padding
    const innerSize = size - (pad * 2);
    
    await sharp(iconPath)
      .resize(innerSize, innerSize)
      .extend({
        top: pad, bottom: pad, left: pad, right: pad,
        background: { r: 0, g: 0, b: 0, alpha: 0 } // transparent
      })
      .toFile(path.join(outDir, `app-icons/icon-${size}x${size}.png`));
    
    addChecklist(`app-icons/icon-${size}x${size}.png`, size, size, 'Neutral', 'App Tile Icon', size === 300);
  }

  // 6. Generate Checklist
  let md = '# Microsoft Store Asset Checklist\n\n';
  md += '| File | Dimensions | Language | Category | Requirement |\n';
  md += '|---|---|---|---|---|\n';
  md += checklist.join('\n');
  md += '\n';
  
  await fs.writeFile(path.join(outDir, 'ASSET-CHECKLIST.md'), md);
  console.log('✅ All assets generated successfully.');
}

run().catch(console.error);
