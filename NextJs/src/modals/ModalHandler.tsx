import ConfirmModal from "@/modals/confirm/ConfirmModal";
import ContextMenuModal from "@/modals/context/ContextMenuModal";
import ToastModal from "@/modals/toast/ToastModal";
import NiceModal from "@ebay/nice-modal-react";

function ModalHandler() {
  NiceModal.register("toast", ToastModal);
  NiceModal.register("confirm", ConfirmModal);
  NiceModal.register("contextMenu", ContextMenuModal);
  return <></>;
}

export default ModalHandler;
