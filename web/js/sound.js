// Apple II speaker sound simulation
// Square wave tones via Web Audio API, recreating the single-bit speaker at $C030

let audioCtx = null;

function ctx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function tone(freq, start, dur, vol = 0.12) {
    const c = ctx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'square';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(start);
    osc.stop(start + dur);
}

function playMelody(notes, tempo = 150) {
    const c = ctx();
    const now = c.currentTime;
    let t = 0;
    for (const [freq, beats] of notes) {
        const dur = (beats * tempo) / 1000;
        if (freq > 0) tone(freq, now + t, dur * 0.85);
        t += dur;
    }
}

// --- Title screen: cheerful ascending fanfare ---
export function playTitleMusic() {
    playMelody([
        [523, 1], [659, 1], [784, 1], [1047, 2],  // C E G C (up)
        [784, 0.5], [1047, 0.5], [1175, 2],        // G C D
        [1047, 1], [784, 1], [1047, 3],             // C G C (resolve)
    ], 140);
}

// --- Day start: short bright reveille ---
export function playDayStart() {
    playMelody([
        [523, 0.5], [659, 0.5], [784, 0.5], [1047, 1],  // C E G C
        [0, 0.25],
        [784, 0.5], [1047, 1],                            // G C
    ], 120);
}

// --- Sunny weather: happy little jingle ---
export function playSunnyTune() {
    playMelody([
        [784, 0.5], [880, 0.5], [1047, 1], [880, 0.5], [784, 1],
    ], 130);
}

// --- Cloudy weather: gentle descending motif ---
export function playCloudyTune() {
    playMelody([
        [659, 1], [587, 1], [523, 1.5], [0, 0.5], [440, 1.5],
    ], 180);
}

// --- Hot weather: energetic ascending run ---
export function playHotTune() {
    playMelody([
        [587, 0.3], [659, 0.3], [740, 0.3], [784, 0.3], [880, 0.3],
        [988, 0.3], [1047, 1], [0, 0.25], [1047, 0.5], [1175, 1],
    ], 100);
}

// --- Storm warning: ominous low tones ---
export function playStormTune() {
    playMelody([
        [196, 1.5], [185, 1.5], [175, 2], [0, 0.5], [147, 2],
    ], 200);
}

// --- Cash register: ascending arpeggio "cha-ching" ---
export function playCashRegister() {
    playMelody([
        [1047, 0.25], [1175, 0.25], [1319, 0.25], [1568, 0.5],
        [0, 0.15],
        [1568, 0.15], [1760, 0.15], [2093, 0.75],
    ], 80);
}

// --- Big profit: triumphant fanfare ---
export function playBigProfit() {
    playMelody([
        [523, 0.5], [659, 0.5], [784, 0.5], [1047, 1],
        [0, 0.25],
        [1047, 0.5], [1175, 0.5], [1319, 0.5], [1568, 1.5],
        [0, 0.25],
        [1568, 0.5], [1760, 0.5], [2093, 2],
    ], 120);
}

// --- Small profit: modest positive tune ---
export function playSmallProfit() {
    playMelody([
        [523, 0.5], [659, 0.5], [784, 1], [1047, 1.5],
    ], 140);
}

// --- Loss: sad descending tones ---
export function playLoss() {
    playMelody([
        [440, 1], [392, 1], [349, 1.5], [0, 0.5],
        [330, 1], [294, 1], [262, 2],
    ], 200);
}

// --- Bankruptcy: dramatic low doom ---
export function playBankruptcy() {
    playMelody([
        [262, 1], [247, 1], [220, 1.5], [0, 0.5],
        [196, 1], [175, 1], [147, 2],
        [0, 0.5],
        [131, 1], [0, 0.25], [131, 1], [0, 0.25], [131, 2],
    ], 220);
}

// --- Thunder: noise burst ---
export function playThunder() {
    const c = ctx();
    const now = c.currentTime;
    const bufLen = c.sampleRate * 0.8;
    const buffer = c.createBuffer(1, bufLen, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.3));
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    src.connect(gain);
    gain.connect(c.destination);
    src.start(now);
}

// --- Rain: rapid random clicks ---
export function playRain(duration = 2) {
    const c = ctx();
    const bufLen = c.sampleRate * duration;
    const buffer = c.createBuffer(1, bufLen, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufLen; i++) {
        data[i] = Math.random() > 0.97 ? (Math.random() - 0.5) * 0.3 : 0;
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const gain = c.createGain();
    gain.gain.value = 0.4;
    src.connect(gain);
    gain.connect(c.destination);
    src.start(c.currentTime);
}

// --- Game over victory: full victory fanfare ---
export function playVictory() {
    playMelody([
        [523, 0.5], [523, 0.5], [523, 0.5], [659, 1.5],
        [587, 0.5], [659, 0.5], [587, 0.25], [659, 2],
        [0, 0.5],
        [784, 0.5], [784, 0.5], [784, 0.5], [880, 1.5],
        [784, 0.5], [659, 0.5], [523, 0.5], [784, 2],
        [0, 0.5],
        [1047, 3],
    ], 130);
}

// --- Keypress click ---
export function playClick() {
    tone(1000, ctx().currentTime, 0.015, 0.08);
}
