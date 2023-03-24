import * as ynab from "ynab"
import { buildAutomationMap } from "./automation"

import { parse } from "./parsers"
import { ApproverAutomation } from "./automations/approve"
import { BottomlessAutomation } from "./automations/bottomless"
import { ReplicateAutomation } from "./automations/replicate"
import { StockAutomation } from "./automations/stocks"

const api = new ynab.API(process.env.YNAB_API_KEY)

const automations = buildAutomationMap([
    new ApproverAutomation(api),
    new BottomlessAutomation(api),
    new ReplicateAutomation(api),
    new StockAutomation(api),
])

const budgetIds = (process.env.YNAB_BUDGET_IDS?.split(",") || [process.env.YNAB_BUDGET_ID]).filter(x => !!x)

if (!budgetIds.length) {
    throw new Error("You haven't provided the YNAB_BUDGET_IDS environment variable")
}

async function updateAccounts(budgetId: string) {
    const budget = await api.budgets.getBudgetById(budgetId || "default")

    const accounts = await api.accounts.getAccounts(budgetId)

    await Promise.all(accounts.data.accounts.map(async account => {
        const triggers = parse(account.note || "")
        if (!triggers.length) return;

        await Promise.all(triggers.map(async trigger => {
            const automation = automations[trigger.kind]
            if (!automation) {
                console.error(`Unknown automation kind '${trigger.kind}' in account '${account.name}'`)
                return;
            }

            console.log(`Running automation '${automation.kind}' in account '${account.name}'`)
            try {
                await automation.run(budget.data.budget, account, trigger.options)
                console.log(`Finished running automation '${automation.kind}' in account '${account.name}'`)
            } catch (err) {
                console.error(`Failed to run automation '${automation.kind}' in account '${account.name}'`, err)
                throw err
            }
        }))
    }))
}


Promise.all(budgetIds.map(b => updateAccounts(b))).then(() => {
    console.log("Updated YNAB account.")
}).catch(err => {
    console.error("Failed to update YNAB account.", err)
    process.exit(1)
})
