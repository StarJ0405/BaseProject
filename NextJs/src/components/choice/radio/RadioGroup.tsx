"use client";
import React, { createContext, useCallback, useRef, useState } from "react";

// RadioGroupContext 타입 정의
interface RadioGroupContextType {
  name: string;
  value: string | null; // 현재 선택된 라디오 버튼의 value (id)
  selectRadio: (id: string) => void; // 라디오 버튼 선택 함수
  registerRadio: (id: string) => void; // 자식 라디오 버튼 등록
  unregisterRadio: (id: string) => void; // 자식 라디오 버튼 등록 해제
  groupRefs: React.MutableRefObject<Set<string>>; // 등록된 라디오 버튼 ID 관리
  groupImages?: {
    on?: string;
    off?: string;
    onHover?: string;
    offHover?: string;
  };
}
export const defaultRadioImages = {
  on: "resources/images/radio_on.png",
  off: "resources/images/radio_off.png",
  //     onHover: "resources/images/checkbox_on.png",
  //     offHover: "resources/images/checkbox_hover.png",
};
// RadioGroupContext 생성
export const RadioGroupContext = createContext<
  RadioGroupContextType | undefined
>(undefined);

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  defaultValue?: string; // 초기 선택 값
  value?: string; // 제어되는 컴포넌트를 위한 value
  onValueChange?: (value: string) => void; // 값이 변경될 때 호출될 콜백
  children: React.ReactNode;
  images?: {
    on?: string;
    off?: string;
    onHover?: string;
    offHover?: string;
  };
}

/**
 * RadioGroup 컴포넌트: 여러 라디오 버튼을 그룹화하고 단일 선택을 관리합니다.
 * @param {RadioGroupProps} props - name, defaultValue, value, onValueChange, children, images
 */
const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  defaultValue,
  value: controlledValue,
  onValueChange,
  children,
  images = defaultRadioImages,
  ...rest
}) => {
  // 제어/비제어 컴포넌트 처리
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue ?? null
  );

  const currentValue = isControlled ? controlledValue : internalValue;

  const groupRefs = useRef<Set<string>>(new Set());

  // 라디오 버튼 선택 핸들러
  const selectRadio = useCallback(
    (id: string) => {
      if (!isControlled) {
        setInternalValue(id);
      }
      onValueChange?.(id);
    },
    [isControlled, onValueChange]
  );

  // 라디오 버튼 등록 (주로 마운트/언마운트 시 사용)
  const registerRadio = useCallback((id: string) => {
    groupRefs.current.add(id);
  }, []);

  // 라디오 버튼 등록 해제
  const unregisterRadio = useCallback((id: string) => {
    groupRefs.current.delete(id);
  }, []);

  // 컨텍스트 값
  const contextValue = React.useMemo(
    () => ({
      name,
      value: currentValue,
      selectRadio,
      registerRadio,
      unregisterRadio,
      groupRefs,
      groupImages: images,
    }),
    [name, currentValue, selectRadio, registerRadio, unregisterRadio, images]
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div role="radiogroup" aria-labelledby={name} {...rest}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
};

export default RadioGroup;
