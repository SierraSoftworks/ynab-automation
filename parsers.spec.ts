import { describe, it } from "node:test";
import * as assert from "assert";

import { isStocksEnabled, parseStocksNote } from "./parsers"

describe("parsers", () => {
    describe("isStocksEnabled", () => {
        it("should return true when the note contains the /automate:stocks instruction", () => {
            const actual = isStocksEnabled("/automate:stocks\nAAPL:10\nGOOG:20");
            assert.strictEqual(actual, true);
        })

        it("should return false when the note does not contain the /automate:stocks instruction", () => {
            const actual = isStocksEnabled("AAPL:10\nGOOG:20");
            assert.strictEqual(actual, false);
        })

        it("should return false when the note is empty", () => {
            const actual = isStocksEnabled("");
            assert.strictEqual(actual, false);
        })

        it("should return false when the note is null", () => {
            const actual = isStocksEnabled(null);
            assert.strictEqual(actual, false);
        })
    })

    describe("parseStocksNote", () => {
        it("should parse a null field", () => {
            const actual = parseStocksNote(null);
            assert.deepStrictEqual(actual, []);
        })

        it("should parse an empty list of stock tickers", () => {
            const actual = parseStocksNote("");
            const expected = [];
            assert.deepStrictEqual(actual, expected);
        })

        it("should parse a valid stock ticker", () => {
            assert.deepEqual(parseStocksNote(`AAPL: 10`), [{ symbol: "AAPL", quantity: 10 }])
        })

        it("should parse a valid list of stock tickers", () => {
            assert.deepEqual(parseStocksNote(`AAPL: 10
GOOG: 20
MSFT: 30`), [{ symbol: "AAPL", quantity: 10 }, { symbol: "GOOG", quantity: 20 }, { symbol: "MSFT", quantity: 30 }])
        })

        it("should ignore lines starting with #", () => {
            assert.deepEqual(parseStocksNote(`# AAPL: 10
GOOG: 20
# MSFT: 30`), [{ symbol: "GOOG", quantity: 20 }])
        })
    })
})