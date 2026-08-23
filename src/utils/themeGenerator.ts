/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BusinessTheme } from '../types';

// Helper: RGB to Hex
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Helper: Hex to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num) || cleanHex.length !== 6) {
    return { r: 136, g: 80, b: 0 }; // Fallback default warm amber
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Helper: RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Helper: HSL to Hex
export function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return rgbToHex((r + m) * 255, (g + m) * 255, (b + m) * 255);
}

// WCAG 2.1 Relative Luminance Calculation
export function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// WCAG 2.1 Contrast Ratio Calculation
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getLuminance(hex1);
  const lum2 = getLuminance(hex2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);
  return Number(ratio.toFixed(2));
}

// Extract dominant and secondary colors from an image URL / Data URI using HTML Canvas
export async function extractColorsFromLogo(imageSrc: string): Promise<{
  dominantColors: string[];
  rawPalette: string[];
}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            dominantColors: ['#7A4E2D', '#C49A6C', '#F3E6D8'],
            rawPalette: ['#7A4E2D', '#C49A6C', '#F3E6D8', '#211A15'],
          });
          return;
        }

        // Downsample to 64x64 for speed and noise reduction
        const width = 64;
        const height = 64;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Color quantization histogram
        const colorBuckets: { [key: string]: { r: number; g: number; b: number; count: number } } = {};
        const step = 4; // Sample every 4th pixel for speed

        for (let i = 0; i < data.length; i += step * 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Ignore transparent pixels
          if (a < 80) continue;

          // Ignore extreme near-pure white (background) unless no other colors
          if (r > 248 && g > 248 && b > 248) continue;

          // Quantize to 32 levels per channel
          const qr = Math.round(r / 16) * 16;
          const qg = Math.round(g / 16) * 16;
          const qb = Math.round(b / 16) * 16;

          const key = `${qr}-${qg}-${qb}`;
          if (!colorBuckets[key]) {
            colorBuckets[key] = { r: qr, g: qg, b: qb, count: 0 };
          }
          colorBuckets[key].count++;
        }

        const sortedColors = Object.values(colorBuckets).sort((a, b) => b.count - a.count);

        if (sortedColors.length === 0) {
          // Fallback if logo was completely white/transparent
          resolve({
            dominantColors: ['#885000', '#A6681C', '#FDBD72'],
            rawPalette: ['#885000', '#A6681C', '#FDBD72', '#211A15'],
          });
          return;
        }

        // Distinct color filtering (avoid nearly identical adjacent shades)
        const distinctColors: string[] = [];
        for (const c of sortedColors) {
          const hex = rgbToHex(c.r, c.g, c.b);
          const isTooClose = distinctColors.some((existing) => {
            const rgb1 = hexToRgb(existing);
            const dist = Math.sqrt(
              Math.pow(rgb1.r - c.r, 2) + Math.pow(rgb1.g - c.g, 2) + Math.pow(rgb1.b - c.b, 2)
            );
            return dist < 45; // Minimum color distance
          });

          if (!isTooClose) {
            distinctColors.push(hex);
          }
          if (distinctColors.length >= 6) break;
        }

        // Pick top distinct colors
        const rawPalette = distinctColors.length > 0 ? distinctColors : ['#7A4E2D', '#C49A6C', '#F3E6D8'];
        resolve({
          dominantColors: rawPalette.slice(0, 3),
          rawPalette: rawPalette,
        });
      } catch (err) {
        console.warn('Canvas color extraction error:', err);
        resolve({
          dominantColors: ['#7A4E2D', '#C49A6C', '#F3E6D8'],
          rawPalette: ['#7A4E2D', '#C49A6C', '#F3E6D8', '#211A15'],
        });
      }
    };

    img.onerror = () => {
      resolve({
        dominantColors: ['#885000', '#A6681C', '#FDBD72'],
        rawPalette: ['#885000', '#A6681C', '#FDBD72', '#211A15'],
      });
    };

    img.src = imageSrc;
  });
}

