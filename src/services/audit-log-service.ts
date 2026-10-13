import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export const AUDIT_ACTIONS = {
  SIGN_IN: "auth.sign_in",
  SIGN_OUT: "auth.sign_out",
  ADMIN_ACCESS_DENIED: "admin.access_denied",
  ADMIN_OPERATION: "admin.operation",
} as const;

export type CreateAuditLogInput = {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function createAuditLog(input: CreateAuditLogInput) {
  if (!input.action.trim() || !input.entityType.trim()) {
    throw new Error("Audit log action and entityType are required.");
  }

  return prisma.auditLog.create({
    data: {
      ...input,
      action: input.action.trim(),
      entityType: input.entityType.trim(),
    },
  });
}
