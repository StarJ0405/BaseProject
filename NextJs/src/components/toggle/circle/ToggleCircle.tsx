"use client";
import React, { useState } from "react"; // useState 훅 임포트
import styles from "./ToggleCircle.module.css";

// CheckCircleProps 인터페이스 정의
interface CheckCircleProps {
  // 초기 상태를 설정하기 위한 prop입니다. 선택 사항입니다.
  // 이 prop이 제공되면 컴포넌트가 이 초기 값으로 시작합니다.
  defaultIsActive?: boolean;
  // 상태가 변경될 때 호출될 콜백 함수입니다.
  // 변경된 `isActive` 상태(boolean)를 인자로 전달합니다.
  onChange?: (isActive: boolean) => void;
  // 외부에서 onClick을 추가하고 싶을 경우를 위한 prop입니다.
  // 내부 로직과는 별개로 추가적인 클릭 동작을 정의할 수 있습니다.
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const ToggleCircle: React.FC<CheckCircleProps> = ({
  defaultIsActive = false, // 기본값 false 설정
  onChange,
  onClick, // 외부에서 전달받는 onClick
}) => {
  // isActive 상태를 내부적으로 관리합니다.
  // defaultIsActive prop이 제공되면 그 값으로 초기화하고, 없으면 false로 초기화합니다.
  const [isActive, setIsActive] = useState<boolean>(defaultIsActive);

  // div 클릭 핸들러
  const handleToggleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // 1. 내부 isActive 상태를 토글합니다.
    const newIsActive = !isActive;
    setIsActive(newIsActive);

    // 2. onChange 콜백이 제공되었다면, 변경된 상태를 외부에 전달합니다.
    if (onChange) {
      onChange(newIsActive);
    }

    // 3. 외부에서 전달받은 onClick 콜백이 있다면 호출합니다.
    // 이는 내부 토글 로직과 별개로 추가적인 클릭 동작이 필요한 경우에 사용됩니다.
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <div
      className={`${styles.checkCircle} ${isActive ? styles.active : ""}`}
      onClick={handleToggleClick} // 내부 상태 토글 함수 연결
    >
      {isActive && <div className={styles.innerCircle} />}
    </div>
  );
};

export default ToggleCircle;
