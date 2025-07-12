"use client";
import clsx from "clsx";
import {
  CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
// Removed: import { numberFormat } from "@/shared/regExp"; // Not applicable for textarea

// Import the CSS Module
import styles from "./InputTextArea.module.css"; // <--- NEW MODULE CSS

const InputTextArea = forwardRef(
  (
    {
      id,
      // Removed: regExp, // Not directly applicable in the same way for textareas
      placeHolder,
      className,
      label,
      style,
      width,
      readOnly: props_readOnly,
      // Removed: type, // Not applicable for textarea
      noWhiteSpace = false,
      onKeyDown,
      feedback = "",
      validable = true,
      maxLength, // MaxLength is valid for textarea
      // Removed: max, min, // Not applicable for textarea
      name = "",
      value: props_value = "",
      onChange: props_onChange,
      // Removed: onFilter, // Less relevant for generic text input
      rows = 3, // New prop for textarea height
      disabled,
      size,
      focus = false,
      onBlur,
      onFocus,
      resize = "none",
    }: // Removed: hidePasswordChange, // Not applicable for textarea
    {
      id?: string;
      // regExp?: [{ exp: { test: (value: any) => boolean } }]; // Removed
      placeHolder?: string;
      className?: string;
      label?: string;
      style?: CSSProperties;
      width?: CSSProperties["width"];
      readOnly?: boolean;
      // type?: HTMLInputTypeAttribute; // Removed
      noWhiteSpace?: boolean;
      onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void; // Changed event type
      feedback?: string;
      validable?: boolean;
      maxLength?: number;
      // max?: number; min?: number; // Removed
      name?: string;
      value?: string; // Textarea value is always string
      onChange?: (value: string) => void;
      // onFilter?: (inputValue: string | number, prevValue: string | number) => string | number; // Removed
      rows?: number; // New prop
      disabled?: boolean;
      size?: "sm" | "lg";
      focus?: boolean;
      onBlur?: (event: React.FocusEvent<HTMLTextAreaElement>) => void; // Changed event type
      onFocus?: (event: React.FocusEvent<HTMLTextAreaElement>) => void; // Changed event type
      resize?: CSSProperties["resize"];
      // hidePasswordChange?: boolean; // Removed
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null); // Changed ref type
    const { t } = useTranslation();
    const [readOnly, setReadOnly] = useState(props_readOnly);
    const [value, setValue] = useState(props_value);
    const [isValid, setValid] = useState(true);
    const [isEmpty, setEmpty] = useState(true);
    const [isMounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const onChange = (inputValue: string) => {
      let processedValue: string = inputValue;

      if (noWhiteSpace) {
        processedValue = processedValue.replace(/ /gi, "");
      }

      setValue(processedValue);
      if (props_onChange) {
        props_onChange(processedValue);
      }
    };

    useEffect(() => {
      if (props_value !== value) {
        setValue(props_value);
      }
    }, [props_value]); // Added value to dependency array for clarity

    useEffect(() => {
      if (focus) textareaRef?.current?.focus?.();
    }, [focus]);

    // Validation logic for textarea can be simplified or customized
    // For now, I'll keep the basic isEmpty check and a placeholder for custom validation.
    // If you need regex for textareas, you'll need to re-introduce and adapt it.
    useEffect(() => {
      // If you need custom regex validation for textarea, add it here.
      // For example, if (regExp && validable) { /* your regex logic */ }
      // For now, it's always valid unless specific regExp is added.
      setValid(true); // Default to valid if no specific validation rules are provided

      if (value !== null && value !== undefined && String(value).length > 0) {
        setEmpty(false);
      } else {
        setEmpty(true);
      }
    }, [value, validable]); // Removed regExp from dependencies

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
      setValue(newValue: string, change_event = true) {
        // Value is string
        setValue(newValue);
        if (change_event) {
          let processedValue: string = String(newValue);

          if (noWhiteSpace && typeof processedValue === "string") {
            processedValue = processedValue.replace(/ /gi, "");
          }

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
        textareaRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
        textareaRef.current?.focus();
      },
    }));

    const defaultTextAreaStyle: CSSProperties = {
      boxShadow: "none",
      borderRadius: "0",
      border: "1px solid var(--line-color, #ccc)", // Use CSS variable with fallback
    };

    const textareaClasses = clsx(
      className,
      "notranslate",
      styles.textarea, // Apply the CSS Module class for textarea
      {
        [styles.invalid]: validable && !isEmpty && !isValid,
        [styles.valid]: validable && !isEmpty && isValid,
        [styles.moveUp]: !isEmpty, // Apply moveUp class based on value presence
        [styles.mobileWrap]: size === "sm", // Re-using for small styling if needed
      }
    );

    const mergedTextAreaStyle = {
      resize,
      ...defaultTextAreaStyle,
      ...style,
      ...(width ? { width: width } : {}),
    };

    return (
      <div
        className={clsx(styles.wrap, { [styles.mobileWrap]: size === "sm" })}
        style={{ width: width || "max-content" }}
      >
        {label && (
          <label htmlFor={id} className={styles.labelId}>
            {label}
          </label>
        )}
        <div className={styles.inputTextWrap}>
          <textarea
            id={id}
            className={textareaClasses}
            style={mergedTextAreaStyle}
            placeholder={placeHolder ? " " : t(placeHolder || "")}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            ref={textareaRef} // Use textareaRef
            disabled={disabled}
            readOnly={readOnly}
            onKeyDown={
              onKeyDown as React.KeyboardEventHandler<HTMLTextAreaElement>
            } // Type assertion for onKeyDown
            maxLength={maxLength}
            onBlur={onBlur as React.FocusEventHandler<HTMLTextAreaElement>} // Type assertion for onBlur
            onFocus={onFocus as React.FocusEventHandler<HTMLTextAreaElement>} // Type assertion for onFocus
            name={name}
            rows={rows} // Apply rows prop
          />

          {placeHolder && (
            <div className={styles.placeHolderArea}>
              <div className={styles.placeHolder}>{t(placeHolder)}</div>
            </div>
          )}

          {/* Password eye icon removed as it's not applicable for textarea */}
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

InputTextArea.displayName = "InputTextArea";

export default InputTextArea;