// Generate accessible, harmonious design tokens from logo colors
export function generateAccessibleTheme(logoUrl: string, extractedColors: string[]): BusinessTheme {
  const primarySourceHex = extractedColors[0] || '#7A4E2D';
  const accentSourceHex = extractedColors[1] || extractedColors[0] || '#C49A6C';
  const secondarySourceHex = extractedColors[2] || extractedColors[1] || '#F3E6D8';

  const primaryRgb = hexToRgb(primarySourceHex);
  const primaryHsl = rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);

  const accentRgb = hexToRgb(accentSourceHex);
  const accentHsl = rgbToHsl(accentRgb.r, accentRgb.g, accentRgb.b);

  // 1. Primary Color: Tuned for crisp contrast on light surfaces & buttons (Lightness 28% - 36%, rich saturation)
  let tunedPrimaryL = primaryHsl.l;
  if (tunedPrimaryL > 36) tunedPrimaryL = 32;
  if (tunedPrimaryL < 20) tunedPrimaryL = 26;
  const tunedPrimaryS = Math.min(85, Math.max(50, primaryHsl.s));
  const primaryColor = hslToHex(primaryHsl.h, tunedPrimaryS, tunedPrimaryL);

  // 2. Primary Hover & Light Container
  const primaryHover = hslToHex(primaryHsl.h, tunedPrimaryS, Math.max(16, tunedPrimaryL - 8));
  const primaryLight = hslToHex(primaryHsl.h, 25, 96);

  // 3. Accent Color: Complementary or vibrant analog with high visibility
  let accentH = accentHsl.h;
  if (Math.abs(accentH - primaryHsl.h) < 15) {
    accentH = (primaryHsl.h + 35) % 360;
  }
  const accentColor = hslToHex(accentH, Math.max(55, accentHsl.s), 48);

  // 4. Secondary Container: Soft pastel badge tint
  const secondaryColor = hslToHex(primaryHsl.h, 35, 90);

  // 5. Background: Clean, warm alabaster linen canvas
  const backgroundColor = '#faf7f2';

  // 6. Surface & Containers (Pure white cards + warm ivory sidebar container)
  const surfaceColor = '#ffffff';
  const surfaceContainer = '#f4ede4';
  const surfaceContainerHigh = '#ede4d8';

  // 7. Dark Neutral Typography: Deep rich espresso charcoal for pristine WCAG AA/AAA legibility
  const textColor = '#1e1610';
  const textMuted = '#615244';

  // 8. Borders & Structural Dividers
  const borderColor = '#e5dacd';

  // 9. WCAG Accessibility Checks
  const contrastRatio = getContrastRatio(textColor, backgroundColor);
  const primaryContrast = getContrastRatio(primaryColor, '#ffffff');

  let wcagRating: 'AAA' | 'AA' | 'Pass' = 'Pass';
  if (contrastRatio >= 7.0 && primaryContrast >= 4.5) {
    wcagRating = 'AAA';
  } else if (contrastRatio >= 4.5) {
    wcagRating = 'AA';
  }

  // 10. Harmony Name Classification
  let harmonyName = 'Bespoke Atelier Palette';
  if (primaryHsl.h >= 15 && primaryHsl.h <= 45) {
    harmonyName = 'Warm Amber & Ochre';
  } else if (primaryHsl.h > 45 && primaryHsl.h <= 70) {
    harmonyName = 'Imperial Golden Silk';
  } else if (primaryHsl.h > 70 && primaryHsl.h <= 165) {
    harmonyName = 'Forest Velvet & Emerald';
  } else if (primaryHsl.h > 165 && primaryHsl.h <= 250) {
    harmonyName = 'Savile Row Cobalt & Navy';
  } else if (primaryHsl.h > 250 && primaryHsl.h <= 330) {
    harmonyName = 'Burgundy & Royal Plum';
  } else {
    harmonyName = 'Florentine Crimson & Charcoal';
  }

  return {
    logoUrl,
    primaryColor,
    primaryHover,
    primaryLight,
    secondaryColor,
    accentColor,
    backgroundColor,
    surfaceColor,
    surfaceContainer,
    surfaceContainerHigh,
    textColor,
    textMuted,
    borderColor,
    contrastRatio,
    wcagRating,
    harmonyName,
    extractedPalette: extractedColors.length > 0 ? extractedColors : [primarySourceHex, accentSourceHex, secondarySourceHex],
    analyzedAt: new Date().toISOString(),
  };
}

