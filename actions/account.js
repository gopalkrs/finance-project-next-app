"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const serialisedTransaction = (obj) => {
  const serialised = { ...obj };

  if (obj.balance) {
    serialised.balance = obj.balance.toNumber();
  }
  if (obj.amount) {
    serialised.amount = obj.amount.toNumber();
  }
  return serialised;
};

export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized User");
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }
    //first change all old accounts to not-default
    await db.account.updateMany({
      where: {
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    const updatedAccount = await db.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");
    return { success: true, error: serialisedTransaction(updatedAccount) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAccountWithTransaction(accountId) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized User");
  }

  const user = await db.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }

  const account = await db.account.findUnique({
    where: { id: accountId, userId: user.id },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account) return null;

  return {
    ...serialisedTransaction(account),
    transactions: account.transactions.map(serialisedTransaction),
  };
}

export async function deleteBulkTransactions(transactionsIds) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized User");
    }

    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });
    if (!user) {
      throw new Error("User not found");
    }

    const transaction = await db.transaction.findMany({
      where: {
        id: { in: transactionsIds },
        userId: user.id,
      },
    });

    const accountBalanceChanges = transaction.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount
          : -transaction.amount;

      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    console.log(accountBalanceChanges);
    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: {
          id: { in: transactionsIds },
          userId: user.id,
        },
      });

      for (const [accountId, changedAmount] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId },
          data: {
            balance: {
              increment: changedAmount,
            },
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
