// Lo-res Apple II scene drawings — faithfully translated from original BASIC source
// Original by Charlie Kellner, Feb 1979 (MECC)
// Line references are from lemonade_original.bas

// Apple II lo-res color indices
const BLK = 0, MAG = 1, DBLU = 2, PUR = 3, DGRN = 4, GRY1 = 5;
const MBLU = 6, LBLU = 7, BRN = 8, ORG = 9, GRY2 = 10, PNK = 11;
const MGRN = 12, YEL = 13, AQU = 14, WHT = 15;

// Weather SC values from original: 2=sunny, 7=hot&dry, 10=cloudy, 5=storms
// SC is used as the sky COLOR= value

// --- 15100: Weather report screen ---
// This is the main weather display subroutine
export function drawWeatherScreen(d, sc) {
    d.clearGr();

    // 15110: Fill sky with weather color (rows 0-25)
    d.fillRect(0, 0, 39, 25, sc);

    // 15120: Green ground (rows 26-39)
    d.fillRect(0, 26, 39, 39, MGRN);

    // 15130: Brown stand/counter (rows 24-32, cols 15-25)
    d.fillRect(15, 24, 25, 32, BRN);

    // 15150: Yellow pitcher/glasses on counter (every other col 17-23, rows 22-23)
    for (let i = 17; i <= 23; i += 2) {
        d.vlin(22, 23, i, YEL);
    }

    // 15151-15162: Weather-specific elements
    if (sc === 2 || sc === 7) {
        // Sunny or Hot: draw sun (15160-15162)
        const sunColor = (sc === 7) ? ORG : YEL;
        // SC=7 uses COLOR=9 (orange), SC=2 uses default (implied yellow)
        d.hlin(3, 5, 1, sunColor);
        d.hlin(2, 6, 2, sunColor);
        for (let i = 3; i <= 6; i++) d.hlin(1, 7, i, sunColor);
        d.hlin(2, 6, 7, sunColor);
        d.hlin(3, 5, 8, sunColor);
    } else {
        // Cloudy or Storms: draw clouds (15152-15158)
        const cloudColor = (sc === 10) ? WHT : BLK; // 10=cloudy→white, 5=storms→black
        d.hlin(6, 10, 2, cloudColor);
        d.hlin(4, 14, 3, cloudColor);
        d.hlin(7, 12, 4, cloudColor);
        d.hlin(22, 30, 4, cloudColor);
        d.hlin(20, 36, 5, cloudColor);
        d.hlin(23, 33, 6, cloudColor);
    }

    // 17001-17005: Lightning bolt (for storms, drawn by GOSUB 17000)
    if (sc === 5) {
        drawLightning(d);
    }
}

// --- 17001-17005: Lightning bolt ---
function drawLightning(d) {
    // 17001: COLOR=10 (grey), right side lightning
    d.vlin(7, 9, 29, GRY2);
    d.hlin(30, 31, 9, GRY2);
    d.vlin(9, 14, 32, GRY2);
    d.hlin(33, 34, 14, GRY2);
    d.vlin(14, 25, 35, GRY2);

    // 17005: Left side lightning
    d.vlin(5, 8, 8, GRY2);
    d.plot(9, 8, GRY2);
    d.vlin(8, 13, 10, GRY2);
    d.plot(11, 13, GRY2);
    d.vlin(13, 17, 12, GRY2);
}

