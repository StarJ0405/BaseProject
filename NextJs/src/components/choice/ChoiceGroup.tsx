"use client";
import React, {
  createContext,
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import { defaultRadioImages } from "./radio/RadioGroup";
import { defaultCheckboxImages } from "./checkbox/CheckboxGroup";

// 이미지 타입 정의 (체크박스용)
interface ChoiceImages {
  // 이름 변경: CheckboxImages -> ChoiceImages
  on?: string;
  off?: string;
  onHover?: string;
  offHover?: string;
}

// 이미지 타입 정의 (라디오용)
interface RadioImages {
  on?: string;
  off?: string;
  onHover?: string;
  offHover?: string;
}

// ChoiceGroupContext 타입 정의
interface ChoiceGroupContextType {
  name: string;
  value: Set<string>; // Set을 사용하여 선택된 값들 관리
  toggleChoice: (id: string, checked: boolean) => void; // 이름 변경: toggleCheckbox -> toggleChoice
  registerChoice: (id: string) => void; // 이름 변경: registerCheckbox -> registerChoice
  unregisterChoice: (id: string) => void; // 이름 변경: unregisterCheckbox -> unregisterChoice
  groupRefs: React.MutableRefObject<Set<string>>; // 등록된 자식 ID 관리
  isRadioMode: boolean; // 현재 모드가 라디오인지 여부
  groupImages?: ChoiceImages | RadioImages; // 그룹에 기본으로 적용될 이미지
  maxSelection?: number; // 최대 선택 가능한 개수
  minSelections?: number; // 최소 선택 필수인 개수
  allChecked: boolean; // 모든 항목이 선택되었는지 여부 (ChoiceAll용)
  setAllChecked: (checked: boolean) => void; // 모든 항목 선택/해제 함수 (ChoiceAll용)
}

// ChoiceGroupContext 생성
export const ChoiceGroupContext = createContext<
  ChoiceGroupContextType | undefined
>(undefined);

interface ChoiceGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  defaultValue?: string[]; // 초기 선택 값 배열
  value?: string[]; // 제어되는 컴포넌트를 위한 value
  onValueChange?: (value: string[]) => void; // 값이 변경될 때 호출될 콜백
  onValidChange?: (status: boolean) => void;
  children: React.ReactNode;
  maxSelection?: number; // 최대 선택 가능 개수
  minSelection?: number; // 최소 선택 필수 개수
  choiceImages?: ChoiceImages; // 체크박스 모드일 때 사용될 이미지 (이름 변경)
  radioImages?: RadioImages; // 라디오 모드일 때 사용될 이미지
}

/**
 * ChoiceGroup 컴포넌트: 여러 선택 항목을 그룹화하고 선택을 관리합니다.
 * maxSelection에 따라 체크박스 또는 라디오처럼 동작합니다.
 * @param {ChoiceGroupProps} props - name, defaultValue, value, onValueChange, children, maxSelection, choiceImages, radioImages
 */
