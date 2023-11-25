import * as assert from "assert"
import {Yahoo} from "./yahoo"

describe("yahoo markets", () => {
    const yahoo = new Yahoo()
    yahoo.disableCache()

    describe("getCurrencyData", () => {
        it("should return currency data for a pair of currencies", async () => {
            const rate = await yahoo.getCurrencyData("USD", "EUR")

            assert.notEqual(rate, 0, "it should return a current price (i.e non-zero)")
        })
    })

    describe("getStockData", () => {
        it("should return data for a stock", async () => {
            const data = await yahoo.getStockData("HCP")
            assert.equal(data.symbol, "HCP", "it should return the correct company symbol")
            assert.equal(data.currency, "USD", "it should return the correct data")
            assert.ok(data.price, "it should return a current price")
        })
    })
})