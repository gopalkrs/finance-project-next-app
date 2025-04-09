import { inngest } from "./client";
import { db } from "../prisma";

export const checkBudgetAlerts = inngest.createFunction(
  { name: "Check budget alerts", id : "bgdt" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budget", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.accounts[0];
      if (!defaultAccount) continue;

      console.log(budget);
      await step.run(`check-budget-${budget.id}`, async () => {
        const startDate = new Date(2025, 2, 1);
        startDate.setDate(1);

        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            accountId: defaultAccount.id,
            type: "EXPENSE",
            date: {
              gte: startDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.amount;
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        if (
          percentageUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(budget.lastAlertSent, new Date()))
        ) {
          //send email

          //update last alert
          await db.budget.update({
            where : {id : budget.id},
            data : {lastAlertSent : new Date()}
          })
        }
      });
    }
  }
);

const isNewMonth = (lastAlertDate, currentDate) => {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
};
