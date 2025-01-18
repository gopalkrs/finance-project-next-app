import Link from 'next/link';
import React from 'react'
import { Button } from './ui/button';
import Image from 'next/image';


const MainSection = () => {
  return (
    <div className='pb-20 px-4'>
        <div className='container mx-auto text-center'>
            <h1 className='text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title'>
                Manage your Finances <br/> with Intelligence
            </h1>
            <p className='text-gray-600 max-w-2xl mx-auto mb-8'>
                An AI-powered financial management pltform that helps you track, analyze and optimize
                your spending with real-time insights.
            </p>
            <div className='flex justify-center space-x-4 mb-8'>
                <Link href={'/dashboard'}>
                    <Button size={'lg'} className='px-8'>Get Started</Button>
                </Link>
                <Link  href={'/'}>
                    <Button size={'lg'} variant={'outline'} className='px-8'>Watch Demo</Button>
                </Link>
            </div>
            <div>
                <div>
                    <Image 
                        src={'/banner.jpeg'} 
                        width={1280}
                        height={720}
                        alt='dashboard-preview'
                        className='rounded-lg shadow-2xl mx-auto border'
                        priority
                    />
                </div>
            </div>
        </div>
    </div>
  )
}

export default MainSection;