"use client";
import clsx from "clsx";
import React, { ReactNode, useContext, useEffect, useMemo } from "react";
import styles from "./Accordion.module.css"; // Accordion.module.css는 그대로 사용
import { AccordionGroupContext } from "./AccordionGroup";

// 기존의 P, Icon, useBrowserEvent 등은 임시로 주석 처리하거나 필요에 맞게 수정
// import P from "@/components/P/P";
// import Icon from "@/components/icons/Icon";
// import { useBrowserEvent } from "@/providers/BrowserEventProvider";

// AccordionGroupContext 사용
const useAccordionGroup = () => {
  const context = useContext(AccordionGroupContext);
  if (!context) {
    throw new Error(
      "AccordionChild must be used within an AccordionGroup. Ensure you have wrapped AccordionChild with <AccordionGroup>."
    );
  }
  return context;
};

// DefaultComponentInterface와 유사하게 Props 타입 정의
interface AccordionChildProps {
  index: any; // 고유한 식별자 (string 또는 number)
  disabled?: boolean;
  header: ReactNode; // string, number 또는 ReactNode
  height?: string | number;
  maxHeight?: string | number;
  overflow?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  children?: ReactNode; // 아코디언 바디 내용
  onClick?: (isFolded: boolean) => void; // Header 클릭 시 콜백
  styling?: {
    item?: { className?: string; style?: React.CSSProperties };
    header?: { className?: string; style?: React.CSSProperties };
    button?: { className?: string; style?: React.CSSProperties };
    body?: { className?: string; style?: React.CSSProperties };
  };
}

/**
 * AccordionChild 컴포넌트: 개별 아코디언 패널을 나타냅니다.
 * AccordionGroup의 컨텍스트를 사용하여 상태를 관리합니다.
 * @param {AccordionChildProps} props - index, disabled, header, height, maxHeight, overflow, border styles, children, onClick, styling
 */
export const AccordionChild: React.FC<AccordionChildProps> = ({
  index,
  disabled = false,
  header,
  height,
  maxHeight,
  overflow,
  borderTop = "1px solid #eeeeee",
  borderRight = "1px solid #eeeeee",
  borderBottom = "1px solid #eeeeee",
  borderLeft = "1px solid #eeeeee",
  children,
  onClick, // Header 용
  styling,
}) => {
  const { actives, setActive, registerChild, unregisterChild } =
    useAccordionGroup();
  const fold = !actives.has(index); // 현재 패널이 접혀있는지 여부
  // const { isMobile } = useBrowserEvent(); // 필요에 따라 주석 해제

  // 마운트 시 자식 등록, 언마운트 시 등록 해제
  useEffect(() => {
    registerChild(index);
    return () => {
      unregisterChild(index);
    };
  }, [index, registerChild, unregisterChild]);

  // Header 렌더링 로직 (P 컴포넌트 대신 직접 텍스트 또는 ReactNode 렌더링)
  const HeaderContent = useMemo(() => {
    if (typeof header === "string" || typeof header === "number") {
      return (
        <span
          style={{
            color: "inherit",
            fontWeight: "inherit",
            fontSize: "inherit",
          }}
        >
          {header}
        </span>
      );
    }
    return header;
  }, [header]);

  return (
    <div
      className={clsx(styles.item, styling?.item?.className)}
      style={{
        maxHeight,
        overflow,
        height,
        borderTop,
        borderRight,
        borderBottom,
        borderLeft,
        ...(styling?.item?.style || {}),
      }}
    >
      <div
        className={clsx(styles.header, styling?.header?.className)}
        onClick={() => {
          if (!disabled) {
            setActive(index, fold); // 컨텍스트의 setActive 호출
            onClick?.(!fold); // props로 전달된 onClick 호출
          }
        }}
        style={styling?.header?.style}
      >
        {HeaderContent}
        {children && ( // 바디 내용이 있을 경우에만 버튼 렌더링
          <div
            className={clsx(styles.button, styling?.button?.className)}
            style={styling?.button?.style}
          >
            {/* Icon 컴포넌트 대신 간단한 텍스트 또는 SVG로 대체하거나, 실제 Icon 컴포넌트를 import */}
            {/* <Icon
              name={fold ? "unfoldBtn-2_2x" : "foldBtn-2_2x"}
              height={"100%"}
              containerWidth={"auto"}
              width={isMobile ? "20px" : "26px"}
              center={true}
            /> */}
            {/* 임시 아이콘 */}
            <span style={{ fontSize: "1.2em" }}>{fold ? "▼" : "▲"}</span>
          </div>
        )}
      </div>
      {children && (
        <div
          className={clsx(styles.body, styling?.body?.className, {
            [styles.fold]: fold,
          })}
          style={styling?.body?.style}
        >
          {children}
        </div>
      )}
    </div>
  );
};

AccordionChild.displayName = "AccordionChild"; // 개발자 도구에서 식별을 위해 유지 (필수 아님)
