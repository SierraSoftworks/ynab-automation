# You Need a Budget - GitHub Automation
**Automate your You Need a Budget account using GitHub Actions.**

This is designed to run as a scheduled GitHub Action to help automate
common account management tasks in [You Need a Budget](https://www.youneedabudget.com/).

## Features
 - **Keep a Stock Account's value up to date.**

    By specifying the number of shares for each ticker as a note on your stock account,
    this action can automatically fetch the latest stock price from Yahoo! Finance and
    update your account's balance (it even supports currency conversion).

 - **Automatically approve transactions.**

    If you're using YNAB's support for account linking, you might get tired of needing
    to approve every transaction which is automatically imported. This action can take
    the toil out of it for you by automatically approving imported transactions which
    have cleared in your account(s).

- **Replicate transactions between budgets.**

    If you're using multiple YNAB budgets to provide a shared household budget while retaining
    your own personal budgets, you'll find that this action can take care of automatically
    copying transactions from one budget to another.

## Setup
1. Create a new YNAB Personal API Token by following their [guide](https://api.youneedabudget.com/#personal-access-tokens).
2. Configure your repository's secrets to include the following:
   - `YNAB_API_KEY`: Your YNAB Personal API Token
   - `YNAB_BUDGET_ID`: The ID of your YNAB budget, this is the first GUID in the URL when you are viewing your budget in the YNAB web app.
3. Create your own repository, and place a `.github/workflows/ynab.yaml` file with the following contents.
   
   ```yaml
   name: YNAB

   on:
     schedule:
        # Run the automation every 12 hours
       - cron: '0 */12 * * *'

   jobs:
     automate-ynab:
       runs-on: ubuntu-latest
       steps:
         - uses: sierrasoftworks/ynab-automation@v2
           with:
             budget-id: ${{ secrets.YNAB_BUDGET_ID }}
             api-key: ${{ secrets.YNAB_API_KEY }}
             cache: true
   ```

### Automatic Updates
If you want to automatically update to the latest version of the YNAB automation, you can add a `.github/dependabot.yml` file
to your repository with the following contents. It will automatically create pull requests to update your repository when new
versions are released.

```yaml
version: 2
updates:
  - directory: /
    package-ecosystem: github-actions
    schedule:
      interval: weekly
```

### Caching
In general, we recommend running this action with the `cache: true` feature turned on. Doing so will automatically generate a
cache for various upstream datastores (for example, stock and currency data) to avoid making unnecessary calls to these upstream
data providers. If you're running multiple instances of this action (for example, across multiple accounts) this will also significantly
reduce the chances of you being rate limited.

## Configuration
You control the automations which are enabled on your account(s) by adding specific
commands to the notes on those accounts. These commands always take the form of
`/automate:<command> <argument>=<value>,<argument>=<value>`.

### Stock Account
To enable the stock account automation, add a note to your stock account with the
following content:

```
# Specify your list of stock tickers and the number of shares held for each ticker.
/automate:stock MSFT=100, AAPL=100, GOOG=100
```

*Note: You can change the list of stock tickers and the number of shares held for each ticker.*

### Cross-Budget Replication
If you're using multiple YNAB budgets to provide a shared household budget while retaining
your own personal budgets, you may find that replicating transactions from your personal
budget to the shared household budget to be a tedious task.

Fortunately, this automation allows you to automatically replicate transactions from one
budget to another by adding a note to your account with the following content:

```
automate:replicate to_budget=Household to_account=Alice from_category=Groceries to_category=Food cleared=yes to_flag=blue
```

### Automated Approvals
To enable the automated approvals automation, add a note to your account with the
following content:

```
/automate:approve cleared=yes imported=yes
```

*Note: You can automatically approve transactions which haven't cleared, or weren't imported, by removing the `cleared=yes` and `imported=yes` arguments respectively.*

This is a relatively simple GitHub Action designed to be run on a schedule to
update an Unlinked Account in YNAB with the current value of your stock portfolio.

### Bottomless Budget
If you're just using YNAB to keep track of your spending and don't want to worry
about tracking how much money you have available (mostly when using a joint budget
for shared spending in conjunction with the **Replication** automation) you may
wish to use the **Bottomless Budget** automation.

This automation will automatically set the available balance of your budget to
zero by adding fake transactions from the "Bottomless Pit" payee to your account.

```
/automate:bottomless name="Bottomless Pit" approved=yes
```