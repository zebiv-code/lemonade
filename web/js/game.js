// Lemonade Stand — game logic faithful to the original BASIC source
// Original by Bob Jamison (MECC), Apple II port by Charlie Kellner, Feb 1979
// Line references are from lemonade_original.bas

// Weather SC values from original: 2=sunny, 7=hot&dry, 10=cloudy, 5=storms
export const WEATHER = {
    SUNNY:  { sc: 2,  name: 'SUNNY' },
    CLOUDY: { sc: 10, name: 'CLOUDY' },
    HOT:    { sc: 7,  name: 'HOT AND DRY' },
    STORM:  { sc: 5,  name: 'THUNDERSTORMS' },
};

export function createGame() {
    // Constants from original (lines 150-195)
    const P9 = 10;    // base price reference (10 cents)
    const S3 = 0.15;  // sign cost ($0.15 each)
    const S2 = 30;    // base demand
    const A2 = 2.00;  // starting assets ($2.00)
    const C9 = 0.5;   // sign effectiveness coefficient
    const C2 = 1;     // sign effectiveness multiplier

    const state = {
        day: 0,
        assets: A2,        // dollars (original uses dollars, not cents)
        sc: 2,             // weather SC code
        weatherName: '',
        costPerGlass: 0.02, // dollars per glass (C1 in original)
        costCode: 2,        // raw cost in cents (C in original)
        glasses: 0,         // L(I) — glasses to make
        signs: 0,           // S(I) — signs to make
        price: 0,           // P(I) — price in cents
        sold: 0,            // N2 — glasses sold
        income: 0,          // M — income in dollars
        expense: 0,         // E — expense in dollars
        profit: 0,          // P1 — profit in dollars
        r1: 1,              // weather demand multiplier
        r2: 0,              // street work flag (2 = street crew buys all)
        r3: 0,              // storm ruined flag
        rained: false,
        event: null,        // random event text
        history: [],
        gameOver: false,
        // Random event flags (each can only happen once)
        x1: false,          // cloudy rain warning shown
        x2: false,          // street work event shown
        x4: false,          // heat wave shown
    };

    // Line 410-460: Weather determination
    function rollWeather() {
        const sc = Math.random();
        // Line 420-440
        if (sc < 0.6) state.sc = 2;       // sunny
        else if (sc < 0.8) state.sc = 10;  // cloudy
        else state.sc = 7;                 // hot and dry
        // Line 460: first 2 days always sunny
        if (state.day < 3) state.sc = 2;

        if (state.sc === 2) state.weatherName = 'SUNNY';
        else if (state.sc === 7) state.weatherName = 'HOT AND DRY';
        else if (state.sc === 10) state.weatherName = 'CLOUDY';
        else state.weatherName = 'THUNDERSTORMS';
    }

    // Line 500-570: Start of new day
    function startDay() {
        state.day++;
        state.rained = false;
        state.event = null;
        state.r1 = 1;
        state.r2 = 0;
        state.r3 = 0;

        // Line 540-550: Cost increases over time
        state.costCode = 2;
        if (state.day > 2) state.costCode = 4;
        if (state.day > 6) state.costCode = 5;
        state.costPerGlass = state.costCode * 0.01;

        rollWeather();
        rollRandomEvent();
    }

    // Lines 2000-2450: Random events
    function rollRandomEvent() {
        // Line 2010: Cloudy day events
        if (state.sc === 10 && !state.x1) {
            // Line 2110-2130: Rain chance warning
            const j = 30 + Math.floor(Math.random() * 5) * 10; // 30-70%
            state.event = `THERE IS A ${j}% CHANCE OF LIGHT RAIN,\nAND THE WEATHER IS COOLER TODAY.`;
            state.r1 = 1 - j / 100;
            state.x1 = true;
            return;
        }

        // Line 2030: Hot day events
        if (state.sc === 7 && !state.x4) {
            // Line 2430-2440: Heat wave
            state.x4 = true;
            state.event = 'A HEAT WAVE IS PREDICTED FOR TODAY!';
            state.r1 = 2;
            return;
        }

        // Line 2040: Sunny day — 25% chance of street work
        if (state.sc === 2 && !state.x2 && state.day > 2) {
            if (Math.random() < 0.25) {
                state.x2 = true;
                state.event = 'THE STREET DEPARTMENT IS WORKING TODAY.\nTHERE WILL BE NO TRAFFIC ON YOUR STREET.';
                // Line 2230-2232: 50% chance street crew buys all, else R1=0.1
                if (Math.random() < 0.5) {
                    state.r2 = 2;
                } else {
                    state.r1 = 0.1;
                }
            }
        }
    }

    // Line 600-660: Day-specific messages
    function getDayMessage() {
        if (state.day === 3) return '(YOUR MOTHER QUIT GIVING YOU FREE SUGAR)';
        if (state.day === 7) return '(THE PRICE OF LEMONADE MIX JUST WENT UP)';
        return null;
    }

    function canAfford(glasses, signs) {
        return glasses * state.costPerGlass + signs * S3 <= state.assets + 0.001;
    }

    function submitChoices(glasses, signs, price) {
        state.glasses = glasses;
        state.signs = signs;
        state.price = price;
    }

    // Lines 1120-1300: Calculate sales and profits
    function simulateDay() {
        // Line 1120: Thunderstorm on cloudy days (25% chance)
        if (state.sc === 10 && Math.random() < 0.25) {
            state.rained = true;
            state.sc = 5;
            state.weatherName = 'THUNDERSTORMS';
            state.r3 = 3;
            // Line 2370: Everything ruined
            state.sold = 0;
            state.income = 0;
            state.expense = state.glasses * state.costPerGlass + state.signs * S3;
            state.profit = -state.expense;
            state.assets += state.profit;
            checkBankruptcy();
            recordHistory();
            return;
        }

        // Line 1182: Street crew buys all
        if (state.r2 === 2) {
            state.sold = state.glasses;
        } else {
            // Lines 1190-1234: Original demand formula
            let n1;
            if (state.price < P9) {
                // Line 1200: N1 = (P9-P)/P9 * 0.8 * S2 + S2
                n1 = ((P9 - state.price) / P9) * 0.8 * S2 + S2;
            } else {
                // Line 1220: N1 = P9^2 * S2 / P^2
                n1 = (P9 * P9 * S2) / (state.price * state.price);
            }

            // Lines 1230-1232: Sign effectiveness (exponential model)
            const w = -state.signs * C9;
            const v = 1 - Math.exp(w) * C2;

            // Line 1234: N2 = R1 * (N1 + N1*V)
            let n2 = state.r1 * (n1 + n1 * v);

            // Line 1240: Floor and cap at glasses made
            state.sold = Math.min(Math.floor(n2), state.glasses);
        }

        // Line 1270-1290: Financial calculations
        state.income = state.sold * state.price * 0.01;  // M = N2 * P(I) * .01
        state.expense = state.signs * S3 + state.glasses * state.costPerGlass;  // E = S(I)*S3 + L(I)*C1
        state.profit = state.income - state.expense;  // P1 = M - E
        state.assets += state.profit;

        checkBankruptcy();
        recordHistory();
    }

    // Line 1350-1380: Bankruptcy check
    function checkBankruptcy() {
        if (state.assets < state.costPerGlass) {
            if (state.assets < 0) state.assets = 0;
            state.gameOver = true;
        }
    }

    function recordHistory() {
        state.history.push({
            day: state.day,
            weather: state.weatherName,
            glasses: state.glasses,
            signs: state.signs,
            price: state.price,
            sold: state.sold,
            income: state.income,
            expense: state.expense,
            profit: state.profit,
            assets: state.assets,
            rained: state.rained,
            event: state.event,
        });
    }

    function formatDollars(amount) {
        // Line 4000-4050: STI => dollars.cents format
        const rounded = Math.round(amount * 100) / 100;
        return '$' + rounded.toFixed(2);
    }

    return {
        state,
        startDay,
        getDayMessage,
        canAfford,
        submitChoices,
        simulateDay,
        formatDollars,
    };
}
