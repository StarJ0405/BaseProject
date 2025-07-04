import { CFormTextarea } from "@coreui/react";
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

const InputTextarea = forwardRef(
  (
    {
      regExp,
      placeholder,
      label,
      name: props_name,
      value: props_value,
      hidden,
      targetRef,
      onChange: props_onChange,
      validable = false,
      rows,
      readOnly,
      style,
    },
    ref
  ) => {
    const { isMobile } = useContext(BrowserDetectContext);
    const input = useRef();

    const { t } = useTranslation();
    const [name, setName] = useState(props_name || "");
    const [value, setValue] = useState(props_value || "");
    const [isValid, setValid] = useState(regExp ? false : true);
    const [isEmpty, setEmpty] = useState(true);

    const onChange = (e) => {
      let inputValue = e.target.value;
      setValue(inputValue);
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
      empty() {
        setValue("");
      },
      focus() {
        input.current.scrollTo(0, input.current.offsetTop);
        if (hidden) {
          targetRef.current.focus();
        } else {
          input.current.focus();
        }
      },
    }));

    useEffect(() => {
      setValue(props_value || "");
    }, [props_value]);

    useEffect(() => {
      if (regExp) {
        let validationResult = true;
        regExp.forEach((re) => {
          let eachValidationResult = re.exp.test(value);
          if (eachValidationResult === false) {
            validationResult = false;
          }
        });

        setValid(validationResult);
      } else {
        setValid(true);
      }

      if (value && value.length > 0) {
        setEmpty(false);
      } else {
        setEmpty(true);
      }

      props_onChange?.(value);
    }, [value]);

    const mobileTextAreaStyle = {
      border: "none",
      boxShadow: "none",
      borderRadius: "0",
      fontSize: "15px",
      padding: "0 20px",
      color: "var(--font-color)",
      height: "50px",
      resize: "none",
    };

    const textAreaStyle = {
      boxShadow: "none",
      borderRadius: "0",
      fontSize: "15px",
      resize: "none",
      color: "var(--font-color)",
    };

    return (
      <CFormTextarea
        style={{
          ...(isMobile ? mobileTextAreaStyle : textAreaStyle),
          ...style,
        }}
        type="text"
        feedback={isValid ? false : "잘 입력좀해주세요"}
        rows={rows}
        placeholder={placeholder}
        value={value}
        valid={validable ? (isEmpty ? "" : isValid) : null}
        invalid={validable ? (isEmpty ? "" : !isValid) : null}
        onChange={onChange}
        label={label}
        ref={input}
        readOnly={readOnly}
      />
    );
  }
);

export default InputTextarea;
