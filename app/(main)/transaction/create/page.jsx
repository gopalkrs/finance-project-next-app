import { getUserAccounts } from '@/actions/dashboard'
import { defaultCategories } from '@/data/category';
import React from 'react';
import AddTransactionForm from "../_components/transaction-form"

const AddTransactionPage = async () => {
  const accounts = await getUserAccounts();

  return (
    <div className='max-w-3xl mx-auto px-5'>
      <div className='flex justify-center mb-8 md:justify-normal'>
        <h1 className='gradient-title text-5xl'>Add Transaction</h1>
      </div>
      <AddTransactionForm accounts = {accounts} categories = {defaultCategories} />
    </div>
  )
}

export default AddTransactionPage