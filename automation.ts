import type { Account, API, BudgetDetail } from "ynab";

export abstract class Automation {
    constructor(protected api: API) {}

    public abstract get kind(): string

    public abstract run(budget: BudgetDetail, account: Account, options: { [key: string]: string }): Promise<void>
}

export function buildAutomationMap(automations: Automation[]): { [key: string]: Automation } {
    return automations.reduce((map, automation) => ({ ...map, [automation.kind]: automation }), {})
}