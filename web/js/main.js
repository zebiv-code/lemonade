// Lemonade Stand — main game flow
// Commands match original BASIC: GR, TEXT, HOME, VTAB, HTAB
import { createDisplay } from './apple2.js';
import { createGame } from './game.js';
import { drawTitleScreen, drawWeatherScreen, drawStand, drawResults } from './scenes.js';
import { playCashRegister, playThunder, playRain, playDayStart, playClick,
    playTitleMusic, playSunnyTune, playCloudyTune, playHotTune, playStormTune,
    playBigProfit, playSmallProfit, playLoss, playBankruptcy, playVictory } from './sound.js';

const canvas = document.getElementById('screen');
const inputArea = document.getElementById('input-area');
const d = createDisplay(canvas);
let game = createGame();

document.getElementById('quit-btn').addEventListener('click', () => location.reload());

function animate() { d.render(); requestAnimationFrame(animate); }
requestAnimationFrame(animate);

// --- Input ---
function showInput(label) {
    return new Promise(resolve => {
        inputArea.innerHTML = `<label>${label}</label>
            <input type="number" id="gi" min="0" step="1" autofocus>
            <button id="gs">OK</button>`;
        const inp = document.getElementById('gi'), btn = document.getElementById('gs');
        const go = () => { playClick(); resolve(parseInt(inp.value) || 0); inputArea.innerHTML = ''; };
        btn.addEventListener('click', go);
        inp.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
        inp.focus();
    });
}

function showButton(label) {
    return new Promise(resolve => {
        inputArea.innerHTML = `<button id="gb">${label}</button>`;
        document.getElementById('gb').addEventListener('click', () => { playClick(); inputArea.innerHTML = ''; resolve(); });
    });
}

function showChoice(options) {
    return new Promise(resolve => {
        inputArea.innerHTML = `<div class="choice-buttons">${options.map(o =>
            `<button class="choice-btn" data-val="${o.value}">${o.label}</button>`).join('')}</div>`;
        inputArea.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', () => { playClick(); inputArea.innerHTML = ''; resolve(btn.dataset.val); });
        });
    });
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

function playWeatherTune(sc) {
    if (sc === 2) playSunnyTune(); else if (sc === 7) playHotTune();
    else if (sc === 10) playCloudyTune(); else playStormTune();
}

// === Line 11000: INTRODUCTION ===
// 11100 TEXT : HOME : GR : COLOR= 12: FOR I = 0 TO 39: HLIN 0,39 AT I
async function introScreen() {
    d.text(); d.home(); // TEXT : HOME
    d.gr();             // GR (clears graphics)
    drawTitleScreen(d);
    // 11280 VTAB 23: PRINT "COPYRIGHT 1979 APPLE COMPUTER INC."
    d.println(' COPYRIGHT 1979');
    d.println(' APPLE COMPUTER INC.');
    playTitleMusic();
    await wait(3000);
}

// === Line 12000: TITLE PAGE ===
// 12100 TEXT : HOME
async function titlePage() {
    d.text(); d.home(); // TEXT : HOME
    // 12110-12180
    d.println('HI! WELCOME TO LEMONSVILLE,');
    d.println('CALIFORNIA!');
    d.println('');
    d.println('IN THIS SMALL TOWN, YOU ARE IN');
    d.println('CHARGE OF RUNNING YOUR OWN');
    d.println('LEMONADE STAND. YOU CAN COMPETE');
    d.println('WITH AS MANY OTHER PEOPLE AS YOU');
    d.println('WISH, BUT HOW MUCH PROFIT YOU');
    d.println('MAKE IS UP TO YOU.');
    d.println('');
    d.println("IF YOU MAKE THE MOST MONEY,");
    d.println("YOU'RE THE WINNER!!");
    await showButton('CONTINUE');
}

// === Line 13000: NEW BUSINESS ===
async function instructions() {
    // 13100 HOME
    d.home();
    d.println('TO MANAGE YOUR LEMONADE STAND,');
    d.println('YOU WILL NEED TO MAKE THESE');
    d.println('DECISIONS EVERY DAY:');
    d.println('');
    d.println('1. HOW MANY GLASSES OF LEMONADE');
    d.println('   TO MAKE');
    d.println('2. HOW MANY ADVERTISING SIGNS');
    d.println('   TO MAKE (15 CENTS EACH)');
    d.println('3. WHAT PRICE TO CHARGE FOR');
    d.println('   EACH GLASS');
    d.println('');
    d.println('YOU WILL BEGIN WITH $2.00 CASH.');
    d.println('LEMONADE COSTS $.02 A GLASS');
    d.println('(THIS MAY CHANGE IN THE FUTURE).');
    // 13200 GOSUB 18000
    await showButton('CONTINUE');

    // 13202 HOME
    d.home();
    d.println('YOUR EXPENSES ARE THE SUM OF THE');
    d.println('COST OF THE LEMONADE AND THE');
    d.println('COST OF THE SIGNS.');
    d.println('');
    d.println('YOUR PROFITS ARE THE DIFFERENCE');
    d.println('BETWEEN THE INCOME FROM SALES');
    d.println('AND YOUR EXPENSES.');
    d.println('');
    d.println('THE NUMBER OF GLASSES YOU SELL');
    d.println('EACH DAY DEPENDS ON THE PRICE');
    d.println('YOU CHARGE, AND ON THE NUMBER');
    d.println('OF ADVERTISING SIGNS YOU USE.');
    d.println('');
    d.println("KEEP TRACK OF YOUR ASSETS,");
    d.println("BECAUSE YOU CAN'T SPEND MORE");
    d.println('MONEY THAN YOU HAVE!');
    // 13300 GOSUB 18000
    await showButton('START GAME');
    // 13302 HOME : RETURN
    d.home();
}

