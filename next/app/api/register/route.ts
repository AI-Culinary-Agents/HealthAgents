import { prisma } from './../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

console.log('Register API loaded');

export async function POST(req: NextRequest) {
	console.log('Register handler invoked');

	const { email, password } = await req.json();
	console.log('Received request body:', { email, password });

	if (!email || !password) {
		console.log('Missing email or password');
		return NextResponse.json(
			{ message: 'Email and password are required' },
			{ status: 400 }
		);
	}

	try {
		console.log('Hashing password');
		const hashedPassword = await bcrypt.hash(password, 10);
		console.log('Password hashed:', hashedPassword);

		console.log('Creating user in database');
		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword,
			},
		});

		console.log('User created:', user);
		return NextResponse.json(user, { status: 201 });
	} catch (error) {
		console.error('Error creating user:', error);

		if (
			(error as any).code === 'P2002' &&
			(error as any).meta?.target?.includes('email')
		) {
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
}
