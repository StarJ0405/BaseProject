import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

import { CFormInput } from "@coreui/react";
import FlexChild from "components/flex/FlexChild";
import VerticalFlex from "components/flex/VerticalFlex";
import P from "components/P/P";
import _ from "lodash";

const InputHashTag = forwardRef(
  (
    {
      id,
      placeHolder,
      className,
      label,
      style,
      width,
      height,
      readOnly,
      noWhiteSpace = false,
      onKeyDown,
      feedback = "pleaseCheck",
      validable = true,
      maxLength,
      name = "",
      values: props_values,
      onChange: props_onChange,
      size,
      disabled,
      focus = false,
    },
    ref
  ) => {
    const input = useRef();
    const { t } = useTranslation();
    const [value, setValue] = useState();
    const [values, setValues] = useState(props_values || []);
    const [isValid, setValid] = useState(true);
    const [isEmpty, setEmpty] = useState(true);
    const [searchInterval, setSearchInterval] = useState();

    const [isMounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);
    const onChange = (e) => {
      let inputValue = e.target.value;

      if (noWhiteSpace) {
        inputValue = inputValue.replace(/ /gi, "");
      }

      setValue(String(inputValue));
    };
    useEffect(() => {
      setValues(props_values || []);
    }, [props_values]);
    useEffect(() => {
      if (focus) input?.current?.focus?.();
    }, [focus]);
    useImperativeHandle(ref, () => ({
      getId() {
        return id;
      },
      getName() {
        return name;
      },
      getValues() {
        return values;
      },
      setValues(values) {
        setValues(values);
      },
      isValid() {
        return true;
      },
      setValid(valid) {
        setValid(valid);
      },
      empty() {
        setValues([]);
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
      border: "none",
      //   border: "1px solid var(--line-color)",
    };

    return (
      <VerticalFlex
        width={width}
        height={height}
        border="1px solid var(--line-color)"
        borderRadius={0}
      >
        {/* <FlexChild
          overflowY={"auto"}
          gap={5}
          flexWrap={"wrap"}
          width={width}
          padding={values?.length > 0 && 10}
        >
          {values.map((value) => (
            <P
              key={value}
              padding={5}
              borderRadius={5}
              position={"relative"}
              width={"max-content"}
              maxWidth={"inherit"}
              wordBreak={"break-all"}
              color="white"
              backgroundColor={"#c000c0"}
              justifyContent={"flex-start"}
              weight={"bold"}
              cursor
              onClick={() => setValues([...values.filter((f) => f !== value)])}
            >
              #{value}
            </P>
          ))}
        </FlexChild> */}
        <Tags width={width} values={values} setValues={setValues} />
        <FlexChild height={"max-content"}>
          <CFormInput
            id={id}
            className={className}
            style={_.merge(
              defaultInputStyle,
              style,
              width ? { width: width } : {}
            )}
            type={"text"}
            feedback={isValid ? false : t(feedback)}
            placeholder={t(placeHolder)}
            value={value ?? ""}
            valid={validable ? (isEmpty ? null : isValid) : null}
            invalid={validable ? (isEmpty ? null : !isValid) : null}
            onChange={onChange}
            label={label}
            ref={input}
            size={size}
            disabled={disabled}
            readOnly={readOnly}
            onKeyDown={(e) => {
              if (e.key === "Enter" && value) {
                setValues(_.uniqBy([...values, value]));
                setValue("");
              }
              onKeyDown?.(e);
            }}
            maxLength={maxLength}
          />
        </FlexChild>
      </VerticalFlex>
    );
  }
);

export default InputHashTag;

export const Tags = ({ width, values = [], setValues }) => (
  <FlexChild
    overflowY={"auto"}
    gap={5}
    flexWrap={"wrap"}
    width={width}
    padding={values?.length > 0 && 10}
  >
    {values.map((value) => (
      <P
        key={value}
        padding={5}
        borderRadius={5}
        position={"relative"}
        width={"max-content"}
        maxWidth={"inherit"}
        wordBreak={"break-all"}
        color="white"
        backgroundColor={"#c000c0"}
        justifyContent={"flex-start"}
        weight={"bold"}
        cursor={setValues}
        onClick={() =>
          setValues && setValues([...values.filter((f) => f !== value)])
        }
      >
        #{value}
      </P>
    ))}
  </FlexChild>
);
