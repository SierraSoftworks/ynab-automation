export function buildUrl(template: string, params: { [key: string]: string }): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => encodeURIComponent(params[key] || ''))
}

export class RateLimitError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "RateLimitError"
    }
}

export function throwForResponseStatus(response: { status: number, statusText: string }, body: string): never {
    if (response.status === 429) throw new RateLimitError(`${response.status} ${response.statusText}: ${body}`)

    throw new Error(`${response.status} ${response.statusText}: ${body}`)
}

export async function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function retry<T>(action: () => Promise<T>, attempts: number = 2, delay: number = 100): Promise<T> {
    while (true) {
        attempts -= 1

        try {
            return await action()
        } catch (e) {
            // Retrying a rate limited request will only make matters worse, so give up immediately.
            if (e instanceof RateLimitError) throw e

            if (!attempts) {
                console.error(e)
                throw e
            }
        }

        await sleep(delay)
    }
}

export async function fetchSafe<T>(url: string, options: RequestInit = {}, attempts: number = 3): Promise<T> {
    return await retry(async () => {
        const response = await fetch(url, options)

        if (!response.ok) {
            throwForResponseStatus(response, await response.text())
        }

        return await response.json()
    }, attempts)
}