// === Main game loop ===
async function dayLoop() {
    while (!game.state.gameOver) {
        game.startDay();
        const s = game.state;
        playDayStart();

        // === Line 470: GOSUB 15000 (weather display) ===
        // 15100 GR : HOME
        d.gr(); d.home();
        drawWeatherScreen(d, s.sc);
        playWeatherTune(s.sc);
        // 15170 VTAB 22: PRINT " LEMONSVILLE WEATHER REPORT"
        d.println(' LEMONSVILLE WEATHER REPORT');
        // 15180-15186
        if (s.sc === 2) d.println('          SUNNY');
        else if (s.sc === 7) d.println('       HOT AND DRY');
        else if (s.sc === 10) d.println('         CLOUDY');
        else d.println('     THUNDERSTORMS!');
        await wait(2500);

        // === Line 490: TEXT : HOME ===
        d.text(); d.home();
        // 520: "ON DAY X, THE COST OF LEMONADE IS $.0C"
        d.println(`ON DAY ${s.day}, THE COST OF`);
        d.println(`LEMONADE IS $.0${s.costCode}`);
        d.println('');

        // 610-660: Day messages
        const dayMsg = game.getDayMessage();
        if (dayMsg) d.println(dayMsg);

        // 2000+: Random events
        if (s.event) {
            const words = s.event.replace(/\n/g, ' ').split(' ');
            let line = '';
            for (const w of words) {
                if (line.length + w.length + 1 > 38) { d.println(line); line = w; }
                else line = line ? line + ' ' + w : w;
            }
            if (line) d.println(line);
        }

        d.println('');

        // === Line 850: Input ===
        d.println(`LEMONADE STAND 1`);
        d.println(`ASSETS ${game.formatDollars(s.assets)}`);

        let valid = false, glasses, signs, price;
        while (!valid) {
            // 890: "HOW MANY GLASSES OF LEMONADE DO YOU WISH TO MAKE"
            glasses = await showInput('GLASSES TO MAKE?');
            if (glasses < 0 || glasses > 1000 || glasses !== Math.floor(glasses)) {
                // 903
                d.home();
                d.println("COME ON, LET'S BE REASONABLE");
                d.println('NOW!!! TRY AGAIN');
                await wait(1000);
                d.home();
                d.println(`LEMONADE STAND 1  ASSETS ${game.formatDollars(s.assets)}`);
                continue;
            }
            // 910: check afford
            if (glasses * s.costPerGlass > s.assets + 0.001) {
                // 920-932
                d.home();
                d.println(`THINK AGAIN!!! YOU HAVE ONLY`);
                d.println(`${game.formatDollars(s.assets)} IN CASH AND`);
                d.println(`TO MAKE ${glasses} GLASSES YOU`);
                d.println(`NEED ${game.formatDollars(glasses * s.costPerGlass)}.`);
                await showButton('TRY AGAIN');
                d.home();
                d.println(`LEMONADE STAND 1  ASSETS ${game.formatDollars(s.assets)}`);
                continue;
            }

            // 951: "HOW MANY ADVERTISING SIGNS (15 CENTS EACH)"
            signs = await showInput('SIGNS? (15 CENTS EACH)');
            if (signs < 0 || signs > 50 || signs !== Math.floor(signs)) {
                // 963
                d.home();
                d.println('COME ON, BE REASONABLE!!!');
                d.println('TRY AGAIN.');
                await wait(1000);
                d.home();
                d.println(`LEMONADE STAND 1  ASSETS ${game.formatDollars(s.assets)}`);
                continue;
            }
            // 970: check afford after glasses
            if (!game.canAfford(glasses, signs)) {
                const left = s.assets - glasses * s.costPerGlass;
                // 985-990
                d.home();
                d.println(`THINK AGAIN, YOU HAVE ONLY`);
                d.println(`${game.formatDollars(left)} IN CASH LEFT`);
                d.println('AFTER MAKING YOUR LEMONADE.');
                await showButton('TRY AGAIN');
                d.home();
                d.println(`LEMONADE STAND 1  ASSETS ${game.formatDollars(s.assets)}`);
                continue;
            }

            // 1010: "WHAT PRICE (IN CENTS) DO YOU WISH TO CHARGE"
            price = await showInput('PRICE PER GLASS? (CENTS)');
            if (price < 0 || price > 100 || price !== Math.floor(price)) {
                d.home();
                d.println('COME ON, BE REASONABLE!!!');
                d.println('TRY AGAIN.');
                await wait(1000);
                d.home();
                d.println(`LEMONADE STAND 1  ASSETS ${game.formatDollars(s.assets)}`);
                continue;
            }
            valid = true;
        }

        game.submitChoices(glasses, signs, price);

        // Selling animation (GR mode)
        d.gr(); d.home();
        drawStand(d, glasses, 0);
        d.println('SELLING LEMONADE...');
        await wait(1000);

        // Simulate
        game.simulateDay();

        // === Line 1120/2300: Thunderstorm ===
        if (s.rained) {
            // 2320: SC = 5: GOSUB 15000: TEXT : HOME
            d.gr(); d.home();
            drawWeatherScreen(d, 5);
            d.println('WEATHER REPORT:');
            d.println('A SEVERE THUNDERSTORM HIT');
            playThunder();
            await wait(500);
            playRain(1.5);
            await wait(2000);
            // TEXT : HOME
            d.text(); d.home();
            // 2340-2360
            d.println('A SEVERE THUNDERSTORM HIT');
            d.println('LEMONSVILLE EARLIER TODAY,');
            d.println('JUST AS THE LEMONADE STANDS');
            d.println('WERE BEING SET UP.');
            d.println('');
            d.println('UNFORTUNATELY, EVERYTHING');
            d.println('WAS RUINED!!');
            await wait(1500);
        } else if (s.r2 === 2 && s.sold === s.glasses) {
            // 2290-2295
            d.gr(); d.home();
            drawStand(d, glasses, s.sold);
            d.println('THE STREET CREWS BOUGHT ALL');
            d.println('YOUR LEMONADE AT LUNCHTIME!!');
            playCashRegister();
            await wait(1500);
        } else {
            d.gr(); d.home();
            drawStand(d, glasses, s.sold);
            drawResults(d, s.profit);
            await wait(800);
        }

        // === Line 1110: TEXT : HOME ===
        // 1130: "$$ LEMONSVILLE DAILY FINANCIAL REPORT $$"
        d.text(); d.home();
        d.println('$$ LEMONSVILLE DAILY');
        d.println('   FINANCIAL REPORT $$');
        d.println('');

        // === Line 5000: Per-stand report ===
        // 5002
        d.println(`   DAY ${s.day}              STAND 1`);
        d.println('');
        // 5010
        d.println(`  ${s.sold}  GLASSES SOLD`);
        d.println('');
        // 5012-5014
        d.println(`  ${game.formatDollars(s.price/100)} PER GLASS    INCOME ${game.formatDollars(s.income)}`);
        d.println('');
        // 5016-5020
        d.println(`  ${s.glasses}  GLASSES MADE`);
        d.println(`  ${s.signs}  SIGNS MADE    EXPENSES ${game.formatDollars(s.expense)}`);
        d.println('');
        // 5030-5040
        d.println(`                PROFIT  ${game.formatDollars(s.profit)}`);
        d.println('');
        d.println(`                ASSETS  ${game.formatDollars(s.assets)}`);

        if (s.profit > 0.50) playBigProfit();
        else if (s.profit > 0) { playSmallProfit(); playCashRegister(); }
        else if (s.profit < 0) playLoss();

        // === Line 1350-1380: Bankruptcy ===
        if (s.gameOver) {
            await wait(1000);
            // 1365 HOME
            d.home();
            d.println("  ...YOU DON'T HAVE ENOUGH");
            d.println(' MONEY LEFT TO STAY IN');
            d.println(" BUSINESS  YOU'RE BANKRUPT!");
            playBankruptcy();
            await wait(2500);
            break;
        }

        // 18000: PRESS SPACE TO CONTINUE
        const choice = await showChoice([
            { value: 'next', label: 'NEXT DAY' },
            { value: 'quit', label: 'QUIT' },
        ]);
        if (choice === 'quit') break;
    }

    // === Line 31111: End ===
    d.text(); d.home();
    d.println(`DAYS PLAYED: ${game.state.day}`);
    d.println(`FINAL ASSETS: ${game.formatDollars(game.state.assets)}`);
    const tp = game.state.assets - 2.00;
    if (tp > 0) { d.println(`PROFIT: ${game.formatDollars(tp)}`); playVictory(); }
    else { d.println(`LOSS: ${game.formatDollars(Math.abs(tp))}`); playLoss(); }
    d.println('');
    d.println('WOULD YOU LIKE TO PLAY AGAIN?');

    const again = await showChoice([
        { value: 'yes', label: 'YES' },
        { value: 'no', label: 'NO' },
    ]);
    if (again === 'yes') { game = createGame(); await introScreen(); await dayLoop(); }
}

// === Line 5: Start ===
(async () => { await introScreen(); await titlePage(); await instructions(); await dayLoop(); })();
