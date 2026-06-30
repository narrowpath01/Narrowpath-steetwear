import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProfileClient from "@/components/profile/ProfileClient"; // We will rename the dashboard to this

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <ProfileClient user={session.user} />;
}