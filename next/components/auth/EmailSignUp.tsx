'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleEmailSignUp } from '@/utils/authHelpers';

const EmailSignUp = () => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const handleSubmit = async (e: { preventDefault: () => void }) => {
		e.preventDefault();
		await handleEmailSignUp(name, email, password, router, setLoading);
	};

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='flex flex-col space-y-4'>
			<input
				type='text'
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder='Name'
				required
				className='p-3 border rounded-md'
			/>
			<input
				type='email'
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder='Email'
				required
				className='p-3 border rounded-md'
			/>
			<input
				type='password'
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				placeholder='Password'
				required
				className='p-3 border rounded-md'
			/>
			<button
				type='submit'
				className='px-6 py-3 text-white transition-colors duration-300 bg-green-500 rounded hover:bg-green-700'>
				Sign up with Email
			</button>
		</form>
	);
};

export default EmailSignUp;
