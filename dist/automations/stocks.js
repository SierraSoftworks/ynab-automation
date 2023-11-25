"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockChecker = exports.StockAutomation = void 0;
const automation_1 = require("../automation");
const ynab_1 = require("ynab");
class StockAutomation extends automation_1.Automation {
    constructor(api, stocks, currencies) {
        super(api);
        this.stockChecker = new StockChecker(stocks, currencies);
    }
    get kind() {
        return "stocks";
    }
    run(budget, account, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const holdings = this.getStocks(options);
            const values = yield this.stockChecker.getStockValues(holdings, budget.currency_format.iso_code);
            if (!values.length)
                return;
            const shift = Math.floor(values.reduce((sum, stock) => sum + stock.value, 0) * 1000) - account.balance;
            // We only record transactions if they result in more than 1 unit of currency change (i.e. ignore changes in the cents range)
            if (Math.abs(shift) <= 1000)
                return;
            yield this.api.transactions.createTransaction(budget.id, {
                transaction: {
                    account_id: account.id,
                    date: new Date().toISOString().split('T')[0],
                    amount: shift,
                    payee_name: options.payee_name || "Stock Market",
                    cleared: ynab_1.TransactionClearedStatus.Cleared,
                    approved: true,
                    memo: values.map(v => `${v.symbol}: ${v.nativeCurrency} ${v.nativeValue.toFixed(2)} @ ${v.nativeCurrency} ${v.nativePrice}`).join(', ')
                }
            });
        });
    }
    getStocks(options) {
        return Object.keys(options).filter(k => k !== "payee_name").map(symbol => ({
            symbol,
            quantity: parseFloat(options[symbol])
        }));
    }
}
exports.StockAutomation = StockAutomation;
class StockChecker {
    constructor(stocks, currencies) {
        this.stocks = stocks;
        this.currencies = currencies;
        this.tickers = {};
        this.rates = {};
    }
    getTicker(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.tickers[symbol])
                return this.tickers[symbol];
            const ticker = yield this.stocks.getStockData(symbol);
            return this.tickers[symbol] = {
                currency: ticker.currency,
                price: ticker.price
            };
        });
    }
    getRate(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            if (from === to)
                return 1;
            const conversion = `${from}:${to}`;
            if (this.rates[conversion])
                return this.rates[conversion];
            const inverse = `${to}:${from}`;
            const rate = yield this.currencies.getCurrencyData(from, to);
            this.rates[inverse] = 1 / rate;
            return this.rates[conversion] = rate;
        });
    }
    getStockValue(holding, targetCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticker = yield this.getTicker(holding.symbol);
            const rate = yield this.getRate(ticker.currency, targetCurrency);
            const value = holding.quantity * ticker.price * rate;
            return {
                symbol: holding.symbol,
                value,
                nativeCurrency: ticker.currency,
                nativeValue: holding.quantity * ticker.price,
                price: ticker.price * rate,
                nativePrice: ticker.price,
            };
        });
    }
    getStockValues(holdings, targetCurrency) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(holdings.map(h => this.getStockValue(h, targetCurrency)));
        });
    }
}
exports.StockChecker = StockChecker;
//# sourceMappingURL=stocks.js.map