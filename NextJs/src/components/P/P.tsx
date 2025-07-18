"use client";
import { DirectionalStyleInterface } from "@/shared/utils/Interfaces";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import style from "./P.module.css";
import { CSSProperties } from "react";

function P({
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
}: ComponentProps<HTMLParagraphElement> & {
  weight?: CSSProperties["fontWeight"];
  size?: CSSProperties["fontSize"];
  i?: boolean;
  min?: CSSProperties["fontSize"];
  max?: CSSProperties["fontSize"];
  selected?: boolean;
  textHover?: boolean;
  enableHover?: boolean;
  ellipsis?: boolean;
  rawText?: boolean;
  notranslate?: boolean;
  maximumFractionDigits?: number;
}) {
  const { t } = useTranslation();
  // const { flagCode } = useContext(LanguageContext);
  // if (!font) {
  //   switch (flagCode) {
  //     case "kr":
  font = "pretendard";
  //       break;
  //     case "cn":
  //     default:
  //       font = "chiness";
  //       break;
  //   }
  // }
  let fontSize = size || props_fontSize;
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
    }

    return styles;
  };
  return (
    <p
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
        fontWeight:
          weight || fontWeight || (!className ? "inherit" : undefined),
        fontFamily: font || fontFamily,
        fontSize: fontSize,
        fontStyle: i ? "italic" : fontStyle ? fontStyle : "normal",
        textIndent: textIndent,
        color: color || (!className ? "inherit" : undefined),
        textDecoration,
        verticalAlign: verticalAlign || "middle",
        whiteSpace: whiteSpace,
        textAlign,
        backgroundColor: backgroundColor,
        borderRadius: borderRadius,
        cursor: cursor ? "pointer" : !className ? "inherit" : undefined,
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
        textDecorationLine,
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
    </p>
  );
}

P.displayName = "P";
export default P;
