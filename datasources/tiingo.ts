import { buildUrl, fetchSafe } from "../utils/http"
import {DataSource, StockDataSource, CurrencyDataSource} from "./datasource"

export class Tiingo extends DataSource implements StockDataSource, CurrencyDataSource {
    constructor(protected apiKey: string = process.env.TIINGO_API_KEY) {
        super("tiingo")
    }

    async getStockData(symbol: string): Promise<StockQuote> {
        const url = buildUrl(stockUrl, { SYMBOL: symbol.toLowerCase(), TIINGO_API_KEY: this.apiKey })
        const response: StockInfo[] = await this.cached(
            `stock-${symbol}`,
            "day",
            () => fetchSafe(url))

        return {
            symbol: symbol.toUpperCase(),
            currency: "USD",
            price: response[0].close
        }
    }

    async getCurrencyData(from: string, to: string): Promise<number> {
        if (from.toLowerCase() === "usd")
        {
            return 1/(await this.getCurrencyData(to, from))
        }

        const url = buildUrl(forexUrl, { SYMBOL: `${from.toLowerCase()}${to.toLowerCase()}`, TIINGO_API_KEY: this.apiKey })
        const response: CurrencyInfo[] = await this.cached(`currency-${from}-${to}`, "day", () => fetchSafe(url))

        return response[0].midPrice
    }
}

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