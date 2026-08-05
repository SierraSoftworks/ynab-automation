import * as assert from "assert"
import {RateLimitError} from "../utils/http"
import {Yahoo} from "./yahoo"

describe("yahoo markets", () => {
    const yahoo = new Yahoo()
    yahoo.disableCache()

    // Yahoo Finance aggressively rate limits unauthenticated clients, so we skip these
    // tests (rather than failing them) when we receive a 429 Too Many Requests response.
    async function skipIfRateLimited(test: Mocha.Context, action: () => Promise<void>): Promise<void> {
        try {
            await action()
        } catch (err) {
            if (err instanceof RateLimitError) {
                console.warn(`Skipping test as Yahoo Finance rate limited us: ${err.message}`)
                test.skip()
            }

            throw err
        }
    }

    describe("getCurrencyData", () => {
        it("should return currency data for a pair of currencies", async function () {
            await skipIfRateLimited(this, async () => {
                const rate = await yahoo.getCurrencyData("USD", "EUR")

                assert.notEqual(rate, 0, "it should return a current price (i.e non-zero)")
            })
        })
    })

    describe("getStockData", () => {
        it("should return data for a stock", async function () {
            await skipIfRateLimited(this, async () => {
                const data = await yahoo.getStockData("MSFT")
                assert.equal(data.symbol, "MSFT", "it should return the correct company symbol")
                assert.equal(data.currency, "USD", "it should return the correct data")
                assert.ok(data.price, "it should return a current price")
            })
        })
    })
})
