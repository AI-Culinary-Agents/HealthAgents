import { NextRequest } from 'next/server';
import {
	handleCreateMessage,
	handleGetMessagesByThread,
} from '@/controllers/messageControllers';

export async function POST(req: NextRequest) {
	return handleCreateMessage(req);
}

export async function GET(req: NextRequest) {
	return handleGetMessagesByThread(req);
}