// Inject Dynamic CSS Variables and Comprehensive Class Overrides to Document Root
export function applyThemeToDocument(theme: BusinessTheme, isDark: boolean = true): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Ensure Tailwind's dark class is synced to the document root
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  const primaryRgb = hexToRgb(theme.primaryColor);
  const primaryHsl = rgbToHsl(primaryRgb.r, primaryRgb.g, primaryRgb.b);

  if (isDark) {
    // Dark mode adaptive variants - sophisticated bespoke atelier palette
    const darkBg = '#150f0b';
    const darkSurface = '#241a13';
    const darkContainer = '#1a120c';
    const darkText = '#f7ebe1';
    const darkMuted = '#d7c3b2';

    // In dark mode, ensure the brand highlight has vibrant luminosity (L: 55-65%)
    const darkBrandAccent = hslToHex(primaryHsl.h, Math.max(65, primaryHsl.s), 58);
    const darkBrandHover = hslToHex(primaryHsl.h, Math.max(65, primaryHsl.s), 66);
    const darkBrandSecondary = hslToHex(primaryHsl.h, 40, 22);

    root.style.setProperty('--color-primary', darkBrandAccent);
    root.style.setProperty('--color-primary-container', theme.primaryColor);
    root.style.setProperty('--color-surface-bright', darkSurface);
    root.style.setProperty('--color-surface-dim', darkBg);
    root.style.setProperty('--color-surface-container-lowest', darkBg);
    root.style.setProperty('--color-surface-container-low', darkContainer);
    root.style.setProperty('--color-surface-container', darkSurface);
    root.style.setProperty('--color-surface-container-high', '#2d2118');
    root.style.setProperty('--color-surface-container-highest', '#382a1f');
    root.style.setProperty('--color-on-surface', darkText);
    root.style.setProperty('--color-on-surface-variant', darkMuted);
    root.style.setProperty('--color-outline', '#524438');
    root.style.setProperty('--color-outline-variant', '#3d2d21');
    root.style.setProperty('--color-secondary-container', darkBrandSecondary);
    root.style.setProperty('--color-on-secondary-container', darkBrandAccent);

    root.style.setProperty('--brand-primary', darkBrandAccent);
    root.style.setProperty('--brand-primary-hover', darkBrandHover);
    root.style.setProperty('--brand-accent', darkBrandAccent);
    root.style.setProperty('--brand-bg', darkBg);
    root.style.setProperty('--brand-surface', darkSurface);
    root.style.setProperty('--brand-text', darkText);
    root.style.setProperty('--brand-border', '#524438');
    root.style.setProperty('--brand-secondary', darkBrandSecondary);
  } else {
    // Light mode design tokens
    root.style.setProperty('--color-primary', theme.primaryColor);
    root.style.setProperty('--color-primary-container', theme.primaryHover);
    root.style.setProperty('--color-surface-bright', '#f8f6f2');
    root.style.setProperty('--color-surface-dim', '#eae1d6');
    root.style.setProperty('--color-surface-container-lowest', '#ffffff');
    root.style.setProperty('--color-surface-container-low', '#fdfbf7');
    root.style.setProperty('--color-surface-container', '#f3ede4');
    root.style.setProperty('--color-surface-container-high', '#eae1d6');
    root.style.setProperty('--color-surface-container-highest', '#ded4c7');
    root.style.setProperty('--color-on-surface', '#1a120b');
    root.style.setProperty('--color-on-surface-variant', '#2e2218');
    root.style.setProperty('--color-outline', '#5e4d3e');
    root.style.setProperty('--color-outline-variant', '#ded4c7');
    root.style.setProperty('--color-secondary-container', '#fbe8d0');
    root.style.setProperty('--color-on-secondary-container', theme.primaryColor);

    root.style.setProperty('--brand-primary', theme.primaryColor);
    root.style.setProperty('--brand-primary-hover', theme.primaryHover);
    root.style.setProperty('--brand-accent', theme.accentColor);
    root.style.setProperty('--brand-bg', '#f8f6f2');
    root.style.setProperty('--brand-surface', '#ffffff');
    root.style.setProperty('--brand-text', '#1a120b');
    root.style.setProperty('--brand-border', '#ded4c7');
    root.style.setProperty('--brand-secondary', '#fbe8d0');
  }

  // Update dynamic style tag for instantaneous visible theme across the entire workspace
  let styleEl = document.getElementById('atelieros-theme-style');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'atelieros-theme-style';
    document.head.appendChild(styleEl);
  }

  const primaryBrand = isDark
    ? hslToHex(primaryHsl.h, Math.max(65, primaryHsl.s), 58)
    : hslToHex(primaryHsl.h, Math.max(70, primaryHsl.s), 38);
  const primaryHover = isDark
    ? hslToHex(primaryHsl.h, Math.max(65, primaryHsl.s), 66)
    : hslToHex(primaryHsl.h, Math.max(70, primaryHsl.s), 30);
  const secondaryBadge = isDark
    ? hslToHex(primaryHsl.h, 35, 20)
    : '#fbe8d0';
  const activeNavText = primaryBrand;
  const textBrand = primaryBrand;

  if (isDark) {
    styleEl.innerHTML = `
      /* ===================================================
         DARK THEME: Deep Obsidian Atelier Palette
         =================================================== */
      body,
      .dark body,
      .dark .bg-\\[\\#fff8f4\\] {
        background-color: #120c08 !important;
        color: #f7ebe1 !important;
      }

      .dark aside,
      .dark header,
      .dark .bg-\\[\\#fff1e7\\] {
        background-color: #18110b !important;
        border-color: #38291e !important;
      }

      /* Dark Mode Cards, Tiles, Panels */
      .dark .bg-white,
      .dark article,
      .dark section.bg-white,
      .dark div.bg-white,
      .dark [role="dialog"] .bg-white {
        background-color: #1e1610 !important;
        border-color: #3d2f24 !important;
      }

      /* Dark Mode Inner container wells */
      .dark .bg-white .bg-\\[\\#fff8f4\\],
      .dark .bg-white .bg-\\[\\#fff1e7\\],
      .dark article .bg-\\[\\#fff8f4\\],
      .dark article .bg-\\[\\#fff1e7\\] {
        background-color: #160e08 !important;
        border-color: #332419 !important;
      }

      /* Dark Mode Headings and Text */
      .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6,
      .dark .text-\\[\\#211a15\\],
      .dark .text-white {
        color: #ffffff !important;
      }

      .dark .text-\\[\\#524438\\] {
        color: #f2e5d9 !important;
      }

      .dark .text-\\[\\#847466\\] {
        color: #c4b3a3 !important;
      }

      /* Primary Brand Buttons in Dark Mode */
      .dark button.bg-\\[\\#a6681c\\],
      .dark button.bg-\\[\\#885000\\],
      .dark a.bg-\\[\\#a6681c\\],
      .dark a.bg-\\[\\#885000\\],
      .dark div.bg-\\[\\#a6681c\\],
      .dark div.bg-\\[\\#885000\\],
      .dark span.bg-\\[\\#a6681c\\],
      .dark span.bg-\\[\\#885000\\],
      .dark .bg-\\[\\#a6681c\\],
      .dark .bg-\\[\\#885000\\] {
        background-color: ${primaryBrand} !important;
        color: #ffffff !important;
        font-weight: 700 !important;
      }

      .dark button.bg-\\[\\#a6681c\\]:hover,
      .dark button.bg-\\[\\#885000\\]:hover,
      .dark .hover\\:bg-\\[\\#885000\\]:hover,
      .dark .hover\\:bg-\\[\\#a6681c\\]:hover {
        background-color: ${primaryHover} !important;
      }

      /* Active Sidebar Tab in Dark Mode */
      .dark aside .bg-\\[\\#fdbd72\\],
      .dark aside .dark\\:bg-\\[\\#845411\\],
      .dark nav .bg-\\[\\#fdbd72\\],
      .dark nav .dark\\:bg-\\[\\#845411\\] {
        background-color: ${secondaryBadge} !important;
        color: ${activeNavText} !important;
        border-left: 3px solid ${primaryBrand} !important;
      }

      .dark aside .text-\\[\\#784a05\\],
      .dark nav .text-\\[\\#784a05\\] {
        color: ${activeNavText} !important;
      }

      /* Brand Text Accents in Dark Mode */
      .dark .text-\\[\\#885000\\],
      .dark .text-\\[\\#a6681c\\],
      .dark .dark\\:text-\\[\\#ffb86d\\] {
        color: ${textBrand} !important;
      }

      /* Borders in Dark Mode */
      .dark .border-\\[\\#885000\\],
      .dark .border-\\[\\#a6681c\\] {
        border-color: ${primaryBrand} !important;
      }

      .dark .border-\\[\\#d7c3b2\\]\\/40,
      .dark .border-\\[\\#d7c3b2\\]\\/30,
      .dark .border-\\[\\#d7c3b2\\]\\/25,
      .dark .border-\\[\\#d7c3b2\\]\\/20,
      .dark .border-\\[\\#d7c3b2\\] {
        border-color: #38291e !important;
      }

      /* Dark Inputs */
      .dark input,
      .dark select,
      .dark textarea {
        background-color: #160f0a !important;
        color: #ffffff !important;
        border-color: #4a392c !important;
      }

      .dark input::placeholder,
      .dark textarea::placeholder {
        color: #8c7b6d !important;
      }

      /* Focus Rings in Dark Mode */
      .dark .focus\\:ring-\\[\\#885000\\]:focus,
      .dark .focus\\:ring-\\[\\#a6681c\\]:focus {
        --tw-ring-color: ${primaryBrand} !important;
      }

      /* Theme helper utility classes in Dark Mode */
      .theme-bg-canvas { background-color: #120c08 !important; }
      .theme-bg-surface { background-color: #1e1610 !important; }
      .theme-bg-container { background-color: #18110b !important; }
      .theme-text-primary { color: #ffffff !important; }
      .theme-text-brand { color: ${primaryBrand} !important; }
      .theme-bg-brand { background-color: ${primaryBrand} !important; }
      .theme-bg-brand-hover:hover { background-color: ${primaryHover} !important; }
      .theme-border-brand { border-color: #38291e !important; }
      .theme-focus-ring:focus { outline: 2px solid ${primaryBrand} !important; }
    `;
  } else {
    styleEl.innerHTML = `
      /* ===================================================
         LIGHT THEME: Crisp High-Contrast Editorial Atelier
         =================================================== */
      /* Outer Light Linen Canvas */
      body,
      .bg-\\[\\#fff8f4\\] {
        background-color: #f8f6f2 !important;
        color: #1a120b !important;
      }

      /* Navigation Sidebar */
      aside {
        background-color: #f3ede4 !important;
        border-color: #ded4c7 !important;
        color: #1a120b !important;
      }

      aside h2,
      aside h3,
      aside p,
      aside span {
        color: #1a120b !important;
      }

      aside .text-\\[\\#847466\\],
      aside .text-\\[\\#524438\\] {
        color: #5e4d3e !important;
      }

      /* Header Bar */
      header {
        background-color: #ffffff !important;
        border-color: #ded4c7 !important;
      }

      header h2,
      header span {
        color: #1a120b !important;
      }

      /* Active Navigation Item */
      aside .bg-\\[\\#fdbd72\\],
      nav .bg-\\[\\#fdbd72\\] {
        background-color: #fbe8d0 !important;
        color: ${primaryBrand} !important;
        border-left: 3px solid ${primaryBrand} !important;
        font-weight: 700 !important;
      }

      aside .text-\\[\\#784a05\\],
      nav .text-\\[\\#784a05\\] {
        color: ${primaryBrand} !important;
      }

      /* Crisp White Cards & Panels with Clean Elevation */
      .bg-white,
      article,
      section.bg-white,
      div.bg-white,
      [role="dialog"] .bg-white,
      .fixed .bg-white,
      .relative.bg-white {
        background-color: #ffffff !important;
        border-color: #ded4c7 !important;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.02) !important;
      }

      /* Inner nested sub-cards / stat wells */
      .bg-white .bg-\\[\\#fff8f4\\],
      .bg-white .bg-\\[\\#fff1e7\\],
      article .bg-\\[\\#fff8f4\\],
      article .bg-\\[\\#fff1e7\\],
      .bg-\\[\\#fff1e7\\] {
        background-color: #f6efe7 !important;
        border-color: #e5ded4 !important;
      }

      /* HIGH CONTRAST HEADINGS (Pure, Deep Obsidian Ink) */
      h1, h2, h3, h4, h5, h6,
      .bg-white h1, .bg-white h2, .bg-white h3, .bg-white h4, .bg-white h5, .bg-white h6,
      article h1, article h2, article h3, article h4, article h5, article h6,
      .text-\\[\\#211a15\\],
      .bg-white .text-\\[\\#211a15\\],
      article .text-\\[\\#211a15\\] {
        color: #1a120b !important;
      }

      /* HIGH CONTRAST BODY TEXT (Rich Warm Charcoal) */
      .text-\\[\\#524438\\],
      .bg-white .text-\\[\\#524438\\],
      article .text-\\[\\#524438\\] {
        color: #2e2218 !important;
      }

      /* HIGH CONTRAST MUTED LABELS & METADATA (Legible Medium Charcoal, WCAG AAA) */
      .text-\\[\\#847466\\],
      .bg-white .text-\\[\\#847466\\],
      article .text-\\[\\#847466\\] {
        color: #5e4d3e !important;
      }

      /* Primary Brand Buttons (Crisp Solid Fill + High Contrast White Text) */
      button.bg-\\[\\#a6681c\\],
      button.bg-\\[\\#885000\\],
      a.bg-\\[\\#a6681c\\],
      a.bg-\\[\\#885000\\],
      div.bg-\\[\\#a6681c\\],
      div.bg-\\[\\#885000\\],
      span.bg-\\[\\#a6681c\\],
      span.bg-\\[\\#885000\\],
      .bg-\\[\\#a6681c\\],
      .bg-\\[\\#885000\\] {
        background-color: ${primaryBrand} !important;
        color: #ffffff !important;
        font-weight: 700 !important;
      }

      button.bg-\\[\\#a6681c\\]:hover,
      button.bg-\\[\\#885000\\]:hover,
      .hover\\:bg-\\[\\#885000\\]:hover,
      .hover\\:bg-\\[\\#a6681c\\]:hover {
        background-color: ${primaryHover} !important;
      }

      /* Brand Text Accents in Light Mode */
      .text-\\[\\#885000\\],
      .text-\\[\\#a6681c\\] {
        color: ${primaryBrand} !important;
      }

      /* Inputs, Selects & Search bars */
      input,
      select,
      textarea {
        background-color: #ffffff !important;
        color: #1a120b !important;
        border-color: #cfbfaf !important;
      }

      input::placeholder,
      textarea::placeholder {
        color: #7a6a5c !important;
      }

      select option {
        background-color: #ffffff !important;
        color: #1a120b !important;
      }

      /* Tables */
      table {
        background-color: #ffffff !important;
        color: #1a120b !important;
      }

      thead, th {
        background-color: #f6efe7 !important;
        color: #1a120b !important;
        border-color: #ded4c7 !important;
        font-weight: 700 !important;
      }

      tbody tr {
        background-color: #ffffff !important;
        border-color: #ebe3d9 !important;
      }

      tbody tr:hover {
        background-color: #faf5ef !important;
      }

      td {
        color: #1a120b !important;
        border-color: #ebe3d9 !important;
      }

      /* Borders */
      .border-\\[\\#885000\\],
      .border-\\[\\#a6681c\\] {
        border-color: ${primaryBrand} !important;
      }

      .border-\\[\\#d7c3b2\\]\\/40,
      .border-\\[\\#d7c3b2\\]\\/30,
      .border-\\[\\#d7c3b2\\]\\/25,
      .border-\\[\\#d7c3b2\\]\\/20,
      .border-\\[\\#d7c3b2\\] {
        border-color: #ded4c7 !important;
      }

      /* Focus Rings */
      .focus\\:ring-\\[\\#885000\\]:focus,
      .focus\\:ring-\\[\\#a6681c\\]:focus {
        --tw-ring-color: ${primaryBrand} !important;
      }

      /* Theme helper utility classes */
      .theme-bg-canvas { background-color: #f8f6f2 !important; }
      .theme-bg-surface { background-color: #ffffff !important; }
      .theme-bg-container { background-color: #f3ede4 !important; }
      .theme-text-primary { color: #1a120b !important; }
      .theme-text-brand { color: ${primaryBrand} !important; }
      .theme-bg-brand { background-color: ${primaryBrand} !important; }
      .theme-bg-brand-hover:hover { background-color: ${primaryHover} !important; }
      .theme-border-brand { border-color: #ded4c7 !important; }
      .theme-focus-ring:focus { outline: 2px solid ${primaryBrand} !important; }
    `;
  }
}
