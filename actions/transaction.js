"use server";

import { revalidatePath } from "next/cache";
import { db } from "../lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { request } from "@arcjet/next";
import aj from "@/lib/arcjet";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializedAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

export async function createTransaction(data) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("Unauthorized User");
    }

    const reqArcjet = await request();

    const decision = await aj.protect(reqArcjet, {
      userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });
        throw new Error("Too many requests, try again later.");
      }
      throw new Error("Request Blocked");
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
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new error("Account not found");
    }

    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;

    const newBalance = account.balance.toNumber() + balanceChange;

    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          lastProcessed:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      {
        /*using last processed instead of next recurring date to a type mistake in database(rookie mistake)*/
      }

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializedAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

const calculateNextRecurringDate = (transactionDate, interval) => {
  const date = new Date(transactionDate);

  switch (interval) {
    case "MONTHLY":
      date.setDate(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setDate(date.getFullYear() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
  }
  return date;
};

export async function sendReceipt(file) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const arrayBuffer = await file.arrayBuffer();
    const base64string = Buffer.from(arrayBuffer).toString("base64");


    const prompt = `
      Analyze this receipt image and extract the following information in JSON format:
      - Total amount (just the number)
      - Date (in ISO format)
      - Description or items purchased (brief summary)
      - Merchant/store name
      - Suggested category (one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense )
      
      Only respond with valid JSON in this exact format:
      {
        "amount": number,
        "date": "ISO date string",
        "description": "string",
        "merchantName": "string",
        "category": "string"
      }

      If its not a recipt, return an empty object
    `;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64string,
          mimeType: file.type,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const responseInText = response.text();
    const cleanedText = responseInText.replace(/```(?:json)?\n?/g, "").trim();
    try {
      const data = JSON.parse(cleanedText);
      console.log(data);

      return {
        amount: parseFloat(data.amount),
        date: new Date(data.date),
        description: data.description,
        category: data.category,
        merchantName: data.merchantName,
      };
    } catch (parseError) {
      console.error("Error parsing the text", parseError);
      throw new Error("Invalid response format from Gemini");
    }
  } catch (error) {
    console.error("Error scanning receipt", error);
    throw new Error("Failed to scan receipt");
  }
}
