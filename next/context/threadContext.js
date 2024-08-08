'use client';
// context/threadContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ThreadsContext = createContext();

export const useThreads = () => {
	return useContext(ThreadsContext);
};

export const ThreadsProvider = ({ children }) => {
	const [threads, setThreads] = useState([]);

	useEffect(() => {
		const fetchThreads = async () => {
			try {
				const response = await axios.get('/api/threads');
				setThreads(response.data.threads);
			} catch (error) {
				console.error('Error fetching threads:', error);
			}
		};
		fetchThreads();
	}, []);

	return (
		<ThreadsContext.Provider value={{ threads, setThreads }}>
			{children}
		</ThreadsContext.Provider>
	);
};
