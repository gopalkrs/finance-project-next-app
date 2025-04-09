export const dynamic = 'force-dynamic';

import { getUserAccounts } from '@/actions/dashboard'
import { defaultCategories } from '@/data/category';
import React from 'react';
import AddTransactionForm from "../_components/transaction-form";


export default async function AddTransactionPage() {
  
  const accounts = await getUserAccounts();

  console.log(accounts);

  return (
    <div className='max-w-3xl mx-auto px-5'>
      <div className='flex justify-center mb-8 md:justify-normal'>
        <h1 className='gradient-title text-5xl'>Add Transaction</h1>
      </div>
      <AddTransactionForm accounts = {accounts} categories = {defaultCategories} />
    </div>
  )
}
