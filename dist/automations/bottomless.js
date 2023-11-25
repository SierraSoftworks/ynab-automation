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
exports.BottomlessAutomation = void 0;
const automation_1 = require("../automation");
class BottomlessAutomation extends automation_1.Automation {
    get kind() {
        return "bottomless";
    }
    run(budget, account, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (account.balance < -10) {
                yield this.api.transactions.createTransaction(budget.id, {
                    transaction: {
                        account_id: account.id,
                        amount: -account.balance,
                        date: new Date().toISOString().split('T')[0],
                        payee_name: options["name"] || "Bottomless Pit",
                        approved: options["approved"] === "yes"
                    }
                });
            }
        });
    }
}
exports.BottomlessAutomation = BottomlessAutomation;
//# sourceMappingURL=bottomless.js.map