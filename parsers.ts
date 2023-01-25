export interface Trigger {
    kind: string
    options: {
        [key: string]: string
    }
}

/**
 * Extracts a list of triggers from a note. Triggers are lines within the
 * note which start with `/automate:${kind}` and may contain a list of comma
 * separated options in the form of `key=value`.
 * @param note The note containing instructions which should be parsed.
 * @returns A list of triggers which were discovered in the note.
 */
export function parse(note: string): Trigger[] {
    return (note || "").split('\n').map(l => l.trim()).filter(l => !!l && l.startsWith('/automate:')).map(l => l.substring('/automate:'.length)).map(v => ({
        kind: !!~v.indexOf(' ') && v.substring(0, v.indexOf(' ')) || v,
        options: parseOptions(!!~v.indexOf(' ') && v.substring(v.indexOf(' ') + 1) || '')
    }))
}

function parseOptions(options: string): { [key: string]: string } {
    return (options || "").split(',').map(o => o.trim()).filter(o => !!o).map(o => o.split('=', 2)).map(o => ({
        [o[0]]: o[1]
    })).reduce((a, b) => ({ ...a, ...b }), {})
}

export interface StockTrigger extends Trigger {
    kind: "stocks"
}

export function isStocksTrigger(trigger: Trigger): trigger is StockTrigger {
    return trigger.kind === "stocks"
}