'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import GoogleSignIn from '@/components/auth/GoogleSignIn';
import EmailSignUp from '@/components/auth/EmailSignUp';
import SignOut from '@/components/auth/SignOut';

const SignUp = () => {
	const { data: session, status } = useSession();

	if (status === 'loading') {
		return (
			<div className='flex items-center justify-center h-screen'>
				Loading...
			</div>
		);
	}

	return (
		<div className='flex flex-col items-center justify-center min-h-screen py-8 bg-gray-50'>
			<div className='w-full max-w-md p-8 bg-white rounded-lg shadow-lg'>
				<h1 className='mb-6 text-2xl font-bold text-center'>Sign Up</h1>
				{session ? (
					<div className='flex flex-col items-center'>
						{session.user?.image && (
							<Image
								src={session.user?.image}
								alt='Profile Picture'
								width={100}
								height={100}
								className='rounded-full'
							/>
						)}
						<p className='mt-4 text-lg'>Signed in as {session.user?.email}</p>
						<SignOut />
					</div>
				) : (
					<div className='space-y-4'>
						<div className='flex justify-center'>
							<GoogleSignIn />
						</div>
						<EmailSignUp />
					</div>
				)}
			</div>
		</div>
	);
};

export default SignUp;
