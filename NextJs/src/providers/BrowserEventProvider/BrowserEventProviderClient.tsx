"use client";
import { createContext, useContext, useState } from "react";

export const BrowserDetectContext = createContext<{
  deviceType: DeviceType;
  OS: OSType;
  webView: boolean;
  isMobile: boolean;
  isDeskTop: boolean;
  isTablet: boolean;
}>({
  deviceType: "" as DeviceType,
  OS: "" as OSType,
  webView: false,
  isMobile: false,
  isDeskTop: false,
  isTablet: false,
});

const MOBILE_MAX_WIDTH = 768;
const TABLET_MAX_WIDTH = 1024;

export default function BrowserEventProviderClient({
  children,
  initDeviceType,
  initOS,
  initWebView,
}: {
  children: React.ReactNode;
  initDeviceType: DeviceType;
  initOS: OSType;
  initWebView: boolean;
}) {
  const [deviceType] = useState(initDeviceType);
  const [OS] = useState(initOS);
  const [webView] = useState(initWebView);

  return (
    <BrowserDetectContext.Provider
      value={{
        deviceType,
        OS,
        webView,
        isMobile: deviceType === "mobile",
        isDeskTop: deviceType === "desktop",
        isTablet: deviceType === "tablet",
      }}
    >
      {children}
    </BrowserDetectContext.Provider>
  );
}

export const useBrowserEvent = () => useContext(BrowserDetectContext);
