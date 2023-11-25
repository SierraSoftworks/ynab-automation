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
const stocks_1 = require("./stocks");
describe("stocks", () => {
    class MockDataSource {
        getStockData(symbol) {
            return __awaiter(this, void 0, void 0, function* () {
                return {
                    symbol,
                    currency: "USD",
                    price: 100
                };
            });
        }
        getCurrencyData(from, to) {
            return __awaiter(this, void 0, void 0, function* () {
                if (from === to)
                    return 1;
                return 0.5;
            });
        }
    }
    const stockChecker = new stocks_1.StockChecker(new MockDataSource(), new MockDataSource());
    describe.skip("fetching ticker data", () => {
        it("should fetch ticker data", () => __awaiter(void 0, void 0, void 0, function* () {
            const actual = yield stockChecker.getTicker("AAPL");
            assert.ok(actual.price === 100);
        }));
        it("should cache ticker data", () => __awaiter(void 0, void 0, void 0, function* () {
            const actual = yield stockChecker.getTicker("AAPL");
            assert.ok(actual.price === 100);
        }));
    });
    describe.skip("fetching currency rates", () => {
        it("should always return 1 when converting identical currencies", () => __awaiter(void 0, void 0, void 0, function* () {
            const actual = yield stockChecker.getRate("USD", "USD");
            assert.strictEqual(actual, 1);
        }));
        it("should fetch currency rates", () => __awaiter(void 0, void 0, void 0, function* () {
            const actual = yield stockChecker.getRate("USD", "GBP");
            assert.ok(actual === 0.5);
        }));
        it("should cache currency rates", () => __awaiter(void 0, void 0, void 0, function* () {
            const actual = yield stockChecker.getRate("USD", "GBP");
            assert.ok(actual === 0.5);
        }));
        it("should cache the inverse rates", () => __awaiter(void 0, void 0, void 0, function* () {
            const actual = yield stockChecker.getRate("GBP", "USD");
            assert.ok(actual === 2);
        }));
    });
    describe.skip("getting stock holding data", () => {
        it("should get stock holding data", () => __awaiter(void 0, void 0, void 0, function* () {
            const actual = yield stockChecker.getStockValue({ symbol: "AAPL", quantity: 10 }, "GBP");
            assert.ok(actual.value > 0);
        }));
        it("should get stock holding data for multiple stocks", () => __awaiter(void 0, void 0, void 0, function* () {
            const actual = yield stockChecker.getStockValues([{ symbol: "AAPL", quantity: 10 }, { symbol: "GOOG", quantity: 20 }], "GBP");
            assert.ok(actual[0].value > 0);
            assert.ok(actual[1].value > 0);
        }));
    });
});
//# sourceMappingURL=stocks.spec.js.map