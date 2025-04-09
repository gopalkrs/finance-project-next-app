"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react'
import { updateDefaultAccount } from '@/actions/account';
import { toast } from 'sonner';



const AccountCard = ({ account }) => {

    const {name, id, balance, type, isDefault} = account;

    const { 
        loading: updateDefaultLoading, 
        fn: updateDefaultFn,
        data: updatedAccount, 
        error
    } = useFetch(updateDefaultAccount);

    const defaultChangeHandler = async (event) =>{
        event.preventDefault();

        if(isDefault){
            toast.warning("You need atleast one default account")
        }
        await updateDefaultFn(id);
    }

    useEffect(() => {
      if(updatedAccount?.success){
        toast.message("Default account updated successfully")
      }
    }, [updatedAccount, updateDefaultLoading]);

    useEffect(() => {
        if(error){
          toast.error(error.message || "Failed to update account");
        }
      }, [error]);  
    
    return (
        <Card className='hover:shadow-md transition-shadow group relative'>
            <Link href={`/account/${id}`}>
            <CardHeader className='flex flex-row  items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium capitalize'>{name}</CardTitle>
                <Switch checked={isDefault} onClick={defaultChangeHandler} />
            </CardHeader>
            <CardContent>
                <div className='text-2xl font-bold'>
                    &#8377;{parseFloat(balance).toFixed(2)}
                    <p className='text-xs text-muted-foreground'>{type.charAt(0) + type.slice(1).toLowerCase()}</p>
                </div>
            </CardContent>
            <CardFooter className='flex justify-between text-sm text-muted-foreground'>
                <div className='flex items-center'>
                    <ArrowUpRight className='mr-1 h-4 w-4 text-green-500' />
                    Income
                </div>
                <div className='flex items-center'>
                    <ArrowDownRight className='mr-1 h-4 w-4 text-red-500' />
                    Expense
                </div>
            </CardFooter>
            </Link>
        </Card>

    )
}

export default AccountCard;