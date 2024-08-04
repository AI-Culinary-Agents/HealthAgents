import { NextRequest } from 'next/server';
import { loginUser } from '@/controllers/authControllers';

export async function POST(req: NextRequest) {
	return loginUser(req);
}
