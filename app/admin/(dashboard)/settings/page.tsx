import React from "react";
import prisma from "@/lib/db";
import { StoreSettingsClient } from "@/components/admin/StoreSettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settingsList = await prisma.storeSetting.findMany();
  const settingsMap: Record<string, string> = {};
  settingsList.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return <StoreSettingsClient initialSettings={settingsMap} />;
}
