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
	const created_by = req.nextUrl.searchParams.get('created_by');
	console.log(req.nextUrl);
	console.log('userId:', created_by);

	if (created_by) {
		return fetchThreadsByUserId(created_by);
	} else {
		return fetchThreads();
	}
}
