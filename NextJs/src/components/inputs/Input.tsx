"use client";
import clsx from "clsx";
import _ from "lodash";
import {
  CSSProperties,
  forwardRef,
  HTMLInputTypeAttribute,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { numberFormat } from "@/shared/regExp"; // Assuming regExp.js exists and exports numberFormat

// Import the CSS Module
import styles from "./Input.module.css"; // <--- NEW

// Inline SVG for the 'eye' (hide password) icon
const EyeSVG = (
  <svg
    width="18"
    height="14"
    viewBox="0 0 18 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M0.961914 0.5C7.21523 5.57063 10.7189 8.41648 16.9619 13.5"
      stroke="#8B8B8B"
      strokeLinecap="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.07742 3.59543C2.13278 4.59863 1.45889 5.75756 1.03619 6.8143L0.961914 7L1.03619 7.1857C2.0755 9.78395 4.63338 13 9.00043 13C10.6763 13 12.0857 12.5264 13.2451 11.7959C12.9631 11.568 12.6864 11.3445 12.4141 11.1246C11.453 11.6639 10.3177 12 9.00043 12C5.30639 12 3.04363 9.35716 2.04129 7C2.44187 6.05796 3.04377 5.07029 3.85789 4.22393C3.6016 4.01752 3.34166 3.8082 3.07742 3.59543ZM6.14779 6.06872C6.05214 6.36189 6.00043 6.6749 6.00043 7C6.00043 8.65685 7.34358 10 9.00043 10C9.55259 10 10.0699 9.85083 10.5143 9.59058C10.2228 9.3553 9.93483 9.12287 9.64924 8.89241C9.44579 8.96215 9.22753 9 9.00043 9C7.89586 9 7.00043 8.10457 7.00043 7C7.00043 6.92112 7.005 6.84332 7.01388 6.76683C6.72671 6.53532 6.4384 6.30293 6.14779 6.06872ZM7.40316 5.79618C7.14499 5.58806 6.88564 5.37903 6.62427 5.1684C7.17288 4.45774 8.0332 4 9.00043 4C10.6573 4 12.0004 5.34315 12.0004 7C12.0004 7.73713 11.7346 8.41216 11.2935 8.93445C11.0313 8.72281 10.7721 8.51358 10.5151 8.30613C10.8175 7.95571 11.0004 7.49922 11.0004 7C11.0004 5.89543 10.105 5 9.00043 5C8.34782 5 7.76822 5.31257 7.40316 5.79618ZM13.2881 10.5451C14.5476 9.57194 15.4297 8.24606 15.9596 7C14.9572 4.64283 12.6945 2 9.00043 2C7.20237 2 5.74341 2.62615 4.60385 3.54072C4.34269 3.33038 4.07783 3.11709 3.80855 2.90026C5.11909 1.78859 6.83795 1 9.00043 1C13.3675 1 15.9254 4.21605 16.9647 6.8143L17.0389 7L16.9647 7.1857C16.4261 8.53207 15.4798 10.0443 14.0853 11.189C13.8149 10.9706 13.5494 10.7561 13.2881 10.5451Z"
      fill="#8B8B8B"
    />
  </svg>
);

// Inline SVG for the 'show eye' icon
const ShowEyeSVG = (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10 4.5C5.92078 4.5 3.5 7.5 2.5 10C3.5 12.5 5.92078 15.5 10 15.5C14.0792 15.5 16.5 12.5 17.5 10C16.5 7.5 14.0792 4.5 10 4.5Z"
      stroke="#8B8B8B"
    />
    <circle cx="10" cy="10" r="2.5" stroke="#8B8B8B" />
  </svg>
);

const Input = forwardRef(
  (
    {
      id,
      regExp,
      placeHolder,
      className, // This will be merged with styles.input
      label,
      style, // This will be merged with defaultInputStyle
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
    }: {
      id?: string;
      regExp?: [{ exp: { test: (value: any) => boolean } }];
      placeHolder?: string;
      className?: string;
      label?: string;
      style?: CSSProperties;
      width?: CSSProperties["width"];
      readOnly?: boolean;
      type?: HTMLInputTypeAttribute;
      noWhiteSpace?: boolean;
      onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
      feedback?: string;
      validable?: boolean;
      maxLength?: number;
      max?: number;
      min?: number;
      name?: string;
      value?: string | number;
      onChange?: (value: string | number) => void;
      onFilter?: (
        inputValue: string | number,
        prevValue: string | number
      ) => string | number;
      size?: "sm" | "lg";
      disabled?: boolean;
      focus?: boolean;
      onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
      onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
      hidePasswordChange?: boolean;
    },
    ref
  ) => {
    const input = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const [readOnly, setReadOnly] = useState(props_readOnly);
    const [value, setValue] = useState(props_value);
    const [isValid, setValid] = useState(true);
    const [isEmpty, setEmpty] = useState(true);
    const [hidePassword, setHidePassword] = useState(true);
    const [isMounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const onChange = (inputValue: string) => {
      let processedValue: string | number = inputValue;

      switch (type) {
        case "number": {
          processedValue = Math.max(
            min,
            Math.min(max, Number(inputValue.replace(numberFormat.exp, "")))
          );
          break;
        }
        default:
          break;
      }

      if (noWhiteSpace && typeof processedValue === "string") {
        processedValue = processedValue.replace(/ /gi, "");
      }
      if (onFilter) processedValue = onFilter(processedValue, value);

      setValue(processedValue);
      if (props_onChange) {
        props_onChange(processedValue);
      }
    };

    useEffect(() => {
      if (isMounted && type === "number") {
        const numericValue = Number(value);
        const newValue = Math.min(numericValue, max);
        if (newValue !== numericValue) {
          setValue(newValue);
          props_onChange?.(newValue);
        }
      }
    }, [max, isMounted, type, value, props_onChange]);

    useEffect(() => {
      if (props_value !== value) {
        setValue(props_value);
      }
    }, [props_value]);

    useEffect(() => {
      if (focus) input?.current?.focus?.();
    }, [focus]);

    useEffect(() => {
      const expCheck = async () => {
        if (regExp && validable) {
          const validationResult = await regExp.reduce(async (acc, re) => {
            const currentAcc = await acc;
            if (currentAcc === false) {
              return false;
            }

            let eachValidationResult;
            if (re.exp.test.constructor.name === "AsyncFunction") {
              eachValidationResult = await re.exp.test(value);
            } else {
              eachValidationResult = re.exp.test(value);
            }

            if (eachValidationResult === false) {
              return false;
            }
            return true;
          }, Promise.resolve(true));
          setValid(validationResult);
        } else {
          setValid(true);
        }
      };

      expCheck();

      if (value !== null && value !== undefined && String(value).length > 0) {
        setEmpty(false);
      } else {
        setEmpty(true);
      }
    }, [value, regExp, validable]);

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
      setValue(newValue: string | number, change_event = true) {
        setValue(newValue);
        if (change_event) {
          let processedValue: string | number = String(newValue);

          switch (type) {
            case "number": {
              processedValue = Math.max(
                min,
                Math.min(
                  max,
                  Number(String(processedValue).replace(numberFormat.exp, ""))
                )
              );
              break;
            }
            default:
              break;
          }

          if (noWhiteSpace && typeof processedValue === "string") {
            processedValue = processedValue.replace(/ /gi, "");
          }

          if (onFilter) processedValue = onFilter(processedValue, value);

          if (props_onChange) {
            props_onChange(processedValue);
          }
        }
      },
      isValid() {
        return validable ? isValid : true;
      },
      setValid(valid: boolean) {
        setValid(valid);
      },
      empty() {
        setValue("");
        if (props_onChange) {
          props_onChange("");
        }
      },
      changeReadOnly() {
        setReadOnly(!readOnly);
      },
      setReadOnly(status: boolean) {
        setReadOnly(!!status);
      },
      focus() {
        input.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        input.current?.focus();
      },
    }));

    const defaultInputStyle: CSSProperties = {
      boxShadow: "none",
      borderRadius: "0",
      border: "1px solid var(--line-color, #ccc)", // Use CSS variable with fallback
    };

    const inputClasses = clsx(
      className,
      "notranslate", // Keep this if it's a global class for translation exclusion
      styles.input, // Apply the CSS Module class
      {
        [styles.invalid]: validable && !isEmpty && !isValid, // Apply CSS Module class for invalid state
        [styles.valid]: validable && !isEmpty && isValid, // Apply CSS Module class for valid state
        [styles.moveUp]: !isEmpty, // Apply moveUp class based on value presence
        // [styles.withPlaceHolder]: !!placeHolder, // Not strictly needed if placeHolderArea is always present
        [styles.mobileInput]: size === "sm", // Example: map size prop to mobileInput class for small size
      }
    );

    const mergedInputStyle = {
      ...defaultInputStyle,
      ...style,
      ...(width ? { width: width } : {}),
    };

    const actualInputType =
      type === "password" && !hidePassword ? "text" : type;

    return (
      <div
        className={clsx(styles.wrap, { [styles.mobileWrap]: size === "sm" })}
        style={{ width: width || "100%" }} // Keep width prop for the wrapper
      >
        {label && (
          <label htmlFor={id} className={styles.labelId}>
            {label}
          </label>
        )}
        <div className={styles.inputTextWrap}>
          <input
            id={id}
            className={inputClasses}
            style={mergedInputStyle}
            type={actualInputType}
            placeholder={placeHolder ? " " : t(placeHolder || "")} // Use a space so :not(:placeholder-shown) works, or completely remove if not needed
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            ref={input}
            disabled={disabled}
            readOnly={readOnly}
            onKeyDown={onKeyDown}
            maxLength={maxLength}
            onBlur={onBlur}
            onFocus={onFocus}
            name={name}
          />

          {placeHolder && !value && (
            <div className={styles.placeHolderArea}>
              <div
                className={clsx(styles.placeHolder, {
                  // styles.moveUp is now applied to the input based on !isEmpty
                  // The CSS rule `input:focus + .placeHolderArea .placeHolder` and
                  // `input.moveUp + .placeHolderArea .placeHolder` handles the movement.
                })}
              >
                {t(placeHolder)}
              </div>
            </div>
          )}

          {type === "password" && !hidePasswordChange && (
            <div
              onClick={() => setHidePassword(!hidePassword)}
              className={styles.buttonArea}
              style={{
                right:
                  validable && !isEmpty && !isValid && feedback
                    ? "30px"
                    : "10px", // Adjust right based on feedback
              }}
            >
              {hidePassword ? EyeSVG : ShowEyeSVG}
            </div>
          )}
        </div>
        {validable && !isEmpty && !isValid && feedback && (
          <div
            className={clsx(styles.requestMessage, {
              [styles.active]: !isValid,
            })}
          >
            {t(feedback)}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
