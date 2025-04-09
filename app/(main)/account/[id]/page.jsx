import { getAccountWithTransaction } from '@/actions/account'
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react'
import TransactionTable from '../_components/transaction-table';
import AccountChart from '../_components/account-chart';

import { BarLoader } from 'react-spinners';

const Account = async ({ params } ) => {

  const {id} = await params;
  const accountsData = await getAccountWithTransaction(id);
  if (!accountsData) {
    notFound();
  }

  const { transactions, ...account } = accountsData;
  return (
    <div className='px-5 space-y-2'>
      <div className='flex items-end justify-between gap-4'>
        <div>
          <h1 className='gradient-title text-5xl sm:text-6xl font-bold capitalize'>{account.name}</h1>
          <p className='text-muted-foreground'>{account.type.charAt(0) + account.type.slice(1).toLowerCase()} Account</p>
        </div>
        <div className='text-right'>
          <div className='text-xl sm:text-2xl font-bold'>&#8377;{parseFloat(account.balance).toFixed(2)}</div>
          <p className='text-sm text-muted-foreground'>{account._count.transactions} Transactions</p>
        </div>
      </div>
      {/* Chart Section */}
      <Suspense fallback={<BarLoader width={"100%"} className='mt-4' color='#9333ea' />}>
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* Transaction Table */}
      <Suspense fallback={<BarLoader width={"100%"} className='mt-4' color='#9333ea' />}>
        <TransactionTable transactions={transactions} />
      </Suspense>

    </div>
  )
}

export default Account