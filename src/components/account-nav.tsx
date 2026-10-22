import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AccountMenu } from "@/components/account-menu";

export async function AccountNav({ language = "ja", callbackUrl = "/" }: { language?: string; callbackUrl?: string }) {
  const session = await getServerSession(authOptions);
  return <AccountMenu email={session?.user?.email} role={session?.user?.role} language={language} callbackUrl={callbackUrl} />;
}
