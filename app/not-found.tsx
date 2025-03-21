import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const NotFound = () => {
  return (
    <div className='flex flex-col items-center justify-center text-center my-32 min-h-[100vh] px-4'>
        <h1 className='text-6xl font-bold gradient-title mb-4'>404</h1>
        <h1 className='text-2xl font-semibold mb-4'>Not Found</h1>
        <p className='text-gray-600 mb-4'>Uh oh! the page you&apos;re 
            looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href={'/'}>
            <Button>Return Home</Button>
        </Link>
    </div>
  )
}

export default NotFound