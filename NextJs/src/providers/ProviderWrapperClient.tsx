"use client";

import { CookiesProvider } from "react-cookie";

export default function ProviderWrapperClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CookiesProvider>{children}</CookiesProvider>;
}
