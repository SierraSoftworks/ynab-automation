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
    let opts = options;
    let results = {}

    while (opts) {
        const key = opts.substring(0, opts.indexOf('=')).trim()
        const valueBase = opts.substring(opts.indexOf('=') + 1).trim()

        if (valueBase[0] === '"') {
            const value = valueBase.substring(1, valueBase.indexOf('"', 1))
            results[key] = value

            if (!~valueBase.indexOf('"', 1)) {
                throw new Error(`Invalid options string: ${options}`)
            }

            opts = valueBase.substring(valueBase.indexOf('"', 1) + 1)
        } else {
            if (!~valueBase.indexOf(',')) {
                results[key] = valueBase
                break
            }
            
            const value = valueBase.substring(0, valueBase.indexOf(','))
            results[key] = value
            opts = valueBase.substring(valueBase.indexOf(',') + 1)
        }

        while (opts.startsWith(',')) {
            opts = opts.substring(1).trim()
        }
    }

    return results
}

export interface StockTrigger extends Trigger {
    kind: "stocks"
}

export function isStocksTrigger(trigger: Trigger): trigger is StockTrigger {
    return trigger.kind === "stocks"
}