'use client';
import Layout from '../components/layout';
import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import LoadingScreen from '../components/LoadingScreen';
import SignUpPage from './signup/page';
import { initializeEventSource } from '../Utility/utils';

const HomePage = () => {
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
			<main className='flex flex-col flex-1 p-4'>
				<div className='relative flex flex-col items-center justify-center w-full h-full'>
					<h1 className='mb-8 text-4xl font-bold text-yellow-500'>
						Recipe Agents
					</h1>
					<div className='flex flex-col w-full'>
						<ChatWindow
							setIsWaiting={setIsWaiting}
							setStatus={setStatus}
						/>
					</div>
					<p className='mt-4 text-center text-gray-600'>
						Enter your dietary preferences and available ingredients, goals and
						or any useful information to get personalized 7 day meal plan by our
						5 agent team !!!
					</p>
					<p className='mt-4 text-center text-gray-600'>
						Refresh to start a new conversation
					</p>
				</div>
				{isWaiting && <LoadingScreen status={status} />}
			</main>
			{/* <SignUpPage /> */}
		</Layout>
	);
};

export default HomePage;
