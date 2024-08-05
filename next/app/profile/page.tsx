import React from 'react';
import { getUserSession } from '@/lib/session';
import { GrUserSettings } from 'react-icons/gr';
import SignOut from '@/components/auth/SignOut';
import Link from 'next/link';
export default async function ProfilePage() {
	const user = await getUserSession();
	console.log(user);
	return (
		<div className='flex flex-col flex-1 p-4'>
			<div className='flex flex-col items-center justify-center w-full h-full'>
				<h1 className='mb-8 text-4xl font-bold text-yellow-500'>Profile</h1>
				<div className='flex flex-col items-center p-6 bg-white rounded-lg shadow-lg w-[50%]'>
					<Link href={'/'}>
						<button>
							<GrUserSettings className='mb-4 text-6xl text-yellow-500' />
						</button>
					</Link>
					<div className='text-left'>
						<div className='mb-4'>
							<span className='block font-bold text-gray-600'>Name:</span>
							<span className='block text-gray-800'>{user.name}</span>
						</div>
						<div className='mb-4'>
							<span className='block font-bold text-gray-600'>Email:</span>
							<span className='block text-gray-800'>{user.email}</span>
						</div>
						<div className='flex justify-center mb-4'>
							<SignOut />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
