"use client";
import ModalHandler from "@/modals/ModalHandler";
import NiceModal from "@ebay/nice-modal-react";
import { createContext, useContext, useState } from "react";
export const ModalContext = createContext({
  addModal: function () {} as any,
  removeModal: function () {} as any,
  closeAllModal: function () {} as any,
  closeModal: function () {} as any,
  modals: [] as any[],
  modal: {} as object, // 마지막에 열린 모달
});

export default function ModalProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [modals, setModals] = useState<any[]>([]);

  const addModal = (modal: any) => {
    setModals([...modals, modal]);
  };
  const removeModal = (modal: any) => {
    setModals([...modals.filter((f) => f !== modal)]);
  };
  const closeAllModal = () => {
    modals?.forEach((modal) => modal?.remove());
    setModals([]);
  };
  const closeModal = () => {
    const modal = modals?.[modals?.length - 1];
    if (modal) modal?.remove();
  };
  return (
    <ModalContext.Provider
      value={{
        addModal,
        removeModal,
        closeModal,
        closeAllModal,
        modals,
        modal: modals?.[modals?.length - 1],
      }}
    >
      <NiceModal.Provider>
        <ModalHandler />
        {children}
      </NiceModal.Provider>
    </ModalContext.Provider>
  );
}

export const useNiceModal = () => useContext(ModalContext);
