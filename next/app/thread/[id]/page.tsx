import { getUserSession } from '@/lib/session';
import Thread from '@/components/Thread';

export default async function threadPage() {
	const user = await getUserSession();
	console.log(user);
	return (
		<Thread
			user={{
				...user,
				name: user.name ?? '',
				email: user.email ?? '',
				image: user.image ?? '',
				id: user.id ?? '',
			}}
		/>
	);
}
