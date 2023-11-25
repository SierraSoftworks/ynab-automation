export function buildUrl(template: string, params: { [key: string]: string }): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => encodeURIComponent(params[key] || ''))
}

export async function retry<T>(action: () => Promise<T>, attempts: number = 3, delay: number = 500): Promise<T> {
    while (true) {
        attempts -= 1

        try {
            return await action()
        } catch (e) {
            if (!attempts) {
                throw e
            }
        }

        await new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), delay)
        })
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