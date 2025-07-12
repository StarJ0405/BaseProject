"use client";
import P from "@/components/P/P";
import Div from "@/components/div/Div";
import FlexChild from "@/components/flex/FlexChild";
import HorizontalFlex from "@/components/flex/HorizontalFlex";
import VerticalFlex from "@/components/flex/VerticalFlex";
import Icon from "@/components/icons/Icon";
import { useBrowserEvent } from "@/providers/BrowserEventProvider";
import { useNiceModal } from "@/providers/ModalProvider";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./ToastModal.module.css";

const ToastModal = NiceModal.create(
  ({
    message,
    autoClose,
    icon,
    className,
    style,
    messageBoxClassName,
    messageBoxStyle,
    width,
  }: any) => {
    const modal = useModal();
    const { modal: niceModal } = useNiceModal();
    const [time, setTime] = useState(autoClose);
    const [isHover, setHover] = useState(false);
    const { isMobile } = useBrowserEvent();
    const [mounted, setMounted] = useState(false);
    const [disappear, setDisappear] = useState(false);
    const pathname = usePathname();
    const onClose = () => {
      setDisappear(true);
      requestAnimationFrame(() => {
        setTimeout(() => {
          modal.remove();
          setDisappear(false);
        }, 300); // CSS transition 시간과 일치
      });
    };
    useEffect(() => {
      modal.remove();
    }, [pathname]);
    useEffect(() => {
      if (mounted && niceModal) {
        onClose();
      }
    }, [niceModal]);
    useEffect(() => {
      if (!message) modal.remove();
    }, [message]);
    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (mounted && autoClose > 0) {
        if (!isHover) {
          if (time > 0) {
            setTimeout(() => {
              setTime(time - 1);
            }, 1);
          } else {
            onClose();
          }
        }
      }
    }, [mounted, time, isHover]);

    return (
      <Div
        minWidth={isMobile ? "70vw" : "300px"}
        maxWidth={"600px"}
        className={clsx(
          styles.container,
          {
            [styles.mobile]: isMobile,
            [styles.mounted]: mounted,
            [styles.disappear]: disappear,
          },
          className
        )}
        {...style}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <VerticalFlex alignItems="flex-end" position={"relative"}>
          <FlexChild
            cursor={"pointer"}
            width={"max-content"}
            onClick={onClose}
            position={"absolute"}
            top={"-4px"}
            right={"-4px"}
          >
            <Icon size={38} name="closeBtn2x" />
          </FlexChild>
          <HorizontalFlex alignItems="flex-start" justifyContent={"center"}>
            {icon && <FlexChild width={"max-content"}>{icon}</FlexChild>}
            <FlexChild
              justifyContent={"center"}
              className={clsx(
                styles.messageBox,
                { [styles.mobile]: isMobile },
                messageBoxClassName
              )}
              {...messageBoxStyle}
              width={width}
            >
              {typeof message === "string" ? (
                <P
                  width={width}
                  size={16}
                  weight={500}
                  color={"var(--main-color)"}
                  padding={"24px 6px 10px 6px"}
                  wordBreak={"keep-all"}
                  textAlign={"center"}
                >
                  {message}
                </P>
              ) : (
                { message }
              )}
            </FlexChild>
          </HorizontalFlex>
        </VerticalFlex>
      </Div>
    );
  }
);

export default ToastModal;
