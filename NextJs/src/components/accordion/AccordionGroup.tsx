"use client";
import React, {
  createContext,
  forwardRef,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./Accordion.module.css"; // Accordion.module.css는 그대로 사용

// AccordionGroup Context 타입 정의
interface AccordionGroupContextType {
  actives: Set<any>;
  setActive: (index: any, fold: boolean) => void;
  unique: boolean;
  registerChild: (index: any) => void;
  unregisterChild: (index: any) => void;
  childRefs: React.MutableRefObject<Set<any>>; // 모든 등록된 AccordionChild index 관리
}

// AccordionGroup Context 생성
export const AccordionGroupContext = createContext<
  AccordionGroupContextType | undefined
>(undefined);

// AccordionGroupProps 인터페이스 정의
interface AccordionGroupProps {
  active?: any[];
  unique?: boolean;
  width?: string | number;
  height?: string | number;
  overflow?: string;
  gap?: number;
  children: ReactNode;
  className?: string; // 추가: 외부에서 스타일을 위한 클래스명
  style?: React.CSSProperties; // 추가: 외부에서 스타일을 위한 인라인 스타일
}

/**
 * AccordionGroup 컴포넌트: 아코디언 그룹의 상태를 관리하고 하위 AccordionChild에 컨텍스트를 제공합니다.
 * @param {AccordionGroupProps} props - active, unique, width, height, overflow, gap, children, className, style
 */
export const AccordionGroup = forwardRef<HTMLDivElement, AccordionGroupProps>(
  (
    {
      active: props_active = [],
      unique = true,
      width,
      height,
      overflow,
      gap = 10,
      children,
      className,
      style,
    },
    ref
  ) => {
    const [actives, setActives] = useState(new Set(props_active));
    const childRefs = useRef<Set<any>>(new Set()); // 등록된 모든 AccordionChild의 index를 관리

    // AccordionChild 등록
    const registerChild = useCallback((index: any) => {
      childRefs.current.add(index);
    }, []);

    // AccordionChild 등록 해제
    const unregisterChild = useCallback((index: any) => {
      childRefs.current.delete(index);
      // 언마운트된 자식이 actives에 포함되어 있다면 제거
      setActives((prev) => {
        if (prev.has(index)) {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        }
        return prev;
      });
    }, []);

    // 아코디언 패널 상태 토글 (열기/닫기)
    const setActive = useCallback(
      (indexToToggle: any, fold: boolean) => {
        setActives((prev) => {
          const newSet = new Set(prev);
          if (fold) {
            // 접혀있는 상태 (열어야 함)
            if (unique) {
              return new Set([indexToToggle]); // 고유 모드: 현재 클릭된 것만 열기
            } else {
              newSet.add(indexToToggle); // 다중 모드: 추가
            }
          } else {
            // 펼쳐진 상태 (접어야 함)
            newSet.delete(indexToToggle);
          }
          return newSet;
        });
      },
      [unique]
    );

    const contextValue = useMemo(
      () => ({
        actives,
        setActive,
        unique,
        registerChild,
        unregisterChild,
        childRefs,
      }),
      [actives, setActive, unique, registerChild, unregisterChild]
    );

    return (
      <AccordionGroupContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={`${styles.container} ${className || ""}`}
          style={{ gap, overflow, width, height, ...style }}
        >
          {children} {/* 자식 컴포넌트들을 직접 렌더링 */}
        </div>
      </AccordionGroupContext.Provider>
    );
  }
);

AccordionGroup.displayName = "AccordionGroup";
