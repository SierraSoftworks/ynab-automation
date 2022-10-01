export function isStocksEnabled(note: string): boolean {
    return !!(note || "").split('\n').find(line => line.startsWith('/automate:stocks'))
}

export function parseStocksNote(note: string): {
    symbol: string
    quantity: number
}[] {
    return (note || "").split('\n').map(l => l.trim()).filter(l => !!l && !l.startsWith('#') && !l.startsWith('/')).map(l => l.split(':', 2)).map(v => ({
        symbol: v[0],
        quantity: parseFloat(v[1])
    }))
}