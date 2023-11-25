import * as assert from "assert";
import { StockChecker } from "./stocks";
import { CurrencyDataSource, StockDataSource } from "../datasources/datasource";

describe("stocks", () => {
    class MockDataSource implements StockDataSource, CurrencyDataSource {
        async getStockData(symbol: string): Promise<{
            symbol: string;
            currency: string;
            price: number;
        }> {
            return {
                symbol,
                currency: "USD",
                price: 100
            }
        }

        async getCurrencyData(from: string, to: string): Promise<number> {
            if (from === to) return 1
            return 0.5
        }
    }

    const stockChecker = new StockChecker(new MockDataSource(), new MockDataSource());

    describe.skip("fetching ticker data", () => {
        it("should fetch ticker data", async () => {
            const actual = await stockChecker.getTicker("AAPL");
            assert.ok(actual.price === 100);
        });

        it("should cache ticker data", async () => {
            const actual = await stockChecker.getTicker("AAPL");
            assert.ok(actual.price === 100);
        });
    });

    describe.skip("fetching currency rates", () => {
        it("should always return 1 when converting identical currencies", async () => {
            const actual = await stockChecker.getRate("USD", "USD");
            assert.strictEqual(actual, 1);
        })

        it("should fetch currency rates", async () => {
            const actual = await stockChecker.getRate("USD", "GBP");
            assert.ok(actual === 0.5);
        });

        it("should cache currency rates", async () => {
            const actual = await stockChecker.getRate("USD", "GBP");
            assert.ok(actual === 0.5);
        });

        it("should cache the inverse rates", async () => {
            const actual = await stockChecker.getRate("GBP", "USD");
            assert.ok(actual === 2);
        })
    });

    describe.skip("getting stock holding data", () => {
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