import { createContext, useContext, useState } from "react";

export const ModalContext = createContext({
  addModal: (modal) => {},
  removeModal: (modal) => {},
  closeAllModal: () => {},
  closeModal: () => {},
  modals: [],
  modal: {}, // 마지막에 열린 모달
});

function ModalProvider({ children }) {
  const [modals, setModals] = useState([]);

  const addModal = (modal) => {
    // console.log("try to add", modals);
    // const added = [...modals, modal];
    // console.log("added : ", added);
    // setModals(added);

    setModals([...modals, modal]);
  };
  const removeModal = (modal) => {
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

export default ModalProvider;
export const useNiceModal = () => useContext(ModalContext);
