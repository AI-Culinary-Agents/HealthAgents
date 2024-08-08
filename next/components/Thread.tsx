'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import ChatWindow from '@/components/ChatWindow';
import LoadingScreen from '@/components/LoadingScreen';
import { initializeEventSource } from '@/utils/utils';

const Thread = ({ user }: { user: Record<string, string> }) => {
	const { id } = useParams();
	const [isWaiting, setIsWaiting] = useState(false);
	const [status, setStatus] = useState<string | null>(null);
	console.log(user);
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
			<main className='flex flex-col flex-1 p-4'>
				<div className='relative flex flex-col items-center justify-center w-full h-full'>
					<div className='relative flex items-center justify-center w-full mb-8'>
						<h1 className='text-4xl font-bold text-yellow-500'>
							Health Agents
						</h1>
					</div>
					<div className='flex flex-col w-full'>
						<ChatWindow
							userId={user.id}
							currentThread={+id[0]}
							setIsWaiting={setIsWaiting}
							setStatus={setStatus}
						/>
					</div>
					<p className='mt-4 text-center text-gray-600'>
						Enter your dietary preferences and available ingredients, goals
						and/or any useful information to get a personalized 7-day meal plan
						by our 5 agent team!!!
					</p>
					<p className='mt-4 text-center text-gray-600'>
						Refresh to start a new conversation
					</p>
				</div>
				{isWaiting && <LoadingScreen status={status} />}
			</main>
		</Layout>
	);
};

export default Thread;
