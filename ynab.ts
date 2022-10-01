import * as ynab from "ynab"

import { parseStocksNote } from "./parsers"
import { getStockInformation } from "./stocks"

const api = new ynab.API(process.env.YNAB_API_KEY)

export async function updateAccount(budgetId: string, accountId: string, payeeName: string) {
    const budget = await api.budgets.getBudgetById(budgetId || "default")

    const accounts = await api.accounts.getAccountById(budgetId, accountId)
    const account = accounts.data.account

    const stocks = parseStocksNote(account.note)

    const values = await getStockInformation(stocks, budget.data.budget.currency_format.iso_code);

    if (!values.length) return;

    const shift = Math.floor(values.reduce((sum, stock) => sum + stock.value, 0)*1000) - account.balance;
    if (shift === 0) return;

    await api.transactions.createTransaction(budgetId, {
        transaction: {
            account_id: account.id,
            date: new Date().toISOString().split('T')[0],
            amount: shift,
            payee_name: payeeName,
            cleared: ynab.SaveTransaction.ClearedEnum.Cleared,
            approved: true,
            memo: values.map(v => `${v.symbol} ${v.nativeValue}`).join(', ')
        }
    })
}
