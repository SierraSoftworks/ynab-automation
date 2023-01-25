import * as assert from "assert";
import { describe, it } from "node:test";
import { StockChecker } from "./stocks";

describe("stocks", () => {
    const stockChecker = new StockChecker();

    describe("fetching ticker data", () => {
        it("should fetch ticker data", async () => {
            const actual = await stockChecker.getTicker("AAPL");
            assert.ok(actual.price > 0);
        });

        it("should cache ticker data", async () => {
            const actual = await stockChecker.getTicker("AAPL");
            assert.ok(actual.price > 0);
        });
    });

    describe("fetching currency rates", () => {
        it("should always return 1 when converting identical currencies", async () => {
            const actual = await stockChecker.getRate("USD", "USD");
            assert.strictEqual(actual, 1);
        })

        it("should fetch currency rates", async () => {
            const actual = await stockChecker.getRate("USD", "GBP");
            assert.ok(actual > 0);
        });

        it("should cache currency rates", async () => {
            const actual = await stockChecker.getRate("USD", "GBP");
            assert.ok(actual > 0);
        });

        it("should cache the inverse rates", async () => {
            const actual = await stockChecker.getRate("GBP", "USD");
            assert.ok(actual > 0);
        })
    });

    describe("getting stock holding data", () => {
        it("should get stock holding data", async () => {
            const actual = await stockChecker.getStockValue({symbol: "AAPL", quantity: 10}, "GBP");
            assert.ok(actual.value > 0);
        });

        it("should get stock holding data for multiple stocks", async () => {
            const actual = await stockChecker.getStockValues([{symbol: "AAPL", quantity: 10}, {symbol: "GOOG", quantity: 20}], "GBP");
            assert.ok(actual[0].value > 0);
            assert.ok(actual[1].value > 0);
        });
    });
})