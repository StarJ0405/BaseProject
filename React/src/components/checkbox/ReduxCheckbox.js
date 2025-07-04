import React, { useRef, useState } from "react";
import style from "./ReduxCheckbox.module.css";
import clsx from "clsx";
import Div from "components/div/Div";
import Icon from "components/icons/Icon";

export const ReduxCheckbox = ({
  readOnly,
  className,
  value,
  checked,
  onChange,
  on = "checkbox_on",
  off = "checkbox_off",
  hover = "checkbox_hover",
  ...props
}) => {
  const [isActive, setActive] = useState(false);
  const input = useRef();
  return on && off ? (
    <Div
      cursor={!readOnly && "pointer"}
      width={props.size || "24px"}
      height={props.size || "24px"}
      onClick={() => {
        input.current.checked = !input.current.checked;
        onChange?.(input.current.checked);
      }}
      onMouseEnter={() => setActive(!readOnly && !!hover)}
      onMouseLeave={() => setActive(false)}
      className={className}
      {...props}
    >
      <Icon
        size={props.size || "24px"}
        name={checked ? on : isActive ? hover : off}
      />
      <input
        ref={input}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        hidden
      />
    </Div>
  ) : (
    <label className={style.checkboxWrapper}>
      <input
        type="checkbox"
        className={clsx(style.checkbox, className)}
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
        width={props.size}
        height={props.size}
        style={{ width: props.size, height: props.size }}
        {...props}
      />
    </label>
  );
};
