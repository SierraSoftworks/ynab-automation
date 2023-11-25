"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const parsers_1 = require("./parsers");
describe("parsers", () => {
    describe("parse", () => {
        it("should return an empty list of triggers if no note is provided", () => {
            const actual = (0, parsers_1.parse)(null);
            assert.deepStrictEqual(actual, []);
        });
        it("should return an empty list of triggers if the note is empty", () => {
            const actual = (0, parsers_1.parse)("");
            assert.deepStrictEqual(actual, []);
        });
        it("should return a trigger if no options are provided", () => {
            const actual = (0, parsers_1.parse)("/automate:xyz");
            assert.deepStrictEqual(actual, [{ kind: "xyz", options: {} }]);
        });
        it("should return a trigger if options are provided", () => {
            const actual = (0, parsers_1.parse)("/automate:xyz foo=bar");
            assert.deepStrictEqual(actual, [{ kind: "xyz", options: { foo: "bar" } }]);
        });
        it("should return a trigger if multiple options are provided", () => {
            const actual = (0, parsers_1.parse)("/automate:xyz foo=bar,bar=baz");
            assert.deepStrictEqual(actual, [{ kind: "xyz", options: { foo: "bar", bar: "baz" } }]);
        });
        it("should return multiple triggers if multiple triggers are provided", () => {
            const actual = (0, parsers_1.parse)("/automate:xyz foo=bar\n/automate:abc bar=baz");
            assert.deepStrictEqual(actual, [{ kind: "xyz", options: { foo: "bar" } }, { kind: "abc", options: { bar: "baz" } }]);
        });
        it("should parse the stock trigger format", () => {
            const actual = (0, parsers_1.parse)("/automate:stocks AAPL=10, MSFT=20");
            assert.deepStrictEqual(actual, [{ kind: "stocks", options: { AAPL: "10", MSFT: "20" } }]);
            assert((0, parsers_1.isStocksTrigger)(actual[0]));
        });
        it("should parse quoted options", () => {
            const actual = (0, parsers_1.parse)("/automate:xyz foo=\"bar,baz\"");
            assert.deepStrictEqual(actual, [{ kind: "xyz", options: { foo: "bar,baz" } }]);
        });
        it("should parse a complex real world example", () => {
            const actual = (0, parsers_1.parse)(`/automate:xyz source="foo" dest=bar guid=00000000-0000-0000-0000-000000000000 category="Fox: Hound" sum=10.0`);
            assert.deepStrictEqual(actual, [{ kind: "xyz", options: { source: "foo", dest: "bar", guid: "00000000-0000-0000-0000-000000000000", category: "Fox: Hound", sum: "10.0" } }]);
        });
    });
});
//# sourceMappingURL=parsers.spec.js.map