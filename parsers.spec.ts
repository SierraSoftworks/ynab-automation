import { describe, it } from "node:test";
import * as assert from "assert";

import {parseStocksNote} from "./parsers"

describe("parsers", () => {
    it("should parse an empty list of stock tickers", () => {
        const actual = parseStocksNote("");
        const expected = [];
        assert.deepStrictEqual(actual, expected);
    })

    it("should parse a valid stock ticker", () => {
        assert.deepEqual(parseStocksNote(`AAPL: 10`), [{symbol: "AAPL", quantity: 10}])
    })

    it("should parse a valid list of stock tickers", () => {
        assert.deepEqual(parseStocksNote(`AAPL: 10
GOOG: 20
MSFT: 30`), [{symbol: "AAPL", quantity: 10}, {symbol: "GOOG", quantity: 20}, {symbol: "MSFT", quantity: 30}])
    })

    it("should ignore lines starting with #", () => {
        assert.deepEqual(parseStocksNote(`# AAPL: 10
GOOG: 20
# MSFT: 30`), [{symbol: "GOOG", quantity: 20}])
    })
})