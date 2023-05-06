import * as assert from "assert"
import {getCurrencyData, getStockData} from "./yahoo"

describe("yahoo markets", () => {
    describe("getCurrencyData", () => {
        it("should return currency data for a pair of currencies", async () => {
            const data = await getCurrencyData("USD", "EUR")

            assert.equal(data.currency, "EUR")
            assert.ok(data.regularMarketPrice?.raw, "it should return a current price")
        })
    })

    describe("getStockData", () => {
        it("should return data for a stock", async () => {
            const data = await getStockData("HCP")
            assert.equal(data.currency, "USD", "it should return the correct data")
            assert.ok(data.regularMarketPrice?.raw, "it should return a current price")
        })
    })
})