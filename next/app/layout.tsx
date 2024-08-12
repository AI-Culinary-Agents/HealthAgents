// app/layout.tsx (if using Next.js 13)
'use client';
import { SessionProvider } from 'next-auth/react';
import { ThreadsProvider } from '@/context/threadContext';
import '../styles/global.css'; // Adjust the path as needed

import { ReactNode } from 'react';

const RootLayout = ({
	children,
	session,
}: {
	children: ReactNode;
	session: any;
}) => {
	return (
		<html>
			<body>
				<SessionProvider session={session}>
					<ThreadsProvider>{children}</ThreadsProvider>
				</SessionProvider>
			</body>
		</html>
	);
};

export default RootLayout;
