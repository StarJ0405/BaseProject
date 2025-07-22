import AuthProvider from "./AuthPorivder/AuthPorivder";
import BrowserEventProvider from "./BrowserEventProvider/BrowserEventProvider";
import ModalProvider from "./ModalProvider/ModalProvider";
import ProviderWrapperClient from "./ProviderWrapperClient";
export default async function ProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProviderWrapperClient>
      <BrowserEventProvider>
        <AuthProvider>
          <ModalProvider>
            {/*  */}
            {children}
            {/*  */}
          </ModalProvider>
        </AuthProvider>
      </BrowserEventProvider>
    </ProviderWrapperClient>
  );
}
