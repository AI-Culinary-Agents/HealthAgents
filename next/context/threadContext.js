'use client';
// context/threadContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react';
const ThreadsContext = createContext();
export const useThreads = () => {
	return useContext(ThreadsContext);
};

export const ThreadsProvider = ({ children }) => {
	const { data: session } = useSession();
	const [threads, setThreads] = useState([]);

	useEffect(() => {
		if (session?.user?.id) {
			const fetchThreads = async () => {
				try {
					const response = await axios.get(
						`/api/threads?userId=${session.user.id}`
					);
					setThreads(response.data.threads);
				} catch (error) {
					console.error('Error fetching threads:', error);
				}
			};
			fetchThreads();
		}
	}, [session]);

	return (
		<ThreadsContext.Provider value={{ threads, setThreads }}>
			{children}
		</ThreadsContext.Provider>
	);
};
