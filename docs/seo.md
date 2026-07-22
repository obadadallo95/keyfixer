# KeyFixer SEO & Integration Guide

## 1. Overview
KeyFixer is equipped with a lightweight, production-ready SEO foundation designed for high discoverability, accurate search engine indexing, and social media rich previews.

---

## 2. SEO Metadata & Social Assets

### Primary Meta Tags
- **Title**: `KeyFixer – Arabic & English Keyboard Layout Fixer`
- **Meta Description**: `Fix text typed with the wrong Arabic or English keyboard layout instantly. Free, private, and fully offline.`
- **Theme Color**: `#050505`
- **Robots**: `index, follow`

### Open Graph & Social Cards
- **`og:title`**: `KeyFixer – Arabic & English Keyboard Layout Fixer`
- **`og:description`**: `Fix text typed with the wrong Arabic or English keyboard layout instantly. Free, private, and fully offline.`
- **`og:image`**: `https://keyfixer.web.app/og-image.png` (1200×630px high-contrast dark theme)
- **`og:type`**: `website`
- **`twitter:card`**: `summary_large_image`

### Favicon Assets
Located in `public/`:
- `favicon.ico`
- `favicon-16x16.png`
- `favicon-32x32.png`
- `apple-touch-icon.png` (180×180px)

---

## 3. Structured Data (JSON-LD)
KeyFixer implements a unified Schema.org `@graph` script inside `index.html` connecting three distinct entities:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://obadadallo.web.app/#person",
      "name": "Obada Dallo",
      "alternateName": "عبادة دللو",
      "url": "https://obadadallo.web.app/",
      "image": "https://obadadallo.web.app/og-image.jpg",
      "jobTitle": "AI-First Product Builder",
      "sameAs": [
        "https://obadadallo.web.app/",
        "https://github.com/obadadallo95",
        "https://www.linkedin.com/in/obada-dallo-777a47a9/"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://keyfixer.web.app/#website",
      "name": "KeyFixer",
      "url": "https://keyfixer.web.app/",
      "publisher": { "@id": "https://obadadallo.web.app/#person" }
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://keyfixer.web.app/#software",
      "name": "KeyFixer",
      "applicationCategory": "UtilitiesApplication",
      "operatingSystem": "Windows, macOS, Chrome OS, Linux",
      "softwareVersion": "1.0.0",
      "isAccessibleForFree": true,
      "downloadUrl": "https://github.com/obadadallo95/keyfixer/releases/tag/v1.0.0",
      "codeRepository": "https://github.com/obadadallo95/keyfixer",
      "author": { "@id": "https://obadadallo.web.app/#person" }
    }
  ]
}
```

---

## 4. Canonical URL & Deployment Configuration
- Default Production URL: `https://keyfixer.web.app/`
- Configured in:
  - `index.html` (`<link rel="canonical" ...>`)
  - `public/sitemap.xml` (`<loc>...`)
  - `public/robots.txt` (`Sitemap: ...`)

*(If deploying to a custom domain or subdirectory, update the base URL in `index.html`, `sitemap.xml`, and `robots.txt` accordingly).*

---

## 5. Portfolio & Author Linking Strategy
- Developer attribution links back to the portfolio: `https://obadadallo.web.app/`
- External links include `rel="me noopener noreferrer"` for identity verification.

---

## 6. How to Validate SEO & Social Cards
1. **Google Rich Results Test**: [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results)
2. **Schema.org Validator**: [https://validator.schema.org/](https://validator.schema.org/)
3. **LinkedIn Post Inspector**: [https://www.linkedin.com/post-inspector/](https://www.linkedin.com/post-inspector/)
4. **Facebook Sharing Debugger**: [https://developers.facebook.com/tools/debug/](https://developers.facebook.com/tools/debug/)
5. **Google Search Console**: Submit `sitemap.xml` after production deployment.
