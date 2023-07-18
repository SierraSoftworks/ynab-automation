import {fetchSafe} from "./http"

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