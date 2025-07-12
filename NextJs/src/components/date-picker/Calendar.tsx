import React, { useState, useCallback, useMemo, useEffect } from "react";
import styles from "./Calendar.module.css"; // CSS Modules import

interface CalendarProps {
  initialDate?: Date; // 초기 달력 표시 날짜
  selectedDate?: Date | null; // 단일 선택 날짜
  selectedRange?: [Date | null, Date | null]; // 범위 선택 날짜 [start, end]
  onSelectDate?: (date: Date) => void; // 단일 날짜 선택 시 콜백 (시간 포함)
  onSelectRange?: (range: [Date | null, Date | null]) => void; // 범위 날짜 선택 시 콜백 (시간 포함)
  selectionMode?: "single" | "range"; // 'single' 또는 'range' 모드
  showTimePicker?: boolean; // 시간 선택기 표시 여부
}

const Calendar: React.FC<CalendarProps> = ({
  initialDate = new Date(),
  selectedDate,
  selectedRange = [null, null],
  onSelectDate,
  onSelectRange,
  selectionMode = "single",
  showTimePicker = false,
}) => {
  // 현재 달력을 표시할 월과 연도 상태
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  // 범위 선택 모드일 때 시작/끝 날짜 임시 저장
  const [rangeStart, setRangeStart] = useState<Date | null>(selectedRange[0]);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(selectedRange[1]);

  // 오늘 날짜를 기억
  const today = useMemo(() => new Date(), []);

  // 월 이름 배열
  const monthNames = useMemo(
    () => [
      "1월",
      "2월",
      "3월",
      "4월",
      "5월",
      "6월",
      "7월",
      "8월",
      "9월",
      "10월",
      "11월",
      "12월",
    ],
    []
  );

  // 초기 선택 범위가 있을 경우, 내부 상태 동기화
  useEffect(() => {
    // Range 모드일 때만 rangeStart, rangeEnd를 동기화
    if (selectionMode === "range") {
      setRangeStart(selectedRange[0]);
      setRangeEnd(selectedRange[1]);
    } else {
      // Single 모드일 때는 selectedDate에 따라 시간 상태를 업데이트
      if (selectedDate) {
        // Calendar 내부의 시간 선택기가 단일 모드일 때만 사용되므로,
        // selectedDate의 시간을 따라감.
        setRangeStart(selectedDate); // Calendar 내부에서 단일 모드 시 selectedDate를 rangeStart로 임시 사용
        setRangeEnd(null);
      } else {
        // 선택된 날짜가 없을 경우 initialDate의 시간을 사용
        setRangeStart(initialDate);
        setRangeEnd(null);
      }
    }
  }, [selectedRange, selectedDate, selectionMode, initialDate]);

  // 특정 월의 날짜들을 배열로 생성하는 함수
  const generateDates = useCallback((year: number, month: number): Date[] => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const numDays = lastDayOfMonth.getDate();

    const dates: Date[] = [];
    // 이전 달의 날짜로 첫 주를 채움
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0: 일요일, 6: 토요일
    for (let i = 0; i < startDayOfWeek; i++) {
      const prevDate = new Date(year, month, 0); // 이전 달의 마지막 날
      prevDate.setDate(prevDate.getDate() - (startDayOfWeek - 1 - i));
      dates.push(prevDate);
    }

    // 현재 달의 날짜 채움
    for (let i = 1; i <= numDays; i++) {
      dates.push(new Date(year, month, i));
    }

    // 다음 달의 날짜로 마지막 주를 채움 (총 6주 = 42칸 유지)
    const totalCells = 6 * 7;
    const remainingCells = totalCells - dates.length;

    for (let i = 1; i <= remainingCells; i++) {
      dates.push(new Date(year, month + 1, i));
    }

    return dates;
  }, []);

  // 현재 월의 날짜 배열을 useMemo로 캐싱
  const datesInMonth = useMemo(
    () => generateDates(currentYear, currentMonth),
    [currentYear, currentMonth, generateDates]
  );

  // 날짜 클릭 핸들러
  const handleDateClick = useCallback(
    (date: Date) => {
      if (selectionMode === "single") {
        // 단일 모드에서는 기존 selectedDate의 시간을 가져와 적용하거나, 현재 시간 적용
        const targetDate = selectedDate || new Date();
        const newDateWithTime = new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          targetDate.getHours(),
          targetDate.getMinutes()
        );
        onSelectDate?.(newDateWithTime);
      } else {
        // 'range' 모드
        if (!rangeStart || rangeEnd) {
          // 시작 날짜가 없거나, 이미 범위가 완성된 경우
          // 새로운 범위 시작, 현재 시간 적용 (또는 default 시간)
          const newStart = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            rangeStart?.getHours() || initialDate.getHours(), // 기존 시작 시간 또는 초기 시간
            rangeStart?.getMinutes() || initialDate.getMinutes()
          );
          setRangeStart(newStart);
          setRangeEnd(null);
          // 콜백은 아직 호출하지 않음 (끝 날짜 선택 대기)
        } else if (date < rangeStart) {
          // 선택한 날짜가 현재 시작 날짜보다 이전인 경우
          // 시작 날짜 재설정, 기존 시작 시간 적용
          const newStart = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            rangeStart.getHours(),
            rangeStart.getMinutes()
          );
          setRangeStart(newStart);
          setRangeEnd(null);
        } else {
          // 시작 날짜가 있고, 선택한 날짜가 시작 날짜 이후인 경우 (범위 완성)
          // 끝 날짜 설정, 기존 끝 시간 적용 (또는 시작 시간과 동일)
          const newEnd = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            (rangeEnd as any)?.getHours() || rangeStart.getHours(), // 기존 끝 시간 또는 시작 시간
            (rangeEnd as any)?.getMinutes() || rangeStart.getMinutes()
          );
          setRangeEnd(newEnd);
          onSelectRange?.([rangeStart, newEnd]); // 범위 선택 콜백 호출
        }
      }
    },
    [
      selectionMode,
      rangeStart,
      rangeEnd,
      selectedDate,
      onSelectDate,
      onSelectRange,
      initialDate,
    ]
  );

  // 달 이동
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 0) {
        setCurrentYear((prevYear) => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prevMonth) => {
      if (prevMonth === 11) {
        setCurrentYear((prevYear) => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  }, []);

  // 각 날짜 셀에 적용될 CSS 클래스를 결정하는 함수
  const getDateClassName = useCallback(
    (date: Date) => {
      let className = styles.calendarDay;

      if (date.getMonth() !== currentMonth) {
        className += ` ${styles.inactive}`;
      }

      if (date.getDay() === 0 || date.getDay() === 6) {
        className += ` ${styles.weekend}`;
      }

      if (date.toDateString() === today.toDateString()) {
        className += ` ${styles.today}`;
      }

      // 시간 정보를 제거하고 날짜만 비교하기 위한 헬퍼
      const cleanDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const cleanSelectedDate = selectedDate
        ? new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate()
          )
        : null;
      const cleanRangeStart = rangeStart
        ? new Date(
            rangeStart.getFullYear(),
            rangeStart.getMonth(),
            rangeStart.getDate()
          )
        : null;
      const cleanRangeEnd = rangeEnd
        ? new Date(
            rangeEnd.getFullYear(),
            rangeEnd.getMonth(),
            rangeEnd.getDate()
          )
        : null;

      // 단일 선택 모드일 때 선택된 날짜
      if (
        selectionMode === "single" &&
        cleanSelectedDate &&
        cleanDate.toDateString() === cleanSelectedDate.toDateString()
      ) {
        className += ` ${styles.selected}`;
      }

      // 범위 선택 모드일 때
      if (selectionMode === "range") {
        const isRangeStart =
          cleanRangeStart &&
          cleanDate.toDateString() === cleanRangeStart.toDateString();
        const isRangeEnd =
          cleanRangeEnd &&
          cleanDate.toDateString() === cleanRangeEnd.toDateString();
        const isInRange =
          cleanRangeStart &&
          cleanRangeEnd &&
          cleanDate > cleanRangeStart &&
          cleanDate < cleanRangeEnd;

        if (isRangeStart || isRangeEnd) {
          className += ` ${styles.selected}`;
        } else if (isInRange) {
          className += ` ${styles.inRange}`;
        }
      }

      return className;
    },
    [currentMonth, selectedDate, selectionMode, rangeStart, rangeEnd, today]
  );

  // 시간 드롭다운 옵션 생성 헬퍼
  const generateTimeOptions = (limit: number) => {
    return Array.from({ length: limit }, (_, i) =>
      i.toString().padStart(2, "0")
    );
  };

  const hoursOptions = useMemo(() => generateTimeOptions(24), []);
  const minutesOptions = useMemo(() => generateTimeOptions(60), []);

  // 시간 변경 핸들러
  const handleTimeChange = useCallback(
    (
      type: "start" | "end" | "single",
      unit: "hour" | "minute",
      value: string
    ) => {
      const numValue = parseInt(value, 10);

      if (selectionMode === "single") {
        const targetDate = selectedDate || new Date();
        const newDate = new Date(targetDate);
        if (unit === "hour") {
          newDate.setHours(numValue);
        } else {
          newDate.setMinutes(numValue);
        }
        onSelectDate?.(newDate);
      } else {
        // range mode
        let newRangeStart = rangeStart ? new Date(rangeStart) : null;
        let newRangeEnd = rangeEnd ? new Date(rangeEnd) : null;

        if (type === "start" && newRangeStart) {
          if (unit === "hour") {
            newRangeStart.setHours(numValue);
          } else {
            newRangeStart.setMinutes(numValue);
          }
        } else if (type === "end" && newRangeEnd) {
          if (unit === "hour") {
            newRangeEnd.setHours(numValue);
          } else {
            newRangeEnd.setMinutes(numValue);
          }
        }
        // 시간이 변경된 후에도 시작 시간이 끝 시간보다 늦지 않도록 조정 (필요하다면)
        if (newRangeStart && newRangeEnd && newRangeStart > newRangeEnd) {
          // 예를 들어, 시작 시간을 변경했는데 끝 시간을 넘어선 경우, 끝 시간을 시작 시간과 동일하게 맞춤
          // 또는 사용자에게 경고를 표시하고 선택을 막을 수도 있음
          // 여기서는 끝 시간을 시작 시간과 동일하게 설정
          if (type === "start") {
            newRangeEnd = new Date(newRangeStart);
          } else if (type === "end") {
            // 끝 시간을 변경했는데 시작 시간보다 빨라진 경우, 시작 시간을 끝 시간과 동일하게
            // 아니면 그냥 선택을 막고 이전 값으로 되돌리는 것이 더 나을 수도 있습니다.
            // 일단 여기서는 사용자가 자유롭게 선택하도록 두고, 검증은 DatePicker 레벨에서 하거나
            // 최종적으로 날짜 선택이 완료될 때 (onChange 콜백) 할 수도 있습니다.
            // 여기서는 시간 선택기의 독립성을 유지합니다.
          }
        }

        setRangeStart(newRangeStart);
        setRangeEnd(newRangeEnd);
        onSelectRange?.([newRangeStart, newRangeEnd]);
      }
    },
    [
      selectionMode,
      selectedDate,
      rangeStart,
      rangeEnd,
      onSelectDate,
      onSelectRange,
    ]
  );

  return (
    <div className={styles.calendarContainer}>
      {/* 달력 헤더 (월/연도, 이전/다음 버튼) */}
      <div className={styles.calendarHeader}>
        <button className={styles.navButton} onClick={goToPreviousMonth}>
          {"<"}
        </button>
        <div className={styles.currentMonthYear}>
          {currentYear}년 {monthNames[currentMonth]}
        </div>
        <button className={styles.navButton} onClick={goToNextMonth}>
          {">"}
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className={styles.weekDays}>
        {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className={styles.datesGrid}>
        {datesInMonth.map((date, index) => (
          <div
            key={index}
            className={getDateClassName(date)}
            onClick={() => handleDateClick(date)}
          >
            {date.getDate()}
          </div>
        ))}
      </div>

      {/* 시간 선택기 (옵션에 따라 표시) */}
      {showTimePicker && (
        <div className={styles.timePickersContainer}>
          {selectionMode === "single" ? (
            // 단일 모드 시간 선택
            <div className={styles.singleTimePicker}>
              <select
                className={styles.timeSelect}
                value={(selectedDate?.getHours() || 0)
                  .toString()
                  .padStart(2, "0")}
                onChange={(e) =>
                  handleTimeChange("single", "hour", e.target.value)
                }
              >
                {hoursOptions.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
              <span className={styles.timeSeparator}>:</span>
              <select
                className={styles.timeSelect}
                value={(selectedDate?.getMinutes() || 0)
                  .toString()
                  .padStart(2, "0")}
                onChange={(e) =>
                  handleTimeChange("single", "minute", e.target.value)
                }
              >
                {minutesOptions.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            // 범위 모드 시간 선택
            <>
              <div className={styles.rangeTimePicker}>
                <span className={styles.timeLabel}>시작:</span>
                <select
                  className={styles.timeSelect}
                  value={(rangeStart?.getHours() || 0)
                    .toString()
                    .padStart(2, "0")}
                  onChange={(e) =>
                    handleTimeChange("start", "hour", e.target.value)
                  }
                  disabled={!rangeStart}
                >
                  {hoursOptions.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
                <span className={styles.timeSeparator}>:</span>
                <select
                  className={styles.timeSelect}
                  value={(rangeStart?.getMinutes() || 0)
                    .toString()
                    .padStart(2, "0")}
                  onChange={(e) =>
                    handleTimeChange("start", "minute", e.target.value)
                  }
                  disabled={!rangeStart}
                >
                  {minutesOptions.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.rangeTimePicker}>
                <span className={styles.timeLabel}>끝:</span>
                <select
                  className={styles.timeSelect}
                  value={(rangeEnd?.getHours() || 0)
                    .toString()
                    .padStart(2, "0")}
                  onChange={(e) =>
                    handleTimeChange("end", "hour", e.target.value)
                  }
                  disabled={!rangeEnd}
                >
                  {hoursOptions.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
                <span className={styles.timeSeparator}>:</span>
                <select
                  className={styles.timeSelect}
                  value={(rangeEnd?.getMinutes() || 0)
                    .toString()
                    .padStart(2, "0")}
                  onChange={(e) =>
                    handleTimeChange("end", "minute", e.target.value)
                  }
                  disabled={!rangeEnd}
                >
                  {minutesOptions.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Calendar;
