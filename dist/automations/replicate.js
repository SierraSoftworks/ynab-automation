"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplicateAutomation = void 0;
const automation_1 = require("../automation");
const ynab_1 = require("ynab");
class ReplicateAutomation extends automation_1.Automation {
    get kind() {
        return "replicate";
    }
    run(budget, account, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetBudgetAccounts = yield this.api.accounts.getAccounts(options["to_budget"]);
            const targetAccount = targetBudgetAccounts.data.accounts.find(a => a.name === options["to_account"]);
            if (!targetAccount) {
                throw new Error(`Could not find target account '${options["to_account"]}' in target budget '${options["to_budget"]}'`);
            }
            const sourceCategories = yield this.getCategoriesLookup(budget.id);
            const targetCategories = this.reverseLookup(yield this.getCategoriesLookup(options["to_budget"]));
            const transactions = yield this.api.transactions.getTransactionsByAccount(budget.id, account.id);
            const pendingTransactions = transactions.data.transactions.filter(t => this.shouldReplicateTransaction(t, sourceCategories, options));
            const sinceDate = pendingTransactions.map(t => t.date).sort()[0];
            const replicatedTransactions = yield this.api.transactions.getTransactionsByAccount(options["to_budget"], targetAccount.id, sinceDate);
            const replicatedTransactionIds = new Set(replicatedTransactions.data.transactions.map(t => t.import_id));
            const diffTransactions = pendingTransactions.filter(t => !replicatedTransactionIds.has(t.import_id));
            if (!diffTransactions.length) {
                return;
            }
            yield this.api.transactions.createTransactions(options["to_budget"], {
                transactions: diffTransactions.map(t => ({
                    account_id: targetAccount.id,
                    amount: t.amount,
                    approved: true,
                    date: t.date,
                    import_id: t.import_id,
                    flag_color: (options["to_flag"] ? options["to_flag"] : t.flag_color),
                    payee_name: t.payee_name,
                    memo: t.memo,
                    cleared: t.cleared,
                    category_id: targetCategories[options["to_category"] || sourceCategories[t.category_id]]
                }))
            });
        });
    }
    getCategoriesLookup(budget_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const categories = yield this.api.categories.getCategories(budget_id);
            const lookup = {};
            for (const category_group of categories.data.category_groups) {
                for (const category of category_group.categories) {
                    lookup[category.id] = this.getNormalizedCategoryName(category_group.name, category.name);
                }
            }
            return lookup;
        });
    }
    reverseLookup(lookup) {
        const reversed = {};
        for (const key in lookup) {
            reversed[lookup[key]] = key;
        }
        return reversed;
    }
    getNormalizedCategoryName(category_group, category_name) {
        return `${category_group}: ${category_name}`;
    }
    shouldReplicateTransaction(transaction, categoryLookup, options) {
        if (!transaction.import_id) {
            return false;
        }
        if (options["from_category"] && categoryLookup[transaction.category_id] !== options["from_category"]) {
            return false;
        }
        if (options["from_flag"] && `${transaction.flag_color}` !== options["from_flag"]) {
            return false;
        }
        if (options["cleared"] === "yes" && transaction.cleared === ynab_1.TransactionClearedStatus.Uncleared) {
            return false;
        }
        return true;
    }
}
exports.ReplicateAutomation = ReplicateAutomation;
//# sourceMappingURL=replicate.js.map