import { memo, useEffect, useState } from "react";
import { useCheckboxGroup } from "shared/hooks/useCheckboxGroup";
import { ReduxCheckbox } from "./ReduxCheckbox";

export const ReduxCheckboxItem = memo(
  ({
    readOnly,
    value,
    label,
    display,
    size,
    style,
    fontSize,
    onChange,
    onClick,
    color,
    cursor,
    checked: externalChecked,
    tag,
  }) => {
    const { isChecked, toggle, check, uncheck } = useCheckboxGroup();
    const checked = isChecked(value);
    const [isMounted, setMounted] = useState(false);
    useEffect(() => {
      setMounted(true);
      return () => {
        uncheck(value);
      };
    }, []);
    useEffect(() => {
      if (isMounted) {
        if (externalChecked) check(value);
        else uncheck(value);
      }
    }, [externalChecked]);
    useEffect(() => {
      if (!isMounted) {
        externalChecked && check(value);
      }
    }, [isMounted, externalChecked]);

    const handleChange = () => {
      if (!readOnly) toggle(value); // 내부 상태 변경
    };

    useEffect(() => {
      onChange?.(checked); // 외부 onChange도 호출
    }, [checked]);

    return (
      <label
        style={{ display: display ? display : "block", ...style }}
        onClick={(e) => e.stopPropagation()}
      >
        <ReduxCheckbox
          readOnly={readOnly}
          value={value}
          checked={checked}
          // onChange={() => toggle(value)}
          onChange={handleChange} // 새로운 핸들러 사용
          size={size}
        />
        <span onClick={() => handleChange(!checked)} style={{ cursor: "pointer" }}>
          {tag && <>{`[${tag}]`} &nbsp;</>}
          {/* <P size={fontSize} color={color} cursor={cursor} textAlign={"center"}> */}
          {label}
        </span>
        {/* </P> */}
      </label>
    );
  }
);
