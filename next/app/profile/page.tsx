import { getUserSession } from '@/lib/session';
import ClientProfile from '@/components/clientProfile';

export default async function ProfilePage() {
	const user = await getUserSession();
	console.log(user);
	return (
		<ClientProfile
			user={{ ...user, name: user.name ?? '', email: user.email ?? '' }}
		/>
	);
}
