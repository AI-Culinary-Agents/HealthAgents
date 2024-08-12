import { NextRequest } from 'next/server';
import { registerUser } from '@/controllers/authControllers';

export async function POST(req: NextRequest) {
	return registerUser(req);
}
