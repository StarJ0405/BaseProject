"use client";

import { useNiceModal } from "@/providers/ModalProvider";
import { useModal } from "@ebay/nice-modal-react";
import clsx from "classnames";
import FlexChild from "@/components/flex/FlexChild";
import VerticalFlex from "@/components/flex/VerticalFlex";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import style from "./ModalBase.module.css";
import ModalBaseFooter from "./ModalBaseFooter";
import ModalBaseHeader from "./ModalBaseHeader";
import ModalBaseMain from "./ModalBaseMain";

const ModalBase = forwardRef((props: any, ref) => {
  const { addModal, removeModal } = useNiceModal();
  const modal = useModal();
  const modalContentRef = useRef<any>(null);
  const [maskHeight, setMaskHeight] = useState(
    Math.max(window.innerHeight, document.documentElement.offsetHeight)
  );
  const { padding, borderRadius, headerBackgroundColor } = props;
  const [isClosing, setIsClosing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  // const [close, setClose] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // useEffect(() => {
  //   if (close) modalClose();
  // }, [close]);
  const modalClose = () => {
    if (props.slide || props.slideDown || props.slideLeft) {
      setIsClosing(true);

      // 애니메이션 종료 후 처리
      const modalElement = modalContentRef.current;
      const handleAnimationEnd = () => {
        modalElement?.removeEventListener("animationend", handleAnimationEnd);
        restoreOverlayScroll();
        modal.remove();
        props?.onClose?.();
      };

      modalElement?.addEventListener("animationend", handleAnimationEnd);
    } else {
      restoreOverlayScroll();
      props?.onClose?.();
      modal.remove();
    }
  };

  useEffect(() => {
    if (isMounted) {
      window.history.pushState(
        { modalOpen: true },
        "",
        window.location.pathname
      );
      const _modal = {
        ...modal,
        close: () => {
          if (!props.require) modalClose();
        },
      };
      addModal(_modal);
      return () => removeModal(_modal);
    }
  }, [modal, isMounted]);
  useEffect(() => {
    // preventOverlayScroll();
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
      // if ($(`.${style.mask}`).length === 0) {
      //     restoreOverlayScroll();
      // }
    };
  }, []);
  useEffect(() => {
    preventOverlayScroll();
  }, []);
  const handleWindowSizeChange = () => {
    setMaskHeight(
      Math.max(window.innerHeight, document.documentElement.offsetHeight)
    );
  };
  const preventOverlayScroll = () => {
    document.body.style.cssText = `overflow-y: hidden;`;
  };

  const restoreOverlayScroll = () => {
    document.body.style.cssText = `overflow-y: auto;`;
  };
  useEffect(() => {
    if (!props.preventScroll) {
      preventOverlayScroll();
    }
    return () => {
      restoreOverlayScroll();
    };
  }, []);

  const onClickOutside = (e: any) => {
    if (props.clickOutsideToClose && !isClosing) {
      modalClose();
    }
  };
  const insideClickPropagation = (e: any) => {
    e.stopPropagation();
  };

  const keyFunction = useCallback((event: any) => {
    if (event.keyCode === 27) {
      // modalClose();
    } else {
      if (props.onKeyPress) {
        props.onKeyPress(event);
      }
    }
  }, []);
  const customHeaderStyle = {
    // 관리자 모달헤더 색 바꾸고 싶을때 여기 수정
    backgroundColor: "#3C4B64",
    color: "white",
  };

  useEffect(() => {
    document.addEventListener("keydown", keyFunction);
    return () => {
      document.removeEventListener("keydown", keyFunction);
    };
  }, [keyFunction]);

  useImperativeHandle(ref, () => ({
    close() {
      modalClose();
    },
  }));

  return (
    <div
      className={style.mask}
      style={{ height: maskHeight, zIndex: props.zIndex ?? 10000 }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        style={{
          position: "fixed",
          height: maskHeight,
          // width: window?.screen?.width,
          width: "100vw",
          backgroundColor: props.dimmedBackgroundColor ?? "rgba(0,0,0,0.7)",
        }}
        onClick={onClickOutside}
      ></div>
      <div className={style.wrap} style={{ borderRadius: borderRadius }}>
        <div
          ref={modalContentRef}
          className={clsx(
            props.slideUp || props.slide
              ? style.slideUpModal
              : props.slideLeft
              ? style.slideLeft
              : style.modal,
            {
              [style.modalSlideLeft]: isClosing && props.slideLeft,
              [style.modalSlideDown]: isClosing && props.slideDown,
              [style.topRound]: props.topRound,
              [style.bottomRound]: props.bottomRound,
            }
          )}
          style={{
            width: props.width,
            maxWidth: props.maxWidth,
            maxHeight: props.maxHeight,
            height: props.height,
            minHeight: props.minHeight,
            padding: props.padding,
            borderRadius: props.borderRadius,
            backgroundColor: props.backgroundColor,
            overflow: props.overflow,
            overflowY: props.overflowY,
            overflowX: props.overflowX,
          }}
          onClick={insideClickPropagation}
        >
          <VerticalFlex height={"100%"}>
            {props.withHeader ? (
              <FlexChild height={60}>
                {props.headerRender ? (
                  <div
                    className={clsx(style.header, {
                      [style.admin]: props.admin,
                    })}
                  >
                    {props.headerRender}
                  </div>
                ) : (
                  <ModalBaseHeader
                    // headerStyle={props.headerStyle}
                    headerStyle={props.headerStyle && customHeaderStyle}
                    title={props.title}
                    color={props.color}
                    modalClose={modalClose}
                    closeBtnWhite={props.closeBtnWhite}
                  />
                )}
              </FlexChild>
            ) : null}
            <FlexChild
              height={`calc(100% ${props.withHeader ? "- 50px" : ""} ${
                props.withFooter ? "- 50px" : ""
              })`}
            >
              <ModalBaseMain
                withCloseButton={
                  props.withHeader || props.withFooter
                    ? false
                    : props.withCloseButton
                }
                modalClose={modalClose}
                padding={padding}
              >
                {props.children}
              </ModalBaseMain>
            </FlexChild>

            {props.withFooter ? (
              <FlexChild height={50}>
                {props.footerRender ? (
                  <div className={style.footer}>{props.footerRender}</div>
                ) : (
                  <ModalBaseFooter
                    buttonText={props.buttonText}
                    modalClose={modalClose}
                  />
                )}
              </FlexChild>
            ) : null}
          </VerticalFlex>
        </div>
      </div>
    </div>
  );
});

export default ModalBase;
