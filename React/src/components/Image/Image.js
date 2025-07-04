import P from "components/P/P";
import _ from "lodash";
import { copy, log } from "shared/utils/Utils";

const { useState, useEffect, useRef } = require("react");
const dev = process.env.REACT_APP_DEV;
const Image = ({
  Ref,
  alt = "empty",
  src,
  width,
  height,
  maxWidth,
  maxHeight,
  minWidth,
  minHeight,
  size,
  maxSize,
  minSize,
  borderRadius,
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
  className,
  aspectRatio,
  emptyRatio = "1 / 1",
  errorStyle,
  successStyle,
  strokeLinecap,
  strokeLinejoin,
  strokeWidth,
  opacity,
  position,
  top,
  right,
  bottom,
  left,
  transform,
  zIndex,
  draggable,
  selectable,
  cursor,
  onClick,
  onMouseDown,
  contextmenu,
  onMouseEnter,
}) => {
  const [isMounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(src ? false : true);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState(src ? false : true);
  const w = width ? width : size;
  const h = height ? height : size;
  const mxW = maxWidth ? maxWidth : maxSize;
  const mnW = minWidth ? minWidth : minSize;
  const mxH = maxHeight ? maxHeight : maxSize;
  const mnH = minHeight ? minHeight : minSize;
  const imgRef = useRef();
  const timer = useRef();
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (isMounted) {
      if (src && src !== "") {
        setHasError(false);
        setError(false);
        setRetry(0);
      } else {
        setHasError(true);
        setError(true);
        setRetry(5);
      }
      clearTimeout(timer.current);
    }
  }, [src]);
  useEffect(() => {
    if (isMounted) {
      clearTimeout(timer.current);
      if (hasError && !error) {
        timer.current = setTimeout(() => {
          if (!error) {
            if (retry < 5) {
              imgRef.current.src = `${src}?t=${new Date().getTime()}`;
              setRetry(retry + 1);
            } else {
              log("이미지 오류 : ", src);
              setError(true);
            }
          } else setRetry(5);
        }, 1000);
      } else setRetry(0);

      return () => clearTimeout(timer.current); // Clear timeout on component unmount or src change
    }
  }, [isMounted, retry, hasError]);
  const onContextMenu = (e) => !contextmenu && e.preventDefault();
  const onDragStart = (e) => !draggable && e.preventDefault();
  const onSelect = (e) => !selectable && e.preventDefault();
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
    <>
      {hasError && (
        <div
          className={className}
          style={_.merge(
            {
              width: w,
              height: h,
              maxWidth: mxW,
              minWidth: mnW,
              minHeight: mnH,
              maxHeight: mxH,
              aspectRatio: aspectRatio || emptyRatio,
              background: "white",
              borderWidth: "1px",
              borderColor: "gray",
              borderStyle: "solid",
              strokeLinecap,
              strokeLinejoin,
              strokeWidth,
              borderRadius,
              opacity,
              zIndex,
              position,
              top,
              right,
              bottom,
              left,
              transform,
            },
            errorStyle,
            { ...getDirectionalStyles() }
          )}
        >
          {dev && src ? (
            <P
              width={w}
              height={h}
              wordBreak={"break-all"}
              notranslate
              padding={5}
              textHover
              cursor
              ellipsis
              onClick={() =>
                copy({ text: src, message: "url을 복사했습니다." })
              }
            >
              {src}
            </P>
          ) : null}
        </div>
      )}
      {!error && (
        <img
          ref={(el) => {
            imgRef.current = el;
            if (Ref) Ref(el);
          }}
          src={src}
          className={className}
          hidden={hasError}
          style={_.merge(
            {
              width: w,
              height: h,
              maxWidth: mxW,
              minWidth: mnW,
              minHeight: mnH,
              maxHeight: mxH,
              strokeLinecap,
              strokeLinejoin,
              strokeWidth,
              cursor,
              borderRadius,
              opacity,
              zIndex,
              position,
              top,
              right,
              bottom,
              left,
              aspectRatio,
              transform,
            },
            successStyle,
            { ...getDirectionalStyles() }
          )}
          alt={alt}
          onError={() => setHasError(true)}
          onLoad={() => setHasError(false)}
          onContextMenu={onContextMenu}
          onDragStart={onDragStart}
          onSelect={onSelect}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseDown={onMouseDown}
        />
      )}
    </>
  );
};

export default Image;
