import clsx from "clsx";
import style from "./Container.module.css";
import { DirectionalStyleInterface } from "@/shared/utils/Interfaces";

function Container({
  width,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  height,
  backgroundColor,
  boxShadow,
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
  border,
  borderTop,
  borderRight,
  borderBottom,
  borderLeft,
  position,
  overflowY,
  transition,
  hideScrollbar,
  className,
  children,
}: any) {
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
    <div
      className={clsx(style.container, className)}
      style={{
        width: width,
        minWidth: minWidth,
        maxWidth: maxWidth,
        minHeight: minHeight,
        maxHeight: maxHeight,
        height: height,
        backgroundColor: backgroundColor,
        padding: padding,
        boxShadow: boxShadow,
        position,
        overflowY,
        scrollbarWidth: hideScrollbar && "none",
        msOverflowStyle: hideScrollbar && "none",
        transition: transition,
        ...getDirectionalStyles(),
      }}
    >
      {children}
    </div>
  );
}

export default Container;
