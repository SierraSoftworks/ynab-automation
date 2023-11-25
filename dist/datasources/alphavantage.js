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
exports.AlphaVantage = void 0;
const http_1 = require("../utils/http");
const datasource_1 = require("./datasource");
class AlphaVantage extends datasource_1.DataSource {
    constructor(apiKey = process.env.ALPHAVANTAGE_API_KEY) {
        super("alphavantage");
        this.apiKey = apiKey;
    }
    getCompanyData(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.cached(`company-${symbol}`, "year", () => (0, http_1.fetchSafe)((0, http_1.buildUrl)(companyUrl, { SYMBOL: symbol.toUpperCase(), ALPHAVANTAGE_API_KEY: this.apiKey })));
        });
    }
    getStockData(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            /*
                The API returns an object with the following structure:
                {
                    "Global Quote": {
                        "01. symbol": "IBM",
                        "02. open": "133.2600",
                        "03. high": "134.6100",
                        "04. low": "133.1000",
                        "05. price": "134.2400",
                        "06. volume": "3168419",
                        "07. latest trading day": "2023-07-17",
                        "08. previous close": "133.4000",
                        "09. change": "0.8400",
                        "10. change percent": "0.6297%"
                    }
                }
            */
            const companyInfo = yield this.getCompanyData(symbol.toUpperCase());
            const response = yield this.cached(`stock-${symbol}`, "day", () => (0, http_1.fetchSafe)((0, http_1.buildUrl)(stockUrl, { SYMBOL: symbol.toUpperCase(), ALPHAVANTAGE_API_KEY: this.apiKey })));
            return {
                symbol: companyInfo.Symbol,
                currency: companyInfo.Currency,
                price: parseFloat(response["Global Quote"]["05. price"])
            };
        });
    }
    getCurrencyData(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            from = from.toUpperCase();
            to = to.toUpperCase();
            /*
                The API returns an object with the following structure:
    
                {
                    "Realtime Currency Exchange Rate": {
                        "1. From_Currency Code": "USD",
                        "2. From_Currency Name": "United States Dollar",
                        "3. To_Currency Code": "JPY",
                        "4. To_Currency Name": "Japanese Yen",
                        "5. Exchange Rate": "138.99100000",
                        "6. Last Refreshed": "2023-07-18 19:39:02",
                        "7. Time Zone": "UTC",
                        "8. Bid Price": "138.98920000",
                        "9. Ask Price": "138.99750000"
                    }
                }
            */
            const response = yield this.cached(`currency-${from}-${to}`, "day", () => (0, http_1.fetchSafe)((0, http_1.buildUrl)(currencyUrl, { FROM_SYMBOL: from.toUpperCase(), TO_SYMBOL: to.toUpperCase(), ALPHAVANTAGE_API_KEY: this.apiKey })));
            return parseFloat(response["Realtime Currency Exchange Rate"]["5. Exchange Rate"]);
        });
    }
}
exports.AlphaVantage = AlphaVantage;
const companyUrl = "https://www.alphavantage.co/query?function=OVERVIEW&symbol={SYMBOL}&apikey={ALPHAVANTAGE_API_KEY}";
const stockUrl = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={SYMBOL}&apikey={ALPHAVANTAGE_API_KEY}";
const currencyUrl = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency={FROM_SYMBOL}&to_currency={TO_SYMBOL}&apikey={ALPHAVANTAGE_API_KEY}";
//# sourceMappingURL=alphavantage.js.map