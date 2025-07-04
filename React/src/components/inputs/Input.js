import { CFormInput } from "@coreui/react";
import clsx from "clsx";
import Div from "components/div/Div";
import Image from "components/Image/Image";
import _ from "lodash";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import eyeIcon from "resources/icons/eyeIcon.svg";
import showEyeIcon from "resources/icons/Property 1=on.svg";
import { numberFormat } from "./regExp";

const Input = forwardRef(
  (
    {
      id,
      regExp,
      placeHolder,
      className,
      label,
      regExpDelay = 0,
      style,
      width,
      readOnly: props_readOnly,
      type = "text", // text, number, password
      noWhiteSpace = false,
      onKeyDown,
      feedback = "",
      validable = true,
      maxLength,
      max = 9999,
      min = 0,
      name = "",
      value: props_value = "",
      onChange: props_onChange,
      onFilter, // filter된 값을 뱉어야함
      size,
      disabled,
      focus = false,
      onBlur,
      onFocus,
      hidePasswordChange = false,
    },
    ref
  ) => {
    const input = useRef();
    const { t } = useTranslation();
    const [readOnly, setReadOnly] = useState(props_readOnly);
    const [value, setValue] = useState(props_value);
    const [isValid, setValid] = useState(true);
    const [isEmpty, setEmpty] = useState(true);
    const [searchInterval, setSearchInterval] = useState();
    const [hidePassword, setHidePassword] = useState(true);
    const [isMounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const onChange = (inputValue) => {
      switch (type) {
        case "number": {
          inputValue = Math.max(
            min,
            Math.min(max, Number(inputValue.replace(numberFormat.exp, "")))
          );
          break;
        }
        default:
          break;
      }

      if (noWhiteSpace && typeof inputValue === "string") {
        inputValue = inputValue.replace(/ /gi, "");
      }
      if (onFilter) inputValue = onFilter(inputValue, value);

      setValue(inputValue);
      input.current.value = inputValue;
      if (props_onChange) {
        props_onChange(inputValue);
      }
    };
    useEffect(() => {
      if (isMounted && type === "number") {
        const newValue = Math.min(value, max);
        if (newValue !== value) {
          setValue(newValue);
          props_onChange?.(newValue);
        }
      }
    }, [max]);
    useEffect(() => {
      setValue(props_value);
    }, [props_value]);
    useEffect(() => {
      if (focus) input?.current?.focus?.();
    }, [focus]);
    useEffect(() => {
      const expCheck = async () => {
        if (regExp) {
          const validationResult = await regExp.reduce(async (acc, re) => {
            switch (re.exp.test.constructor.name) {
              case "AsyncFunction": {
                let eachValidationResult = await re.exp.test(value);
                if (eachValidationResult === false) {
                  return false;
                }
                break;
              }
              default: {
                let eachValidationResult = re.exp.test(value);
                if (eachValidationResult === false) {
                  return false;
                }
              }
            }
            return acc;
          }, true);
          setValid(validationResult);
        } else {
          setValid(true);
        }
      };
      if (regExpDelay > 0) {
        if (searchInterval) clearInterval(searchInterval);
        const interval = setTimeout(async () => {
          await expCheck();
        }, regExpDelay);
        setSearchInterval(interval);
      } else {
        expCheck();
      }

      if (value && value.length > 0) {
        setEmpty(false);
      } else {
        setEmpty(true);
      }
    }, [value, regExpDelay, regExp]);

    useImperativeHandle(ref, () => ({
      getId() {
        return id;
      },
      getName() {
        return name;
      },
      getValue() {
        return value;
      },
      setValue(value, change_event = true) {
        setValue(value);
        if (change_event) onChange(value);
      },
      isValid() {
        return validable ? isValid : true;
      },
      setValid(valid) {
        setValid(valid);
      },
      empty() {
        setValue("");
      },
      changeReadOnly() {
        setReadOnly(!readOnly);
      },
      setReadOnly(status) {
        setReadOnly(!!status);
      },
      focus() {
        input.current?.scrollTo(0, input.current.offsetTop);
        input.current?.focus();
      },
    }));

    const defaultInputStyle = {
      "--cui-invalid-feedback": "none",
      boxShadow: "none",
      borderRadius: "0",
      fontSize: "15px",
      border: "1px solid var(--line-color)",
    };

    return type === "password" && !hidePasswordChange ? (
      <Div position={"relative"}>
        <CFormInput
          id={id}
          className={clsx(className, "notranslate")}
          style={_.merge(
            defaultInputStyle,
            style,
            width ? { width: width } : {}
          )}
          type={hidePassword ? type : "text"}
          feedback={isValid ? false : t(feedback)}
          placeholder={t(placeHolder)}
          value={value ?? ""}
          valid={validable ? (isEmpty ? null : isValid) : null}
          invalid={validable ? (isEmpty ? null : !isValid) : null}
          onChange={(e) => onChange(e.target.value)}
          label={label}
          ref={input}
          size={size}
          disabled={disabled}
          readOnly={readOnly}
          onKeyDown={onKeyDown}
          maxLength={maxLength}
          onBlur={onBlur}
          onFocus={onFocus}
        />
        <Image
          onClick={() => setHidePassword(!hidePassword)}
          src={hidePassword ? eyeIcon : showEyeIcon}
          position="absolute"
          right={validable && !isEmpty ? 30 : 10}
          top="50%"
          transform="translateY(-50%)"
          cursor={"pointer"}
          width={22}
        />
      </Div>
    ) : (
      <CFormInput
        id={id}
        className={clsx(className, "notranslate")}
        style={_.merge(defaultInputStyle, style, width ? { width: width } : {})}
        type={type}
        feedback={isValid ? false : t(feedback)}
        placeholder={t(placeHolder)}
        value={value ?? ""}
        valid={validable ? (isEmpty ? null : isValid) : null}
        invalid={validable ? (isEmpty ? null : !isValid) : null}
        onChange={(e) => onChange(e.target.value)}
        label={label}
        ref={input}
        size={size}
        disabled={disabled}
        readOnly={readOnly}
        onKeyDown={onKeyDown}
        maxLength={maxLength}
        onBlur={onBlur}
        onFocus={onFocus}
      />
    );
  }
);

export default Input;
