'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import GoogleSignIn from '@/components/auth/GoogleSignIn';
import EmailSignUp from '@/components/auth/EmailSignUp';
import SignOut from '@/components/auth/SignOut';
import Login from '@/components/auth/Login';
import Loader from './Load';
const SignUp = () => {
	const { data: session, status } = useSession();
	const [activeForm, setActiveForm] = useState('signup');

	const handleToggle = (formName: string) => {
		setActiveForm((prevForm) => (prevForm === formName ? '' : formName));
	};

	if (status === 'loading') {
		return (
			<div className='flex items-center justify-center h-screen'>
				<Loader />
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
						<div className='flex justify-center mb-4'>
							<GoogleSignIn />
						</div>
						<div className='flex justify-center space-x-4'>
							<button
								className={`px-6 py-3 text-white transition-colors duration-300 bg-yellow-500 rounded hover:bg-yellow-700 ${
									activeForm === 'signup' ? 'bg-yellow-700' : ''
								}`}
								onClick={() => handleToggle('signup')}>
								Sign up with Email
							</button>
							<button
								className={`px-6 py-3 text-white transition-colors duration-300 bg-yellow-500 rounded hover:bg-yellow-700 ${
									activeForm === 'login' ? 'bg-yellow-700' : ''
								}`}
								onClick={() => handleToggle('login')}>
								Log in with Email
							</button>
						</div>
						{activeForm === 'signup' && <EmailSignUp />}
						{activeForm === 'login' && <Login />}
					</div>
				)}
			</div>
		</div>
	);
};

export default SignUp;
