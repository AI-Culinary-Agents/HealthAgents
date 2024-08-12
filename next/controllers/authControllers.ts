import bcrypt from 'bcryptjs';
import { upsertUser, findUserByEmail } from '@/models/userModel';
import { NextResponse, NextRequest } from 'next/server';

export const registerUser = async (req: NextRequest) => {
	try {
		const { email, password, name } = await req.json();

		if (!email || !password) {
			return NextResponse.json(
				{ message: 'Email and password are required' },
				{ status: 400 }
			);
		}

		// Check if the user already exists
		const existingUser = await findUserByEmail(email);

		if (existingUser) {
			return NextResponse.json(
				{ message: 'User already exists' },
				{ status: 400 }
			);
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create the user data object
		const userData = {
			email,
			password: hashedPassword,
			name,
			createdAt: new Date(),
			updatedAt: new Date(),
		};

		// Upsert the user (create or update)
		const user = await upsertUser(userData);

		return NextResponse.json(user, { status: 201 });
	} catch (error: any) {
		return NextResponse.json(
			{ message: 'Error registering user', error: error.message },
			{ status: 500 }
		);
	}
};

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
