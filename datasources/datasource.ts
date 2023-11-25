import { createHash } from "node:crypto"
import * as fs from "node:fs"
import * as path from "node:path"

type CacheExpiryTime = "hour" | "day" | "month" | "year" | "never"

export class DataSource {
    constructor(protected id: string) {
        this.cacheDirectory = path.join(process.cwd(), ".ynab-cache", id)
    }

    private cacheDirectory: string
    private cacheEnabled = true

    disableCache() {
        this.cacheEnabled = false
    }

    protected async cached<T>(key: string, expiry: CacheExpiryTime, hydrate: () => Promise<T>): Promise<T> {
        if (!this.cacheEnabled)
        {
            return await hydrate()
        }

        await fs.promises.mkdir(this.cacheDirectory, { recursive: true })
        const cachePath = this.getCachePath(key, expiry)

        return await fs.promises.readFile(cachePath, { encoding: "utf-8" })
            .then(data => JSON.parse(data))
            .catch(() => hydrate().then(async data => {
                await fs.promises.writeFile(cachePath, JSON.stringify(data), { encoding: "utf-8" })
                return data
            }))
    }

    private getCachePath(key: string, expiry: CacheExpiryTime = "never"): string {
        const cacheExpiry = {
            "hour": `${new Date().toISOString().split('T')[0]}T${new Date().getUTCHours()}:00:00Z`,
            "day": `${new Date().toISOString().split('T')[0]}T00:00:00Z`,
            "month": `${new Date().toISOString().split('T')[0].substring(0, 7)}-01T00:00:00Z`,
            "year": `${new Date().toISOString().split('T')[0].substring(0, 4)}-01-01T00:00:00Z`,
            "never": "0000-01-01T00:00:00Z"
        }[expiry]

        return path.join(this.cacheDirectory, createHash("sha256").update(cacheExpiry).update(key).digest("hex"))
    }
}

export interface StockDataSource {
    getStockData(symbol: string): Promise<{
        symbol: string,
        currency: string
        price: number
    }>
}

export interface CurrencyDataSource {
    getCurrencyData(from: string, to: string): Promise<number>
}