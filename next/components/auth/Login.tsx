'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleLogin } from '@/utils/authHelpers';

const Login = ({ setLoading }: { setLoading: (loading: boolean) => void }) => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const router = useRouter();

	const handleSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		await handleLogin(email, password, router, setLoading);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='flex flex-col w-full mt-4 space-y-4'>
			<input
				type='email'
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder='Email'
				required
				className='p-3 border border-gray-300 rounded-md focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500'
			/>
			<input
				type='password'
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder='Password'
				required
				className='p-3 border border-gray-300 rounded-md focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500'
			/>
			<button
				type='submit'
				className='px-6 py-3 text-white transition-colors duration-300 bg-yellow-500 rounded hover:bg-yellow-700'>
				Submit
			</button>
		</form>
	);
};

export default Login;
