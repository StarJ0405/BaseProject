import clsx from "classnames";
import React, { Children } from "react";
import style from "./HorizontalFlex.module.css";
import { DirectionalStyleInterface } from "@/shared/utils/Interfaces";

function HorizontalFlex({
  flexStart,
  width,
  height,
  overflow,
  overflowX,
  overflowY,
  gap,
  alignItems = "center",
  padding,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  backgroundColor,
  border,
  borderTop,
  borderRight,
  borderBottom,
  borderLeft,
  borderRadius,
  flexWrap,
  margin,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  justifyContent,
  color,
  flexGrow,
  flexBasis,
  fontWeight,
  fontSize,
  className,
  position,
  top,
  bottom,
  left,
  right,
  cursor,
  onClick,
  onContextMenu,
  hidden,
  children,
}: any) {
  const childrenWithProps = Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        parentclass: "horizontal",
      } as any);
    }
  });

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
    <div
      hidden={hidden}
      className={clsx(
        style.horizontal,
        {
          [style.flexStart]: !!flexStart,
          [style.flex]: !flexStart,
        },

        className
      )}
      style={{
        width: width,
        height: height,
        overflow: overflow,
        overflowX: overflowX,
        overflowY: overflowY,
        gap: gap,
        alignItems: flexStart ? "flex-start" : alignItems,
        backgroundColor: backgroundColor,
        color,
        borderRadius: borderRadius,
        flexWrap: flexWrap,
        borderBottom: borderBottom,
        justifyContent: justifyContent,
        flexGrow: flexGrow,
        flexBasis: flexBasis,
        fontSize,
        fontWeight,
        position,
        top,
        bottom,
        left,
        right,
        cursor,
        ...getDirectionalStyles(), // 방향성 스타일 적용
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {childrenWithProps}
    </div>
  );
}

export default HorizontalFlex;
