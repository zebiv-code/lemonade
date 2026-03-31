// Apple II display simulator
// Faithfully implements GR, TEXT, and HOME commands:
//   GR   — enters lo-res mixed mode, clears graphics area to black
//   TEXT — enters full 24-line text mode (does NOT clear)
//   HOME — clears text window from cursor position to end

export const COLS = 40;
export const GR_ROWS = 40;
export const TEXT_LINES_GR = 4;
export const TEXT_LINES_FULL = 24;

export const PALETTE = [
    '#000000', '#dd0033', '#000099', '#dd22dd', '#007722', '#555555',
    '#2222ff', '#6666ff', '#885500', '#ff6600', '#aaaaaa', '#ff9988',
    '#11dd00', '#ffff00', '#44ff99', '#ffffff',
];

export function createDisplay(canvas) {
    const ctx = canvas.getContext('2d');
    const grBuffer = Array.from({ length: GR_ROWS }, () => new Array(COLS).fill(0));
    const textBuffer = Array.from({ length: TEXT_LINES_FULL }, () => new Array(COLS).fill(' '));
    let cursorRow = 0, cursorCol = 0;
    let mode = 'text'; // 'gr' or 'text'

    function textRows() { return mode === 'text' ? TEXT_LINES_FULL : TEXT_LINES_GR; }
    function textBase() { return mode === 'text' ? 0 : TEXT_LINES_FULL - TEXT_LINES_GR; }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth * dpr, h = canvas.clientHeight * dpr;
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    }

    function render() {
        resize();
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        if (mode === 'gr') {
            const totalRows = 48;
            const bw = w / COLS, bh = h / totalRows;
            // Lo-res blocks
            for (let r = 0; r < GR_ROWS; r++)
                for (let c = 0; c < COLS; c++) {
                    const color = grBuffer[r][c];
                    if (color !== 0) {
                        ctx.fillStyle = PALETTE[color];
                        ctx.fillRect(c * bw, r * bh, bw + 0.5, bh + 0.5);
                    }
                }
            // Bottom 4 text lines
            const ty = GR_ROWS * bh, cw = bw, ch = bh * 2;
            const fs = Math.max(10, ch * 0.7);
            ctx.font = `${fs}px "Courier New", monospace`;
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#33ff33';
            const base = textBase();
            for (let r = 0; r < TEXT_LINES_GR; r++)
                for (let c = 0; c < COLS; c++) {
                    const ch2 = textBuffer[base + r][c];
                    if (ch2 !== ' ') ctx.fillText(ch2, c * cw + cw * 0.1, ty + r * ch + ch * 0.1);
                }
        } else {
            // Full 24-line text
            const ch = h / TEXT_LINES_FULL, cw = w / COLS;
            const fs = Math.max(10, ch * 0.7);
            ctx.font = `${fs}px "Courier New", monospace`;
            ctx.textBaseline = 'top';
            ctx.fillStyle = '#33ff33';
            for (let r = 0; r < TEXT_LINES_FULL; r++)
                for (let c = 0; c < COLS; c++) {
                    const ch2 = textBuffer[r][c];
                    if (ch2 !== ' ') ctx.fillText(ch2, c * cw + cw * 0.1, r * ch + ch * 0.15);
                }
            // Cursor
            if (Math.floor(Date.now() / 500) % 2 === 0) {
                ctx.fillStyle = '#33ff33';
                ctx.fillRect(cursorCol * cw, cursorRow * ch + ch * 0.85, cw * 0.8, ch * 0.12);
            }
        }
    }

    // === Apple II commands ===

    // GR: enter lo-res mixed mode, clear graphics area (does NOT clear text)
    function gr() {
        mode = 'gr';
        for (let r = 0; r < GR_ROWS; r++) grBuffer[r].fill(0);
        // Set text window to bottom 4 lines
        cursorRow = textBase();
        cursorCol = 0;
    }

    // TEXT: enter full text mode (does NOT clear — faithful to Apple II)
    function text() {
        mode = 'text';
    }

    // HOME: clear text window from current position to end
    function home() {
        const base = textBase();
        const rows = textRows();
        for (let r = base; r < base + rows; r++) textBuffer[r].fill(' ');
        cursorRow = base;
        cursorCol = 0;
    }

    // --- Graphics API ---
    function plot(x, y, color) {
        if (x >= 0 && x < COLS && y >= 0 && y < GR_ROWS) grBuffer[y][x] = color;
    }
    function hlin(x1, x2, y, color) { for (let x = x1; x <= x2; x++) plot(x, y, color); }
    function vlin(y1, y2, x, color) { for (let y = y1; y <= y2; y++) plot(x, y, color); }
    function fillRect(x1, y1, x2, y2, color) { for (let y = y1; y <= y2; y++) hlin(x1, x2, y, color); }

    // Legacy helpers
    function clearGr() { for (let r = 0; r < GR_ROWS; r++) grBuffer[r].fill(0); }
    function clearText() { home(); }
    function clearAll() { gr(); home(); }

    // --- Text API ---
    function printAt(row, col, str) {
        const actualRow = mode === 'text' ? row : textBase() + row;
        for (let i = 0; i < str.length && col + i < COLS; i++)
            textBuffer[actualRow][col + i] = str[i];
    }

    function print(str) {
        const base = textBase(), max = base + textRows();
        for (const ch of str) {
            if (ch === '\n') {
                cursorCol = 0;
                cursorRow++;
                if (cursorRow >= max) scrollText();
            } else {
                if (cursorRow >= base && cursorRow < max)
                    textBuffer[cursorRow][cursorCol] = ch;
                cursorCol++;
                if (cursorCol >= COLS) {
                    cursorCol = 0;
                    cursorRow++;
                    if (cursorRow >= max) scrollText();
                }
            }
        }
    }

    function println(str = '') { print(str + '\n'); }

    function scrollText() {
        const base = textBase(), rows = textRows();
        cursorRow = base + rows - 1;
        for (let r = base; r < base + rows - 1; r++)
            textBuffer[r] = textBuffer[r + 1].slice();
        textBuffer[base + rows - 1].fill(' ');
    }

    function vtab(row) {
        cursorRow = mode === 'text' ? row - 1 : textBase() + row - 1; // 1-based like Apple II
        cursorCol = 0;
    }

    function htab(col) { cursorCol = col - 1; } // 1-based

    return {
        render, gr, text, home,
        clearGr, clearText, clearAll,
        plot, hlin, vlin, fillRect,
        print, println, printAt, vtab, htab,
        get mode() { return mode; },
    };
}
