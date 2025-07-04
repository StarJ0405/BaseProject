import clsx from "clsx";
import { LanguageContext } from "providers/LanguageProvider";
import { useNiceModal } from "providers/ModalProvider";
import { useContext, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useLocation } from "react-router-dom";
import styles from "./Tooltip.module.css";
const Tooltip = ({
  children,
  click = false,
  disable = false,
  hover = true,
  scroll = false,
  content,
  Content,
  cursor,
  textHover,
  zIndex = 10001,
  position = "bottom",
  autoClose = true,
  autoMove = true, // false시 공간이 없어도 그래도 표현
  showClassName,
  width = "max-content",
  preventInnerWheel = false,
  top: _top = 0,
  left: _left = 0,
  right: _right = 0,
  bottom: _bottom = 0,
  delay = 0,
  onClick = () => {},
}) => {
  const { modal } = useNiceModal();
  const location = useLocation();
  const { flagCode } = useContext(LanguageContext);
  const [isMounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const targetRef = useRef(null);
  const tooltipRef = useRef(null);
  const handleOnClick = (e) => {
    if (!disable && click) {
      if (closeRef.current) clearTimeout(closeRef.current);
      // setShow(autoClose || !show);
      if (!show) setShow(true);
      else if (autoClose) setShow(false);
      e.stopPropagation();
    }
  };
  const handleMouseEnter = () => {
    if (!disable && hover && !show) {
      setShow(true);
      clearTimeout(closeRef.current);
    }
  };
  const handleMouseLeave = () => {
    if (autoClose && show) {
      if (closeRef.current) clearTimeout(closeRef.current);
      closeRef.current = setTimeout(() => setShow(false), delay);
    }
  };
  const close = () => {
    if (closeRef.current) clearTimeout(closeRef.current);
    setShow(false);
  };
  const closeRef = useRef();
  const onWheel = (e) => {
    if (
      preventInnerWheel &&
      tooltipRef.current &&
      tooltipRef.current.contains(e.target)
    )
      return;
    close();
  };

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (!show && !tooltipRef.current && !targetRef.current) {
        return;
      }

      const wrapperRect = targetRef?.current?.getBoundingClientRect();
      const tooltipRect = tooltipRef?.current?.getBoundingClientRect();
      if (!wrapperRect || !tooltipRect) return;
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // 마우스가 래퍼 영역 밖으로 벗어났고, 툴팁 영역 밖으로 벗어났을 때 숨김
      if (
        (mouseX < wrapperRect.left ||
          mouseX > wrapperRect.right ||
          mouseY < wrapperRect.top ||
          mouseY > wrapperRect.bottom) &&
        (mouseX < tooltipRect.left ||
          mouseX > tooltipRect.right ||
          mouseY < tooltipRect.top ||
          mouseY > tooltipRect.bottom)
      ) {
        // console.log("close!!");
        if (autoClose) close();
      }
    };
    const handleMouseClick = (event) => {
      if (!show && !tooltipRef.current && !targetRef.current) {
        return;
      }

      const wrapperRect = targetRef?.current?.getBoundingClientRect();
      const tooltipRect = tooltipRef?.current?.getBoundingClientRect();
      if (!wrapperRect || !tooltipRect) return;
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      // 마우스가 래퍼 영역 밖으로 벗어났고, 툴팁 영역 밖으로 벗어났을 때 숨김
      if (
        (mouseX < wrapperRect.left ||
          mouseX > wrapperRect.right ||
          mouseY < wrapperRect.top ||
          mouseY > wrapperRect.bottom) &&
        (mouseX < tooltipRect.left ||
          mouseX > tooltipRect.right ||
          mouseY < tooltipRect.top ||
          mouseY > tooltipRect.bottom)
      ) {
        // console.log("close!!");
        close();
      }
    };
    if (show) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("click", handleMouseClick);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleMouseClick);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleMouseClick);
    };
  }, [show]);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (isMounted) close();
  }, [location, modal, flagCode]);
  useEffect(() => {
    if (!scroll) window.addEventListener("wheel", onWheel);
    return () => window.removeEventListener("wheel", onWheel);
  }, [scroll]);
  useEffect(() => {
    if (show && tooltipRef.current && targetRef.current) {
      const targetRect = targetRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      const scrollY = Math.max(
        Math.min(
          window.scrollY || window.pageYOffset,
          document.body.offsetHeight - window.innerHeight
        ),
        0
      );
      const scrollX = Math.max(
        Math.min(
          window.scrollX || window.pageXOffset,
          document.body.offsetWidth - window.innerWidth
        ),
        0
      );
      let top = targetRect.top + scrollY;
      let left = targetRect.left + scrollX;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      switch (position) {
        case "top":
          // left += targetRect.width / 2 - tooltipRect.width / 2;
          if (
            autoMove &&
            top - tooltipRect.height - scrollY < 0 &&
            top + tooltipRect.height + targetRect.height - scrollY <
              windowHeight
          ) {
            top += targetRect.height;
          } else {
            top -= tooltipRect.height;
          }
          // 좌우 추가 조절
          if (
            autoMove &&
            left - tooltipRect.width - scrollX < 0 &&
            left + targetRect.width + tooltipRect.width - scrollX < windowWidth
          ) {
            left += targetRect.width;
          } else if (
            autoMove &&
            left - tooltipRect.width - scrollX > 0 &&
            left + targetRect.width + tooltipRect.width - scrollX > windowWidth
          ) {
            left -= tooltipRect.width;
          }
          break;
        case "top_center":
          left += targetRect.width / 2 - tooltipRect.width / 2;
          if (
            autoMove &&
            top - tooltipRect.height - scrollY < 0 &&
            top + tooltipRect.height + targetRect.height - scrollY <
              windowHeight
          ) {
            top += targetRect.height;
          } else {
            top -= tooltipRect.height;
          }
          // 좌우 추가 조절
          if (
            autoMove &&
            left - tooltipRect.width - scrollX < 0 &&
            left + targetRect.width + tooltipRect.width - scrollX < windowWidth
          ) {
            left += targetRect.width;
          } else if (
            autoMove &&
            left - tooltipRect.width - scrollX > 0 &&
            left + targetRect.width + tooltipRect.width - scrollX > windowWidth
          ) {
            left -= tooltipRect.width;
          }
          break;
        case "left":
          // top += targetRect.height / 2 - tooltipRect.height / 2;
          if (
            autoMove &&
            left - tooltipRect.width - scrollX < 0 &&
            left + targetRect.width + tooltipRect.width - scrollX < windowWidth
          ) {
            left += targetRect.width;
          } else {
            left -= tooltipRect.width;
          }
          // 높낮이 추가 조절
          if (
            autoMove &&
            top - tooltipRect.height - scrollY > 0 &&
            top + tooltipRect.height + targetRect.height - scrollY >
              windowHeight
          ) {
            top -= tooltipRect.height;
          } else if (
            autoMove &&
            top - tooltipRect.height - scrollY < 0 &&
            top + tooltipRect.height + targetRect.height - scrollY <
              windowHeight
          ) {
            top += targetRect.height;
          }
          break;
        case "right":
          // top += targetRect.height / 2 - tooltipRect.height / 2;
          if (
            autoMove &&
            left - tooltipRect.width - scrollX > 0 &&
            left + targetRect.width + tooltipRect.width - scrollX > windowWidth
          ) {
            left -= tooltipRect.width;
          } else {
            left += targetRect.width;
          }
          // 높낮이 추가 조절
          if (
            autoMove &&
            top - tooltipRect.height - scrollY > 0 &&
            top + tooltipRect.height + targetRect.height - scrollY >
              windowHeight
          ) {
            top -= tooltipRect.height;
          } else if (
            autoMove &&
            top - tooltipRect.height - scrollY < 0 &&
            top + tooltipRect.height + targetRect.height - scrollY <
              windowHeight
          ) {
            top += targetRect.height;
          }
          break;
        default:
        case "bottom":
          // left += targetRect.width / 2 - tooltipRect.width / 2;
          if (
            autoMove &&
            top - tooltipRect.height - scrollY > 0 &&
            top + tooltipRect.height + targetRect.height - scrollY >
              windowHeight
          ) {
            top -= tooltipRect.height;
          } else {
            top += targetRect.height;
          }
          // 좌우 추가 조절
          if (
            autoMove &&
            left - tooltipRect.width - scrollX < 0 &&
            left + targetRect.width + tooltipRect.width - scrollX < windowWidth
          ) {
            left += targetRect.width;
          } else if (
            autoMove &&
            left - tooltipRect.width - scrollX > 0 &&
            left + targetRect.width + tooltipRect.width - scrollX > windowWidth
          ) {
            left -= tooltipRect.width;
          }
          break;
        case "bottom_center":
          left += targetRect.width / 2 - tooltipRect.width / 2;
          if (
            autoMove &&
            top - tooltipRect.height - scrollY > 0 &&
            top + tooltipRect.height + targetRect.height - scrollY >
              windowHeight
          ) {
            top -= tooltipRect.height;
          } else {
            top += targetRect.height;
          }
          // 좌우 추가 조절
          if (
            autoMove &&
            left - tooltipRect.width - scrollX < 0 &&
            left + targetRect.width + tooltipRect.width - scrollX < windowWidth
          ) {
            // 우
            left += targetRect.width;
          } else if (
            autoMove &&
            left - tooltipRect.width - scrollX > 0 &&
            left + tooltipRect.width - scrollX > windowWidth
          ) {
            // 좌
            left -= -windowWidth + (left + tooltipRect.width - scrollX);
          }
          break;
      }

      // tooltipRef.current.style.top = `${top + _top - _bottom}px`;
      // tooltipRef.current.style.left = `${left + _right - _left}px`;
      tooltipRef.current.style.top = `calc(${top}px + ${
        typeof _top === "number" ? `${_top}px` : _top
      } - ${typeof _bottom === "number" ? `${_bottom}px` : _bottom})`;
      tooltipRef.current.style.left = `calc(${left}px + ${
        typeof _right === "number" ? `${_right}px` : _right
      } - ${typeof _left === "number" ? `${_left}px` : _left})`;
    }
  }, [show, position, autoMove]);
  const style =
    typeof content === "string" || typeof content === "number"
      ? {
          backgroundColor: "white",
          color: "black",
          border: "1px solid black",
          padding: "5px 10px",
          borderRadius: "5px",
        }
      : {};
  const tooltipContent = (
    <div
      ref={tooltipRef}
      style={{
        position: "absolute",
        width: "max-content",
        zIndex: zIndex, // 다른 요소 위에 표시되도록 z-index 설정
        cursor: cursor && "pointer",
        ...style,
      }}
      className={clsx({ [styles.textHover]: textHover })}
      onClick={onClick}
    >
      {typeof Content === "function" && <Content close={close} />}
      {content}
    </div>
  );

  return (
    <div
      ref={targetRef}
      onClick={handleOnClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={clsx({ [showClassName]: show })}
      style={{ display: "inline-block", width: width }} // Tooltip 대상 요소의 display 속성 설정
    >
      {children}
      {show &&
        close &&
        (content || Content) &&
        ReactDOM.createPortal(tooltipContent, document.body)}
    </div>
  );
};

export default Tooltip;
