import bcrypt from 'bcryptjs';
import { createUser, findUserByEmail } from '../models/userModel';
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
		const user = await createUser({
			name,
			email,
			password: hashedPassword,
		});
		return NextResponse.json(user, { status: 201 });
	} catch (error: any) {
		if (error.code === 'P2002' && error.meta.target.includes('email')) {
			return NextResponse.json(
				{ message: 'Email already exists' },
				{ status: 409 }
			);
		}
		return NextResponse.json(
			{ message: 'Error creating user', error },
			{ status: 500 }
		);
	}
};

export const loginUser = async (req: Request) => {
	const { email, password } = await req.json();

	if (!email || !password) {
		return NextResponse.json(
			{ message: 'Email and password are required' },
			{ status: 400 }
		);
	}

	const user = await findUserByEmail(email);

	if (!user) {
		return NextResponse.json({ message: 'User not found' }, { status: 404 });
	}

	const isMatch = user.password
		? await bcrypt.compare(password, user.password)
		: false;

	if (!isMatch) {
		return NextResponse.json(
			{ message: 'Invalid credentials' },
			{ status: 401 }
		);
	}

	// Optionally, you might want to create a session or token here

	return NextResponse.json(user, { status: 200 });
};
