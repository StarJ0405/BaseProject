import React, { useCallback, useMemo, useEffect, useRef } from "react";
import styles from "./SpinnerCalendar.module.css";

// --- 상수 정의 ---
const ITEM_HEIGHT = 30;
const VISIBLE_ITEMS_COUNT = 5;
const PADDING_ITEMS_COUNT = Math.floor(VISIBLE_ITEMS_COUNT / 2);
const SCROLL_DEBOUNCE_TIME = 150;
const WHEEL_THROTTLE_TIME = 50; // 마우스 휠 스크롤 스로틀 시간

// --- 타입 정의 ---
interface SpinnerCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  onDone: () => void;
  showTimePicker: boolean;
}

type ColumnType = "year" | "month" | "day" | "hour" | "minute";

const isSameDate = (date1: Date | null, date2: Date | null): boolean => {
  if (!date1 || !date2) return false;
  return date1.getTime() === date2.getTime();
};

// =================================================================
// ✨ 1. SpinnerColumn 컴포넌트 분리 (Key 문제 해결)
// =================================================================
interface SpinnerColumnProps {
  type: ColumnType;
  options: { value: number; label: string }[];
  selectedValue: number;
  columnRef: React.RefObject<HTMLDivElement>;
  onScroll: (event: React.UIEvent<HTMLDivElement>, type: ColumnType) => void;
  onWheel: (event: React.WheelEvent<HTMLDivElement>, type: ColumnType) => void;
}

const SpinnerColumn: React.FC<SpinnerColumnProps> = React.memo(
  ({ type, options, selectedValue, columnRef, onScroll, onWheel }) => {
    return (
      <div
        className={styles.spinnerColumn}
        ref={columnRef}
        onScroll={(e) => onScroll(e, type)}
        onWheel={(e) => onWheel(e, type)} // ✨ 2. onWheel 핸들러 추가
      >
        {Array(PADDING_ITEMS_COUNT)
          .fill(null)
          .map((_, i) => (
            <div key={`pad-top-${i}`} className={styles.spinnerItemDummy} />
          ))}
        {options.map((option) => (
          <div
            key={`${type}-${option.value}`}
            className={`${styles.spinnerItem} ${
              option.value === selectedValue ? styles.selected : ""
            }`}
          >
            {option.label}
          </div>
        ))}
        {Array(PADDING_ITEMS_COUNT)
          .fill(null)
          .map((_, i) => (
            <div key={`pad-bottom-${i}`} className={styles.spinnerItemDummy} />
          ))}
      </div>
    );
  }
);
SpinnerColumn.displayName = "SpinnerColumn";

