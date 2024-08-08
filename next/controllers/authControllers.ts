import bcrypt from 'bcryptjs';
import { upsertUser, findUserByEmail } from '../models/userModel';
import { NextResponse } from 'next/server';

export const registerUser = async (req: Request) => {
	const { name, email, password } = await req.json();

	if (!name || !email || !password) {
		return NextResponse.json(
			{ message: 'Name, email, and password are required' },
			{ status: 400 }
		);
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	try {
		const user = await upsertUser({
			name,
			email,
			password: hashedPassword,
		});
		return NextResponse.json(user, { status: 201 });
	} catch (error: any) {
		return NextResponse.json(
			{ message: 'Error creating or updating user', error },
			{ status: 500 }
		);
	}
};
