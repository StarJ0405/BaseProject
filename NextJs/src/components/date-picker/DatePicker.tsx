import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactDOM from "react-dom"; // Portal 사용을 위해 import
import Calendar from "./Calendar"; // 기존 달력 컴포넌트
import styles from "./DatePicker.module.css"; // CSS Modules import
import SpinnerCalendar from "./SpinnerCalendar"; // 새 스피너 캘린더 컴포넌트

interface DatePickerProps {
  initialDate?: Date;
  defaultSelectedDate?: Date; // 단일 선택 시 초기 날짜
  defaultSelectedRange?: [Date | null, Date | null]; // 범위 선택 시 초기 날짜
  selectionMode?: "single" | "range" | "spinner";
  onChange?: (date: Date | [Date | null, Date | null] | null) => void;
  placeholder?: string;
  dateFormat?: (
    date: Date | [Date | null, Date | null] | null,
    showTimePicker: boolean
  ) => string;
  showTimePicker?: boolean; // 시간 선택기 표시 여부
}

// 날짜/시간 포맷 함수 (YYYY-MM-DD HH:MM)
const defaultDateFormat = (
  date: Date | [Date | null, Date | null] | null,
  showTimePicker: boolean
): string => {
  if (!date) return "";

  const formatSingleDate = (d: Date | null): string => {
    if (!d) return "";
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const hours = d.getHours().toString().padStart(2, "0");
    const minutes = d.getMinutes().toString().padStart(2, "0");
    return showTimePicker
      ? `${year}-${month}-${day} ${hours}:${minutes}`
      : `${year}-${month}-${day}`;
  };

  if (Array.isArray(date)) {
    const [start, end] = date;
    if (start && end) {
      return `${formatSingleDate(start)} ~ ${formatSingleDate(end)}`;
    }
    if (start) {
      return `${formatSingleDate(start)} ~`; // 범위 선택 중일 때
    }
    return "";
  }
  return formatSingleDate(date);
};

const DatePicker: React.FC<DatePickerProps> = ({
  initialDate = new Date(),
  defaultSelectedDate = null,
  defaultSelectedRange = [null, null],
  selectionMode = "single",
  onChange,
  placeholder = "날짜를 선택하세요",
  dateFormat = defaultDateFormat,
  showTimePicker = false,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedSingleDate, setSelectedSingleDate] = useState<Date | null>(
    defaultSelectedDate
  );
  const [selectedDateRange, setSelectedDateRange] =
    useState<[Date | null, Date | null]>(defaultSelectedRange);

  const pickerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });

  const updateCalendarPosition = useCallback(() => {
    if (pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // 캘린더/스피너의 대략적인 높이
      let pickerHeight = 300; // 기본 달력 높이
      if (selectionMode === "spinner") {
        pickerHeight = showTimePicker ? 300 : 250; // 스피너는 시간 포함 시 300px, 시간 없음 250px
      } else if (selectionMode === "range" && showTimePicker) {
        pickerHeight = 400; // 범위 선택+시간선택 달력 높이
      }

      const top =
        spaceBelow >= pickerHeight || spaceBelow >= spaceAbove
          ? rect.bottom + window.scrollY + 10
          : rect.top + window.scrollY - pickerHeight - 10;

      const left = rect.left + window.scrollX;
      setCalendarPosition({ top, left });
    }
  }, [showTimePicker, selectionMode]);

  useEffect(() => {
    updateCalendarPosition();
    window.addEventListener("resize", updateCalendarPosition);
    window.addEventListener("scroll", updateCalendarPosition, true);

    return () => {
      window.removeEventListener("resize", updateCalendarPosition);
      window.removeEventListener("scroll", updateCalendarPosition, true);
    };
  }, [updateCalendarPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectDate = useCallback(
    (date: Date) => {
      setSelectedSingleDate(date);
      onChange?.(date);
      // 스피너 UI에서는 'Done' 버튼으로 닫히므로 여기서 바로 닫지 않음
      // 일반 달력 UI에서는 단일 선택 시 바로 닫힘
      if (selectionMode !== "spinner") {
        setIsCalendarOpen(false);
      }
    },
    [onChange, selectionMode]
  );

  const handleSelectRange = useCallback(
    (range: [Date | null, Date | null]) => {
      setSelectedDateRange(range);
      if (range[0] && range[1]) {
        onChange?.(range);
        if (!showTimePicker) {
          // 범위 선택 + 시간 선택기가 없으면 닫음
          setIsCalendarOpen(false);
        }
      }
    },
    [onChange, showTimePicker]
  );

  const displayDateText = useMemo(() => {
    if (selectionMode !== "range") {
      return selectedSingleDate
        ? dateFormat(selectedSingleDate, showTimePicker)
        : placeholder;
    } else {
      return selectedDateRange[0] || selectedDateRange[1]
        ? dateFormat(selectedDateRange, showTimePicker)
        : placeholder;
    }
  }, [
    selectedSingleDate,
    selectedDateRange,
    selectionMode,
    placeholder,
    dateFormat,
  ]);

  const renderPickerComponent = () => {
    if (selectionMode === "spinner") {
      return (
        <SpinnerCalendar
          selectedDate={selectedSingleDate || new Date()} // SpinnerCalendar는 Date 객체가 항상 필요
          onSelectDate={handleSelectDate}
          onDone={() => setIsCalendarOpen(false)} // SpinnerCalendar의 "Done" 버튼이 클릭되면 닫기
          showTimePicker={showTimePicker}
        />
      );
    } else {
      return (
        <Calendar
          initialDate={
            selectionMode === "single"
              ? selectedSingleDate || initialDate
              : selectedDateRange[0] || initialDate
          }
          selectedDate={selectedSingleDate}
          selectedRange={selectedDateRange}
          onSelectDate={handleSelectDate}
          onSelectRange={handleSelectRange}
          selectionMode={selectionMode}
          showTimePicker={showTimePicker}
        />
      );
    }
  };

  return (
    <div className={styles.datePickerContainer}>
      <div
        ref={pickerRef}
        className={styles.dateDisplay}
        onClick={() => {
          setIsCalendarOpen((prev) => !prev);
          updateCalendarPosition();
        }}
      >
        {displayDateText}
      </div>

      {isCalendarOpen &&
        ReactDOM.createPortal(
          <div
            ref={calendarRef}
            className={styles.calendarPortal}
            style={{ top: calendarPosition.top, left: calendarPosition.left }}
          >
            {renderPickerComponent()}
          </div>,
          document.body
        )}
    </div>
  );
};

export default DatePicker;
