import ModalProviderClient from "./ModalProviderClient";

export default async function ModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ModalProviderClient>{children}</ModalProviderClient>;
}
