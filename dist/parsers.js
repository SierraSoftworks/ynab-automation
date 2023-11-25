"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isStocksTrigger = exports.parse = void 0;
/**
 * Extracts a list of triggers from a note. Triggers are lines within the
 * note which start with `/automate:${kind}` and may contain a list of comma
 * separated options in the form of `key=value`.
 * @param note The note containing instructions which should be parsed.
 * @returns A list of triggers which were discovered in the note.
 */
function parse(note) {
    return (note || "").split('\n').map(l => l.trim()).filter(l => !!l && l.startsWith('/automate:')).map(l => l.substring('/automate:'.length)).map(v => ({
        kind: !!~v.indexOf(' ') && v.substring(0, v.indexOf(' ')) || v,
        options: parseOptions(!!~v.indexOf(' ') && v.substring(v.indexOf(' ') + 1) || '')
    }));
}
exports.parse = parse;
function parseOptions(options) {
    let opts = options;
    let results = {};
    const optionSeparators = [',', ' '];
    while (opts) {
        const key = opts.substring(0, opts.indexOf('=')).trim();
        const valueBase = opts.substring(opts.indexOf('=') + 1).trim();
        if (valueBase[0] === '"') {
            const value = valueBase.substring(1, valueBase.indexOf('"', 1));
            results[key] = value;
            if (!~valueBase.indexOf('"', 1)) {
                throw new Error(`Invalid options string: ${options}`);
            }
            opts = valueBase.substring(valueBase.indexOf('"', 1) + 1);
        }
        else {
            let hadSeparator = false;
            for (const separator of optionSeparators) {
                if (!~valueBase.indexOf(separator))
                    continue;
                const value = valueBase.substring(0, valueBase.indexOf(separator));
                results[key] = value;
                opts = valueBase.substring(valueBase.indexOf(separator) + 1);
                hadSeparator = true;
                break;
            }
            if (!hadSeparator) {
                results[key] = valueBase;
                break;
            }
        }
        while (opts.startsWith(' ')) {
            opts = opts.substring(1).trim();
        }
    }
    return results;
}
function isStocksTrigger(trigger) {
    return trigger.kind === "stocks";
}
exports.isStocksTrigger = isStocksTrigger;
//# sourceMappingURL=parsers.js.map