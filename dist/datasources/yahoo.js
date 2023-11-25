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
exports.Yahoo = void 0;
const http_1 = require("../utils/http");
const datasource_1 = require("./datasource");
class Yahoo extends datasource_1.DataSource {
    constructor() {
        super("yahoo");
        this.headers = {
            "Accept": "application/json, text/javascript, text/plain, */*; q=0.01",
            "User-Agent": 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
        };
    }
    getStockData(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.cached(`stock-${symbol}`, "hour", () => this.getStockDataInternal(symbol));
            return {
                symbol: result.symbol,
                currency: result.currency,
                price: result.regularMarketPrice.raw
            };
        });
    }
    getCurrencyData(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            from = from.toUpperCase();
            to = to.toUpperCase();
            const result = yield this.cached(`currency-${from}-${to}`, "hour", () => this.getCurrencyDataInternal(from, to));
            return result.regularMarketPrice.raw;
        });
    }
    getStockDataInternal(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureSessionCrumb();
            const url = (0, http_1.buildUrl)(stockUrl, { SYMBOL: symbol, crumb: this.crumb });
            const response = yield (0, http_1.fetchSafe)(url, {
                headers: Object.assign({}, this.headers, {
                    "Cookie": this.cookie
                })
            });
            return response.quoteSummary.result[0].price;
        });
    }
    getCurrencyDataInternal(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ensureSessionCrumb();
            const url = (0, http_1.buildUrl)(currencyUrl, { FROM_SYMBOL: from, TO_SYMBOL: to, crumb: this.crumb });
            const response = yield (0, http_1.fetchSafe)(url, {
                headers: Object.assign({}, this.headers, {
                    "Cookie": this.cookie
                })
            });
            return response.quoteSummary.result[0].price;
        });
    }
    ensureSessionCrumb() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.crumb)
                return;
            this.cookie = yield this.getSessionCookie();
            this.crumb = yield this.getSessionCrumb(this.cookie);
        });
    }
    getSessionCookie() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch("https://fc.yahoo.com", {
                headers: this.headers,
                redirect: "follow"
            });
            return response.headers.get("set-cookie").split(";")[0] || "";
        });
    }
    getSessionCrumb(sessionCookie) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch("https://query2.finance.yahoo.com/v1/test/getcrumb", {
                headers: Object.assign({}, this.headers, {
                    "Cookie": sessionCookie
                }),
                redirect: "follow"
            });
            const crumb = response.text();
            if ((yield crumb).includes("<html>"))
                return null;
            return crumb;
        });
    }
}
exports.Yahoo = Yahoo;
const stockUrl = "https://query1.finance.yahoo.com/v10/finance/quoteSummary/{SYMBOL}?modules=price&crumb={crumb}";
const currencyUrl = "https://query1.finance.yahoo.com/v10/finance/quoteSummary/{FROM_SYMBOL}{TO_SYMBOL}=X?modules=price&crumb={crumb}";
//# sourceMappingURL=yahoo.js.map