import {
  getDeviceType,
  getOperatingSystem,
  getWebView,
} from "@/shared/utils/Functions";
import { headers } from "next/headers";
import React from "react";
import BrowserEventProviderClient from "./BrowserEventProviderClient";

export default async function BrowserEventProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent");
  const initDeviceType = getDeviceType(userAgent);
  const initOS = getOperatingSystem(userAgent);
  const initWebView = getWebView(userAgent);
  return (
    <BrowserEventProviderClient
      initDeviceType={initDeviceType}
      initOS={initOS}
      initWebView={initWebView}
    >
      {children}
    </BrowserEventProviderClient>
  );
}
