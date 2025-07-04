import { useState, useContext } from "react";
import "react-datepicker/dist/react-datepicker.css";
import style from "./CustomDatePicker.module.css";
import P from "components/P/P";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import Div from "components/div/Div";
import NiceModal from "@ebay/nice-modal-react";
import Icon from "components/icons/Icon";
import { useTranslation } from "react-i18next";
import { BrowserDetectContext } from "providers/BrowserEventProvider";

const CustomDatePicker = ({ onConfirm, date = new Date() }) => {
  const { t } = useTranslation();
  const { isMobile } = useContext(BrowserDetectContext);
  const [selectedDate, setSelectedDate] = useState(date);
  const goToPreviousMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
    );
  };
  const goToNextMonth = () => {
    setSelectedDate(
      new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
    );
  };
  const formatDate = (date) => {
    return `${date.getFullYear()}${t("year")} ${date.getMonth() + 1}${t(
      "month"
    )} ${date.getDate()}${t("day")}`;
  };

  const getDaysInMonth = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay(); // 첫 번째 날의 요일 (0: 일요일 ~ 6: 토요일)
    const days = new Date(year, month + 1, 0).getDate(); // 해당 월의 총 일수
    const dates = [];

    // 첫 주의 빈 칸 채우기
    for (let i = 0; i < firstDay; i++) {
      dates.push(null);
    }

    // 날짜 채우기
    for (let i = 1; i <= days; i++) {
      dates.push(new Date(year, month, i));
    }

    return dates;
  };

  const days = getDaysInMonth(
    selectedDate.getFullYear(),
    selectedDate.getMonth()
  );

  const weekDays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const handleConfirm = () => {
    if (onConfirm) {
      // const chinaTime = new Date(selectedDate);
      // chinaTime.setHours(
      //   chinaTime.getHours() - chinaTime.getTimezoneOffset() / 60 + 8
      // );
      onConfirm(selectedDate);
    }
    NiceModal.hide("datePicker");
  };

  return (
    <VerticalFlex gap={30} height={"100%"} padding={42} position={"relative"}>
      <FlexChild justifyContent={"center"}>
        <P size={24} weight={700} color={"#353535"}>
          {formatDate(selectedDate)}
        </P>
      </FlexChild>

      <FlexChild alignItems={"center"}>
        <HorizontalFlex gap={30} justifyContent={"center"}>
          <FlexChild width={"fit-content"}>
            <P cursor={"pointer"} onClick={goToPreviousMonth}>
              <Icon name={"prevBtnBig"} />
            </P>
          </FlexChild>
          <FlexChild justifyContent={"center"} width={"fit-content"}>
            <P size={20} weight={600} color={"#353535"}>
              {selectedDate.getFullYear()}
              {t("year")} {selectedDate.getMonth() + 1}
              {t("month")}
            </P>
          </FlexChild>
          <FlexChild width={"fit-content"}>
            <P
              cursor={"pointer"}
              onClick={goToNextMonth}
              className={style.arrowButton}
            >
              <Icon name="nextBtnBig" />
            </P>
          </FlexChild>
        </HorizontalFlex>
      </FlexChild>

      <FlexChild width={"fit-content"}>
        <HorizontalFlex className={style.weekDays} gap={30}>
          {weekDays.map((day, index) => (
            <FlexChild key={index}>
              <P size={18} weight={600} color={"#8b8b8b"}>
                {day}
              </P>
            </FlexChild>
          ))}
        </HorizontalFlex>
      </FlexChild>

      <FlexChild width={"fit-content"}>
        <div className={style.calendarGrid}>
          {days.map((day, index) => (
            <Div
              key={index}
              className={`${style.dateBox} ${
                day && selectedDate.toDateString() === day.toDateString()
                  ? style.selectedDate
                  : ""
              }`}
              onClick={() => day && setSelectedDate(day)}
            >
              <P size={18}>{day ? day.getDate() : ""}</P>
            </Div>
          ))}
        </div>
      </FlexChild>

      <FlexChild
        onClick={handleConfirm}
        className={style.selectBtn}
        borderRadius={3}
        padding={10}
        width={310}
        cursor={"pointer"}
        position={"absolute"}
        bottom={isMobile ? 60 : 30}
        justifyContent={"center"}
      >
        <P color={"#ffffff"} size={20} weight={600} textAlign={"center"}>
          SelectDate
        </P>
      </FlexChild>
    </VerticalFlex>
  );
};

export default CustomDatePicker;
