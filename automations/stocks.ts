import * as CurrencyConverter from "currency-converter-lt"
import { Automation } from "../automation"
import { getStockData } from "../utils/yahoo"

import { Account, API, BudgetDetail, SaveTransaction } from "ynab"

const currencyConverter = new CurrencyConverter()

export class StockAutomation extends Automation {
    private stockChecker = new StockChecker()

    public get kind() {
        return "stocks"
    }

    public async run(budget: BudgetDetail, account: Account, options: { [key: string]: string }): Promise<void> {
        const holdings = this.getStocks(options)

        const values = await this.stockChecker.getStockValues(holdings, budget.currency_format.iso_code)
        if (!values.length) return;

        const shift = Math.floor(values.reduce((sum, stock) => sum + stock.value, 0) * 1000) - account.balance;

        // We only record transactions if they result in more than 1 unit of currency change (i.e. ignore changes in the cents range)
        if (Math.abs(shift) <= 1000) return;

        await this.api.transactions.createTransaction(budget.id, {
            transaction: {
                account_id: account.id,
                date: new Date().toISOString().split('T')[0],
                amount: shift,
                payee_name: options.payee_name || "Stock Market",
                cleared: SaveTransaction.ClearedEnum.Cleared,
                approved: true,
                memo: values.map(v => `${v.symbol}: ${v.nativeCurrency} ${v.nativeValue.toFixed(2)} @ ${v.nativeCurrency} ${v.nativePrice}`).join(', ')
            }
        })
    }

    private getStocks(options: { [key: string]: string }): StockHolding[] {
        return Object.keys(options).filter(k => k !== "payee_name").map(symbol => ({
            symbol,
            quantity: parseFloat(options[symbol])
        }))
    }
}

interface StockHolding {
    symbol: string
    quantity: number
}

interface StockValue {
    symbol: string
    value: number
    nativeCurrency: string
    nativeValue: number
    price: number
    nativePrice: number
}

interface TickerData {
    currency: string
    price: number
}

export class StockChecker {
    private readonly tickers: { [symbol: string]: TickerData } = {}

    private readonly rates: { [conversion: string]: number } = {}

    public async getTicker(symbol: string): Promise<TickerData> {
        if (this.tickers[symbol]) return this.tickers[symbol]
        const ticker = await getStockData([symbol])
        return this.tickers[symbol] = {
            currency: ticker[0].currency,
            price: ticker[0].regularMarketPrice.raw
        }
    }

    public async getRate(from: string, to: string): Promise<number> {
        if (from === to) return 1;

        const conversion = `${from}:${to}`
        if (this.rates[conversion]) return this.rates[conversion]
        const inverse = `${to}:${from}`
        const rate = await currencyConverter.from(from).to(to).convert()
        this.rates[inverse] = 1 / rate
        return this.rates[conversion] = rate
    }

    public async getStockValue(holding: StockHolding, targetCurrency: string): Promise<StockValue> {
        const ticker = await this.getTicker(holding.symbol)
        const rate = await this.getRate(ticker.currency, targetCurrency)
        const value = holding.quantity * ticker.price * rate
        return {
            symbol: holding.symbol,
            value,
            nativeCurrency: ticker.currency,
            nativeValue: holding.quantity * ticker.price,
            price: ticker.price * rate,
            nativePrice: ticker.price,
        }
    }

    public async getStockValues(holdings: StockHolding[], targetCurrency: string): Promise<StockValue[]> {
        return Promise.all(holdings.map(h => this.getStockValue(h, targetCurrency)))
    }
}