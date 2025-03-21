'use server';

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// type AccountTypes{
//         id     :      String,
//         balance :     String,
//         isDefault :   Boolean,
//         userId  :     String
// }
const serialisedTransaction = (obj) =>{
    const serialised = {...obj};

    if(obj.balance){
        serialised.balance = obj.balance.toNumber();
    }
    if(obj.amount){
        serialised.amount = obj.amount.toNumber();
    }
    return serialised;
}

export async function createAccount(data) {
    try {
        const {userId} = await auth();

        if(!userId){
            throw new Error("Unauthorized User");
        }

        const user = await db.user.findUnique({
            where : {
                clerkUserId : userId
            }
        });

        if(!user){
            throw new Error("User not found"); 
        }

        //convert balance to float for string in database

        const balanceFloat = parseFloat(data.balance);
        if(isNaN(balanceFloat)){
            throw new Error("Invalid balance amount"); 
        }

        const existingAccount = await db.account.findMany({
            where : {
                userId : user.id
            }
        });

        const shouldBeDefault = existingAccount.length === 0? true : data.isDefault;

        //if there exist other accounts already, rest accounts 'isDefault' is changed to false
        if(shouldBeDefault){
            await db.account.updateMany({
                where : {
                    userId : user.id,
                    isDefault : true
                },
                data: {isDefault : false}
            });
        }
        //creating new account
        const newAccount = await db.account.create({
            data : {
                ...data,
                balance : balanceFloat,
                userId : user.id,
                isDefault : shouldBeDefault
            }
        });

        //converting the balance float to number for next render
        const serialisedAccount = serialisedTransaction(newAccount);
        revalidatePath('/dashboard');
        return {success : true, data : serialisedAccount};

    } catch (error) {
        return { success: false, error: error.message };
    }
}


export async function getUserAccounts(){

    try {
        const {userId} = await auth();

        if(!userId){
            throw new Error("Unauthorized User");
        }

        const user = await db.user.findUnique({
            where : {
                clerkUserId : userId
            }
        });

        if(!user){
            throw new Error("User not found"); 
        }

        const userAccounts = await db.account.findMany({
            where : { userId : user.id },
            orderBy : {createdAt : "desc"},
            include : {
                _count : {
                    select : {
                        transactions : true
                    }
                }
            }
        });

        const serialisedAccounts = userAccounts.map((account)=>serialisedTransaction(account));
        return serialisedAccounts;

    } catch(error){
        return { success: false, error: error.message };
    }

}