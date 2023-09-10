import { Automation } from "../automation"
import { Account, API, BudgetDetail, TransactionDetail, TransactionDetailClearedEnum } from "ynab"


export class ApproverAutomation extends Automation {
    public get kind() {
        return "approve"
    }

    public async run(budget: BudgetDetail, account: Account, options: { [key: string]: string }): Promise<void> {
        const transactions = await this.api.transactions.getTransactionsByAccount(budget.id, account.id)
        const pendingTransactions = transactions.data.transactions.filter(t => this.shouldApproveTransaction(t, options))

        if (!pendingTransactions.length) {
            return
        }

        await this.api.transactions.updateTransactions(budget.id, {
            transactions: pendingTransactions.map(t => ({
                id: t.id,
                approved: true
            }))
        })
    }

    private shouldApproveTransaction(transaction: TransactionDetail, options: { [key: string]: string }): boolean {
        return !transaction.approved &&
            (options.cleared === "yes" ? transaction.cleared !== TransactionDetailClearedEnum.Uncleared : true) &&
            (options.imported === "yes" ? transaction.import_id !== null : true)
    }
}