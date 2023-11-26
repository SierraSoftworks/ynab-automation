import { createHash } from "node:crypto"
import * as fs from "node:fs"
import * as path from "node:path"
import * as dayjs from "dayjs"

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

    public async cleanCache() {
        const now = dayjs().unix()

        const cacheFiles = await fs.promises.readdir(this.cacheDirectory)
        const expiredFiles = cacheFiles.filter(f => !f.startsWith("forever-")).filter(f => {
            try
            {
                const expiry = parseInt(f.split("-")[0])
                return expiry < now
            }
            catch
            {
                return false
            }
        })

        await Promise.all(expiredFiles.map(async f => {
            await fs.promises.rm(path.join(this.cacheDirectory, f))
        }))
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
        if (expiry === "never") {
            return path.join(this.cacheDirectory, `forever-${key}`)
        }

        const cacheExpiry = dayjs().add(1, expiry).unix()

        return path.join(this.cacheDirectory, `${cacheExpiry}-${key}`)
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