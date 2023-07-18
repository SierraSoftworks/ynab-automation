import { buildUrl, fetchSafe } from "./http"

const companyUrl = "https://www.alphavantage.co/query?function=OVERVIEW&symbol={SYMBOL}&apikey={ALPHAVANTAGE_API_KEY}"

const stockUrl = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={SYMBOL}&apikey={ALPHAVANTAGE_API_KEY}"

const currencyUrl = "https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency={FROM_SYMBOL}&to_currency={TO_SYMBOL}&apikey={ALPHAVANTAGE_API_KEY}"

interface CompanyInfo {
    Symbol: string
    Name: string
    Exchange: string
    Currency: string
}

interface StockQuote {
    symbol: string,
    currency: string
    price: number
}

async function getCompanyData(symbol: string): Promise<CompanyInfo> {
    const response: any = await fetchSafe(buildUrl(companyUrl, { SYMBOL: symbol.toUpperCase(), ALPHAVANTAGE_API_KEY: process.env.ALPHAVANTAGE_API_KEY }))
    return response
}

export async function getStockData(symbol: string): Promise<StockQuote> {
    /*
        The API returns an object with the following structure:
        {
            "Global Quote": {
                "01. symbol": "IBM",
                "02. open": "133.2600",
                "03. high": "134.6100",
                "04. low": "133.1000",
                "05. price": "134.2400",
                "06. volume": "3168419",
                "07. latest trading day": "2023-07-17",
                "08. previous close": "133.4000",
                "09. change": "0.8400",
                "10. change percent": "0.6297%"
            }
        }
     */

    const companyInfo = await getCompanyData(symbol.toUpperCase())

    const response: any = await fetchSafe(buildUrl(stockUrl, { SYMBOL: symbol.toUpperCase(), ALPHAVANTAGE_API_KEY: process.env.ALPHAVANTAGE_API_KEY }))
    return {
        symbol: companyInfo.Symbol,
        currency: companyInfo.Currency,
        price: parseFloat(response["Global Quote"]["05. price"])
    }
}

export async function getCurrencyData(from: string, to: string): Promise<number> {
    from = from.toUpperCase()
    to = to.toUpperCase()

    /*
        The API returns an object with the following structure:

        {
            "Realtime Currency Exchange Rate": {
                "1. From_Currency Code": "USD",
                "2. From_Currency Name": "United States Dollar",
                "3. To_Currency Code": "JPY",
                "4. To_Currency Name": "Japanese Yen",
                "5. Exchange Rate": "138.99100000",
                "6. Last Refreshed": "2023-07-18 19:39:02",
                "7. Time Zone": "UTC",
                "8. Bid Price": "138.98920000",
                "9. Ask Price": "138.99750000"
            }
        }
    */

    const response: any = await fetchSafe(buildUrl(currencyUrl, { FROM_SYMBOL: from.toUpperCase(), TO_SYMBOL: to.toUpperCase(), ALPHAVANTAGE_API_KEY: process.env.ALPHAVANTAGE_API_KEY }))
    return parseFloat(response["Realtime Currency Exchange Rate"]["5. Exchange Rate"])
}