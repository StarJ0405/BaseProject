import clsx from "classnames";
import React, { Children } from "react";
import style from "./FlexGrid.module.css";
import { DirectionalStyleInterface } from "@/shared/utils/Interfaces";

function FlexGrid({
  flexStart,
  className,
  width,
  height,
  gap,
  rows,
  gridGap,
  columns,
  children,
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
  overflowY,
  overflowX,
  scrollbarWidth,
  backgroundColor,
  flexGrow,
}: any) {
  const childrenWithProps = Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        parentclass: "grid",
        flexStart: flexStart ? flexStart : null,
      } as any);
    }
    return child;
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
      className={clsx(style.grid, className)}
      style={{
        width,
        height,
        gap,
        overflowY,
        overflowX,
        scrollbarWidth,
        backgroundColor,
        flexGrow,
        gridTemplateRows: rows
          ? `repeat(${rows}, ${gridGap ? gridGap : "1fr"})`
          : undefined,
        gridTemplateColumns: columns
          ? `repeat(${columns}, ${gridGap ? gridGap : "1fr"})`
          : undefined,
        ...getDirectionalStyles(), // 방향성 스타일 적용
      }}
    >
      {childrenWithProps}
    </div>
  );
}

export default FlexGrid;
