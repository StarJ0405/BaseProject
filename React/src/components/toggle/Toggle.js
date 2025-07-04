import Div from "components/div/Div";
import Icon from "components/icons/Icon";
import styles from "./Toggle.module.css";

import { forwardRef, useEffect, useImperativeHandle, useState } from "react";

const Toggle = forwardRef(
  (
    {
      on = "switch_on", //<Icon className={styles.appear} name="switch_on" />,
      off = "switch_off", //<Icon className={styles.appear} name="switch_off" />,
      onChange = () => {},
      status: pre_status = false,
      disabled = false,
    },
    ref
  ) => {
    const [status, setStstus] = useState(pre_status);
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
      setMounted(true);
    }, []);
    useEffect(() => {
      if (mounted) setStstus(pre_status);
    }, [pre_status]);
    useImperativeHandle(ref, () => ({
      toggle() {
        setStstus(!status);
      },
      setStatus(status) {
        setStstus(status);
      },
      isStatus() {
        return status;
      },
    }));
    return (
      <Div
        onClick={() => {
          if (disabled) return;
          setStstus(!status);
          onChange?.(!status);
        }}
        cursor={!disabled && "pointer"}
      >
        {on && off ? (
          <Icon
            className={styles.appear}
            name={disabled ? off : status ? on : off}
          />
        ) : status ? (
          "on"
        ) : (
          "off"
        )}
      </Div>
    );
  }
);
export default Toggle;
