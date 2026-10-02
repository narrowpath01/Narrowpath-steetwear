import React from "react";
import prisma from "@/lib/db";
import { AuditLogsClient } from "@/components/admin/AuditLogsClient";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <AuditLogsClient
      initialLogs={logs.map((l) => ({
        id: l.id,
        adminEmail: l.adminEmail,
        action: l.action,
        resourceType: l.resourceType,
        resourceId: l.resourceId,
        details: l.details,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt,
      }))}
    />
  );
}
