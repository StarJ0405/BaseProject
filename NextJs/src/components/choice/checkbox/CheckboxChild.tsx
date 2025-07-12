"use client";
import React, {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckboxGroupContext } from "./CheckboxGroup";

// CheckboxGroupContext 사용
const useCheckboxGroup = () => {
  const context = useContext(CheckboxGroupContext);
  if (!context) {
    console.error(
      "CheckboxChild must be used within a CheckboxGroup. Ensure you have wrapped CheckboxChild with <CheckboxGroup>."
    );
    // Fallback or throw error based on desired behavior
    return {
      name: "default-group",
      value: new Set(),
      toggleCheckbox: () => {},
      registerCheckbox: () => {},
      unregisterCheckbox: () => {},
      allChecked: false,
      setAllChecked: () => {},
      groupRefs: React.useRef(new Set()),
      groupImages: undefined,
    };
  }
  return context;
};

interface CheckboxChildProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  images?: {
    on?: string;
    off?: string;
    onHover?: string;
    offHover?: string;
  };
}

/**
 * CheckboxChild 컴포넌트: 개별 체크박스를 나타냅니다.
 * @param {CheckboxChildProps} props - id, className, style, children, images
 */
const CheckboxChild = forwardRef<HTMLInputElement, CheckboxChildProps>(
  (
    { id, className, style, children, disabled, onChange, images, ...rest },
    ref
  ) => {
    const {
      name,
      value,
      toggleCheckbox,
      registerCheckbox,
      unregisterCheckbox,
      groupImages,
    } = useCheckboxGroup();
    const isChecked = value.has(id);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // 이미지 경로 결정 로직
    const currentImages = images || groupImages;
    const hasImages = currentImages?.on && currentImages?.off;

    const backgroundImage = useMemo(() => {
      if (hasImages) {
        if (isChecked) {
          if (isHovered && currentImages?.onHover)
            return `url(${currentImages.onHover})`;
          return `url(${currentImages.on})`;
        } else {
          if (isHovered && currentImages?.offHover)
            return `url(${currentImages.offHover})`;
          return `url(${currentImages.off})`;
        }
      }
      return "none";
    }, [isChecked, isHovered, hasImages, currentImages]);
    // 마운트 시 체크박스 등록, 언마운트 시 등록 해제
    useEffect(() => {
      registerCheckbox(id);
      return () => {
        unregisterCheckbox(id);
      };
    }, [id, registerCheckbox, unregisterCheckbox]);

    // 내부 input의 change 이벤트 처리
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) return;
      toggleCheckbox(id, !isChecked);
      onChange?.(e); // Prop으로 전달된 onChange 호출
    };

    // Ref 연결
    React.useImperativeHandle(ref, () => inputRef.current!);

    return (
      <div
        className={className}
        style={{
          ...style,
          position: "relative",
          display: "inline-block", // 또는 'flex', 'inline-flex' 등 적절한 값
          width: hasImages ? "24px" : undefined, // 이미지 크기에 따라 조절
          height: hasImages ? "24px" : undefined, // 이미지 크기에 따라 조절
          cursor: "pointer",
          backgroundImage: backgroundImage,
          backgroundSize: hasImages ? "contain" : undefined,
          backgroundRepeat: hasImages ? "no-repeat" : undefined,
          backgroundPosition: hasImages ? "center" : undefined,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => inputRef.current?.click()} // div 클릭 시 input 클릭
      >
        <input
          disabled={disabled}
          type="checkbox"
          id={`${name}-${id}`}
          name={name}
          value={id}
          checked={isChecked}
          onChange={handleChange}
          ref={inputRef}
          style={{
            opacity: hasImages ? 0 : 1, // 이미지가 있는 경우 input 숨김
            position: hasImages ? "absolute" : "static",
            width: hasImages ? "100%" : "auto",
            height: hasImages ? "100%" : "auto",
            cursor: "pointer",
            ...(hasImages && { top: 0, left: 0 }),
          }}
          {...rest}
        />
        {!hasImages && children} {/* 이미지가 없으면 children 렌더링 */}
      </div>
    );
  }
);

CheckboxChild.displayName = "CheckboxChild";
export default CheckboxChild;
