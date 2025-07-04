import clsx from "classnames";
import P from "components/P/P";
import style from "./ProgressBar.module.scss";

function ProgressBar({
  textColor,
  text = " ",
  fontSize,
  percent = 0,
  barColor = "black",
  width,
  height,
}) {
  return (
    <>
      <div
        className={clsx(style.progress, style.progressStriped, style.active)}
        style={{ position: "relative", width: width, height: height }}
      >
        <div style={{ height: "100%", position: "absolute", padding: 10 }}>
          <P fontSize={fontSize} color={textColor}>
            {text}
          </P>
        </div>
        <div
          style={{
            width: typeof percent === "number" ? `${percent}%` : percent,
            height: "100%",
            backgroundColor: barColor,
          }}
          className={clsx(style.progressBar)}
        ></div>
      </div>
    </>
  );
}

export default ProgressBar;
