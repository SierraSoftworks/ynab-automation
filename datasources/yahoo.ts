import {buildUrl, fetchSafe} from "../utils/http"
import {CurrencyDataSource, DataSource, StockDataSource} from "./datasource"

export class Yahoo extends DataSource implements StockDataSource, CurrencyDataSource {
    constructor() {
        super("yahoo")
    }

    private headers = {
        "Accept": "application/json, text/javascript, text/plain, */*; q=0.01",
        "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
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
        await this.ensureSessionCrumb()

        const url = buildUrl(stockUrl, { SYMBOL: symbol, crumb: this.crumb })
        const response: any = await fetchSafe(url, {
                headers: Object.assign({}, this.headers, {
                    "Cookie": this.cookie
                })
            })
        
        return response.quoteSummary.result[0].price
    }

    private async getCurrencyDataInternal(from: string, to: string): Promise<CurrencyData> {
        await this.ensureSessionCrumb()

        const url = buildUrl(currencyUrl, { FROM_SYMBOL: from, TO_SYMBOL: to, crumb: this.crumb  })
        const response: any = await fetchSafe(url, {
            headers: Object.assign({}, this.headers, {
                "Cookie": this.cookie
            })
        })
        
        return response.quoteSummary.result[0].price
    }

    private async ensureSessionCrumb(): Promise<void> {
        if (this.crumb) return

        this.cookie = await this.getSessionCookie()
        this.crumb = await this.getSessionCrumb(this.cookie)
    }

    private async getSessionCookie(): Promise<string> {

        const response = await fetch("https://fc.yahoo.com", {
            headers: this.headers,
            redirect: "follow"
        })

        return response.headers.get("set-cookie").split(";")[0] || ""
    }

    private async getSessionCrumb(sessionCookie: string): Promise<string> {
        const response = await fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
            headers: Object.assign({}, this.headers, {
                "Cookie": sessionCookie
            }),
            redirect: "follow"
        })

        const crumb = response.text()
        if ((await crumb).includes("<html>")) return null
        return crumb    
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