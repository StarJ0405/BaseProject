import clsx from "clsx";
import style from "./Div.module.css";
import { DirectionalStyleInterface } from "@/shared/utils/Interfaces";

function Div({
  id,
  Ref,
  width,
  minWidth,
  maxWidth,
  height,
  minHeight,
  maxHeight,
  backgroundColor,
  color,
  padding,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  boxShadow,
  borderRadius,
  border,
  borderTop,
  borderRight,
  borderBottom,
  borderLeft,
  dangerouslySetInnerHTML,

  onMouseOver,
  onMouseEnter,
  onMouseLeave,
  className,
  margin,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  children,
  position,
  opacity,
  top,
  bottom,
  left,
  right,
  zIndex,
  display,
  justifyContent,
  alignItems,
  overflow,
  overflowY,
  cursor,
  hidden,
  onClick,
  onContextMenu,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onDragOver,
  onDragLeave,
  onDrop,
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
      ref={Ref}
      hidden={hidden}
      id={id}
      className={clsx(style.div, className)}
      style={{
        borderRadius,
        width,
        minWidth,
        maxWidth,
        height,
        minHeight,
        maxHeight,
        backgroundColor,
        color,
        boxShadow,
        position,
        top,
        bottom,
        left,
        right,
        zIndex,
        display,
        justifyContent,
        alignItems,
        overflow,
        overflowY,
        opacity,
        cursor: cursor ? "pointer" : undefined,
        ...getDirectionalStyles(),
      }}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseOver={onMouseOver}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {children}
    </div>
  );
}

export default Div;
