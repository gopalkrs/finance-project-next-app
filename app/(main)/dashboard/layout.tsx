import React, { Suspense } from 'react';
import { BarLoader } from "react-spinners"
import DashboardPage from './page';

const DashboardLayout = () => {
  return (
    <div className='px-5'>
        <h1 className='font-bold gradient-title text-6xl mb-4'>Dashboard</h1>

        {/* Dashboard Page */}
        <Suspense fallback={<BarLoader className='mt-4' width='100%' color='#000' />}>
            <DashboardPage />
        </Suspense>
    </div>
  )
}

export default DashboardLayout;