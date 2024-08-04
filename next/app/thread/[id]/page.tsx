'use client';

import Layout from '../../../components/layout';
import { useEffect, useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import ChatWindow from '../../../components/ChatWindow';
import LoadingScreen from '../../../components/LoadingScreen';
import SignUpPage from '../../signup/page';
import { initializeEventSource } from '../../../utils/utils';
import { useParams } from 'next/navigation';

const ThreadPage = () => {
	const { id } = useParams();
	const [isWaiting, setIsWaiting] = useState(false);
	const [status, setStatus] = useState<string | null>(null);

	useEffect(() => {
		const cleanupEventSource = initializeEventSource(
			'http://127.0.0.1:5000/api/updates',
			// @ts-expect-error not sure yet
			(data: { status: string }): void => {
				setStatus(data.status + '...');
			}
		);

		return () => {
			cleanupEventSource();
		};
	}, []);

	return (
		<Layout>
			<Sidebar />
			<main className='flex-1 p-4 flex flex-col'>
				<div className='flex flex-col items-center justify-center h-full w-full relative'>
					<h1 className='text-4xl font-bold text-yellow-500 mb-8'>
						Thread ID: {id}
					</h1>
					<div className='w-full flex flex-col'>
						<ChatWindow
							setIsWaiting={setIsWaiting}
							setStatus={setStatus}
						/>
					</div>
					<p className='text-center text-gray-600 mt-4'>
						Enter your dietary preferences and available ingredients, goals and
						or any useful information to get personalized 7 day meal plan by our
						5 agent team !!!
					</p>
					<p className='text-center text-gray-600 mt-4'>
						Refresh to start a new conversation
					</p>
				</div>
				{isWaiting && <LoadingScreen status={status} />}
			</main>
			<SignUpPage />
		</Layout>
	);
};

export default ThreadPage;