// --- 11100-11280: Title screen ---
// Original uses text characters to draw "LEMONADE" and "STAND" logos
// We approximate this with lo-res blocks
export function drawTitleScreen(d) {
    d.clearGr();

    // 11100: Fill entire screen green (COLOR=12)
    d.fillRect(0, 0, 39, 39, MGRN);

    // The original title uses printed text characters (;L) in lo-res mixed mode
    // to create block letters. We draw a simplified version:

    // "LEMONADE" in yellow blocks across top area
    const titleY = 4;
    // L
    d.vlin(titleY, titleY+6, 2, YEL); d.hlin(2, 4, titleY+6, YEL);
    // E
    d.vlin(titleY, titleY+6, 6, YEL); d.hlin(6, 8, titleY, YEL); d.hlin(6, 8, titleY+3, YEL); d.hlin(6, 8, titleY+6, YEL);
    // M
    d.vlin(titleY, titleY+6, 10, YEL); d.vlin(titleY, titleY+6, 14, YEL); d.plot(11, titleY+1, YEL); d.plot(12, titleY+2, YEL); d.plot(13, titleY+1, YEL);
    // O
    d.vlin(titleY+1, titleY+5, 16, YEL); d.vlin(titleY+1, titleY+5, 19, YEL); d.hlin(17, 18, titleY, YEL); d.hlin(17, 18, titleY+6, YEL);
    // N
    d.vlin(titleY, titleY+6, 21, YEL); d.vlin(titleY, titleY+6, 24, YEL); d.plot(22, titleY+1, YEL); d.plot(23, titleY+2, YEL); d.plot(23, titleY+3, YEL);
    // A
    d.vlin(titleY+1, titleY+6, 26, YEL); d.vlin(titleY+1, titleY+6, 29, YEL); d.hlin(27, 28, titleY, YEL); d.hlin(26, 29, titleY+3, YEL);
    // D
    d.vlin(titleY, titleY+6, 31, YEL); d.vlin(titleY+1, titleY+5, 34, YEL); d.hlin(32, 33, titleY, YEL); d.hlin(32, 33, titleY+6, YEL);
    // E
    d.vlin(titleY, titleY+6, 36, YEL); d.hlin(36, 38, titleY, YEL); d.hlin(36, 38, titleY+3, YEL); d.hlin(36, 38, titleY+6, YEL);

    // "STAND" centered below
    const sY = 15;
    // S
    d.hlin(10, 12, sY, WHT); d.plot(10, sY+1, WHT); d.hlin(10, 12, sY+2, WHT); d.plot(12, sY+3, WHT); d.hlin(10, 12, sY+4, WHT);
    // T
    d.hlin(14, 16, sY, WHT); d.vlin(sY+1, sY+4, 15, WHT);
    // A
    d.hlin(19, 20, sY, WHT); d.vlin(sY+1, sY+4, 18, WHT); d.vlin(sY+1, sY+4, 21, WHT); d.hlin(18, 21, sY+2, WHT);
    // N
    d.vlin(sY, sY+4, 23, WHT); d.vlin(sY, sY+4, 26, WHT); d.plot(24, sY+1, WHT); d.plot(25, sY+2, WHT);
    // D
    d.vlin(sY, sY+4, 28, WHT); d.vlin(sY+1, sY+3, 30, WHT); d.plot(29, sY, WHT); d.plot(29, sY+4, WHT);

    // 11360: Lemon (yellow filled column at col 12, rows 20-36)
    d.vlin(22, 30, 12, YEL);
    d.vlin(22, 30, 13, YEL);
    d.vlin(23, 29, 11, YEL);
    d.vlin(23, 29, 14, YEL);
}

// --- Stand scene: show the lemonade stand with customers ---
export function drawStand(d, glasses, sold) {
    d.clearGr();

    // Sky (sunny blue, rows 0-18)
    d.fillRect(0, 0, 39, 18, LBLU);

    // Sun
    d.hlin(30, 34, 2, YEL);
    d.hlin(29, 35, 3, YEL);
    d.hlin(29, 35, 4, YEL);
    d.hlin(30, 34, 5, YEL);

    // Ground (green, rows 19-39)
    d.fillRect(0, 19, 39, 39, MGRN);

    // Stand counter (brown, from original 15130)
    d.fillRect(12, 16, 28, 24, BRN);

    // Awning (red + white stripes)
    d.hlin(13, 27, 14, MAG);
    d.hlin(13, 27, 15, WHT);

    // Glasses on counter (yellow)
    const remaining = Math.max(0, glasses - sold);
    const maxShow = Math.min(remaining, 6);
    for (let i = 0; i < maxShow; i++) {
        d.vlin(18, 19, 14 + i * 2, YEL);
    }

    // Pitcher
    d.fillRect(19, 17, 22, 22, YEL);

    // Stand legs
    d.vlin(25, 30, 14, BRN);
    d.vlin(25, 30, 26, BRN);

    // Sign (on left)
    d.fillRect(3, 22, 8, 26, WHT);
    d.fillRect(4, 23, 7, 25, YEL);
    d.vlin(27, 30, 5, BRN);

    // People (customers based on sold count)
    const people = Math.min(sold, 5);
    for (let i = 0; i < people; i++) {
        const x = 30 + (i % 3) * 3;
        const y = 26 + Math.floor(i / 3) * 5;
        const bodyColor = [MAG, DBLU, PUR, ORG, MBLU][i];
        d.plot(x, y, PNK);         // head
        d.vlin(y+1, y+2, x, bodyColor); // body
        d.plot(x-1, y+3, BLK);     // legs
        d.plot(x+1, y+3, BLK);
    }
}

// --- Results overlay ---
export function drawResults(d, profit) {
    if (profit > 0) {
        // Coins
        d.fillRect(16, 32, 23, 36, YEL);
        d.fillRect(17, 33, 22, 35, ORG);
    }
}

// Re-exports for weather by SC code
export function drawSunny(d) { drawWeatherScreen(d, 2); }
export function drawCloudy(d) { drawWeatherScreen(d, 10); }
export function drawHot(d) { drawWeatherScreen(d, 7); }
export function drawStorm(d) { drawWeatherScreen(d, 5); }
