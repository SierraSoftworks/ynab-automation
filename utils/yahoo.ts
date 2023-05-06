import {request} from "https"

const stockUrl = "https://query1.finance.yahoo.com/v11/finance/quoteSummary/{SYMBOL}?modules=price"

const currencyUrl = "https://query1.finance.yahoo.com/v11/finance/quoteSummary/{FROM_SYMBOL}{TO_SYMBOL}=X?modules=price"

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

async function fetchSafe<T>(url: string, attempts: number = 3): Promise<T> {
    while (true) {
        attempts -= 1

        const response = await fetch(url)
        if (response.ok) {
            return await response.json()
        }

        if (!attempts) {
            throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`)
        }

        // Delay for 1s between retries
        await new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), 500)
        })
    }
}

export async function getStockData(symbol: string): Promise<StockData> {
    const url = stockUrl.replace('{SYMBOL}', encodeURIComponent(symbol))
    const response: any = await fetchSafe(url)
    return response.quoteSummary.result[0].price
}

export async function getCurrencyData(from: string, to: string): Promise<CurrencyData> {
    from = from.toUpperCase()
    to = to.toUpperCase()

    const url = currencyUrl.replace('{FROM_SYMBOL}', encodeURIComponent(from)).replace('{TO_SYMBOL}', encodeURIComponent(to))
    const response: any = await fetchSafe(url)
    return response.quoteSummary.result[0].price
}