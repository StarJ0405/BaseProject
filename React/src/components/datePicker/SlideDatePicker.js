import { useState, useRef, useEffect, useContext } from "react";
import "react-datepicker/dist/react-datepicker.css";
import style from "./SlideDatePicker.module.css";
import P from "components/P/P";
import FlexChild from "components/flex/FlexChild";
import VerticalFlex from "components/flex/VerticalFlex";
import Div from "components/div/Div";
import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { BrowserDetectContext } from "providers/BrowserEventProvider";

const SlideDatePicker = ({ onConfirm, birthday }) => {
  const today = new Date();
  const parsedBirthday = birthday ? new Date(birthday) : today;
  const { isMobile } = useContext(BrowserDetectContext);

  const modal = useModal();
  const hideDay = modal.args?.hideDay || false;

  const [selectedYear, setSelectedYear] = useState(
    parsedBirthday.getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    parsedBirthday.getMonth() + 1
  );
  const [selectedDate, setSelectedDate] = useState(parsedBirthday.getDate());

  const yearRef = useRef(null);
  const monthRef = useRef(null);
  const dateRef = useRef(null);

  // 스크롤 타이머 참조
  const yearScrollTimer = useRef(null);
  const monthScrollTimer = useRef(null);
  const dateScrollTimer = useRef(null);

  const years = Array.from(
    { length: 101 },
    (_, i) => today.getFullYear() - 100 + i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const infiniteMonths = [...months, ...months, ...months];
  const infiniteDays = [...days, ...days, ...days];

  const ITEM_HEIGHT = 40; // 아이템 높이 상수
  useEffect(() => {
    if (dateRef.current) {
      const middleIndex = days.length + selectedDate - 1;
      setTimeout(() => {
        dateRef.current.scrollTo({
          top: middleIndex * ITEM_HEIGHT,
          behavior: "instant",
        });
      }, 10);
    }
  }, []);

  useEffect(() => {
    if (monthRef.current) {
      const middleIndex = months.length + selectedMonth - 1;
      setTimeout(() => {
        monthRef.current.scrollTo({
          top: middleIndex * ITEM_HEIGHT,
          behavior: "instant",
        });
      }, 10);
    }
  }, []);

  useEffect(() => {
    if (yearRef.current) {
      const yearIndex = years.findIndex((year) => year === selectedYear);
      if (yearIndex !== -1) {
        setTimeout(() => {
          yearRef.current.scrollTo({
            top: yearIndex * ITEM_HEIGHT,
            behavior: "instant",
          });
        }, 10);
      }
    }
  }, []);
  const handleDateScroll = () => {
    if (dateRef.current) {
      const scrollPosition = dateRef.current.scrollTop;
      const itemHeight = ITEM_HEIGHT;
      const totalItems = infiniteDays.length;
      const totalScrollHeight = itemHeight * totalItems;
      const buffer = itemHeight * days.length;

      if (scrollPosition <= buffer) {
        dateRef.current.scrollTo({
          top: scrollPosition + buffer,
          behavior: "instant",
        });
      } else if (scrollPosition >= totalScrollHeight - buffer) {
        dateRef.current.scrollTo({
          top: scrollPosition - buffer,
          behavior: "instant",
        });
      }
      const centerIndex = Math.round(scrollPosition / itemHeight) % days.length;
      const newSelectedDate = centerIndex + 1;

      if (newSelectedDate !== selectedDate) {
        setSelectedDate(newSelectedDate);
      }
      clearTimeout(dateScrollTimer.current);
      dateScrollTimer.current = setTimeout(() => {
        const newPosition =
          Math.round(dateRef.current.scrollTop / itemHeight) * itemHeight;
        dateRef.current.scrollTo({
          top: newPosition,
          behavior: "smooth",
        });
      }, 150);
    }
  };

  const handleMonthScroll = () => {
    if (monthRef.current) {
      const scrollPosition = monthRef.current.scrollTop;
      const itemHeight = ITEM_HEIGHT;
      const totalItems = infiniteMonths.length;
      const totalScrollHeight = itemHeight * totalItems;
      const buffer = itemHeight * months.length;
      if (scrollPosition <= buffer) {
        monthRef.current.scrollTo({
          top: scrollPosition + buffer,
          behavior: "instant",
        });
      } else if (scrollPosition >= totalScrollHeight - buffer) {
        monthRef.current.scrollTo({
          top: scrollPosition - buffer,
          behavior: "instant",
        });
      }
      const centerIndex =
        Math.round(scrollPosition / itemHeight) % months.length;
      const newSelectedMonth = centerIndex + 1;

      if (newSelectedMonth !== selectedMonth) {
        setSelectedMonth(newSelectedMonth);
      }
      clearTimeout(monthScrollTimer.current);
      monthScrollTimer.current = setTimeout(() => {
        const newPosition =
          Math.round(monthRef.current.scrollTop / itemHeight) * itemHeight;
        monthRef.current.scrollTo({
          top: newPosition,
          behavior: "smooth",
        });
      }, 150);
    }
  };

  const handleYearScroll = () => {
    if (yearRef.current) {
      const scrollPosition = yearRef.current.scrollTop;
      const itemHeight = ITEM_HEIGHT;

      const centerIndex = Math.round(scrollPosition / itemHeight);

      if (centerIndex >= 0 && centerIndex < years.length) {
        const newSelectedYear = years[centerIndex];
        if (newSelectedYear !== selectedYear) {
          setSelectedYear(newSelectedYear);
        }
      }
      clearTimeout(yearScrollTimer.current);
      yearScrollTimer.current = setTimeout(() => {
        const newPosition =
          Math.round(yearRef.current.scrollTop / itemHeight) * itemHeight;
        yearRef.current.scrollTo({
          top: newPosition,
          behavior: "smooth",
        });
      }, 150);
    }
  };
  useEffect(() => {
    return () => {
      clearTimeout(yearScrollTimer.current);
      clearTimeout(monthScrollTimer.current);
      clearTimeout(dateScrollTimer.current);
    };
  }, []);

  const handleConfirm = () => {
    const lastDateOfMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const validDate = Math.min(selectedDate, lastDateOfMonth);
    const selectedFullDate = new Date(
      selectedYear,
      selectedMonth - 1,
      validDate
    );
    selectedFullDate.setHours(12, 0, 0, 0);

    if (onConfirm) {
      onConfirm(selectedFullDate);
    }
    if (modal.args?.confirmCondition && modal.args?.onConfirm) {
      modal.args.onConfirm({
        year: selectedYear,
        month: selectedMonth,
      });
    }

    NiceModal.hide("datePicker");
  };

  return (
    <VerticalFlex
      gap={20}
      height={"95%"}
      padding={20}
      position={"relative"}
      alignItems={"center"}
      justifyContent={isMobile ? "start" : "center"}
    >
      <Div className={style.scrollContainerWrapper}>
        <div className={style.centerHighlight}></div>
        <FlexChild width={"50%"}>
          <div
            className={style.scrollContainer}
            ref={yearRef}
            onScroll={handleYearScroll}
          >
            {years.map((year, index) => (
              <Div
                key={index}
                className={`${style.dateItem} ${
                  selectedYear === year ? style.selected : ""
                }`}
                paddingLeft={"40%"}
              >
                <P size={18} rawText={true}>
                  {year}
                </P>
                <P size={18} paddingLeft={6}>
                  year
                </P>
              </Div>
            ))}
          </div>
        </FlexChild>
        <FlexChild width={"50%"}>
          <div
            className={style.scrollContainer}
            ref={monthRef}
            onScroll={handleMonthScroll}
          >
            {infiniteMonths.map((month, index) => (
              <Div
                key={index}
                className={`${style.dateItem} ${
                  selectedMonth === month ? style.selected : ""
                }`}
                paddingRight={"40%"}
              >
                <P size={18}>{month}</P>
                <P size={18} paddingLeft={3}>
                  month
                </P>
              </Div>
            ))}
          </div>
        </FlexChild>
        {!hideDay && (
          <FlexChild width={"27%"}>
            <div
              className={style.scrollContainer}
              ref={dateRef}
              onScroll={handleDateScroll}
            >
              {infiniteDays.map((day, index) => (
                <Div
                  key={index}
                  className={`${style.dateItem} ${
                    selectedDate === day ? style.selected : ""
                  }`}
                >
                  <P size={18}>{day}</P>
                  <P size={18}>day</P>
                </Div>
              ))}
            </div>
          </FlexChild>
        )}
      </Div>

      <FlexChild
        className={style.redBtn}
        borderRadius={3}
        padding={10}
        width={310}
        cursor={"pointer"}
        position={"absolute"}
        bottom={isMobile ? 65 : 30}
      >
        <div onClick={handleConfirm}>
          <P color={"#ffffff"} size={20} weight={600} textAlign={"center"}>
            SelectDate
          </P>
        </div>
      </FlexChild>
    </VerticalFlex>
  );
};

export default SlideDatePicker;
