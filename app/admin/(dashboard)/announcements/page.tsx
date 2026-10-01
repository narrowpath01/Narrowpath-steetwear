import React from "react";
import prisma from "@/lib/db";
import { AnnouncementManagerClient } from "@/components/admin/AnnouncementManagerClient";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return <AnnouncementManagerClient initialAnnouncements={announcements} />;
}
