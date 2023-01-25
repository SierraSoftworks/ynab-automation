import * as ynab from "ynab"
import { buildAutomationMap } from "./automation"

import { parse } from "./parsers"
import { StockAutomation } from "./automations/stocks"

const api = new ynab.API(process.env.YNAB_API_KEY)

const automations = buildAutomationMap([
    new StockAutomation(api),
])

const budgetId = process.env.YNAB_BUDGET_ID

if (!budgetId) {
    throw new Error("You haven't provided the YNAB_BUDGET_ID environment variable")
}

async function updateAccounts(budgetId: string) {
    const budget = await api.budgets.getBudgetById(budgetId || "default")

    const accounts = await api.accounts.getAccounts(budgetId)

    await Promise.all(accounts.data.accounts.map(async account => {
        const triggers = parse(account.note || "")
        if (!triggers.length) return;

        await Promise.all(triggers.map(async trigger => {
            const automation = automations[trigger.kind]
            if (!automation) return;

            await automation.run(budget.data.budget, account, trigger.options)
        }))
    }))
}


updateAccounts(budgetId).then(() => {
    console.log("Updated YNAB account with the latest stock information.")
}).catch(err => {
    console.error("Failed to update YNAB account with the latest stock information.", err)
    process.exit(1)
})