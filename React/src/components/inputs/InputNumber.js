import clsx from "clsx";
import Center from "components/center/Center";
import Div from "components/div/Div";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import Icon from "components/icons/Icon";
import P from "components/P/P";
import _ from "lodash";
import { BrowserDetectContext } from "providers/BrowserEventProvider";
import {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { toast } from "shared/utils/Utils";
import style from "./Input.module.scss";
import { numberOnlyFormat } from "./regExp";

const InputNumber = forwardRef((props, ref) => {
  const input = useRef();
  const {
    min,
    max,
    placeHolder,
    clearButton,
    disabled,
    required,
    allowedQuantity,
    hideLeftArrow,
    hideRightArrow,
    hideArrow,
    borderless,
    isAllowed = true,
    notAllowedMessage = "not_allowed",
    validText = "check_count",
    prefix,
    suffix,
    onKeyDown,
    arrowStyle,
    decimal = -1,
  } = props;
  const { t } = useTranslation();
  const [name, setName] = useState(props.name || "");
  const [value, setValue] = useState(props.value ? props.value : 0);
  const [isValid, setValid] = useState(required ? false : true);
  const [helperText, setHelperText] = useState("");
  const [isEmpty, setEmpty] = useState(true);
  const [minBlock, setMinBlock] = useState(false);
  const [maxBlock, setMaxBlock] = useState(false);
  const { isMobile } = useContext(BrowserDetectContext);
  const [isMounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const handleWheel = (event) => {
      event.stopPropagation();
      event.preventDefault();
    };

    // 모든 input 태그에 대해 이벤트 리스너 추가
    const inputElements = document.querySelectorAll("input");
    inputElements.forEach((input) => {
      input.addEventListener("wheel", handleWheel);
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      inputElements.forEach((input) => {
        input.removeEventListener("wheel", handleWheel);
      });
    };
  }, []);

  const changeValue = (v) => {
    let changedValue = Math.max(
      min ? min : 0,
      Math.min(max || (typeof max === "number" && max === 0) ? max : 99999, v)
    );

    if (allowedQuantity !== undefined && changedValue > allowedQuantity) {
      changedValue = allowedQuantity;
    }
    if (decimal >= 0) {
      const pow = Math.pow(10, decimal);
      changedValue = Math.floor(changedValue * pow) / pow;
    }

    if (props.onChange) {
      props.onChange(changedValue);
    }
    setValue(changedValue);
  };
  useEffect(() => {
    if (isMounted) {
      const newValue = Math.min(value, max);
      if (value !== newValue) {
        setValue(newValue);
        props?.onChange?.(newValue);
      }
    }
  }, [max]);
  const onChange = (e) => {
    if (!isAllowed) {
      toast({ message: notAllowedMessage });
      setValue(props.value);
      return;
    }

    let inputValue = Number(e.target.value);
    if (isEmpty) {
      setEmpty(false);
    }
    changeValue(inputValue);
  };

  const onClearButtonClick = () => {
    setValue(0);
  };
  const onPlusClick = (e) => {
    if (isAllowed) {
      e.stopPropagation();
      if (disabled) return;
      if (isEmpty) {
        setEmpty(false);
      }
      changeValue(value + 1);
    } else {
      toast({ message: notAllowedMessage });
    }
  };
  const onMinusClick = (e) => {
    if (isAllowed) {
      e.stopPropagation();
      if (disabled) return;

      if (isEmpty) {
        setEmpty(false);
      }

      changeValue(value - 1);
    } else {
      toast({ message: notAllowedMessage });
    }
  };

  useImperativeHandle(ref, () => ({
    getName() {
      return name;
    },
    getValue() {
      return value;
    },
    setValue(value) {
      setValue(value);
    },
    isValid() {
      return isValid;
    },
    focus() {
      if (isValid) {
        setHelperText("");
      } else {
        setHelperText("수량을 입력해주세요");
      }
      input.current.scrollTo(0, input.current.offsetTop);
    },
  }));

  useEffect(() => {
    if (props.value) {
      setValue(props.value);
    }
  }, [props.value]);

  useEffect(() => {
    if (required) {
      if (value > 0) {
        setValid(true);
      } else {
        setValid(false);
      }
    }

    if (value <= min) setMinBlock(true);
    else setMinBlock(false);

    if (value >= max) setMaxBlock(true);
    else setMaxBlock(false);
  }, [value]);

  useEffect(() => {
    if (isValid) {
      setHelperText("");
    } else {
      if (!isEmpty) {
        setHelperText("수량을 입력해주세요");
      }
    }
  }, [isValid, isEmpty]);
  return (
    <Div width={"initial"} height={props.height}>
      <HorizontalFlex justifyContent={"center"} width={"fit-content"}>
        {!hideArrow && !hideLeftArrow && (
          <FlexChild width={"initial"}>
            <span
              onClick={onMinusClick}
              // className={clsx(
              //   isMobile ? style.mobileLeftArrow : style.leftArrow,
              //   { [style.active]: !disabled && !minBlock }
              // )}
              className={clsx(style.leftArrow, {
                [style.active]: !disabled && !minBlock,
              })}
              style={_.merge(arrowStyle, arrowStyle?.left || {})}
            >
              <Center>
                <Icon name={"minus"} />
              </Center>
            </span>
          </FlexChild>
        )}
        <FlexChild width={"fit-content"}>
          <div ref={input} className={style.wrap}>
            <HorizontalFlex alignItems="center" gap={5}>
              {prefix && (
                <p
                  className={clsx(isMobile ? style.mobileInput : style.input, {
                    [style.borderless]: hideArrow || hideLeftArrow,
                  })}
                >
                  {prefix}
                </p>
              )}
              <input
                type="number"
                name={name}
                // className={clsx(
                //   isMobile ? style.mobileInput : style.input,
                //   { [style.borderless]: borderless || true },
                //   {
                //     [style.withPlaceHolder]: placeHolder ? true : false,
                //     [style.hideLeftArrow]: hideArrow || hideLeftArrow,
                //     [style.hideRightArrow]: hideArrow || hideRightArrow,
                //   }
                // )}
                className={clsx(
                  style.input,
                  { [style.borderless]: borderless || true },
                  {
                    [style.withPlaceHolder]: placeHolder ? true : false,
                    [style.hideLeftArrow]: hideArrow || hideLeftArrow,
                    [style.hideRightArrow]: hideArrow || hideRightArrow,
                  },
                  "notranslate"
                )}
                style={_.merge({ width: props.width }, props.style)}
                onChange={onChange}
                onKeyDown={(e) => onKeyDown?.(e, value)}
                value={Number(value || 0).toString()}
                disabled={disabled ? true : null}
              />
              {suffix && (
                <P
                  width={"max-content"}
                  className={clsx(isMobile ? style.mobileInput : style.input, {
                    [style.borderless]: hideArrow || hideRightArrow,
                  })}
                >
                  {suffix}
                </P>
              )}
            </HorizontalFlex>
            {placeHolder ? (
              <div className={style.placeHolderArea}>
                <Center>
                  <span
                    className={clsx(style.placeHolder, {
                      [style.moveUp]: value && value.length > 0,
                    })}
                  >
                    {props.placeHolder}
                  </span>
                </Center>
              </div>
            ) : null}
            {clearButton ? (
              <div className={style.buttonArea}>
                <span
                  className={style.clearButton}
                  onClick={onClearButtonClick}
                >
                  &times;{" "}
                </span>
              </div>
            ) : null}
          </div>
        </FlexChild>
        {!hideArrow && !hideRightArrow && (
          <FlexChild width={"initial"}>
            <span
              onClick={onPlusClick}
              // className={clsx(
              //   isMobile ? style.mobileRightArrow : style.rightArrow,
              //   { [style.active]: !disabled && !maxBlock }
              // )}
              className={clsx(style.rightArrow, {
                [style.active]: !disabled && !maxBlock,
              })}
              style={_.merge(arrowStyle, arrowStyle?.right || {})}
            >
              <Center>
                <Icon name={"plus"} />
              </Center>
            </span>
          </FlexChild>
        )}
      </HorizontalFlex>
      {/* <ArrowBox visible={helperText.length > 0}><p>{helperText}</p></ArrowBox> */}
    </Div>
  );
});

export default InputNumber;
