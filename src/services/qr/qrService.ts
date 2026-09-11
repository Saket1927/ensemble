import QRCode from 'qrcode';
import jsQR from 'jsqr';

export interface QROptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  width?: number;
}

/**
 * Constructs the canonical public customer URL for a table.
 * If in browser and not localhost, uses window.location.origin (e.g. https://ensemble-xxx.vercel.app/heritage/t/1)
 * Otherwise defaults to standard production URL https://heritage.ensemble.com/t/1
 */
export function getTableCanonicalUrl(restaurantSlug: string, tableNumber: number, customOrigin?: string): string {
  const cleanSlug = restaurantSlug.toLowerCase().trim();
  if (customOrigin && customOrigin.trim()) {
    const cleanOrigin = customOrigin.trim().replace(/\/$/, '');
    return `${cleanOrigin}/${cleanSlug}/t/${tableNumber}`;
  }
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    if (!origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      return `${origin}/${cleanSlug}/t/${tableNumber}`;
    }
  }
  return `https://${cleanSlug}.ensemble.com/t/${tableNumber}`;
}

/**
 * Generates an SVG string of the genuine QR code.
 * Adheres strictly to ISO/IEC 18004 standards:
 * - Pure black on pure white (#000000 on #ffffff)
 * - 4-module quiet zone on all sides
 * - Error correction level Q (25% redundancy)
 * - Standard square modules
 */
export async function generateQRCodeSVG(text: string, options?: QROptions): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    errorCorrectionLevel: options?.errorCorrectionLevel || 'Q',
    margin: options?.margin ?? 4,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

/**
 * Generates a high-resolution PNG Data URL of the genuine QR code.
 */
export async function generateQRCodeDataURL(text: string, options?: QROptions): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: options?.errorCorrectionLevel || 'Q',
    margin: options?.margin ?? 4,
    width: options?.width || 800,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

/**
 * Validates machine decodability of a QR payload using jsQR.
 * Automatically verifies that a freshly generated QR matrix decodes back to the exact URL.
 */
export function validateQRCode(
  text: string,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H' = 'Q'
): { success: boolean; decoded?: string; error?: string } {
  try {
    const qrData = QRCode.create(text, { errorCorrectionLevel });
    const size = qrData.modules.size;
    const margin = 4;
    const totalSize = size + margin * 2;

    const imgData = new Uint8ClampedArray(totalSize * totalSize * 4);
    for (let y = 0; y < totalSize; y++) {
      for (let x = 0; x < totalSize; x++) {
        const idx = (y * totalSize + x) * 4;
        const modX = x - margin;
        const modY = y - margin;
        const isDark =
          modX >= 0 && modX < size && modY >= 0 && modY < size
            ? qrData.modules.get(modX, modY)
            : 0;

        const val = isDark ? 0 : 255;
        imgData[idx] = val;
        imgData[idx + 1] = val;
        imgData[idx + 2] = val;
        imgData[idx + 3] = 255;
      }
    }

    const decoded = jsQR(imgData, totalSize, totalSize);
    if (decoded && decoded.data === text) {
      return { success: true, decoded: decoded.data };
    }
    return {
      success: false,
      error: decoded
        ? `Decoded payload mismatch: expected "${text}", got "${decoded.data}"`
        : 'Failed to decode QR code image matrix.',
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'QR validation error' };
  }
}

/**
 * Builds a complete, printable, luxury ENSEMBLE table standee SVG document.
 * Contains:
 * 1. Outer branded acrylic/wooden standee frame
 * 2. Restaurant name and luxury hospitality banner
 * 3. Dedicated clean white card containing the REAL machine-readable QR code
 * 4. Table number header and readable URL footer
 */
export async function buildPrintableStandeeSVG(params: {
  restaurantName: string;
  restaurantSlug: string;
  tableNumber: number;
  primaryColor?: string;
  accentColor?: string;
  customOrigin?: string;
}): Promise<string> {
  const url = getTableCanonicalUrl(params.restaurantSlug, params.tableNumber, params.customOrigin);
  const qrSvgRaw = await generateQRCodeSVG(url, { errorCorrectionLevel: 'Q', margin: 4 });

  // Extract the inner path from the generated QR SVG so we can embed it into the standee
  // QRCode.toString returns <svg ...><path fill="#ffffff" .../><path stroke="#000000" .../></svg>
  const qrInnerMatch = qrSvgRaw.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  const qrInnerContent = qrInnerMatch ? qrInnerMatch[1] : '';

  // Get viewBox size from generated QR (e.g. 0 0 41 41)
  const viewBoxMatch = qrSvgRaw.match(/viewBox="([^"]+)"/i);
  const qrViewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 41 41';

  const primary = params.primaryColor || '#1c1917';
  const name = params.restaurantName.toUpperCase();
  const tableNum = params.tableNumber;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 860" width="600" height="860" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif">
  <defs>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Outer Standee Background -->
  <rect width="600" height="860" rx="36" fill="${primary}"/>
  
  <!-- Subtle Luxury Inner Border -->
  <rect x="24" y="24" width="552" height="812" rx="24" fill="none" stroke="#fef3c7" stroke-opacity="0.2" stroke-width="2"/>

  <!-- Brand Title -->
  <text x="300" y="90" text-anchor="middle" fill="#fef3c7" font-size="24" font-weight="800" letter-spacing="4">${name}</text>
  
  <!-- Instructions -->
  <text x="300" y="125" text-anchor="middle" fill="#e2e8f0" font-size="13" font-weight="500" letter-spacing="1">Scan to View Menu, Place Orders &amp; Win Rewards</text>

  <!-- Center White Card with Shadow (Strict Quiet Zone Guarantee) -->
  <g filter="url(#cardShadow)">
    <rect x="85" y="160" width="430" height="430" rx="28" fill="#ffffff"/>
  </g>

  <!-- Embedded Standard Machine-Readable QR Code -->
  <svg x="110" y="185" width="380" height="380" viewBox="${qrViewBox}" shape-rendering="crispEdges">
    ${qrInnerContent}
  </svg>

  <!-- Table Number Display -->
  <rect x="200" y="630" width="200" height="48" rx="24" fill="#fef3c7" fill-opacity="0.15" stroke="#fef3c7" stroke-opacity="0.3" stroke-width="1.5"/>
  <text x="300" y="662" text-anchor="middle" fill="#fef3c7" font-size="20" font-weight="900" letter-spacing="2">TABLE #${tableNum}</text>

  <!-- Canonical Encoded URL -->
  <text x="300" y="725" text-anchor="middle" fill="#cbd5e1" font-size="12" font-family="monospace" letter-spacing="0.5">${url}</text>

  <!-- Footer Tagline -->
  <text x="300" y="780" text-anchor="middle" fill="#94a3b8" font-size="11" letter-spacing="1.5" text-transform="uppercase">POWERED BY ENSEMBLE HOSPITALITY OS</text>
</svg>`;
}

/**
 * Triggers a browser download of a text/SVG file.
 */
export function downloadFile(content: string, filename: string, mimeType = 'image/svg+xml'): void {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Triggers a browser download of a high-resolution PNG file.
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
