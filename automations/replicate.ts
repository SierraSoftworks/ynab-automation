import {Automation} from "../automation"
import {Account, API, BudgetDetail, TransactionDetail} from "ynab"

export class ReplicateAutomation extends Automation {
    public get kind() {
        return "replicate"
    }

    public async run(budget: BudgetDetail, account: Account, options: { [key: string]: string }): Promise<void> {
        const targetBudgetAccounts = await this.api.accounts.getAccounts(options["to_budget"])
        const targetAccount = targetBudgetAccounts.data.accounts.find(a => a.name === options["to_account"])
        
        const sourceCategories = await this.getCategoriesLookup(budget.id)
        const targetCategories = this.reverseLookup(await this.getCategoriesLookup(options["to_budget"]))
        
        const transactions = await this.api.transactions.getTransactionsByAccount(budget.id, account.id)
        const pendingTransactions = transactions.data.transactions.filter(t => this.shouldReplicateTransaction(t, sourceCategories, options))

        const sinceDate = pendingTransactions.map(t => t.date).sort()[0]

        const replicatedTransactions = await this.api.transactions.getTransactionsByAccount(options["to_budget"], targetAccount.id, sinceDate)
        const replicatedTransactionIds = new Set(replicatedTransactions.data.transactions.map(t => t.import_id))

        const diffTransactions = pendingTransactions.filter(t => !replicatedTransactionIds.has(t.import_id))

        await this.api.transactions.createTransactions(options["to_budget"], {
            transactions: diffTransactions.map(t => ({
                account_id: targetAccount.id,
                amount: t.amount,
                approved: true,
                date: t.date,
                import_id: t.import_id,
                flag_color: (options["to_flag"] ? options["to_flag"] : t.flag_color) as TransactionDetail.FlagColorEnum,
                payee_name: t.payee_name,
                memo: t.memo,
                category_id: targetCategories[options["to_category"] || sourceCategories[t.category_id]]
            }))
        })

        await this.api.transactions.updateTransactions(budget.id, {
            transactions: pendingTransactions.map(t => ({
                id: t.id,
                approved: true
            }))
        })
    }

    private async getCategoriesLookup(budget_id: string): Promise<{ [id: string]: string }> {
        const categories = await this.api.categories.getCategories(budget_id)
        const lookup: { [normalizedName: string]: string } = {}

        for (const category_group of categories.data.category_groups) {
            for (const category of category_group.categories) {
                lookup[category.id] = this.getNormalizedCategoryName(category_group.name, category.name)
            }
        }

        return lookup
    }

    private reverseLookup(lookup: { [key: string]: string }): { [value: string]: string } {
        const reversed: { [key: string]: string } = {}

        for (const key in lookup) {
            reversed[lookup[key]] = key
        }

        return reversed
    }

    private getNormalizedCategoryName(category_group: string, category_name: string): string {
        return `${category_group}: ${category_name}`
    }

    private shouldReplicateTransaction(transaction: TransactionDetail, categoryLookup: { [id: string]: string }, options: { [key: string]: string }): boolean {
        if (!transaction.import_id) {
            return false
        }

        if (options["from_category"] && categoryLookup[transaction.category_id] !== options["from_category"]) {
            return false
        }

        if (options["from_flag"] && `${transaction.flag_color}` !== options["from_flag"]) {
            return false
        }

        return true
    }
}
