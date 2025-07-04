import clsx from "clsx";
import Button from "components/buttons/Button";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import { forwardRef, useImperativeHandle, useState } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import style from "./datepicker.module.css";
const dateButtons = [
  {
    text: "전체",
    start_date: new Date(0),
  },
  {
    text: "오늘",
    start_date: new Date(),
  },
  {
    text: "1주일",
    start_date: new Date(new Date().setDate(new Date().getDate() - 7)),
  },
  {
    text: "1개월",
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 1)),
  },
  {
    text: "3개월",
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 3)),
  },
  {
    text: "6개월",
    start_date: new Date(new Date().setMonth(new Date().getMonth() - 6)),
  },
  {
    text: "1년",
    start_date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
  },
];

const RangeDatePicker = forwardRef(
  (
    {
      withPortal,
      withButton = false,
      buttons = dateButtons,
      closeOnScroll = true,
      limits = [{ start: new Date("2024-01-01"), end: new Date() }],
      showTimeSelect = false,
      disabled,
    },
    ref
  ) => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(null);
    const onChange = (dates) => {
      const [start, end] = dates;
      setStartDate(start);
      setEndDate(end);
    };
    useImperativeHandle(ref, () => ({
      getDates() {
        return [startDate, endDate];
      },
      getStartDate() {
        return startDate;
      },
      getEndDate() {
        return endDate;
      },
      setDate(startDate, endDate) {
        setStartDate(new Date(startDate));
        setEndDate(new Date(endDate));
      },
      setStartDate(value) {
        setStartDate(new Date(value));
      },
      setEndDate(value) {
        setEndDate(new Date(value));
      },
    }));
    return withButton ? (
      <HorizontalFlex gap={10}>
        <FlexChild width={"max-content"}>
          <ReactDatePicker
            className={style.pickerInput}
            style={{ width: "unset" }}
            closeOnScroll={closeOnScroll}
            selected={startDate}
            onChange={onChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            peekNextMonth
            showMonthDropdown
            showYearDropdown
            wrapperClassName="datepicker-wrapper"
            includeDateIntervals={limits}
            withPortal={withPortal}
            showTimeSelect={showTimeSelect}
            disabled={disabled}
          />
        </FlexChild>
        <FlexChild>
          <HorizontalFlex gap={10} justifyContent={"flex-start"}>
            {buttons?.map((date) => (
              <Button
                className={clsx(style.dateButton, {
                  [style.selected]:
                    sameDate(startDate, date.start_date) &&
                    sameDate(endDate, new Date()),
                })}
                key={date.text}
                onClick={() => {
                  setStartDate(date.start_date);
                  setEndDate(new Date());
                }}
              >
                {date.text}
              </Button>
            ))}
          </HorizontalFlex>
        </FlexChild>
      </HorizontalFlex>
    ) : (
      <ReactDatePicker
        className={style.pickerInput}
        style={{ width: "unset" }}
        closeOnScroll={closeOnScroll}
        selected={startDate}
        onChange={onChange}
        startDate={startDate}
        endDate={endDate}
        selectsRange
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        wrapperClassName="datepicker-wrapper"
        includeDateIntervals={limits}
        withPortal={withPortal}
        showTimeSelect={showTimeSelect}
        disabled={disabled}
      />
    );
  }
);

export default RangeDatePicker;

const sameDate = (date1, date2) => {
  if (date1 && date2) {
    date1 = new Date(date1);
    date2 = new Date(date2);
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);

    return (
      date1.toISOString().slice(0, 11) === date2.toISOString().slice(0, 11)
    );
  }

  return false;
};
