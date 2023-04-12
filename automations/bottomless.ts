import { Automation } from "../automation"
import { Account, API, BudgetDetail, TransactionDetail } from "ynab"


export class BottomlessAutomation extends Automation {
    public get kind() {
        return "bottomless"
    }

    public async run(budget: BudgetDetail, account: Account, options: { [key: string]: string }): Promise<void> {
        if (account.balance < -10) {
            await this.api.transactions.createTransaction(budget.id, {
                transaction: {
                    account_id: account.id,
                    amount: -account.balance,
                    date: new Date().toISOString().split('T')[0],
                    payee_name: options["name"] || "Bottomless Pit",
                    approved: options["approved"] === "yes"
                }
            })
        }
    }
}