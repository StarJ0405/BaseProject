"use client";
import { DirectionalStyleInterface } from "@/shared/utils/Interfaces";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import style from "./Span.module.css";

function Span({
  hidden,
  weight,
  font,
  size,
  fontSize: props_fontSize,
  i,
  min,
  max,
  color,
  fontStyle,
  textDecoration,
  textAlign,
  selected, // 선택 상태 유지 여부
  enableHover, // hover 기능 사용 여부
  textHover,
  id,
  Ref,
  ellipsis = false,
  className,
  width,
  minWidth,
  maxWidth,
  fontWeight,
  fontFamily,
  textIndent,
  verticalAlign,
  whiteSpace,
  padding,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  margin = "0",
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  backgroundColor,
  border,
  borderTop,
  borderRight,
  borderBottom,
  borderLeft,
  borderRadius,
  cursor,
  lineHeight,
  height,
  maxHeight,
  minHeight,
  letterSpacing,
  wordBreak,
  overflow,
  overflowWrap,
  textOverflow,
  onMouseDown,
  position,
  textDecorationLine,
  top,
  right,
  bottom,
  left,
  display,
  alignItems,
  justifyContent,
  dangerouslySetInnerHTML,
  onClick,
  onMouseEnter,
  onContextMenu,
  rawText = false,
  notranslate = false,
  maximumFractionDigits = 0,
  lineClamp,
  children,
}: any) {
  const { t } = useTranslation();

  let fontSize = size || props_fontSize || "inherit";
  if (min) {
    fontSize = `max(${fontSize}, ${min})`;
  }
  if (max) {
    fontSize = `min(${fontSize}, ${max})`;
  }
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
    } else {
      styles.border = "none";
    }

    return styles;
  };
  return (
    <span
      id={id}
      ref={Ref}
      className={clsx(
        style.paragraph,
        { [style.ellipsis]: ellipsis === true },
        { [style.selected]: selected === true },
        { [style.hoverEnabled]: enableHover === true && !selected },
        { [style.textHover]: textHover === true },

        className,
        "notranslate"
      )}
      hidden={hidden}
      style={{
        width: width,
        minWidth,
        maxWidth,
        fontWeight: weight || fontWeight || "inherit",
        fontFamily: font || fontFamily,
        fontSize: fontSize || "inherit",
        fontStyle: i ? "italic" : fontStyle ? fontStyle : "normal",
        textIndent: textIndent,
        color,
        // textDecoration: textDecoration ? textDecoration : null,
        verticalAlign: verticalAlign || "middle",
        whiteSpace: whiteSpace,
        textAlign: textAlign ? textAlign : undefined,
        backgroundColor: backgroundColor,
        borderRadius: borderRadius,
        cursor: cursor ? "pointer" : "inherit",
        lineHeight: lineHeight,
        height: height,
        maxHeight: maxHeight,
        minHeight: minHeight,
        letterSpacing: letterSpacing,
        wordBreak: wordBreak,
        overflow: lineClamp ? "hidden" : overflow,
        textOverflow: lineClamp ? "ellipsis" : textOverflow,
        overflowWrap: overflowWrap,
        position,
        textDecorationLine: textDecoration || textDecorationLine || undefined,
        top,
        right,
        bottom,
        left,
        display: lineClamp ? "-webkit-box" : display,
        alignItems,
        justifyContent,
        WebkitLineClamp: lineClamp,
        WebkitBoxOrient: lineClamp ? "vertical" : undefined,
        ...getDirectionalStyles(),
      }}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onContextMenu={onContextMenu}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
    >
      {typeof children === "string"
        ? notranslate
          ? children
          : children.replace(children.trim(), t(children.trim()))
        : !rawText && typeof children === "number"
        ? children.toLocaleString("kr", {
            maximumFractionDigits: maximumFractionDigits,
          })
        : children}
    </span>
  );
}

Span.displayName = "Span";
export default Span;
