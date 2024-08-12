'use client';

import { GrUserSettings } from 'react-icons/gr';
import { useRouter } from 'next/navigation';
import SignOut from '@/components/auth/SignOut';
const ClientProfile = ({ user }: { user: { name: string; email: string } }) => {
	const router = useRouter();
	const handleGoBack = () => {
		router.back();
	};
	return (
		<div className='flex items-center justify-center min-h-screen bg-gray-100'>
			<div className='flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg w-[50%] max-w-md'>
				<h1 className='mb-8 text-4xl font-bold text-yellow-500'>Profile</h1>
				<button onClick={() => handleGoBack()}>
					<GrUserSettings className='mb-4 text-6xl text-yellow-500' />
				</button>
				<div className='w-full text-left'>
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
	);
};

export default ClientProfile;
