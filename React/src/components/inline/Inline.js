import clsx from "clsx";
import style from "./Inline.module.css";

function Inline({
  weight,
  font,
  size,
  margin,
  color,
  padding,
  width,
  textAlign,
  display = "inline-flex",
  alignItems,
  children,
  backgroundColor,
  ellipsis,
}) {
  return (
    <div
      className={clsx(style.inline, { [style.ellipsis]: ellipsis })}
      style={{
        backgroundColor,
        fontWeight: weight,
        fontFamily: font,
        fontSize: size,
        margin,
        color,
        padding,
        width,
        display,
        textAlign,
        alignItems,
      }}
    >
      {children}
    </div>
  );
}

export default Inline;
