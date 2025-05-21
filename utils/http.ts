export function buildUrl(template: string, params: { [key: string]: string }): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => encodeURIComponent(params[key] || ''))
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
            throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`)
        }

        return await response.json()
    }, attempts)
}