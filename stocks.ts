import * as yahooStockPrices from "yahoo-stock-prices"
import * as CurrencyConverter from "currency-converter-lt"
const currencyConverter = new CurrencyConverter()

export interface StockHolding {
    symbol: string
    quantity: number
}

export interface StockValue {
    symbol: string
    value: number
    nativeValue: string
}

export async function getStockInformation(holdings: StockHolding[], targetCurrency: string): Promise<StockValue[]> {
    return await Promise.all(holdings.map(async stock => {
        const ticker: {
            currency: string,
            price: number
        } = await yahooStockPrices.getCurrentData(stock.symbol)
        const price = ticker.currency === targetCurrency ? ticker.price : await currencyConverter.from(ticker.currency).to(targetCurrency).convert(ticker.price)

        return { symbol: stock.symbol, value: stock.quantity * price, nativeValue: `${ticker.currency} ${(stock.quantity * ticker.price).toFixed(2)}` }
    }))
}