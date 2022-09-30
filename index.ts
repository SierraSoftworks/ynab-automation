import {updateAccount} from "./ynab"

const spec: {
    budgetId: string
    accountId: string
    payeeName: string
}[] = JSON.parse(process.env.YNAB_IMPORT_SPEC)

Promise.all(spec.map(async account => {
    await updateAccount(account.budgetId, account.accountId, account.payeeName)
})).then(() => {
    console.log("Updated YNAB account with the latest stock information.")
}).catch(err => {
    console.error(err)
})