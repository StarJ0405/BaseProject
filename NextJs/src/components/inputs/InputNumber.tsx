"use client";
import { BrowserDetectContext } from "@/providers/BrowserEventProvider";
import { toast } from "@/shared/utils/Functions";
import clsx from "clsx";
import {
  CSSProperties,
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import style from "./InputNumber.module.css";

// Props type definition for better type safety
interface InputNumberProps {
  name?: string;
  value?: number; // The canonical numeric value
  min?: number;
  max?: number;
  placeHolder?: string;
  clearButton?: boolean;
  disabled?: boolean;
  required?: boolean;
  allowedQuantity?: number;
  hideLeftArrow?: boolean;
  hideRightArrow?: boolean;
  hideArrow?: boolean;
  borderless?: boolean;
  isAllowed?: boolean;
  notAllowedMessage?: string;
  validText?: string;
  prefix?: string;
  suffix?: string;
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLInputElement>,
    value: number
  ) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void; // Added onBlur to props
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void; // Added onFocus to props
  arrowStyle?: CSSProperties & { left?: CSSProperties; right?: CSSProperties };
  decimal?: number; // -1 for flexible decimals, 0 for integers, >0 for fixed decimals
  step?: number;
  onChange?: (value: number) => void; // Callback for the numeric value
  height?: CSSProperties["height"];
  width?: CSSProperties["width"];
  style?: CSSProperties;
}
interface refInterface {
  getName: () => string;
  getValue: () => number;
  setValue: (value: number) => void;
  isValid: () => boolean;
  focus: () => void;
}
const InputNumber = forwardRef<refInterface, InputNumberProps>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    min = 0,
    max = 99999,
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
    prefix,
    suffix,
    onKeyDown,
    onBlur,
    onFocus,
    arrowStyle,
    decimal = -1,
    step = 1,
    height,
    width = 60,
    style: componentStyle,
  } = props;

  const { t } = useTranslation();
  const [value, setValue] = useState(props.value ?? 0);
  const formatNumberForDisplay = (num: number): string => {
    if (typeof num !== "number" || isNaN(num)) return "";
    if (decimal >= 0) {
      return num.toFixed(decimal);
    }
    return String(num);
  };
  const [displayValue, setDisplayValue] = useState(
    formatNumberForDisplay(props.value ?? 0)
  );
  const [name, setName] = useState(props.name || "");
  const [isValid, setValid] = useState(required ? false : true);
  const [helperText, setHelperText] = useState("");
  const [isEmpty, setEmpty] = useState(true);
  const [minBlock, setMinBlock] = useState(false);
  const [maxBlock, setMaxBlock] = useState(false);
  const { isMobile } = useContext(BrowserDetectContext);
  const [isMounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Handle wheel event specifically for this input
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (inputRef.current && inputRef.current.contains(event.target as Node)) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const currentInput = inputRef.current;
    if (currentInput) {
      currentInput.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (currentInput) {
        currentInput.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);

  // Function to format the canonical numeric value for display

  // Function to parse the string input and clamp it to min/max/decimal/allowedQuantity
  const parseAndClampValue = (inputStr: string): number => {
    let cleaned = inputStr;

    let hasMinus = cleaned.startsWith("-");
    if (hasMinus) {
      cleaned = cleaned.substring(1);
    }

    cleaned = cleaned.replace(/[^0-9.]/g, "");

    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }

    if (decimal >= 0) {
      const decimalParts = cleaned.split(".");
      if (decimalParts[1] && decimalParts[1].length > decimal) {
        cleaned = decimalParts[0] + "." + decimalParts[1].substring(0, decimal);
      }
    }

    if (hasMinus && cleaned !== "") {
      cleaned = "-" + cleaned;
    }

    let parsedNum = parseFloat(cleaned);

    if (cleaned === "" || cleaned === "-") {
      return min;
    }
    if (isNaN(parsedNum)) {
      return min;
    }

    if (decimal >= 0) {
      const multiplier = Math.pow(10, decimal);
      parsedNum = Math.round(parsedNum * multiplier) / multiplier;
    }

    parsedNum = Math.max(min, Math.min(max, parsedNum));

    if (allowedQuantity !== undefined && parsedNum > allowedQuantity) {
      parsedNum = allowedQuantity;
    }

    return parsedNum;
  };

  // This useEffect synchronizes `props.value` with internal state when parent changes it
  const onKeyDownHandler = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isAllowed) return toast({ message: t(notAllowedMessage) });
    if (disabled) return;
    if (onKeyDown) {
      onKeyDown(e, value);
    } else {
      switch (e.key) {
        case "ArrowUp":
          {
            e.preventDefault();
            const newValue = value + step;
            const clampedNewValue = parseAndClampValue(String(newValue));
            setValue(clampedNewValue);
            setDisplayValue(formatNumberForDisplay(clampedNewValue)); // Immediate formatting
            props.onChange?.(clampedNewValue);
          }
          break;
        case "ArrowDown":
          {
            e.preventDefault();
            const newValue = value - step;
            const clampedNewValue = parseAndClampValue(String(newValue));
            setValue(clampedNewValue);
            setDisplayValue(formatNumberForDisplay(clampedNewValue)); // Immediate formatting
            props.onChange?.(clampedNewValue);
          }
          break;
      }
    }
  };
  useEffect(() => {
    const canonicalPropValue = props.value ?? min;
    const clampedPropValue = parseAndClampValue(String(canonicalPropValue));

    // Only update internal `value` state if the incoming `props.value` is different
    // or if the *formatted display* value is out of sync and input is not focused.
    if (value !== clampedPropValue) {
      setValue(clampedPropValue);
      if (!inputRef.current?.matches(":focus")) {
        setDisplayValue(formatNumberForDisplay(clampedPropValue));
      }
    } else if (
      !inputRef.current?.matches(":focus") &&
      displayValue !== formatNumberForDisplay(clampedPropValue)
    ) {
      setDisplayValue(formatNumberForDisplay(clampedPropValue));
    }
  }, [props.value, min, max, allowedQuantity, decimal]);

  // Handler for user input changes - NOW WITH IMMEDIATE FORMATTING
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAllowed) {
      toast({ message: t(notAllowedMessage) });
      setDisplayValue(formatNumberForDisplay(value)); // Revert display
      return;
    }

    const currentInputString = e.target.value;

    // Parse and clamp the numeric value based on the current input string
    const numericValue = parseAndClampValue(currentInputString);

    // Update the canonical numeric value
    setValue(numericValue);
    props.onChange?.(numericValue); // Always send a numeric value (even min/0 for 'empty' states)

    // IMPORTANT CHANGE: Format the display value immediately based on the numeric value
    // This will apply toFixed/etc. as the user types
    setDisplayValue(formatNumberForDisplay(numericValue));
  };

  // On blur, ensure final formatting. This might be redundant for formatting
  // if onChangeHandler already formats, but keeps it consistent and can house
  // other onBlur logic.
  const onBlurHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    // Final check and clamping on blur
    const finalNumericValue = parseAndClampValue(e.target.value);
    setValue(finalNumericValue);
    setDisplayValue(formatNumberForDisplay(finalNumericValue));

    props.onChange?.(finalNumericValue); // Trigger onChange with the final clamped value

    onBlur?.(e); // Call original onBlur if provided
  };

  // On focus, revert to raw string without fixed decimals to allow free typing
  const onFocusHandler = (e: React.FocusEvent<HTMLInputElement>) => {
    // Show raw number without fixed decimals to allow free typing
    setDisplayValue(String(value));
    onFocus?.(e); // Call original onFocus if provided
  };

  const onClearButtonClick = () => {
    setValue(min);
    setDisplayValue(formatNumberForDisplay(min));
    props.onChange?.(min);
  };

  const onPlusClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAllowed) {
      e.stopPropagation();
      if (disabled) return;
      const newValue = value + step;
      const clampedNewValue = parseAndClampValue(String(newValue));
      setValue(clampedNewValue);
      setDisplayValue(formatNumberForDisplay(clampedNewValue)); // Immediate formatting
      props.onChange?.(clampedNewValue);
    } else {
      toast({ message: t(notAllowedMessage) });
    }
  };

  const onMinusClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAllowed) {
      e.stopPropagation();
      if (disabled) return;
      const newValue = value - step;
      const clampedNewValue = parseAndClampValue(String(newValue));
      setValue(clampedNewValue);
      setDisplayValue(formatNumberForDisplay(clampedNewValue)); // Immediate formatting
      props.onChange?.(clampedNewValue);
    } else {
      toast({ message: t(notAllowedMessage) });
    }
  };

  useImperativeHandle(
    ref,
    (): refInterface => ({
      getName() {
        return name;
      },
      getValue() {
        return value;
      },
      setValue(newValue: number) {
        const clampedNewValue = parseAndClampValue(String(newValue));
        setValue(clampedNewValue);
        setDisplayValue(formatNumberForDisplay(clampedNewValue)); // Immediate formatting
        props.onChange?.(clampedNewValue);
      },
      isValid() {
        return isValid;
      },
      focus() {
        if (isValid) {
          setHelperText("");
        } else {
          setHelperText(t("수량을 입력해주세요"));
        }
        inputRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
        inputRef.current?.focus();
      },
    })
  );

  // Update validation and block states
  useEffect(() => {
    const currentIsValid = required ? value > min : true;
    setValid(currentIsValid);

    setMinBlock(value <= min);
    setMaxBlock(value >= max);

    setEmpty((value === min && !required) || isNaN(value));
  }, [value, min, max, required]);

  // Update helper text based on validation state
  useEffect(() => {
    if (isValid) {
      setHelperText("");
    } else {
      if (!isEmpty || (required && value <= min)) {
        setHelperText(t("수량을 입력해주세요"));
      }
    }
  }, [isValid, isEmpty, t, required, value, min]);

  // Determine if placeholder should move up (based on displayValue having content or input being focused)
  const shouldPlaceholderMoveUp =
    displayValue !== "" || inputRef.current?.matches(":focus");

  // Adjusted pattern to allow optional minus sign, digits, and optional decimal with digits
  const inputPattern = `^-?\\d*${
    decimal >= 0 ? `(?:\\.\\d{0,${decimal}})?` : `(?:\\.\\d*)?}$`
  }`;
  const inputMode = decimal >= 0 ? "decimal" : "numeric";

  return (
    <div className={style.container} style={componentStyle}>
      <div
        className={clsx(style.inputContainer, {
          [style.mobileInputContainer]: isMobile,
        })}
      >
        {!hideArrow && !hideLeftArrow && (
          <div
            onClick={onMinusClick}
            className={clsx(style.leftArrow, {
              [style.active]: !disabled && !minBlock,
              [style.borderless]: borderless,
            })}
            style={{ ...arrowStyle, ...(arrowStyle?.left as any) }}
          >
            <div className={style.center}>
              {/* Minus icon SVG */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )}
        <div
          className={style.wrap}
          style={{ width: width || "initial", height: height }}
        >
          <div className={style.inputContentWrapper}>
            {prefix && (
              <p
                className={clsx(style.prefix, {
                  [style.borderless]: hideArrow || hideLeftArrow,
                })}
              >
                {prefix}
              </p>
            )}
            <input
              type="text"
              inputMode={inputMode}
              pattern={inputPattern}
              name={name}
              className={clsx(
                style.input,
                { [style.borderless]: borderless || true },
                {
                  [style.moveUp]: shouldPlaceholderMoveUp,
                },
                "notranslate"
              )}
              style={{ width: props.width, ...props.style }}
              onChange={onChangeHandler}
              onKeyDown={onKeyDownHandler}
              value={displayValue} // Input is controlled by displayValue
              disabled={disabled}
              ref={inputRef}
              placeholder={placeHolder ? " " : t(placeHolder || "")}
              onBlur={onBlurHandler}
              onFocus={onFocusHandler}
            />
            {suffix && (
              <p
                className={clsx(style.suffix, {
                  [style.borderless]: hideArrow || hideRightArrow,
                })}
              >
                {suffix}
              </p>
            )}
          </div>
          {placeHolder ? (
            <div className={style.placeHolderArea}>
              <div
                className={clsx(style.placeHolder, {
                  [style.moveUp]: shouldPlaceholderMoveUp,
                })}
              >
                {t(placeHolder)}
              </div>
            </div>
          ) : null}
          {clearButton && value !== min ? (
            <div className={style.buttonArea}>
              <span className={style.clearButton} onClick={onClearButtonClick}>
                &times;
              </span>
            </div>
          ) : null}
        </div>
        {!hideArrow && !hideRightArrow && (
          <div
            onClick={onPlusClick}
            className={clsx(style.rightArrow, {
              [style.active]: !disabled && !maxBlock,
              [style.borderless]: borderless,
            })}
            style={{ ...arrowStyle, ...(arrowStyle?.right as any) }}
          >
            <div className={style.center}>
              {/* Plus icon SVG */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5V19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
      {helperText.length > 0 && (
        <div className={style.requestMessage}>{helperText}</div>
      )}
    </div>
  );
});

InputNumber.displayName = "InputNumber";

export default InputNumber;
