"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAutomationMap = exports.Automation = void 0;
class Automation {
    constructor(api) {
        this.api = api;
    }
}
exports.Automation = Automation;
function buildAutomationMap(automations) {
    return automations.reduce((map, automation) => (Object.assign(Object.assign({}, map), { [automation.kind]: automation })), {});
}
exports.buildAutomationMap = buildAutomationMap;
//# sourceMappingURL=automation.js.map