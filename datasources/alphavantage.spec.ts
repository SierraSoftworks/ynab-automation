import * as assert from "assert"
import {AlphaVantage} from "./alphavantage"

describe.skip("AlphaVantage Stock API", () => {
    const alphaVantage = new AlphaVantage(process.env.ALPHAVANTAGE_API_KEY)
    alphaVantage.disableCache()

    describe("getCurrencyData", () => {
        it("should return currency data for a pair of currencies", async () => {
            const rate = await alphaVantage.getCurrencyData("USD", "EUR")

            assert.notEqual(rate, 0, "it should return a current price (i.e non-zero)")
        })
    })

    describe("getStockData", () => {
        it("should return data for a stock", async () => {
            const data = await alphaVantage.getStockData("HCP")
            assert.equal(data.symbol, "HCP", "it should return the correct company symbol")
            assert.equal(data.currency, "USD", "it should return the correct data")
            assert.ok(data.price, "it should return a current price")
        })
    })
})