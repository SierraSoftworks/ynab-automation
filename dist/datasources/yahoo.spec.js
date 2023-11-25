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
const assert = require("assert");
const yahoo_1 = require("./yahoo");
describe("yahoo markets", () => {
    const yahoo = new yahoo_1.Yahoo();
    describe("getCurrencyData", () => {
        it("should return currency data for a pair of currencies", () => __awaiter(void 0, void 0, void 0, function* () {
            const rate = yield yahoo.getCurrencyData("USD", "EUR");
            assert.notEqual(rate, 0, "it should return a current price (i.e non-zero)");
        }));
    });
    describe("getStockData", () => {
        it("should return data for a stock", () => __awaiter(void 0, void 0, void 0, function* () {
            const data = yield yahoo.getStockData("HCP");
            assert.equal(data.symbol, "HCP", "it should return the correct company symbol");
            assert.equal(data.currency, "USD", "it should return the correct data");
            assert.ok(data.price, "it should return a current price");
        }));
    });
});
//# sourceMappingURL=yahoo.spec.js.map