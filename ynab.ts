import * as ynab from "ynab"

import { parseStocksNote } from "./parsers"
import { getStockInformation } from "./stocks"

const api = new ynab.API(process.env.YNAB_API_KEY)

export async function updateAccount(budgetId: string, accountName: string, payeeName: string) {
    const budget = await api.budgets.getBudgetById(budgetId || "default")

    const accounts = await api.accounts.getAccounts(budgetId)
    const account = accounts.data.accounts.find(a => a.name === accountName)
    if (!account) throw new Error(`Account ${accountName} not found in budget ${budgetId}, available accounts: ${accounts.data.accounts.map(a => a.name).join(", ")}`)
    
    const payees = await api.payees.getPayees(budgetId)
    let payee = payees.data.payees.find(p => p.name === payeeName)

    if (!payee) throw new Error(`Payee ${payeeName} not found in budget ${budgetId}`)

    const stocks = parseStocksNote(account.note)

    const values = await getStockInformation(stocks, budget.data.budget.currency_format.iso_code);

    if (!values.length) return;

    await api.transactions.createTransaction(budgetId, {
        transaction: {
            account_id: account.id,
            date: new Date().toISOString().split('T')[0],
            amount: Math.floor(values.reduce((sum, stock) => sum + stock.value, 0)*1000) - account.balance,
            payee_name: "Stock Adjustment",
            cleared: ynab.SaveTransaction.ClearedEnum.Reconciled,
            approved: true,
            memo: values.map(v => `${v.symbol} ${v.nativeValue}`).join(', '),
            payee_id: payee.id
        }
    })
}
