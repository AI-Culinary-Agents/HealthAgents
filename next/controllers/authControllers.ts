import bcrypt from 'bcryptjs';
import { findUserByEmail } from '@/models/userModel';
import { NextResponse, NextRequest } from 'next/server';

export const loginUser = async (req: NextRequest) => {
	const { email, password } = await req.json();

	if (!email || !password) {
		return NextResponse.json(
			{ message: 'Email and password are required' },
			{ status: 400 }
		);
	}

	try {
		const user = await findUserByEmail(email);

		if (!user || !user.password) {
			return NextResponse.json(
				{ message: 'Invalid email or password' },
				{ status: 401 }
			);
		}

		const isValidPassword = await bcrypt.compare(password, user.password);

		if (!isValidPassword) {
			return NextResponse.json(
				{ message: 'Invalid email or password' },
				{ status: 401 }
			);
		}

		// If you need to create a session or JWT, you can do that here
		// For example:
		// const token = createJWT(user);
		// return NextResponse.json({ token });

		return NextResponse.json(user, { status: 200 });
	} catch (error: any) {
		return NextResponse.json(
			{ message: 'Error logging in user', error },
			{ status: 500 }
		);
	}
};
