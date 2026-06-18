import type { ClientSession } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog";
import type { AuditAction, AuditEntityType } from "@/lib/constants";

type AuditLogInput = {
  adminId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  metadata?: Record<string, unknown>;
};

export async function recordAuditLog(
  input: AuditLogInput,
  session?: ClientSession
) {
  await connectDB();

  const payload = {
    adminId: input.adminId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    metadata: input.metadata ?? {}
  };

  if (session) {
    return AuditLog.create([payload], { session });
  }

  return AuditLog.create(payload);
}

