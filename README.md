# You Need a Budget - Stock Tracking
**Keep track of your stock portfolio in YNAB.**

This is a relatively simple Azure Function designed to be run on a schedule to
update an Unlinked Account in YNAB with the current value of your stock portfolio.

## Setup
1. Create an Unlinked Account in YNAB for your stock portfolio.
   You can create more than one if you want to track multiple portfolios.

2. Add a note to your stock portfolio account with the following content:
   
   ```
   /automate:stock
   MSFT:100
   AAPL:100
   GOOG:100
   ```

   *Note: You can change the list of stock tickers and the number of shares held for each ticker.*

3. Create a new YNAB Personal API Token by following their [guide](https://api.youneedabudget.com/#personal-access-tokens).
4. Create a copy of this repository by clicking the **Use this template** button.
5. Configure your repository's secrets to include the following:
   - `YNAB_API_KEY`: Your YNAB Personal API Token
   - `YNAB_BUDGET_ID`: The ID of your YNAB budget, this is the first GUID in the URL when you are viewing your budget in the YNAB web app.

By default, your stock portfolio will be updated every 6 hours by the `.github/workflows/run.yaml` workflow.
You can adjust this by modifying the schedule, or force an update by running the action manually.