import Center from "components/center/Center";
import Div from "components/div/Div";
import Image from "components/Image/Image";
import { ReactSVG } from "react-svg";
import { log } from "shared/utils/Utils";

function Icon({
  projectly = false,
  center = true,
  src: extraSrc = "images/",
  type = "png",
  name,
  size = "100%",
  containerWidth,
  width,
  height,
  cursor,
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
  opacity,
  hidden,
  color,
  fill,
  stroke,
  draggable = false,
  selectable = false,
  contextmenu = false,
  onClick,
  onMouseDown,
  className,
}) {
  let Icon;
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
  try {
    if (!name) return "";
    const split = name?.split(".");
    const fileName = (
      split?.length > 1 ? name : `${name}.${type || "png"}`
    ).replace("..", ".");

    const src = require(`resources/${`${extraSrc}${
      projectly
        ? process.env.REACT_APP_MODE
          ? `${process.env.REACT_APP_MODE}/`
          : ""
        : ""
    }${fileName}`.replace("//", "/")}`);

    Icon =
      type === "svg" || name.includes(".svg") ? (
        <ReactSVG
          src={src}
          cursor={cursor}
          draggable={draggable}
          contextMenu={contextmenu}
          onClick={onClick}
          onMouseDown={onMouseDown}
          opacity={opacity || 0.1}
          beforeInjection={(svg) => {
            svg.style.width = width || size || "100%";
            svg.style.height = height || size || "100%";
            svg.style.stroke = stroke || color;
            svg.style.fill = fill || color;
            svg.style.opacity = opacity;
            svg.style.strokeLinecap = "round";
            svg.style.strokeLinejoin = "round";
            svg.style.strokeWidth = "2px";
          }}
        />
      ) : (
        <Image
          src={src}
          // width="100%"
          // height="100%"
          width={width || size || "100%"}
          height={height || size || "100%"}
          strokeLinecap={"round"}
          strokeLinejoin={"round"}
          strokeWidth={"2px"}
          cursor={cursor}
          draggable={draggable}
          selectable={selectable}
          contextmenu={contextmenu}
          onClick={onClick}
          onMouseDown={onMouseDown}
          opacity={opacity}
        />
      );
  } catch (error) {
    log(error);
    return "";
  }
  return (
    <Div
      borderRadius={borderRadius}
      width={containerWidth || width || size}
      position="relative"
      height={height || size}
      className={className}
      opacity={opacity}
      hidden={hidden}
      {...getDirectionalStyles()}
    >
      {center ? (
        <Center width={"100%"} height={"100%"}>
          {Icon}
        </Center>
      ) : (
        <>{Icon}</>
      )}
    </Div>
  );
}

export default Icon;
