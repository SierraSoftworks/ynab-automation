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
exports.Tiingo = void 0;
const http_1 = require("../utils/http");
const datasource_1 = require("./datasource");
class Tiingo extends datasource_1.DataSource {
    constructor(apiKey = process.env.TIINGO_API_KEY) {
        super("tiingo");
        this.apiKey = apiKey;
    }
    getStockData(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            const url = (0, http_1.buildUrl)(stockUrl, { SYMBOL: symbol.toLowerCase(), TIINGO_API_KEY: this.apiKey });
            const response = yield this.cached(`stock-${symbol}`, "day", () => (0, http_1.fetchSafe)(url));
            return {
                symbol: symbol.toUpperCase(),
                currency: "USD",
                price: response[0].close
            };
        });
    }
    getCurrencyData(from, to) {
        return __awaiter(this, void 0, void 0, function* () {
            if (from.toLowerCase() === "usd") {
                return 1 / (yield this.getCurrencyData(to, from));
            }
            const url = (0, http_1.buildUrl)(forexUrl, { SYMBOL: `${from.toLowerCase()}${to.toLowerCase()}`, TIINGO_API_KEY: this.apiKey });
            const response = yield this.cached(`currency-${from}-${to}`, "day", () => (0, http_1.fetchSafe)(url));
            return response[0].midPrice;
        });
    }
}
exports.Tiingo = Tiingo;
const forexUrl = "https://api.tiingo.com/tiingo/fx/{SYMBOL}/top?token={TIINGO_API_KEY}";
const stockUrl = "https://api.tiingo.com/tiingo/daily/{SYMBOL}/prices?token={TIINGO_API_KEY}";
//# sourceMappingURL=tiingo.js.map