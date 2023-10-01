import { buildUrl, fetchSafe } from "./http"

const forexUrl = "https://api.tiingo.com/tiingo/fx/{SYMBOL}/top?token={TIINGO_API_KEY}"

const stockUrl = "https://api.tiingo.com/tiingo/daily/{SYMBOL}/prices?token={TIINGO_API_KEY}"

interface CurrencyInfo {
    ticker: string
    quoteTimestamp: string
    bidPrice: number
    bidSize: number
    askPrice: number
    askSize: number
    midPrice: number
}

interface StockInfo {
    date: string
    close: number
    high: number
    low: number
    open: number
    volume: number
    adjClose: number
    adjHigh: number
    adjLow: number
    adjOpen: number
    adjVolume: number
    divCash: number
    splitFactor: number
}

interface StockQuote {
    symbol: string,
    currency: string
    price: number
}

export async function getStockData(symbol: string): Promise<StockQuote> {
    const response: StockInfo[] = await fetchSafe(buildUrl(stockUrl, { SYMBOL: symbol.toLowerCase(), TIINGO_API_KEY: process.env.TIINGO_API_KEY }))
    return {
        symbol: symbol.toUpperCase(),
        currency: "USD",
        price: response[0].close
    }
}

export async function getCurrencyData(from: string, to: string): Promise<number> {
    if (from.toLowerCase() === "usd")
    {
        return 1/(await getCurrencyData(to, from))
    }

    const response: CurrencyInfo[] = await fetchSafe(buildUrl(forexUrl, { SYMBOL: `${from.toLowerCase()}${to.toLowerCase()}`, TIINGO_API_KEY: process.env.TIINGO_API_KEY }))
    return response[0].midPrice
}