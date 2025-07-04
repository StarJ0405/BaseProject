import Div from "components/div/Div";
import Icon from "components/icons/Icon";
import { useRef, useState } from "react";

// name과 valueRef는 부모에 의해 변경되므로 필요없음
function Radio({
  on,
  hover,
  off,
  value,
  width = "max-content",
  height,
  marginRight,
  marginLeft,
  marginTop,
  marginBottom,
  readOnly,
  ...props
}) {
  const { name, defaultValue, setValue, readOnly2 } = props;
  const [isActive, setActive] = useState(false);
  const input = useRef();
  return on && off ? (
    <Div
      cursor={"pointer"}
      onClick={() => !readOnly && !readOnly2 && setValue?.(value)}
      {...{
        cursor: "pointer",
        width,
        height,
        marginRight,
        marginLeft,
        marginTop,
        marginBottom,
      }}
      onMouseEnter={() => !readOnly && !readOnly2 && setActive(!!hover)}
      onMouseLeave={() => !readOnly && !readOnly2 && setActive(false)}
    >
      <Icon
        size={height}
        name={value === defaultValue ? on : isActive ? hover : off}
      />
      <input
        ref={input}
        type="radio"
        hidden={on && off}
        value={value}
        name={name}
        onChange={() => setValue?.(value)}
        defaultChecked={value === defaultValue}
      />
    </Div>
  ) : (
    <input
      type="radio"
      value={value}
      name={name}
      readOnly={readOnly || readOnly2}
      onChange={() => setValue?.(value)}
      defaultChecked={value === defaultValue}
      style={{
        cursor: "pointer",
        width,
        height,
        marginRight,
        marginLeft,
        marginTop,
        marginBottom,
      }}
    />
  );
}
Radio.displayName = "Radio";
export default Radio;
