export function buildUrl(template: string, params: { [key: string]: string }): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => encodeURIComponent(params[key] || ''))
}

export async function fetchSafe<T>(url: string, attempts: number = 3, options: RequestInit = {}): Promise<T> {
    while (true) {
        attempts -= 1

        const response = await fetch(url, {
            ...options
        })
        
        if (response.ok) {
            return await response.json()
        }

        if (!attempts) {
            throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`)
        }

        // Delay for 1s between retries
        await new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), 500)
        })
    }
}