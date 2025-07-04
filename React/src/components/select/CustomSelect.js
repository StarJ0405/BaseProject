import P from "components/P/P";
import HorizontalFlex from "components/flex/HorizontalFlex";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./CustomSelect.module.css";

const ChevronIcon = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CustomSelect = ({
  border,
  borderRadius,
  fontSize,
  padding,
  onToggle,
  options = [],
  defaultValue = "",
  onChange = (value) => {},
  width = 468,
  height = 37,
  placeholder = "Select an option",
  chevronSize,
  value,
  disabled = false,
  Location,
  backgroundColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(defaultValue);
  const [isMounted, setMounted] = useState(false);
  const optionsRef = useRef({ index: -1, options: [], base: null });
  const defaultChevronSize = useMemo(() => {
    const numericHeight =
      typeof height === "number" ? height : parseInt(height);
    return Math.max(16, Math.floor(numericHeight * 0.43));
  }, [height]);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (isMounted) setSelectedValue(value);
  }, [value]);
  useEffect(() => {
    if (onToggle) onToggle(isOpen);
  }, [isOpen]);
  const finalChevronSize = chevronSize || defaultChevronSize;

  const handleSelect = (option) => {
    setSelectedValue(option.label || option);
    setIsOpen(false);
    onChange(option);
    optionsRef.current.index = -1;
    optionsRef.current.base.focus();
  };

  const containerStyle = {
    width: typeof width === "number" ? `${width}px` : width,
  };

  const triggerStyle = {
    height: typeof height === "number" ? `${height}px` : height,
    backgroundColor: backgroundColor || "white",
  };

  const chevronStyle = {
    width: `${finalChevronSize}px`,
    height: `${finalChevronSize}px`,
  };

  const displayValue = value !== undefined ? value : selectedValue;

  return (
    <div className={styles.container} style={containerStyle}>
      <button
        ref={(el) => (optionsRef.current.base = el)}
        type="button"
        onClick={() => {
          if (!disabled) {
            optionsRef.current.index = -1;
            setIsOpen(!isOpen);
          }
        }}
        className={styles.trigger}
        style={{ ...triggerStyle, border, borderRadius, fontSize, padding }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            if (isOpen) {
              console.log(optionsRef.current.index);
              const now = Math.min(
                optionsRef.current.index + 1,
                options?.length - 1
              );
              optionsRef.current.index = now;
              optionsRef.current.options[now].focus();
            } else {
              setIsOpen(true);
            }
            e.preventDefault();
            e.stopPropagation();
          } else if (e.key === "ArrowUp" && isOpen) {
            optionsRef.current.index = -1;
            setIsOpen(false);
          }
        }}
      >
        <P className={styles.label} fontSize={fontSize}>
          {displayValue || placeholder}
        </P>
        <span
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ""}`}
          style={chevronStyle}
        >
          <ChevronIcon size={finalChevronSize} />
        </span>
      </button>

      {isOpen && (
        <div className={Location ? styles.dropdown_delivery : styles.dropdown}>
          {options.map((option, index) => (
            <button
              ref={(el) => (optionsRef.current.options[index] = el)}
              key={index}
              type="button"
              onClick={() => handleSelect(option)}
              className={styles.option}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  const now = Math.min(
                    optionsRef.current.index + 1,
                    options?.length - 1
                  );
                  optionsRef.current.index = now;
                  optionsRef.current.options[now].focus();
                  e.preventDefault();
                  e.stopPropagation();
                } else if (e.key === "ArrowUp") {
                  const now = optionsRef.current.index - 1;
                  if (now === -1) {
                    optionsRef.current.index = -1;
                    optionsRef.current.base.focus();
                    setIsOpen(false);
                  } else {
                    optionsRef.current.index = now;
                    optionsRef.current.options[now].focus();
                  }
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              {option.label && option.label2 ? (
                <HorizontalFlex>
                  <P className={styles.option_text} fontSize={fontSize}>
                    {option.label}
                  </P>
                  <P className={styles.option_text} fontSize={fontSize}>
                    {option.label2}
                  </P>
                </HorizontalFlex>
              ) : (
                <P className={styles.option_text} fontSize={fontSize}>
                  {option.label || (typeof option !== "object" ? option : "")}
                </P>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
