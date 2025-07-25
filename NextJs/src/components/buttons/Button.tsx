"use client";
import P from "@/components/P/P";
import { DirectionalStyleInterface } from "@/shared/utils/Interfaces";
import clsx from "clsx";
import { useRef } from "react";
import style from "./Button.module.css";
function Button({
  id,
  className,
  width,
  height,
  border,
  borderTop,
  borderRight,
  borderBottom,
  borderLeft,
  padding,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  margin,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  backgroundColor,
  fontSize,
  fontWeight,
  color,
  borderRadius,
  position,
  top,
  bottom,
  left,
  right,
  disabled,
  onClick,
  onChange,
  onMouseDown,
  type = "button",
  children,
}: ComponentProps<HTMLButtonElement> & {
  type?: "button" | "file";
  disabled?: boolean;
  onChange?: any;
}) {
  const inputRef = useRef<any>(null);
  // 방향성 스타일 속성들을 처리
  const getDirectionalStyles = (): DirectionalStyleInterface => {
    const styles: DirectionalStyleInterface = {};
    // padding 처리
    if (padding || paddingTop || paddingRight || paddingBottom || paddingLeft) {
      if (padding) styles.padding = padding;
      if (paddingTop) styles.paddingTop = paddingTop;
      if (paddingRight) styles.paddingRight = paddingRight;
      if (paddingBottom) styles.paddingBottom = paddingBottom;
      if (paddingLeft) styles.paddingLeft = paddingLeft;
    }

    // margin 처리
    if (margin || marginTop || marginRight || marginBottom || marginLeft) {
      if (margin) styles.margin = margin;
      if (marginTop) styles.marginTop = marginTop;
      if (marginRight) styles.marginRight = marginRight;
      if (marginBottom) styles.marginBottom = marginBottom;
      if (marginLeft) styles.marginLeft = marginLeft;
    }

    // border 처리
    if (border || borderTop || borderRight || borderBottom || borderLeft) {
      if (border) styles.border = border;
      if (borderTop) styles.borderTop = borderTop;
      if (borderRight) styles.borderRight = borderRight;
      if (borderBottom) styles.borderBottom = borderBottom;
      if (borderLeft) styles.borderLeft = borderLeft;
    }

    return styles;
  };
  return (
    <button
      id={id}
      disabled={disabled}
      style={{
        width,
        height,
        backgroundColor,
        border,
        fontSize,
        fontWeight,
        color,
        borderRadius,
        position,
        top,
        bottom,
        left,
        right,
        ...getDirectionalStyles(), // 방향성 스타일 적용
      }}
      onClick={(e) => {
        onClick?.(e);
        inputRef?.current?.click?.();
      }}
      onMouseDown={onMouseDown}
      className={clsx(style.button, className, "notranslate")}
    >
      {type === "file" && (
        <input ref={inputRef} type="file" hidden onChange={onChange} />
      )}
      {typeof children === "string" ? (
        <P fontSize={fontSize} fontWeight={fontWeight} color={color}>
          {children}
        </P>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