const ChoiceGroup: React.FC<ChoiceGroupProps> = ({
  name,
  defaultValue,
  value: controlledValue,
  onValueChange,
  onValidChange,
  children,
  maxSelection,
  minSelection,
  choiceImages = defaultCheckboxImages,
  radioImages = defaultRadioImages,
  ...rest
}) => {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<Set<string>>(
    new Set(defaultValue)
  );

  const currentValue = useMemo(
    () => (isControlled ? new Set(controlledValue) : internalValue),
    [isControlled, controlledValue, internalValue]
  );

  const groupRefs = useRef<Set<string>>(new Set()); // 등록된 모든 ChoiceChild의 id

  const isRadioMode = maxSelection === 1;
  if (minSelection) minSelection = Math.min(maxSelection || 0, minSelection);

  const groupImages = useMemo(() => {
    return isRadioMode ? radioImages : choiceImages;
  }, [isRadioMode, radioImages, choiceImages]);

  // ChoiceAll을 위한 allChecked 상태
  const allChecked = useMemo(() => {
    if (isRadioMode) return false; // 라디오 모드에서는 의미 없음
    if (groupRefs.current.size === 0) return false; // 등록된 자식이 없으면 false
    return (
      currentValue.size === groupRefs.current.size &&
      Array.from(groupRefs.current).every((id) => currentValue.has(id))
    );
  }, [currentValue, isRadioMode]);

  // ChoiceAll을 위한 setAllChecked 함수
  const setAllChecked = useCallback(
    (checked: boolean) => {
      if (isRadioMode) return; // 라디오 모드에서는 동작하지 않음

      let newValue: Set<string>;
      if (checked) {
        // 모든 항목 선택
        if (maxSelection && groupRefs.current.size > maxSelection) {
          // maxSelection보다 전체 항목 수가 많으면 경고 및 선택하지 않음
          console.warn(
            `Cannot select all items as total count (${groupRefs.current.size}) exceeds maxSelection (${maxSelection}).`
          );
          return;
        }
        newValue = new Set(groupRefs.current);
      } else {
        // 모든 항목 해제
        newValue = new Set();
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      const array = Array.from(newValue);
      onValueChange?.(array);
      onValidChange?.(!minSelection || array.length > minSelection);
    },
    [isControlled, onValueChange, onValidChange, isRadioMode, maxSelection]
  );

  const toggleChoice = useCallback(
    (id: string, checked: boolean) => {
      let newValue: Set<string>;

      if (isRadioMode) {
        newValue = new Set([id]); // 라디오 모드: 항상 하나만 선택
      } else {
        newValue = new Set(currentValue);
        if (checked) {
          if (maxSelection && newValue.size >= maxSelection) {
            console.warn(
              `Maximum selection of ${maxSelection} reached. Cannot select more items.`
            );
            return;
          }
          newValue.add(id);
        } else {
          newValue.delete(id);
        }
      }

      if (!isControlled) {
        setInternalValue(newValue);
      }
      const array = Array.from(newValue);
      onValueChange?.(array);
      onValidChange?.(!minSelection || array.length > minSelection);
    },
    [
      isControlled,
      currentValue,
      onValueChange,
      onValidChange,
      isRadioMode,
      maxSelection,
    ]
  );

  const registerChoice = useCallback((id: string) => {
    groupRefs.current.add(id);
  }, []);

  const unregisterChoice = useCallback(
    (id: string) => {
      groupRefs.current.delete(id);
      // 등록 해제 시, 만약 해당 ID가 현재 선택된 값에 포함되어 있다면 제거
      setInternalValue((prev) => {
        if (prev.has(id)) {
          const newSet = new Set(prev);
          newSet.delete(id);
          // 제어되지 않는 컴포넌트인 경우에만 상태 업데이트 후 콜백 호출
          const array = Array.from(newSet);
          if (!isControlled) {
            onValueChange?.(array);
          }
          onValidChange?.(!minSelection || array.length > minSelection);

          return newSet;
        }
        return prev;
      });
    },
    [isControlled, onValueChange]
  );

  const contextValue = useMemo(
    () => ({
      name,
      value: currentValue,
      toggleChoice,
      registerChoice,
      unregisterChoice,
      groupRefs,
      isRadioMode,
      groupImages,
      maxSelection,
      minSelection,
      allChecked, // 추가
      setAllChecked, // 추가
    }),
    [
      name,
      currentValue,
      toggleChoice,
      registerChoice,
      unregisterChoice,
      isRadioMode,
      groupImages,
      maxSelection,
      minSelection,
      allChecked,
      setAllChecked,
    ]
  );

  return (
    <ChoiceGroupContext.Provider value={contextValue}>
      <div
        role={isRadioMode ? "radiogroup" : "group"}
        aria-labelledby={name}
        {...rest}
      >
        {children}
      </div>
    </ChoiceGroupContext.Provider>
  );
};

export default ChoiceGroup;
