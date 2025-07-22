import { requester } from "@/shared/Requester";
import AuthProviderClient from "./AuthPorivderClient";

export default async function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initCustomerData = await requester.getCurrentUser();

  return (
    <AuthProviderClient initCustomerData={initCustomerData}>
      {children}
    </AuthProviderClient>
  );
}
export const useAuth = async () => await requester.getCurrentUser();
