import { requester } from "@/shared/Requester";
import { SearchParams } from "next/dist/server/request/search-params";
import Login from "./login";

export default async function ({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { appid, redirect_uri, state } = await searchParams;

  const response: any = await requester.isConnectExist({ appid, redirect_uri });
  if (response?.error) {
    return <p>{response.error}</p>;
  }
  return <Login />;
}
