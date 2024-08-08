import { NextRequest, NextResponse } from 'next/server';
import {
	findUserById,
	createThread,
	getAllThreads,
	getThreadsByUserId,
} from '@/models/threadModel';

export const createNewThread = async (req: NextRequest) => {
	try {
		const { name, created_by } = await req.json();
		console.log('Creating thread with:', { name, created_by });

		const user = await findUserById(created_by);

		if (!user) {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}

		const newThread = await createThread(name, created_by);

		return NextResponse.json({ threadId: newThread.id }, { status: 201 });
	} catch (error) {
		console.error('Error creating new thread:', error);
		return NextResponse.json(
			{ error: 'Failed to create new thread' },
			{ status: 500 }
		);
	}
};

export const fetchThreads = async () => {
	try {
		const threads = await getAllThreads();
		return NextResponse.json({ threads }, { status: 200 });
	} catch (error) {
		console.error('Error fetching threads:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch threads' },
			{ status: 500 }
		);
	}
};

export const fetchThreadsByUserId = async (userId: string) => {
	try {
		const threads = await getThreadsByUserId(userId);
		return NextResponse.json({ threads }, { status: 200 });
	} catch (error) {
		console.error('Error fetching threads for user:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch threads for user' },
			{ status: 500 }
		);
	}
};
