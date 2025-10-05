import MainLayout from "@/components/layout/main-layout";

import ProfileHeader from "@/features/profile/components/layout/profile-header";

import { getUser } from "@/queries/getUser";

import { ProfileForm } from "./profile-client";

export default async function ProfilePage() {
	const session = await getUser();

	if (!session?.user) {
		return <div>Loading...</div>;
	}

	return (
		<MainLayout headers={[<ProfileHeader key="profile-header" />]}>
			<ProfileForm user={session.user} />
		</MainLayout>
	);
}
