'use client';
import { SessionProvider } from 'next-auth/react';
import React from 'react';
import '../styles/global.css';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
	return (
		<html lang='en'>
			<head>
				<meta charSet='UTF-8' />
				<link
					rel='icon'
					type='image/svg+xml'
					href='/vite.svg'
				/>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1.0'
				/>
				<title>Vite + React + TS</title>
			</head>
			<body className='relative flex h-screen bg-gray-100'>
				<SessionProvider>
					<main className='flex flex-col flex-1 p-4'>{children}</main>
				</SessionProvider>
			</body>
		</html>
	);
};

export default RootLayout;
