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
const ynab = require("ynab");
const core = require("@actions/core");
const cache = require("@actions/cache");
const automation_1 = require("./automation");
const parsers_1 = require("./parsers");
const approve_1 = require("./automations/approve");
const bottomless_1 = require("./automations/bottomless");
const replicate_1 = require("./automations/replicate");
const stocks_1 = require("./automations/stocks");
const yahoo_1 = require("./datasources/yahoo");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        const cacheEnabled = core.getBooleanInput("cache", { required: false });
        try {
            const apiKey = core.getInput("api_key", { trimWhitespace: true, required: true });
            const api = new ynab.API(apiKey);
            if (cacheEnabled) {
                yield cache.restoreCache([".ynab-cache"], "ynab-cache");
            }
            const yahoo = new yahoo_1.Yahoo();
            const automations = (0, automation_1.buildAutomationMap)([
                new approve_1.ApproverAutomation(api),
                new bottomless_1.BottomlessAutomation(api),
                new replicate_1.ReplicateAutomation(api),
                new stocks_1.StockAutomation(api, yahoo, yahoo),
            ]);
            const budgetId = core.getInput("budget_id", { trimWhitespace: true, required: false }) || "default";
            const budget = yield api.budgets.getBudgetById(budgetId);
            const accounts = yield api.accounts.getAccounts(budget.data.budget.id);
            yield Promise.all(accounts.data.accounts.map((account) => __awaiter(this, void 0, void 0, function* () {
                const triggers = (0, parsers_1.parse)(account.note || "");
                if (!triggers.length)
                    return;
                yield Promise.all(triggers.map((trigger) => __awaiter(this, void 0, void 0, function* () {
                    const automation = automations[trigger.kind];
                    if (!automation) {
                        core.error(`Unknown automation kind '${trigger.kind}' in account '${account.name}'`);
                        return;
                    }
                    core.info(`Running automation '${automation.kind}' in account '${account.name}'`);
                    try {
                        yield automation.run(budget.data.budget, account, trigger.options);
                        core.info(`Finished running automation '${automation.kind}' in account '${account.name}'`);
                    }
                    catch (err) {
                        core.error(`Failed to run automation '${automation.kind}' in account '${account.name}'`, err);
                        throw err;
                    }
                })));
            })));
            core.setOutput("success", true);
        }
        catch (err) {
            core.debug(err.message);
            core.debug(err.stack);
            core.setFailed(err.message);
        }
        finally {
            if (cacheEnabled) {
                yield cache.saveCache([".ynab-cache"], "ynab-cache");
            }
        }
    });
}
run();
//# sourceMappingURL=index.js.map