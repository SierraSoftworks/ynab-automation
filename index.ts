import {updateAccounts} from "./ynab"

const budgetId = process.env.YNAB_BUDGET_ID
const payeeName = process.env.YNAB_PAYEE_NAME || "Stock Market"

if (!budgetId) {
    throw new Error("You haven't provided the YNAB_BUDGET_ID environment variable")
}

updateAccounts(budgetId, payeeName).then(() => {
    console.log("Updated YNAB account with the latest stock information.")
}).catch(err => {
    console.error(err)
})