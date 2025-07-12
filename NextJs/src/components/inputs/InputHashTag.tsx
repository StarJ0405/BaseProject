"use client";
import { toast } from "@/shared/utils/Functions"; // Assuming you have a toast utility
import clsx from "clsx";
import _ from "lodash";
import React, {
  CSSProperties,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import style from "./InputHashTag.module.css";

interface InputHashTagProps {
  name?: string;
  value?: string[]; // Array of strings for tags
  placeHolder?: string;
  maxTags?: number; // Maximum number of tags allowed
  maxLength?: number; // Max length for each individual tag
  disabled?: boolean;
  required?: boolean;
  isAllowed?: boolean; // General permission check
  notAllowedMessage?: string;
  tagDelimiter?: string; // e.g., ',' or ' ' (space) to create tags
  clearable?: boolean;
  width?: CSSProperties["width"];
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onChange?: (tags: string[]) => void;
  style?: CSSProperties;
}
interface refInterface {
  getName: () => string;
  getValue: () => string[];
  setValue: (value: string[]) => void;
  isValid: () => boolean;
  focus: () => void;
}
const InputHashTag = forwardRef<refInterface, InputHashTagProps>(
  (props, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null); // Ref for the main tags container
    const {
      name = "",
      value, // Default to empty array
      placeHolder,
      maxTags,
      maxLength,
      disabled = false,
      required = false,
      isAllowed = true,
      notAllowedMessage = "not_allowed",
      tagDelimiter = ",", // Default delimiter is comma
      clearable = false,
      width,
      onKeyDown,
      onChange,
      style: componentStyle,
    } = props;
    const { t } = useTranslation();
    const [tags, setTags] = useState<string[]>(value || []);
    const [inputValue, setInputValue] = useState<string>("");
    const [isValid, setValid] = useState(true);
    const [helperText, setHelperText] = useState("");

    useEffect(() => {
      if (value && JSON.stringify(tags) !== JSON.stringify(value)) {
        setTags(value);
      }
    }, [value]); // Only re-run if the 'value' prop itself changes

    // Imperative handle for parent component to access methods
    useImperativeHandle(ref, () => ({
      getName: () => name,
      getValue: () => tags,
      setValue: (newTags: string[]) => {
        const uniqueTags = Array.from(new Set(newTags)).filter(
          (tag) => tag.trim() !== ""
        );
        setTags(uniqueTags);
        onChange?.(uniqueTags);
      },
      isValid: () => isValid,
      focus: () => {
        inputRef.current?.focus();
      },
    }));

    // Validation useEffect (e.g., for required, maxTags)
    useEffect(() => {
      let currentIsValid = true;
      let currentHelperText = "";

      if (required && tags.length === 0) {
        currentIsValid = false;
        currentHelperText = t("태그를 입력해주세요."); // "Please enter tags."
      } else if (maxTags !== undefined && tags.length > maxTags) {
        currentIsValid = false;
        currentHelperText = t(`최대 ${maxTags}개의 태그만 허용됩니다.`); // "Only up to X tags are allowed."
      }

      setValid(currentIsValid);
      setHelperText(currentHelperText);
    }, [tags, required, maxTags, t]);

    // Helper to validate and normalize a single tag string
    const normalizeAndValidateTag = (tagText: string): string | null => {
      const trimmedTag = tagText.trim();
      if (trimmedTag === "") return null; // Don't add empty tags

      // Basic validation: no spaces within the tag itself
      if (trimmedTag.includes(" ")) {
        toast({ message: t("태그에 공백을 포함할 수 없습니다.") }); // "Tags cannot contain spaces."
        return null;
      }

      if (maxLength !== undefined && trimmedTag.length > maxLength) {
        toast({ message: t(`태그는 ${maxLength}자를 초과할 수 없습니다.`) }); // "Tag cannot exceed X characters."
        return null;
      }

      // Check for duplicates
      if (tags.includes(trimmedTag)) {
        toast({ message: t("이미 존재하는 태그입니다.") }); // "Tag already exists."
        return null;
      }

      return trimmedTag;
    };

    // Function to add a tag
    const addTag = (text: string) => {
      if (disabled || !isAllowed) {
        toast({ message: t(notAllowedMessage) });
        return;
      }

      const newTag = normalizeAndValidateTag(text);
      if (newTag) {
        if (maxTags !== undefined && tags.length >= maxTags) {
          toast({ message: t(`최대 ${maxTags}개의 태그만 허용됩니다.`) });
          return;
        }
        const updatedTags = [...tags, newTag];
        setTags(updatedTags);
        onChange?.(updatedTags);
        setInputValue(""); // Clear input after adding tag
      }
    };

    // Function to remove a tag
    const removeTag = (tagToRemove: string) => {
      if (disabled) return;
      const updatedTags = tags.filter((tag) => tag !== tagToRemove);
      setTags(updatedTags);
      onChange?.(updatedTags);
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled || !isAllowed) {
        toast({ message: t(notAllowedMessage) });
        return;
      }
      setInputValue(e.target.value);
    };

    // Handle key presses to create tags
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e); // Propagate original onKeyDown

      const valueToProcess = inputValue.trim();

      // Check for specific delimiters or Enter key
      if (
        e.key === "Enter" ||
        (tagDelimiter.includes(",") && e.key === ",") ||
        (tagDelimiter.includes(" ") && e.key === " ") ||
        (tagDelimiter.includes("Tab") && e.key === "Tab")
      ) {
        e.preventDefault(); // Prevent default behavior (e.g., form submission, tab focus)
        if (valueToProcess) {
          addTag(valueToProcess);
        } else if (e.key === "Enter" && tags.length > 0) {
          // If Enter is pressed on empty input, but there are tags,
          // maybe submit form or do something else? For now, do nothing.
        }
      } else if (
        e.key === "Backspace" &&
        inputValue === "" &&
        tags.length > 0
      ) {
        // Remove last tag if backspace is pressed on empty input
        removeTag(tags[tags.length - 1]);
      }
    };

    // Handle paste event (e.g., comma-separated tags)
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (disabled || !isAllowed) {
        toast({ message: t(notAllowedMessage) });
        return;
      }
      e.preventDefault();
      const pasteData = e.clipboardData.getData("text");
      const newTags = pasteData
        .split(new RegExp(`[${tagDelimiter.split("").join("|")}\\s]+`)) // Split by delimiters or whitespace
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");

      newTags.forEach((tag) => addTag(tag)); // Add each parsed tag
    };

    // Clear all tags
    const handleClearAllTags = () => {
      if (disabled) return;
      setTags([]);
      onChange?.([]);
      setInputValue("");
    };

    // Focus the input when the container is clicked
    const handleContainerClick = () => {
      inputRef.current?.focus();
    };

    const hasTags = tags.length > 0;
    const showClearButton = (hasTags || inputValue) && clearable; // Show if there are tags or something typed

    return (
      <div
        className={style.container}
        style={_.merge(componentStyle || {}, { width })}
      >
        <div
          ref={containerRef}
          className={clsx(style.tagsContainer, {
            [style.disabled]: disabled,
            [style.error]: !isValid,
          })}
          onClick={handleContainerClick} // Click anywhere on container to focus input
        >
          {tags.map((tag, index) => (
            <div key={index} className={style.tag}>
              <span className={style.tagText}>#{tag}</span>
              <button
                type="button"
                className={style.tagRemove}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent container click from re-focusing input
                  removeTag(tag);
                }}
                disabled={disabled}
              >
                &times;
              </button>
            </div>
          ))}

          <input
            type="text"
            ref={inputRef}
            name={name}
            className={style.input}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onPaste={handlePaste}
            placeholder={placeHolder ? t(placeHolder) : ""}
            disabled={disabled}
            autoComplete="off" // Prevent browser autocomplete for individual tag words
          />

          {showClearButton && (
            <div className={style.clearButtonArea}>
              <button
                type="button"
                className={style.clearButton}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent container click
                  handleClearAllTags();
                }}
                disabled={disabled}
              >
                &times;
              </button>
            </div>
          )}
        </div>

        {helperText.length > 0 && (
          <div className={style.requestMessage}>{helperText}</div>
        )}
      </div>
    );
  }
);

InputHashTag.displayName = "InputHashTag";

export default InputHashTag;
