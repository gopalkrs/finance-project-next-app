import { getUserAccounts } from '@/actions/dashboard'
import { getAccountBudget } from '@/actions/budget'
import CreateAccountDrawer from '@/components/CreateAccoutDrawer'
import { Card, CardContent } from '@/components/ui/card'
import { Plus } from 'lucide-react'
import React from 'react'
import AccountCard from './_components/AccountsCard'
import BudgetProgress from './_components/BudgetProgress'


const DashboardPage = async () => {

  const userAccounts = await getUserAccounts();

  const defaultAccount = userAccounts?.find((account) => account.isDefault);

  let budgetData = null;
  if(defaultAccount){
    budgetData = await getAccountBudget(defaultAccount.id);
  }

  return (

    <div className='space-y-8'>
      {/* Budget progress */}
      {
        defaultAccount && 
        <BudgetProgress 
          initialBudget = {budgetData?.budget} 
          currentExpenses = {budgetData.currentExpenses || 0} 
        />
      }

      {/* overview */}

      {/* Accounts Grid */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <CreateAccountDrawer>
          <Card className='hover:shadow-md transition-shadow border-dashed cursor-pointer'>
            <CardContent className='flex flex-col items-center justify-center pt-5 h-full text-muted-foreground'>
              <Plus className='h-10 w-10 mb-2' />
              <p className='text-sm font-medium'>Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {userAccounts.map((account)=>{
          return <AccountCard key={account.id} account={account}/>
        })

        }
      </div>
    </div>
  )
}

export default DashboardPage