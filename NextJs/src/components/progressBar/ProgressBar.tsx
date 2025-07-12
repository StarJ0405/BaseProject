"use client";
import clsx from "clsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ProgressBar.module.css";

// 프로그레스 바의 크기 옵션
type ProgressBarSize = "xs" | "sm" | "md" | "lg";

// 텍스트 정렬 옵션
type ProgressBarTextAlign = "center" | "left" | "right";

interface ProgressBarProps {
  /**
   * 프로그레스 바의 현재 진행률 (0-100).
   * @default 0
   */
  percent?: number;
  /**
   * 프로그레스 바의 색상 (CSS 색상 문자열).
   * @default #2196F3 (brand-primary)
   */
  color?: string;
  /**
   * 프로그레스 바의 크기.
   * @default 'md'
   */
  size?: ProgressBarSize;
  /**
   * 프로그레스 바 내부에 percent 텍스트를 표시할지 여부.
   * @default true
   */
  showText?: boolean;
  /**
   * percent 텍스트의 정렬 방식.
   * `showText`가 true일 때만 유효합니다.
   * @default 'center'
   */
  textAlign?: ProgressBarTextAlign;
  /**
   * 프로그레스 바가 수직 방향인지 여부.
   * @default false
   */
  vertical?: boolean;
  /**
   * percent 값이 변경될 때 호출되는 콜백 함수.
   * (새로운 percent 값) => void 형태로 호출됩니다.
   */
  onChange?: (newPercent: number) => void;
  /**
   * 사용자 정의 CSS 클래스.
   */
  className?: string;
  /**
   * 프로그레스 바의 클릭/드래그 조작을 비활성화할지 여부.
   * @default false
   */
  disabled?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percent = 0,
  color,
  size = "md",
  showText = true,
  textAlign = "center",
  vertical = false,
  onChange,
  className,
  disabled = false,
}) => {
  const [currentPercent, setCurrentPercent] = useState(percent);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // 외부 percent prop이 변경될 때 내부 상태 업데이트
  useEffect(() => {
    setCurrentPercent(percent);
  }, [percent]);

  // 클릭 또는 드래그를 통해 percent 값을 계산하는 함수
  const calculatePercent = useCallback(
    (event: MouseEvent | React.MouseEvent | TouchEvent | React.TouchEvent) => {
      if (disabled || !containerRef.current) return;

      const { current: container } = containerRef;
      const rect = container.getBoundingClientRect();
      let clientPosition: number;

      if ("clientX" in event) {
        // MouseEvent
        clientPosition = vertical ? event.clientY : event.clientX;
      } else if ("touches" in event && event.touches.length > 0) {
        // TouchEvent
        clientPosition = vertical
          ? event.touches[0].clientY
          : event.touches[0].clientX;
      } else {
        return; // 지원하지 않는 이벤트 타입
      }

      let newPercent: number;
      if (vertical) {
        // 수직 바: 아래에서 위로 채워지므로, 클릭 위치를 역으로 계산
        const height = rect.height;
        const offset = clientPosition - rect.top;
        newPercent = ((height - offset) / height) * 100;
      } else {
        // 수평 바: 왼쪽에서 오른쪽으로 채워짐
        const width = rect.width;
        const offset = clientPosition - rect.left;
        newPercent = (offset / width) * 100;
      }

      // 0-100 범위로 제한
      newPercent = Math.max(0, Math.min(100, Math.round(newPercent)));

      setCurrentPercent(newPercent);
      onChange?.(newPercent); // onChange 콜백 호출
    },
    [disabled, vertical, onChange]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;
      isDragging.current = true;
      calculatePercent(e as any); // Type assertion for event consistency

      // 전역 이벤트 리스너 등록
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      }); // passive: false for preventDefault
      document.addEventListener("touchend", handleTouchEnd);
    },
    [disabled, calculatePercent]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging.current) {
        e.preventDefault(); // 드래그 시 텍스트 선택 방지
        calculatePercent(e);
      }
    },
    [calculatePercent]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    // 전역 이벤트 리스너 제거
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (isDragging.current) {
        e.preventDefault(); // 스크롤 방지
        calculatePercent(e);
      }
    },
    [calculatePercent]
  );

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
    // 전역 이벤트 리스너 제거
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
  }, [handleTouchMove]);

  const containerClasses = clsx(
    styles.progressBarContainer,
    styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`], // 'sizeMd'
    vertical && styles.vertical,
    className,
    disabled && styles.disabled // disabled 스타일이 있다면 추가
  );

  const trackStyle: React.CSSProperties = {
    // 수직 바는 height, 수평 바는 width
    [vertical ? "height" : "width"]: `${currentPercent}%`,
    backgroundColor: color || undefined, // color prop이 있으면 적용
  };

  const textClasses = clsx(
    styles.progressBarText,
    textAlign === "left" && styles.textLeft,
    textAlign === "right" && styles.textRight
    // 'center'는 기본이므로 별도 클래스 불필요
  );

  return (
    <div
      ref={containerRef}
      className={containerClasses}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown} // 터치 이벤트도 처리
      // onClick을 사용하지 않는 이유는 드래그 중에도 클릭 이벤트가 발생할 수 있기 때문
      // onMouseMove, onMouseUp은 전역에서 처리하여 드래그 범위를 벗어나도 작동하게 함
    >
      <div className={styles.progressBarTrack} style={trackStyle}>
        {/* percent 텍스트는 트랙 안에 위치시켜 트랙 색상 위에 표시 */}
        {showText && <span className={textClasses}>{currentPercent}%</span>}
      </div>
    </div>
  );
};

export default ProgressBar;
