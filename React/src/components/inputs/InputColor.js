import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import P from "components/P/P";
import Tooltip from "components/tooltip/Tooltip";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ChromePicker } from "react-color";

const InputColor = forwardRef(
  (
    {
      id,
      type = "hex", // hex, hsl, hsv, rgb
      displayType = "text", // text, bar, box(square), sphere
      withText = false, // displayType이 text가 아닌 경우에만 적용, 이미지 옆에 텍스트 추가
      readOnly = false,
      value: props_value = "#000000",
      onChange: props_onChange,
      disabled,
      disableAlpha = true,
    },
    ref
  ) => {
    if (type === "hex") disableAlpha = true;
    const box = useRef();
    const inputs = useRef([]);
    const [value, setValue] = useState({
      hex: "#000000",
      hsl: { h: 0, s: 0, l: 0, a: 1 },
      hsv: { h: 0, s: 0, v: 0, a: 1 },
      oldHue: 0,
      rgb: { r: 0, g: 0, b: 0, a: 1 },
    });
    const [focusState, setFocusState] = useState(false);
    const timeoutRef = useRef();
    const focusChange = (status) => {
      clearTimeout(timeoutRef.current);
      if (status && !disabled) setFocusState(true);
      else {
        timeoutRef.current = setTimeout(() => {
          setFocusState(false);
        }, 500);
      }
    };

    const onChange = (inputValue) => {
      setValue(inputValue);
      inputs.current.value = inputValue;
      if (props_onChange) {
        props_onChange(inputValue);
      }
    };
    useEffect(() => {
      if (props_value) {
        if (typeof props_value === "string") setValue({ hex: props_value });
        else if (typeof props_value === "object") setValue(props_value);
      }
    }, [props_value]);

    useImperativeHandle(ref, () => ({
      getId() {
        return id;
      },
      getValue() {
        return value?.[type];
      },
      getHex() {
        return value?.hex;
      },
      getRGB() {
        return value.rgb;
      },
      getHSL() {
        return value.hsl;
      },
      getHSV() {
        return value.hsv;
      },
      setValue(value, change_event = true) {
        if (value) {
          if (typeof props_value === "string") value = { hex: props_value };
          setValue(value);
          if (change_event) onChange(value);
        }
      },
      isValid() {
        return true;
      },
      empty() {
        setValue("#000000");
      },
    }));
    const Display = ({ displayType, type, disableAlpha }) => {
      switch (String(displayType).toLowerCase()) {
        case "bar":
          return (
            <div
              onClick={() => focusChange(true)}
              style={{
                border: "1px solid #dadada",
                padding: 5,
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  height: 10,
                  width: 40,
                  backgroundColor: value?.hex ?? "#000000",
                }}
              ></div>
            </div>
          );
        case "sphere":
          return (
            <div
              onClick={() => focusChange(true)}
              style={{
                display: "flex",
                border: "1px solid #dadada",
                height: 40,
                width: 40,
                cursor: "pointer",
                borderRadius: "100%",
                backgroundColor: value?.hex ?? "#000000",
              }}
            ></div>
          );
        case "sqaure":
        case "box":
          return (
            <div
              onClick={() => focusChange(true)}
              style={{
                border: "1px solid #dadada",
                cursor: "pointer",
                height: 40,
                width: 40,
                backgroundColor: value?.hex ?? "#000000",
              }}
            ></div>
          );
        case "textColor":
          return <></>;
        case "text":
          switch (String(type).toLowerCase()) {
            case "hex":
              return (
                <div
                  onClick={() => focusChange(true)}
                  style={{
                    border: "1px solid #dadada",
                    padding: "5px 12px",
                    cursor: "pointer",
                  }}
                >
                  <P>{value?.hex || "#000000"}</P>
                </div>
              );
            case "rgba":
            case "rgb":
              return (
                <div onClick={() => focusChange(true)}>
                  <HorizontalFlex gap={10}>
                    {["r", "g", "b"].map((rgb) => (
                      <FlexChild key={rgb}>
                        <VerticalFlex gap={3}>
                          <P border={"1px solid #dadada"} padding={"5px 12px"}>
                            {String(value?.rgb?.[rgb] || 0).padStart(3, "0")}
                          </P>
                          <P color={"#dadada"}>{rgb.toUpperCase()}</P>
                        </VerticalFlex>
                      </FlexChild>
                    ))}
                    {!disableAlpha && (
                      <FlexChild>
                        <VerticalFlex gap={3}>
                          <P border={"1px solid #dadada"} padding={"5px 12px"}>
                            {Number(value?.rgb?.a || 0).toLocaleString("ko", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </P>
                          <P color={"#dadada"}>{"a".toUpperCase()}</P>
                        </VerticalFlex>
                      </FlexChild>
                    )}
                  </HorizontalFlex>
                </div>
              );
            case "hsla":
            case "hsl":
              return (
                <div onClick={() => focusChange(true)}>
                  <HorizontalFlex gap={10}>
                    <FlexChild>
                      <VerticalFlex gap={3}>
                        <P border={"1px solid #dadada"} padding={"5px 12px"}>
                          {String(Math.round(value?.hsl?.h || 0)).padStart(
                            3,
                            "0"
                          )}
                        </P>
                        <P color={"#dadada"}>{"h".toUpperCase()}</P>
                      </VerticalFlex>
                    </FlexChild>
                    {["s", "l"].map((hsl) => (
                      <FlexChild key={hsl}>
                        <VerticalFlex gap={3}>
                          <P border={"1px solid #dadada"} padding={"5px 12px"}>
                            {String(
                              Math.round((value?.hsl?.[hsl] || 0) * 100)
                            ).padStart(2, "0")}
                            %
                          </P>
                          <P color={"#dadada"}>{hsl.toUpperCase()}</P>
                        </VerticalFlex>
                      </FlexChild>
                    ))}
                    {!disableAlpha && (
                      <FlexChild>
                        <VerticalFlex gap={3}>
                          <P border={"1px solid #dadada"} padding={"5px 12px"}>
                            {Number(value?.hsl?.a || 0).toLocaleString("ko", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </P>
                          <P color={"#dadada"}>{"a".toUpperCase()}</P>
                        </VerticalFlex>
                      </FlexChild>
                    )}
                  </HorizontalFlex>
                </div>
              );
            case "hsva":
            case "hsv":
              return (
                <div onClick={() => focusChange(true)}>
                  <HorizontalFlex gap={10}>
                    <FlexChild>
                      <VerticalFlex gap={3}>
                        <P border={"1px solid #dadada"} padding={"5px 12px"}>
                          {String(Math.round(value?.hsv?.h || 0)).padStart(
                            3,
                            "0"
                          )}
                        </P>
                        <P color={"#dadada"}>{"h".toUpperCase()}</P>
                      </VerticalFlex>
                    </FlexChild>
                    {["s", "v"].map((hsv) => (
                      <FlexChild key={hsv}>
                        <VerticalFlex gap={3}>
                          <P border={"1px solid #dadada"} padding={"5px 12px"}>
                            {String(
                              Math.round((value?.hsv?.[hsv] || 0) * 100)
                            ).padStart(2, "0")}
                            %
                          </P>
                          <P color={"#dadada"}>{hsv.toUpperCase()}</P>
                        </VerticalFlex>
                      </FlexChild>
                    ))}
                    {!disableAlpha && (
                      <FlexChild>
                        <VerticalFlex gap={3}>
                          <P border={"1px solid #dadada"} padding={"5px 12px"}>
                            {Number(value?.hsv?.a || 0).toLocaleString("ko", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </P>
                          <P color={"#dadada"}>{"a".toUpperCase()}</P>
                        </VerticalFlex>
                      </FlexChild>
                    )}
                  </HorizontalFlex>
                </div>
              );
            default:
              break;
          }
          break;
        default:
          break;
      }
      return <P>unknown</P>;
    };
    return (
      <Tooltip
        disable={readOnly}
        style={{
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          userSelect: "none",
        }}
        hover={false}
        click={true}
        autoClose={false}
        position="top"
        content={
          <ChromePicker
            disableAlpha={disableAlpha}
            color={value?.[type] ?? value}
            onChange={(value) => {
              inputs.current.value = value[type];
              setValue(value);
            }}
          />
        }
      >
        <HorizontalFlex ref={box} id={id} cursor={"pointer"} gap={10}>
          <FlexChild width={"max-content"}>
            <Display
              displayType={displayType}
              type={type}
              disableAlpha={disableAlpha}
            />
          </FlexChild>
          {withText && type !== "text" && (
            <FlexChild width={"max-content"}>
              <Display
                displayType={"text"}
                type={type}
                disableAlpha={disableAlpha}
              />
            </FlexChild>
          )}
        </HorizontalFlex>
      </Tooltip>
    );
  }
);

export default InputColor;
