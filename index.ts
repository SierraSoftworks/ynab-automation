import * as ynab from "ynab"
import * as core from "@actions/core";
import * as cache from "@actions/cache"

import { buildAutomationMap } from "./automation"

import { parse } from "./parsers"
import { ApproverAutomation } from "./automations/approve"
import { BottomlessAutomation } from "./automations/bottomless"
import { ReplicateAutomation } from "./automations/replicate"
import { StockAutomation } from "./automations/stocks"
import { Yahoo } from "./datasources/yahoo";


async function run() {
    const cacheEnabled = core.getBooleanInput("cache", { required: false })

    try
    {
        const apiKey = core.getInput("api-key", { trimWhitespace: true, required: true })
        const api = new ynab.API(apiKey)


        if (cacheEnabled) {
            await cache.restoreCache([".ynab-cache"], "ynab-cache")
        }

        const yahoo = new Yahoo()

        if (cacheEnabled) {
            core.debug("Removing old entries from the cache")
            await yahoo.cleanCache()
        }

        const automations = buildAutomationMap([
            new ApproverAutomation(api),
            new BottomlessAutomation(api),
            new ReplicateAutomation(api),
            new StockAutomation(api, yahoo, yahoo),
        ])

        const budgetId = core.getInput("budget-id", { trimWhitespace: true, required: false }) || "default"

        const budget = await api.budgets.getBudgetById(budgetId)
        const accounts = await api.accounts.getAccounts(budget.data.budget.id)

        await Promise.all(accounts.data.accounts.map(async account => {
            const triggers = parse(account.note || "")
            if (!triggers.length) return;

            await Promise.all(triggers.map(async trigger => {
                const automation = automations[trigger.kind]
                if (!automation) {
                    core.error(`Unknown automation kind '${trigger.kind}' in account '${account.name}'`)
                    return;
                }

                core.info(`Running automation '${automation.kind}' in account '${account.name}'`)
                try {
                    await automation.run(budget.data.budget, account, trigger.options)
                    core.info(`Finished running automation '${automation.kind}' in account '${account.name}'`)
                } catch (err) {
                    core.error(`Failed to run automation '${automation.kind}' in account '${account.name}'`, err)
                    throw err
                }
            }))
        }))

        core.setOutput("success", true)
    } catch (err) {
        core.debug(err.message)
        core.debug(err.stack)
        core.setFailed(err.message)
    } finally {
        if (cacheEnabled) {
            await cache.saveCache([".ynab-cache"], "ynab-cache")
        }
    }
}

run()