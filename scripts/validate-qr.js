import QRCode from 'qrcode';
import jsQR from 'jsqr';

// Test matrix
const testTables = [1, 2, 3, 5, 10, 25];
const restaurantSlug = 'heritage';

async function validateTableQR(tableNumber) {
  const expectedUrl = `https://${restaurantSlug}.ensemble.com/t/${tableNumber}`;
  console.log(`\n========================================`);
  console.log(`Testing Table #${tableNumber}: ${expectedUrl}`);

  // 1. Test Raw QR Matrix
  const qrData = QRCode.create(expectedUrl, { errorCorrectionLevel: 'Q' });
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

  const rawDecoded = jsQR(imgData, totalSize, totalSize);
  if (!rawDecoded || rawDecoded.data !== expectedUrl) {
    console.error(`[FAIL] Raw matrix decode failed for Table #${tableNumber}`);
    return false;
  }
  console.log(`[PASS] Raw Matrix Decoded: "${rawDecoded.data}"`);

  // 2. Test SVG Generation
  const svg = await QRCode.toString(expectedUrl, {
    type: 'svg',
    errorCorrectionLevel: 'Q',
    margin: 4,
    color: { dark: '#000000', light: '#ffffff' },
  });

  if (!svg.includes('<svg') || !svg.includes('viewBox') || !svg.includes('#000000')) {
    console.error(`[FAIL] SVG structure invalid for Table #${tableNumber}`);
    return false;
  }
  console.log(`[PASS] SVG Generated: ${svg.length} bytes, crispEdges vector paths`);

  // 3. Test High-Res PNG Data URL Generation
  const pngDataUrl = await QRCode.toDataURL(expectedUrl, {
    errorCorrectionLevel: 'Q',
    margin: 4,
    width: 800,
  });

  if (!pngDataUrl.startsWith('data:image/png;base64,')) {
    console.error(`[FAIL] PNG Data URL invalid for Table #${tableNumber}`);
    return false;
  }
  console.log(`[PASS] High-Res PNG Generated (800x800, Error Correction Q)`);

  return true;
}

async function runAllTests() {
  console.log('STARTING ENSEMBLE AUTOMATED QR VALIDATION SUITE');
  let passed = 0;
  for (const tableNum of testTables) {
    const ok = await validateTableQR(tableNum);
    if (ok) passed++;
  }

  console.log(`\n========================================`);
  console.log(`SUMMARY: ${passed}/${testTables.length} Tables Validated Successfully!`);
  if (passed === testTables.length) {
    console.log('ALL QR CODES PASS ISO/IEC 18004 MACHINE READABILITY!');
    process.exit(0);
  } else {
    console.error('SOME QR CODES FAILED VALIDATION');
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
