import ToastModal from "@/modals/toast/ToastModal";
import NiceModal from "@ebay/nice-modal-react";
import ConfirmModal from "./confirm/ConfirmModal";
import ContextMenuModal from "./context/ContextMenuModal";

function ModalHandler() {
  NiceModal.register("toast", ToastModal);
  NiceModal.register("confirm", ConfirmModal);
  NiceModal.register("contextMenu", ContextMenuModal);
  return <></>;
}

export default ModalHandler;
