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
exports.ApproverAutomation = void 0;
const automation_1 = require("../automation");
const ynab_1 = require("ynab");
class ApproverAutomation extends automation_1.Automation {
    get kind() {
        return "approve";
    }
    run(budget, account, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const transactions = yield this.api.transactions.getTransactionsByAccount(budget.id, account.id);
            const pendingTransactions = transactions.data.transactions.filter(t => this.shouldApproveTransaction(t, options));
            if (!pendingTransactions.length) {
                return;
            }
            yield this.api.transactions.updateTransactions(budget.id, {
                transactions: pendingTransactions.map(t => ({
                    id: t.id,
                    approved: true
                }))
            });
        });
    }
    shouldApproveTransaction(transaction, options) {
        return !transaction.approved &&
            (options.cleared === "yes" ? transaction.cleared !== ynab_1.TransactionClearedStatus.Uncleared : true) &&
            (options.imported === "yes" ? transaction.import_id !== null : true);
    }
}
exports.ApproverAutomation = ApproverAutomation;
//# sourceMappingURL=approve.js.map