import clsx from "classnames";
import style from "./FlexChild.module.css";

function FlexChild({
  parentclass,
  id,
  height,
  width,
  Ref,
  addWidth,
  display,
  gridTemplateColumns,
  flex,
  flexBasis,
  flexGrow,
  minWidth,
  maxWidth,
  minHeight,
  maxHeight,
  overflowX,
  overflowY,
  alignItems = "center",
  flexStart,
  alignSelf,
  justifySelf,
  gap,
  justifyContent,
  backgroundColor,
  backgroundImage,
  padding,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  flexWrap,
  border,
  borderRadius,
  borderTop,
  borderRight,
  borderBottom,
  borderLeft,
  margin,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  cursor,
  position,
  top,
  bottom,
  left,
  right,
  fontWeight,
  fontSize,
  color,
  zIndex,
  hidden,
  onClick,
  onContextMenu,
  scrollbarGutter,
  onMouseEnter,
  onMouseLeave,
  onWheel,
  className,
  children,
}) {
  // Fixed 여부 체크
  let isFixed = false;
  if (parentclass) {
    if (parentclass === "vertical") {
      isFixed = height ? true : false;
    } else if (parentclass === "horizontal") {
      isFixed = width ? true : false;
    }
  }

  // 방향성 스타일 속성들을 처리
  const getDirectionalStyles = () => {
    const styles = {};

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
      ref={Ref}
      id={id}
      className={clsx(style.flexChild, { [style.fixed]: isFixed }, className)}
      style={{
        width: addWidth ? `calc(${flexBasis || "100%"} + ${addWidth})` : width,
        minWidth,
        maxWidth,
        height,
        maxHeight,
        minHeight,
        display,
        gridTemplateColumns,
        overflowX,
        overflowY,
        alignItems: flexStart ? "flex-start" : alignItems,
        alignSelf,
        justifySelf,
        gap,
        justifyContent,
        backgroundColor,
        backgroundImage,
        flexWrap,
        borderRadius,
        flex,
        flexBasis,
        flexGrow,
        cursor,
        position,
        top,
        bottom,
        left,
        right,
        zIndex,
        fontWeight,
        fontSize,
        scrollbarGutter,
        color,
        ...getDirectionalStyles(), // 방향성 스타일 적용
      }}
      hidden={hidden}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onWheel={onWheel}
    >
      {children}
    </div>
  );
}

export default FlexChild;
