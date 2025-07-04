import clsx from "clsx";
import P from "components/P/P";
import Icon from "components/icons/Icon";
import styles from "./Accordion.module.css";
import { useContext } from "react";
import { BrowserDetectContext } from "providers/BrowserEventProvider";

function AccordionChild({
  index,
  disabled = false,
  fold,
  setActive,
  header,
  height,
  maxHeight,
  overflowY,
  borderTop = "1px solid #eeeeee",
  borderRight = "1px solid #eeeeee",
  borderBottom = "1px solid #eeeeee",
  borderLeft = "1px solid #eeeeee",
  children,
  onClick, // Header 용
  styling,
}) {
  const Header =
    typeof header === "string" || typeof header === "number" ? (
      <P color={"inherit"} weight={"inherit"} fontSize={"inherit"}>
        {header}
      </P>
    ) : (
      header
    );
  const { isMobile } = useContext(BrowserDetectContext);

  return (
    <div
      className={clsx(styles.item, styling?.item?.className)}
      height={height}
      maxHeight={maxHeight}
      overflow={overflowY}
      style={{
        borderTop,
        borderRight,
        borderBottom,
        borderLeft,
        ...(styling?.item?.style || {}),
      }}
    >
      <div
        className={clsx(styles.header, styling?.header?.className)}
        onClick={() => {
          if (!disabled) {
            setActive(index, fold);
            onClick?.(!fold);
          }
        }}
        style={styling?.header?.style}
      >
        {Header}
        {children && (
          <div
            className={clsx(styles.button, styling?.button?.className)}
            style={styling?.button?.style}
          >
            <Icon
              name={fold ? "unfoldBtn-2_2x" : "foldBtn-2_2x"}
              height={"100%"}
              containerWidth={"auto"}
              width={isMobile ? "20px" : "26px"}
              center={true}
            />
          </div>
        )}
      </div>
      {children && (
        <div
          // hidden={fold}
          className={clsx(styles.body, styling?.body?.className, {
            [styles.fold]: fold,
          })}
          style={styling?.body?.style}
        >
          {children}
        </div>
      )}
    </div>
  );
}
AccordionChild.displayName = "AccordionChild";
export default AccordionChild;
