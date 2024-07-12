import { Automation } from "../automation"
import { StockDataSource, CurrencyDataSource } from "../datasources/datasource"

import { Account, API, BudgetDetail, TransactionClearedStatus } from "ynab"

export class StockAutomation extends Automation {
    constructor(api: API, stocks: StockDataSource, private readonly currencies: CurrencyDataSource) {
        super(api)

        this.stockChecker = new StockChecker(stocks, currencies)
    }

    private stockChecker: StockChecker

    public get kind() {
        return "stocks"
    }

    public async run(budget: BudgetDetail, account: Account, options: { [key: string]: string }): Promise<void> {
        const holdings = this.getStocks(options)

        const values = await this.stockChecker.getStockValues(holdings, budget.currency_format.iso_code)
        if (!values.length) return;

        const costBasis = await this.getCurrencyValue(options.cost_basis || "0", budget.currency_format.iso_code);
        const cgtRate = parseFloat(options.cgt_rate?.replace('%', '')?.trim() || "0") / 100;

        const net = StockAutomation.getNetValue(values, {
            costBasis,
            cgtRate
        }) * 1000;
        const shift = Math.floor(net - account.balance);

        // We only record transactions if they result in more than 1 unit of currency change (i.e. ignore changes in the cents range)
        if (Math.abs(shift) <= 1000) return;

        await this.api.transactions.createTransaction(budget.id, {
            transaction: {
                account_id: account.id,
                date: new Date().toISOString().split('T')[0],
                amount: shift,
                payee_name: options.payee_name || "Stock Market",
                cleared: TransactionClearedStatus.Cleared,
                approved: true,
                memo: values.map(v => `${v.symbol}: ${v.nativeCurrency} ${v.nativeValue.toFixed(2)} @ ${v.nativeCurrency} ${v.nativePrice}`).join(', ')
            }
        })
    }

    public static getNetValue(stockValues: StockValue[], options: { cgtRate?: number; costBasis?: number }): number {
        const gross = stockValues.reduce((sum, stock) => sum + stock.value, 0);
        const cgt = Math.max((gross - options.costBasis || 0) * options.cgtRate || 0, 0);
        return gross - cgt;
    }

    protected getStocks(options: { [key: string]: string }): StockHolding[] {
        return Object.keys(options).filter(k => k !== "payee_name" && k !== "cost_basis" && k !== "cgt_rate").map(symbol => ({
            symbol,
            quantity: parseFloat(options[symbol]),
        }))
    }

    protected async getCurrencyValue(value: string, targetCurrency: string): Promise<number> {
        const [_, currencySpec, amountSpec] = value.match(/^([A-Z]*)(\d+(?:\.\d+)?)$/)
        const amount = parseFloat(amountSpec)

        if (!currencySpec) return amount

        const currencyRate = await this.currencies.getCurrencyData(currencySpec, targetCurrency)
        return amount * currencyRate
    }
}

interface StockHolding {
    symbol: string
    quantity: number
    costBasis?: number
}

interface StockValue {
    // The stock symbol
    symbol: string

    // The value of the shares held in the target currency
    value: number

    // The currency that the stock is valued in
    nativeCurrency: string

    // The value of the shares held in the native currency
    nativeValue: number

    // The price of the stock in the target currency
    price: number

    // The price of the stock in its native currency
    nativePrice: number
}

interface TickerData {
    currency: string
    price: number
}

export class StockChecker {
    constructor(protected stocks: StockDataSource, protected currencies: CurrencyDataSource) { }

    private readonly tickers: { [symbol: string]: TickerData } = {}

    private readonly rates: { [conversion: string]: number } = {}

    public async getTicker(symbol: string): Promise<TickerData> {
        if (this.tickers[symbol]) return this.tickers[symbol]
        const ticker = await this.stocks.getStockData(symbol)
        return this.tickers[symbol] = {
            currency: ticker.currency,
            price: ticker.price
        }
    }

    public async getRate(from: string, to: string): Promise<number> {
        if (from === to) return 1;

        const conversion = `${from}:${to}`
        if (this.rates[conversion]) return this.rates[conversion]
        const inverse = `${to}:${from}`
        const rate = await this.currencies.getCurrencyData(from, to)
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