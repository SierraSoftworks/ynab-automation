import {request} from "https"

const stockBaseUrl = "https://query2.finance.yahoo.com/v7/finance/quote?formatted=true&lang=en-US&region=US&fields=longName,shortName,marketCap,underlyingSymbol,underlyingExchangeSymbol,headSymbolAsString,regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketVolume,regularMarketOpen,toCurrency,fromCurrency"

const currencyBaseUrl = "https://query2.finance.yahoo.com/v7/finance/quote?formatted=true&lang=en-US&region=US&fields=regularMarketPrice,toCurrency,fromCurrency,shortName"

interface NumericalValue {
    raw: number
    fmt: string
    longFmt?: string
}

export interface StockData {
    cryptoTradeable: boolean
    currency: string
    customPriceAlertConfidence: string
    exchange: string
    exchangeTimezoneShortName: string
    exhangeTimezoneName: string
    firstTradeDateMilliseconds: number
    fullExchangeName: string
    language: string
    longName: string
    market: string
    marketCap: NumericalValue
    marketState: string
    priceHint: number
    quoteSourceName: string
    quoteType: string
    region: string
    regularMarketChange: NumericalValue
    regularMarketChangePercent: NumericalValue
    regularMarketOpen: NumericalValue
    regularMarketPreviousClose: NumericalValue
    regularMarketPrice: NumericalValue
    regularMarketTime: NumericalValue
    regularMarketVolume: NumericalValue
    shortName: string
    sourceInterval: number
    symbol: string
    tradeable: boolean
    typeDisp: string
}

export interface CurrencyData {
    cryptoTradeable: boolean
    currency: string
    customPriceAlertConfidence: string
    exchange: string
    exchangeTimezoneName: string
    exchangeTimezoneShortName: string
    firstTradeDateMilliseconds: number
    fullExchangeName: string
    langauge: string
    market: string
    marketState: string
    priceHint: number
    quoteSourceName: string
    quoteType: string
    region: string
    regularMarketPrice: NumericalValue
    regularMarketTime: NumericalValue
    shortName: string
    sourceInterfal: number
    symbol: string
    typeDisp: string
}

async function fetchSafe<T>(url: string, attempts: number = 3): Promise<T> {
    while (attempts-- > 0) {
        const response = await fetch(url)
        if (response.ok) {
            return await response.json()
        }

        if (!attempts) {
            throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`)
        }

        // Delay for 1s between retries
        await new Promise((result) => {
            setTimeout(() => result(null), 1000)
        })
    }
}

export async function getStockData(symbols: string[]): Promise<StockData[]> {
    symbols = symbols.map(s => s.toUpperCase())

    const url = `${stockBaseUrl}&symbols=${symbols.join(',')}`
    const response: any = await fetchSafe(url)
    return response.quoteResponse.result
}

export async function getCurrencyData(from: string, to: string): Promise<CurrencyData[]> {
    from = from.toUpperCase()
    to = to.toUpperCase()

    if (from === "USD") {
        from = ""
    }

    const url = `${currencyBaseUrl}&symbols=${from}${to}=X`
    const response: any = await fetchSafe(url)
    return response.quoteResponse.result
}