/*
    GOLD AI - XAUUSD SIGNAL DASHBOARD

    FRONTEND PROTOTYPE

    This file currently uses simulated market data.

    Later we will replace the simulated data with:

        MT5
          ↓
        Python
          ↓
        FastAPI
          ↓
        This website
*/


let marketData = {

    price: 3640.20,

    h1Trend: "BULLISH",

    m15Trend: "BULLISH",

    rsi: 57.8,

    atr: 6.2,

    ema50: 3642.10,

    ema200: 3628.40,

    support: 3635.00,

    resistance: 3660.00

};


/*
========================================
FORMAT PRICE
========================================
*/

function formatPrice(value) {

    return Number(value).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/*
========================================
UPDATE MARKET DATA
========================================
*/

function updateMarketDisplay() {

    document.getElementById("currentPrice")
        .textContent = formatPrice(marketData.price);

    document.getElementById("levelPrice")
        .textContent = "$" + formatPrice(marketData.price);


    document.getElementById("h1Trend")
        .textContent = marketData.h1Trend;


    document.getElementById("m15Trend")
        .textContent = marketData.m15Trend;


    document.getElementById("rsi")
        .textContent = marketData.rsi;


    document.getElementById("atr")
        .textContent = marketData.atr;


    document.getElementById("ema50")
        .textContent = formatPrice(marketData.ema50);


    document.getElementById("ema200")
        .textContent = formatPrice(marketData.ema200);


    document.getElementById("support")
        .textContent = "$" + formatPrice(marketData.support);


    document.getElementById("resistance")
        .textContent = "$" + formatPrice(marketData.resistance);

}


/*
========================================
GENERATE SIGNAL
========================================

THIS IS ONLY A DEMONSTRATION.

It will later be replaced by our
real strategy engine.
*/

function generateSignal() {

    const price = marketData.price;

    const bullishTrend =
        marketData.h1Trend === "BULLISH" &&
        marketData.m15Trend === "BULLISH";

    const bearishTrend =
        marketData.h1Trend === "BEARISH" &&
        marketData.m15Trend === "BEARISH";


    /*
        BUY CONDITION

        Price near support
        + bullish trend
        + RSI above 50
    */

    const nearSupport =
        price <= marketData.support + 8;


    const nearResistance =
        price >= marketData.resistance - 8;


    if (
        bullishTrend &&
        nearSupport &&
        marketData.rsi > 50
    ) {

        return createBuySignal();

    }


    if (
        bearishTrend &&
        nearResistance &&
        marketData.rsi < 50
    ) {

        return createSellSignal();

    }


    return createWaitSignal();

}


/*
========================================
BUY SIGNAL
========================================
*/

function createBuySignal() {

    const entry = marketData.price;

    const stopLoss =
        marketData.support - 4;

    const risk =
        entry - stopLoss;

    const takeProfit1 =
        entry + risk * 2;

    const takeProfit2 =
        entry + risk * 3;


    return {

        type: "BUY",

        entry: entry,

        stopLoss: stopLoss,

        tp1: takeProfit1,

        tp2: takeProfit2,

        riskReward: "1 : 2",

        quality: "MODERATE",

        description:
            "Bullish higher-timeframe structure with price reacting near support.",

        aiTitle:
            "Potential bullish setup",

        aiExplanation:
            "The market is showing bullish structure on H1 and M15. Price is near the identified support zone and RSI is above 50, suggesting positive momentum. Confirmation is still required before entering."

    };

}


/*
========================================
SELL SIGNAL
========================================
*/

function createSellSignal() {

    const entry = marketData.price;

    const stopLoss =
        marketData.resistance + 4;

    const risk =
        stopLoss - entry;

    const takeProfit1 =
        entry - risk * 2;

    const takeProfit2 =
        entry - risk * 3;


    return {

        type: "SELL",

        entry: entry,

        stopLoss: stopLoss,

        tp1: takeProfit1,

        tp2: takeProfit2,

        riskReward: "1 : 2",

        quality: "MODERATE",

        description:
            "Bearish higher-timeframe structure with price reacting near resistance.",

        aiTitle:
            "Potential bearish setup",

        aiExplanation:
            "The market is showing bearish structure on H1 and M15. Price is near resistance and RSI is below 50, suggesting negative momentum. Confirmation is still required before entering."

    };

}


/*
========================================
WAIT SIGNAL
========================================
*/

function createWaitSignal() {

    return {

        type: "WAIT",

        entry: null,

        stopLoss: null,

        tp1: null,

        tp2: null,

        riskReward: "--",

        quality: "NO SETUP",

        description:
            "No high-quality setup is currently confirmed.",

        aiTitle:
            "Waiting for confirmation",

        aiExplanation:
            "The current market conditions do not meet enough of the strategy requirements. The system will continue monitoring XAUUSD rather than forcing a trade."

    };

}


/*
========================================
DISPLAY SIGNAL
========================================
*/

function displaySignal(signal) {

    const signalText =
        document.getElementById("signalText");

    const signalIcon =
        document.getElementById("signalIcon");


    signalText.textContent =
        signal.type;


    document.getElementById("signalDescription")
        .textContent =
        signal.description;


    document.getElementById("confidence")
        .textContent =
        signal.quality;


    document.getElementById("entryPrice")
        .textContent =
        signal.entry
            ? "$" + formatPrice(signal.entry)
            : "--";


    document.getElementById("stopLoss")
        .textContent =
        signal.stopLoss
            ? "$" + formatPrice(signal.stopLoss)
            : "--";


    document.getElementById("takeProfit1")
        .textContent =
        signal.tp1
            ? "$" + formatPrice(signal.tp1)
            : "--";


    document.getElementById("takeProfit2")
        .textContent =
        signal.tp2
            ? "$" + formatPrice(signal.tp2)
            : "--";


    document.getElementById("riskReward")
        .textContent =
        signal.riskReward;


    document.getElementById("aiTitle")
        .textContent =
        signal.aiTitle;


    document.getElementById("aiExplanation")
        .textContent =
        signal.aiExplanation;


    /*
        Change signal color
    */

    if (signal.type === "BUY") {

        signalText.style.color =
            "#22c55e";

        signalIcon.style.color =
            "#22c55e";

    }

    else if (signal.type === "SELL") {

        signalText.style.color =
            "#ef4444";

        signalIcon.style.color =
            "#ef4444";

    }

    else {

        signalText.style.color =
            "#f59e0b";

        signalIcon.style.color =
            "#f59e0b";

    }

}


/*
========================================
REFRESH SIGNAL
========================================
*/

function refreshSignal() {

    /*
        Simulate a small price movement.

        THIS WILL LATER BE REPLACED BY
        REAL MT5 DATA.
    */

    const movement =
        (Math.random() - 0.5) * 4;


    marketData.price += movement;


    updateMarketDisplay();


    const signal =
        generateSignal();


    displaySignal(signal);

}


/*
========================================
DEMO TRADE
========================================
*/

function demoTrade() {

    const signal =
        generateSignal();


    if (signal.type === "WAIT") {

        alert(
            "No confirmed setup.\n\n" +
            "The system recommends WAIT."
        );

        return;

    }


    alert(

        "DEMO TRADE\n\n" +

        "Signal: " +
        signal.type +

        "\nEntry: $" +
        formatPrice(signal.entry) +

        "\nStop Loss: $" +
        formatPrice(signal.stopLoss) +

        "\nTP1: $" +
        formatPrice(signal.tp1) +

        "\nTP2: $" +
        formatPrice(signal.tp2) +

        "\n\nThis is only a simulated trade."

    );

}


/*
========================================
INITIALIZE
========================================
*/

function initialize() {

    updateMarketDisplay();

    const signal =
        generateSignal();

    displaySignal(signal);

}


/*
========================================
START APP
========================================
*/

document.addEventListener(
    "DOMContentLoaded",
    initialize
);