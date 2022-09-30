import * as assert from "assert";
import { describe, it } from "node:test";
import { getStockInformation } from "./stocks";

describe("stocks", () => {
    describe("with stocks in the same target currency", () => {
        it("should return the correct value", async () => {
            const values = await getStockInformation([
                {symbol: "AAPL", quantity: 1},
                {symbol: "AAPL", quantity: 10},
            ], "USD");

            assert.equal(values.length, 2);
            assert.equal(values[0].symbol, "AAPL");
            assert.equal(values[1].symbol, "AAPL");

            assert.equal(10 * values[0].value, values[1].value);
            assert.notEqual(values[0].value, 0);

            assert.equal(values[0].nativeValue, `USD ${values[0].value.toFixed(2)}`);
        })
    })
})