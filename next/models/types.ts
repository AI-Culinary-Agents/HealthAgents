export interface User {
	// id: string;
	name: string;
	email: string;
	password: string;
}

export interface UserMessage {
	id: number;
	threadId: string;
	userId: string;
	message: string;
}
