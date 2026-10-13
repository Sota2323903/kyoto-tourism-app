import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  if (!["ADMIN", "SUPER_ADMIN"].includes(session?.user.role ?? "")) {
    redirect("/auth/signin?callbackUrl=%2Fadmin%2Fspots");
  }

  return children;
}
