"use client";
import React, { useEffect, useState } from 'react'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema } from "@/app/lib/schema"
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import useFetch from "@/hooks/use-fetch"
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createAccount } from '@/actions/dashboard';

const CreateAccountDrawer = ({ children }) => {

    const [open, setOpen] = useState(false);
    const { loading: createAccountLoading, 
            fn: createAccountFn, 
            setData, 
            error, 
            data: newAccount} = useFetch(createAccount);

    const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
        resolver: zodResolver(accountSchema),
        defaultValues: {
            name: "",
            type: "CURRENT",
            balance: "",
            isDefault: false
        }
    })

    const onSubmit = async (data) =>{
        console.log(data);
        await createAccountFn(data);
    }

    useEffect(() => {
      if(newAccount && !createAccountLoading){
        toast.success("Account Created Successfully.");
        reset();
        setOpen(false);
      }
    }, [newAccount, createAccountLoading, reset])

    useEffect(() => {
      if(error){
        toast.error(error.message || "Failed to create account");
      }
    }, [error]);
    
    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Create a New Account</DrawerTitle>
                </DrawerHeader>
                <div className='px-4 pb-4'>
                    <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
                        <div className='space-y-2'>
                            <label className='text-sm font-medium' htmlFor='name'>Account Name</label>
                            <Input 
                                id='name' 
                                placeholder='e.g., Main Checking' 
                                {...register('name')} 
                            />
                            {errors.name && (
                                <p className='text-red-500'>{errors.name.message}</p>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <label className='text-sm font-medium' htmlFor='type'>Account Type</label>
                            <Select onValueChange={(value) => setValue("type", value)}
                                defaultValue={watch('type')}>
                                <SelectTrigger id='type' className="">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SAVINGS">Savings</SelectItem>
                                    <SelectItem value="CURRENT">Current</SelectItem>
                                </SelectContent>
                            </Select>

                            {errors.type && (
                                <p className='text-red-500'>{errors.type.message}</p>
                            )}
                        </div>

                        <div className='space-y-2'>
                            <label className='text-sm font-medium' htmlFor='balance'>Initial Balance</label>
                            <Input 
                                id='balance' 
                                type='number' 
                                step='0.01' 
                                placeholder='0.00' 
                                {...register('balance')} 
                            />
                            {errors.balance && (
                                <p className='text-red-500'>{errors.balance.message}</p>
                            )}
                        </div>

                        <div className='flex items-center justify-between rounded-lg p-3 border'>
                            <div>
                                <label className='text-sm font-medium cursor-pointer' htmlFor='isDefault'>
                                    Set as Default
                                </label>

                                <p className='text-sm text-muted-foreground'>
                                    This account will be set as default acccount for transaction
                                </p>
                            </div>
                            <Switch 
                                id='isDefault' 
                                onCheckedChange={(checked) => setValue("isDefault", checked)} 
                                checked={watch('isDefault')} 
                            />
                        </div>

                        <div className='w-full flex gap-4 pt-4'>
                            <DrawerClose asChild>
                                <Button type='button' variant={'outline'} className='flex-1'>
                                    Cancel
                                </Button>
                            </DrawerClose>

                            <Button type='submit' className='flex-1' disabled={createAccountLoading}>
                                {createAccountLoading? (
                                    <> 
                                        <Loader2 className='h-4 w-4 mr-2 animate-spin' /> Creating.... 
                                    </> 
                                ): ("Create Account")}
                            </Button>
                        </div>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    )
}

export default CreateAccountDrawer