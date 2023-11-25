import { randomInt } from "node:crypto"
import {buildUrl, fetchSafe, retry} from "../utils/http"
import {CurrencyDataSource, DataSource, StockDataSource} from "./datasource"

const validUserAgents = [
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.1; rv:109.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0"
]

export class Yahoo extends DataSource implements StockDataSource, CurrencyDataSource {
    constructor() {
        super("yahoo")
    }

    private headers = {
        "Accept": "application/json, text/javascript, text/plain, */*; q=0.01",
        "User-Agent": validUserAgents[randomInt(validUserAgents.length)],
    }

    private cookie: string
    private crumb: string

    async getStockData(symbol: string): Promise<{
        symbol: string,
        currency: string
        price: number
    }> {
        const result =  await this.cached(
            `stock-${symbol}`,
            "hour",
            () => this.getStockDataInternal(symbol))

        return {
            symbol: result.symbol,
            currency: result.currency,
            price: result.regularMarketPrice.raw
        }
    }

    async getCurrencyData(from: string, to: string): Promise<number> {
        from = from.toUpperCase()
        to = to.toUpperCase()

        const result = await this.cached(`currency-${from}-${to}`, "hour", () => this.getCurrencyDataInternal(from, to))

        return result.regularMarketPrice.raw
    }

    private async getStockDataInternal(symbol: string): Promise<StockData> {
        return await retry(async () => {
            await this.ensureSessionCrumb()

            const url = buildUrl(stockUrl, { SYMBOL: symbol, crumb: this.crumb })
            const response = await fetch(url, {
                headers: Object.assign({}, this.headers, {
                    "Cookie": this.cookie
                })
            })

            if (response.status >= 400) {
                // Ensure that we re-initialize these values on the next attempt
                this.cookie = this.crumb = null
            }

            if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`)

            const result = await response.json()
            return result.quoteSummary.result[0].price
        })
    }

    private async getCurrencyDataInternal(from: string, to: string): Promise<CurrencyData> {
        return await retry(async () => {
            await this.ensureSessionCrumb()

            const url = buildUrl(currencyUrl, { FROM_SYMBOL: from, TO_SYMBOL: to, crumb: this.crumb  })
            const response = await fetch(url, {
                headers: Object.assign({}, this.headers, {
                    "Cookie": this.cookie
                })
            })

            if (response.status >= 400) {
                // Ensure that we re-initialize these values on the next attempt
                this.cookie = this.crumb = null
            }

            if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`)

            const result = await response.json()
            return result.quoteSummary.result[0].price
        })
    }

    private async ensureSessionCrumb(): Promise<void> {
        if (this.crumb) return

        this.cookie = await this.getSessionCookie()

        if (!this.cookie) throw new Error("Failed to get session cookie")
        
        this.crumb = await this.getSessionCrumb(this.cookie)

        if (!this.crumb) throw new Error("Failed to get session crumb")
    }

    private async getSessionCookie(): Promise<string> {
        return await retry(async () => {
            const resp = await fetch("https://fc.yahoo.com", {
                headers: this.headers,
                redirect: "follow"
            })

            const cookie = resp.headers.get("set-cookie").split(";")[0] || ""
            if (!cookie) throw new Error(`${resp.status} ${resp.statusText}: No cookie returned when attempting to initialize a session.`)

            return cookie
        })
    }

    private async getSessionCrumb(sessionCookie: string): Promise<string> {
        return await retry(async () => {
            const response = await fetch("https://query1.finance.yahoo.com/v1/test/getcrumb", {
                headers: Object.assign({}, this.headers, {
                    "Cookie": sessionCookie
                }),
                redirect: "follow"
            })

            if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`)

            const crumb = response.text()
            if ((await crumb).includes("<html>")) throw new Error(`${response.status} ${response.statusText}: Did not receive a valid crumb when attempting to initialize a session: ${crumb}`)
            return crumb    
        })
    }
}

const stockUrl = "https://query1.finance.yahoo.com/v10/finance/quoteSummary/{SYMBOL}?modules=price&crumb={crumb}"

const currencyUrl = "https://query1.finance.yahoo.com/v10/finance/quoteSummary/{FROM_SYMBOL}{TO_SYMBOL}=X?modules=price&crumb={crumb}"

interface NumericalValue {
    raw: number
    fmt: string
    longFmt?: string
}

export interface StockData {
    symbol: string
    shortName: string
    longName: string
    exchange: string
    exchangeName: string
    currency: string
    currencySymbol: string
    regularMarketPrice: NumericalValue
}

export interface CurrencyData {
    currency: string
    currencySymbol: string
    shortName: string
    longName: string
    regularMarketPrice: NumericalValue
}