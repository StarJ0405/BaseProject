import React, { Children, forwardRef, useState } from "react";
import styles from "./Accordion.module.css";
const AccordionWrapper = forwardRef(
  (
    {
      active: props_active = [],
      unique = true,
      width,
      height,
      overflowY,
      gap = 10,
      children,
    },
    ref
  ) => {
    const [actives, setActives] = useState(props_active || []);
    function setActive(active, fold = true) {
      active = Array.isArray(active) ? active : [active];
      if (fold) {
        if (unique) setActives(active);
        else setActives((pre) => [...pre, ...active]);
      } else {
        setActives((pre) => [...pre.filter((f) => !active.includes(f))]);
      }
    }

    return (
      <div
        className={styles.container}
        width={width}
        height={height}
        overflowY={overflowY}
        style={{ gap }}
      >
        {Children.map(children, (child, index) => {
          if (
            React.isValidElement(child) &&
            child.type.displayName === "AccordionChild"
          ) {
            const idx = child.props.index || index;
            return React.cloneElement(child, {
              fold: !actives.includes(idx),
              setActive,
              index: idx,
            });
          }
        })}
      </div>
    );
  }
);

export default AccordionWrapper;
