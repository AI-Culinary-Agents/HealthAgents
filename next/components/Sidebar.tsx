'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useThreads } from '@/context/threadContext';
import { AiOutlineArrowLeft } from 'react-icons/ai';
import axios from 'axios';

const Sidebar = () => {
	const router = useRouter();
	const { data: session } = useSession();
	const { threads, setThreads } = useThreads();
	const [newThreadName, setNewThreadName] = useState('');
	const pathname = usePathname();
	console.log(session);
	const handleAddThread = async () => {
		if (newThreadName.trim() !== '' && session?.user?.id) {
			try {
				const response = await axios.post('/api/threads', {
					name: newThreadName,
					created_by: session.user.id, // Use session user id directly
				});
				const newThreadId = response.data.threadId;
				console.log('New thread ID:', newThreadId);
				setThreads((prevThreads: any) => [
					...prevThreads,
					{ id: newThreadId, name: newThreadName },
				]);
				setNewThreadName('');
				router.push(`/thread/${newThreadId}`);
			} catch (error) {
				console.error('Error creating new thread:', error);
			}
		}
	};
	return (
		<aside className='flex flex-col w-64 p-4 text-white bg-gray-800'>
			<h2 className='mb-4 text-2xl font-bold'>Threads</h2>
			<ul>
				{threads.map((thread: { id: string; name: string }) => {
					const isActive = pathname === `/thread/${thread.id}`; // Check if the thread is active

					return (
						<ol
							key={thread.id}
							className={`mb-2 flex items-center`}>
							<Link href={`/thread/${thread.id}`}>
								<li
									className={`cursor-pointer hover:underline ${
										isActive ? 'font-bold' : ''
									}`}>
									{thread.name}
								</li>
							</Link>
							{isActive && (
								<span className='ml-2 text-yellow-500'>
									<AiOutlineArrowLeft size={20} />
								</span>
							)}
						</ol>
					);
				})}
				<li className='mt-4'>
					<input
						type='text'
						value={newThreadName}
						onChange={(e) => setNewThreadName(e.target.value)}
						placeholder='New thread name'
						className='w-full p-2 mb-2 text-gray-700 rounded'
					/>
					<button
						onClick={handleAddThread}
						className='w-full px-4 py-2 font-bold text-white bg-yellow-500 rounded'>
						+ Add Thread
					</button>
				</li>
			</ul>
		</aside>
	);
};

export default Sidebar;
