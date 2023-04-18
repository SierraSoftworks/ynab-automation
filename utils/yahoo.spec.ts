import * as assert from "assert"
import {getCurrencyData, getStockData} from "./yahoo"

describe("yahoo markets", () => {
    describe("getCurrencyData", () => {
        it("should return currency data for a pair of currencies", async () => {
            const data = await getCurrencyData("EUR", "USD")
            assert.equal(data.length, 1, "it should return a single entry")

            assert.equal(data[0].symbol, "EURUSD=X")
        })
    })

    describe("getStockData", () => {
        it("should return data for a series of stocks", async () => {
            const data = await getStockData(["AAPL", "HCP"])
            assert.equal(data.length, 2, "it should return two entries")

            assert.equal(data[0].symbol, "AAPL", "results should be returned in the correct order")
        })
    })
})