const SpinnerCalendar: React.FC<SpinnerCalendarProps> = ({
  selectedDate,
  onSelectDate,
  onDone,
  showTimePicker,
}) => {
  const yearColumnRef = useRef<HTMLDivElement>(null);
  const monthColumnRef = useRef<HTMLDivElement>(null);
  const dayColumnRef = useRef<HTMLDivElement>(null);
  const hourColumnRef = useRef<HTMLDivElement>(null);
  const minuteColumnRef = useRef<HTMLDivElement>(null);

  const scrollEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null); // ✨ 2. 휠 스로틀링을 위한 ref
  const isProgrammaticScrollRef = useRef(false);
  const isInitialMountRef = useRef(true);

  const date = selectedDate || new Date();

  const getYearOptions = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    const endYear = currentYear + 100;
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => ({
      value: startYear + i,
      label: (startYear + i).toString(),
    }));
  }, []);

  const getMonthOptions = useCallback(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: `${i + 1}월`,
    }));
  }, []);

  const getDayOptions = useCallback((year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => ({
      value: i + 1,
      label: (i + 1).toString().padStart(2, "0"),
    }));
  }, []);

  const getHourOptions = useCallback(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      value: i,
      label: i.toString().padStart(2, "0"),
    }));
  }, []);

  const getMinuteOptions = useCallback(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      value: i,
      label: i.toString().padStart(2, "0"),
    }));
  }, []);

  const columnConfig = useMemo(() => {
    const columns: {
      type: ColumnType;
      ref: React.RefObject<HTMLDivElement>;
      options: { value: number; label: string }[];
      selectedValue: number;
    }[] = [
      {
        type: "year",
        ref: yearColumnRef as any,
        options: getYearOptions(),
        selectedValue: date.getFullYear(),
      },
      {
        type: "month",
        ref: monthColumnRef as any,
        options: getMonthOptions(),
        selectedValue: date.getMonth(),
      },
      {
        type: "day",
        ref: dayColumnRef as any,
        options: getDayOptions(date.getFullYear(), date.getMonth()),
        selectedValue: date.getDate(),
      },
    ];

    if (showTimePicker) {
      columns.push(
        {
          type: "hour",
          ref: hourColumnRef as any,
          options: getHourOptions(),
          selectedValue: date.getHours(),
        },
        {
          type: "minute",
          ref: minuteColumnRef as any,
          options: getMinuteOptions(),
          selectedValue: date.getMinutes(),
        }
      );
    }
    return columns;
  }, [
    date,
    showTimePicker,
    getYearOptions,
    getMonthOptions,
    getDayOptions,
    getHourOptions,
    getMinuteOptions,
  ]);

  const scrollToDate = useCallback(
    (targetDate: Date, behavior: ScrollBehavior) => {
      isProgrammaticScrollRef.current = true;
      columnConfig.forEach(({ ref, options, type }) => {
        if (!ref.current) return;
        let valueToFind: number;
        switch (type) {
          case "year":
            valueToFind = targetDate.getFullYear();
            break;
          case "month":
            valueToFind = targetDate.getMonth();
            break;
          case "day":
            valueToFind = targetDate.getDate();
            break;
          case "hour":
            valueToFind = targetDate.getHours();
            break;
          case "minute":
            valueToFind = targetDate.getMinutes();
            break;
        }
        const selectedIndex = options.findIndex(
          (opt) => opt.value === valueToFind
        );
        if (selectedIndex !== -1) {
          const targetScrollTop = selectedIndex * ITEM_HEIGHT;
          ref.current.scrollTo({ top: targetScrollTop, behavior });
        }
      });
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, SCROLL_DEBOUNCE_TIME + (behavior === "smooth" ? 150 : 0));
    },
    [columnConfig]
  );

  useEffect(() => {
    if (isInitialMountRef.current) {
      scrollToDate(date, "auto");
      isInitialMountRef.current = false;
    } else if (!isSameDate(date, selectedDate)) {
      scrollToDate(date, "smooth");
    }
  }, [date, scrollToDate, selectedDate]);

  const updateDate = useCallback(
    (type: ColumnType, newValue: number) => {
      const newDate = new Date(date);
      const originalDay = newDate.getDate();
      switch (type) {
        case "year":
          newDate.setFullYear(newValue);
          break;
        case "month":
          newDate.setMonth(newValue);
          break;
        case "day":
          newDate.setDate(newValue);
          break;
        case "hour":
          newDate.setHours(newValue);
          break;
        case "minute":
          newDate.setMinutes(newValue);
          break;
      }
      if (type === "year" || type === "month") {
        const daysInNewMonth = new Date(
          newDate.getFullYear(),
          newDate.getMonth() + 1,
          0
        ).getDate();
        if (originalDay > daysInNewMonth) {
          newDate.setDate(daysInNewMonth);
        }
      }
      if (!isSameDate(newDate, date)) {
        onSelectDate(newDate);
      }
    },
    [date, onSelectDate]
  );

  const handleScrollEnd = useCallback(
    (columnDiv: HTMLDivElement, type: ColumnType) => {
      const currentScrollTop = columnDiv.scrollTop;
      const closestIndex = Math.round(currentScrollTop / ITEM_HEIGHT);
      const currentOptions = columnConfig.find((c) => c.type === type)?.options;
      if (!currentOptions || !currentOptions[closestIndex]) return;
      const newValue = currentOptions[closestIndex].value;
      updateDate(type, newValue);
    },
    [columnConfig, updateDate]
  );

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>, type: ColumnType) => {
      if (isProgrammaticScrollRef.current) return;
      if (scrollEndTimeoutRef.current)
        clearTimeout(scrollEndTimeoutRef.current);
      const columnDiv = event.currentTarget;
      scrollEndTimeoutRef.current = setTimeout(() => {
        handleScrollEnd(columnDiv, type);
      }, SCROLL_DEBOUNCE_TIME);
    },
    [handleScrollEnd]
  );

  // ✨ 2. PC 마우스 휠 전용 핸들러 추가
  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>, type: ColumnType) => {
      //event.preventDefault(); // 기본 스크롤 동작 방지
      if (wheelTimeoutRef.current) return; // 스로틀링

      const config = columnConfig.find((c) => c.type === type);
      if (!config) return;

      const { options, selectedValue } = config;
      const currentIndex = options.findIndex(
        (opt) => opt.value === selectedValue
      );
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;
      if (event.deltaY > 0) {
        // 아래로 스크롤
        nextIndex = Math.min(options.length - 1, currentIndex + 1);
      } else {
        // 위로 스크롤
        nextIndex = Math.max(0, currentIndex - 1);
      }

      if (nextIndex !== currentIndex) {
        updateDate(type, options[nextIndex].value);
      }

      wheelTimeoutRef.current = setTimeout(() => {
        wheelTimeoutRef.current = null;
      }, WHEEL_THROTTLE_TIME);
    },
    [columnConfig, updateDate]
  );

  const formattedHeaderDate = useMemo(() => {
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(date);
  }, [date]);

  return (
    <div className={styles.spinnerCalendarContainer}>
      <div className={styles.headerDate}>{formattedHeaderDate}</div>
      <div className={styles.spinnerColumnsWrapper}>
        <div className={styles.selectionOverlay} />

        {columnConfig.map(({ type, ref, options, selectedValue }) => {
          const column = (
            <SpinnerColumn
              type={type}
              options={options}
              selectedValue={selectedValue}
              columnRef={ref}
              onScroll={handleScroll}
              onWheel={handleWheel} // ✨ 2. onWheel 핸들러 전달
            />
          );

          if (!showTimePicker && (type === "hour" || type === "minute")) {
            return null;
          }
          if (showTimePicker && (type === "hour" || type === "minute")) {
            return (
              // ✨ 1. React.Fragment에 key 추가
              <React.Fragment key={type}>
                <div className={styles.timeSeparator}>:</div>
                {column}
              </React.Fragment>
            );
          }
          // ✨ 1. 분리된 컴포넌트에 직접 key 추가
          return React.cloneElement(column, { key: type });
        })}
      </div>
      <div className={styles.doneButtonContainer}>
        <button className={styles.doneButton} onClick={onDone}>
          확인
        </button>
      </div>
    </div>
  );
};

export default SpinnerCalendar;
