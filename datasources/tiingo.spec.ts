import * as assert from "assert"
import {Tiingo} from "./tiingo"

describe.skip("Tiingo Stock API", () => {
    const tiingo = new Tiingo(process.env.TIINGO_API_KEY)

    describe("getCurrencyData", () => {
        it("should return currency data for a pair of currencies", async () => {
            const rate = await tiingo.getCurrencyData("USD", "EUR")

            assert.notEqual(rate, 0, "it should return a current price (i.e non-zero)")
        })
    })

    describe("getStockData", () => {
        it("should return data for a stock", async () => {
            const data = await tiingo.getStockData("HCP")
            assert.equal(data.symbol, "HCP", "it should return the correct company symbol")
            assert.equal(data.currency, "USD", "it should return the correct data")
            assert.ok(data.price, "it should return a current price")
        })
    })
})