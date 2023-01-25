# You Need a Budget - GitHub Automation
**Automate your You Need a Budget account using GitHub Actions.**

This repository is designed to run as a scheduled GitHub Action to help automate
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

## Setup
1. Create a new YNAB Personal API Token by following their [guide](https://api.youneedabudget.com/#personal-access-tokens).
2. Create a copy of this repository by clicking the **Use this template** button.
3. Configure your repository's secrets to include the following:
   - `YNAB_API_KEY`: Your YNAB Personal API Token
   - `YNAB_BUDGET_ID`: The ID of your YNAB budget, this is the first GUID in the URL when you are viewing your budget in the YNAB web app.

By default, your stock portfolio will be updated every 12 hours by the `.github/workflows/run.yaml` workflow.
You can adjust this by modifying the schedule, or force an update by running the action manually.

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

### Automated Approvals
To enable the automated approvals automation, add a note to your account with the
following content:

```
/automate:approve cleared=yes imported=yes
```

*Note: You can automatically approve transactions which haven't cleared, or weren't imported, by removing the `cleared=yes` and `imported=yes` arguments respectively.*


This is a relatively simple GitHub Action designed to be run on a schedule to
update an Unlinked Account in YNAB with the current value of your stock portfolio.
