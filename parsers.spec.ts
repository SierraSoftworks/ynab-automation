import { describe, it } from "node:test";
import * as assert from "assert";

import { isStocksTrigger, parse } from "./parsers"

describe("parsers", () => {
    describe("parse", () => {
        it("should return an empty list of triggers if no note is provided", () => {
            const actual = parse(null);
            assert.deepStrictEqual(actual, []);
        })

        it("should return an empty list of triggers if the note is empty", () => {
            const actual = parse("");
            assert.deepStrictEqual(actual, []);
        })

        it("should return a trigger if no options are provided", () => {
            const actual = parse("/automate:xyz");
            assert.deepStrictEqual(actual, [{ kind: "xyz", options: {} }]);
        })

        it("should return a trigger if options are provided", () => {
            const actual = parse("/automate:xyz foo=bar");
            assert.deepStrictEqual(actual, [{ kind: "xyz", options: { foo: "bar" } }]);
        })

        it("should return a trigger if multiple options are provided", () => {
            const actual = parse("/automate:xyz foo=bar,bar=baz");
            assert.deepStrictEqual(actual, [{ kind: "xyz", options: { foo: "bar", bar: "baz" } }]);
        })

        it("should return multiple triggers if multiple triggers are provided", () => {
            const actual = parse("/automate:xyz foo=bar\n/automate:abc bar=baz");
            assert.deepStrictEqual(actual, [{ kind: "xyz", options: { foo: "bar" } }, { kind: "abc", options: { bar: "baz" } }]);
        })

        it("should parse the stock trigger format", () => {
            const actual = parse("/automate:stocks AAPL=10, MSFT=20");
            assert.deepStrictEqual(actual, [{ kind: "stocks", options: { AAPL: "10", MSFT: "20" } }]);

            assert(isStocksTrigger(actual[0]));
        })
    })
})