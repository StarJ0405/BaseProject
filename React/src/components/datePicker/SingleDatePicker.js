import { forwardRef, useImperativeHandle, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import style from "./datepicker.module.css";
const SingleDatePicker = forwardRef(
  (
    {
      withPortal,
      closeOnScroll = true,
      limits = [{ start: new Date("2024-01-01"), end: new Date() }],
      showTimeSelect = false,
    },
    ref
  ) => {
    const [date, setDate] = useState(new Date());
    const onChange = (date) => {
      setDate(date);
    };
    useImperativeHandle(ref, () => ({
      getDate() {
        return date;
      },
      setDate(value) {
        setDate(new Date(value));
      },
    }));
    return (
      <ReactDatePicker
        className={style.div}
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        closeOnScroll={closeOnScroll}
        selected={date}
        onChange={onChange}
        includeDateIntervals={limits}
        withPortal={withPortal}
        showTimeSelect={showTimeSelect}
      />
    );
  }
);

export default SingleDatePicker;
