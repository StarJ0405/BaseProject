"use client";
import { createContext, useContext, useState } from "react";

export const ModalContext = createContext({
  addModal: function () {} as any,
  removeModal: function () {} as any,
  closeAllModal: function () {} as any,
  closeModal: function () {} as any,
  modals: [] as any[],
  modal: {} as object, // 마지막에 열린 모달
});

export default function ModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [modals, setModals] = useState<any[]>([]);

  const addModal = (modal: any) => {
    // console.log("try to add", modals);
    // const added = [...modals, modal];
    // console.log("added : ", added);
    // setModals(added);

    setModals([...modals, modal]);
  };
  const removeModal = (modal: any) => {
    // const removed = [...modals.filter((f) => f !== modal)];
    // console.log("removed : ", removed);
    // setModals(removed);

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
      {children}
    </ModalContext.Provider>
  );
}

export const useNiceModal = () => useContext(ModalContext);
