import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { compare } from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { AUDIT_ACTIONS, createAuditLog } from "@/services/audit-log-service";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email.toLowerCase() } });
        if (!user?.passwordHash || !(await compare(credentials.password, user.passwordHash))) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      await createAuditLog({
        userId: user.id,
        action: AUDIT_ACTIONS.SIGN_IN,
        entityType: "User",
        entityId: user.id,
        metadata: { provider: "auth.js" },
      });
    },
    async signOut({ token }) {
      const userId = token?.userId ?? token?.sub;
      await createAuditLog({
        userId,
        action: AUDIT_ACTIONS.SIGN_OUT,
        entityType: "User",
        entityId: userId,
        metadata: { provider: "auth.js" },
      });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.userId = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? token.sub ?? "";
        session.user.role = token.role ?? "USER";
      }

      return session;
    },
  },
};
