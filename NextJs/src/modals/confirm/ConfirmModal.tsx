import P from "@/components/P/P";
import FlexChild from "@/components/flex/FlexChild";
import HorizontalFlex from "@/components/flex/HorizontalFlex";
import VerticalFlex from "@/components/flex/VerticalFlex";
import LoadingSpinner from "@/components/loading/LoadingSpinner";
import NiceModal from "@ebay/nice-modal-react";
import ModalBase from "../ModalBase";
import { useBrowserEvent } from "@/providers/BrowserEventProvider";
import { useRef, useState } from "react";
import style from "./ConfirmModal.module.css";

const ConfirmModal = NiceModal.create(
  ({
    onConfirm,
    onCancel,
    message,
    cancelText,
    confirmText,
    loading = true,
  }: any) => {
    const [withHeader, withFooter] = [false, false];
    const [width, height] = ["min(80%, 400px)", "auto"];
    const withCloseButton = false;
    const clickOutsideToClose = true;
    const title = "";
    const buttonText = "close";

    const modal = useRef<any>(null);
    const [isBlocked, setIsBlocked] = useState(false);
    const { isMobile } = useBrowserEvent();

    const onConfirmClick = async () => {
      if (isBlocked) return;
      setIsBlocked(true);
      if (onConfirm) {
        let isAsyncFn =
          onConfirm.constructor.name === "AsyncFunction" ? true : false;
        if (isAsyncFn) {
          await onConfirm();
          modal.current.close();
        } else {
          onConfirm();
          modal.current.close();
        }
      } else {
        modal.current.close();
      }
      setIsBlocked(false);
    };

    const onCancelClick = () => {
      if (onCancel) {
        onCancel();
        // modalClose();
      }
      modal.current.close();
    };

    return (
      <ModalBase
        zIndex={10055}
        ref={modal}
        width={width}
        height={height}
        withHeader={withHeader}
        withFooter={withFooter}
        withCloseButton={withCloseButton}
        clickOutsideToClose={clickOutsideToClose}
        title={title}
        buttonText={buttonText}
        borderRadius={6}
      >
        <FlexChild padding={"50px 24px 24px 24px"} height="100%">
          <VerticalFlex gap={40} height={"100%"}>
            <FlexChild>
              <P
                width="100%"
                textAlign="center"
                size={isMobile ? 16 : 18}
                color={"#494949"}
                weight={600}
              >
                {message}
              </P>
            </FlexChild>
            <FlexChild>
              <HorizontalFlex justifyContent={"center"}>
                {cancelText && (
                  <FlexChild height={48} padding={3}>
                    <div
                      className={`${style.confirmButton} ${style.white}`}
                      onClick={onCancelClick}
                    >
                      <P
                        size={16}
                        textAlign="center"
                        color={"var(--main-color)"}
                      >
                        {cancelText}
                      </P>
                    </div>
                  </FlexChild>
                )}
                <FlexChild height={48} padding={3}>
                  <div
                    className={`${style.confirmButton} ${style.red}`}
                    onClick={onConfirmClick}
                  >
                    {loading && (
                      <FlexChild
                        position={"absolute"}
                        justifyContent={"center"}
                        hidden={!isBlocked}
                      >
                        <LoadingSpinner />
                      </FlexChild>
                    )}
                    <P size={16} textAlign="center" color={"#ffffff"}>
                      {confirmText}
                    </P>
                  </div>
                </FlexChild>
              </HorizontalFlex>
            </FlexChild>
          </VerticalFlex>
        </FlexChild>
      </ModalBase>
    );
  }
);

export default ConfirmModal;
