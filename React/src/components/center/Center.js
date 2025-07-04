import style from "./Center.module.css";

function Center({
  alignItems = "center",
  textAlign = "center",
  width,
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
  borderLeft,
  borderBottom,
  maxWidth,
  height,
  minHeight,
  children,
  position,
  backgroundColor,
}) {
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
      className={style.wrap}
      style={{
        alignItems,
        width,
        maxWidth,
        height,
        minHeight,
        backgroundColor,
        position,
        ...getDirectionalStyles(),
      }}
    >
      <div
        className={style.inner}
        style={{
          // width,
          // height,
          textAlign,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default Center;
