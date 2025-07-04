import React, {
  Children,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";

const RadioGroup = forwardRef(({ defaultValue, readOnly, name = Math.random()
    .toString(36)
    .substring(2, 11), on = "radio_on", off = "radio_off", hover = "radio_hover", onChange, children }, ref) => {
  const [value, setValue] = useState(defaultValue);

  useImperativeHandle(ref, () => ({
    getName() {
      return name;
    },
    getValue() {
      return value;
    },
    setValue(newValue) {
      if (!newValue && newValue !== value) onChange(newValue);
      setValue(newValue);
    },
  }));
  useEffect(() => {
    if (typeof value !== "undefined" && value !== null) onChange?.(value);
  }, [value]);
  useEffect(() => {
    if (defaultValue !== value) setValue(defaultValue);
  }, [defaultValue]);
  const childrenWithProps = tranfer({
    children,
    name,
    defaultValue: value,
    setValue,
    on,
    off,
    hover,
    readOnly,
  });
  return <>{childrenWithProps}</>;
});

function tranfer({
  children,
  name,
  defaultValue,
  setValue,
  on,
  off,
  hover,
  readOnly,
}) {
  return Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type.displayName === "Radio") {
        const data = {
          name,
          defaultValue,
          setValue,
          readOnly2: readOnly,
        };
        if (on && off) {
          if (!child.props.on) data.on = on;
          if (!child.props.off) data.off = off;
          if (hover) data.hover = hover;
        }
        return React.cloneElement(child, data);
      } else {
        if (child.type.displayName === "RadioGorup") {
          return child;
        } else if (child.props.children) {
          const childrenWithProps = tranfer({
            children: child.props.children,
            name,
            defaultValue,
            setValue,
            on,
            off,
            hover,
            readOnly,
          });
          return React.cloneElement(child, { children: childrenWithProps });
        } else {
          return child;
        }
      }
    } else return child;
  });
}
RadioGroup.displayName = "RadioGroup";
export default RadioGroup;
