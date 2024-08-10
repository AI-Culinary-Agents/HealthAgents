import { NextRequest } from 'next/server';
import {
	createNewThread,
	fetchThreads,
	fetchThreadsByUserId,
} from '@/controllers/threadController';

export async function POST(req: NextRequest) {
	return createNewThread(req);
}

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const created_by = url.searchParams.get('userId');
	console.log(url);
	console.log('userId:', created_by);

	if (created_by) {
		return fetchThreadsByUserId(created_by);
	} else {
		return fetchThreads();
	}
}
