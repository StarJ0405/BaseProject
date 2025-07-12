"use client";
import React, {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChoiceGroupContext } from "./ChoiceGroup"; // ChoiceGroupContext 가져오기

// ChoiceGroupContext 사용 훅 (이름 변경)
const useChoiceGroup = () => {
  const context = useContext(ChoiceGroupContext);
  if (!context) {
    console.error(
      "ChoiceChild must be used within a ChoiceGroup. Ensure you have wrapped ChoiceChild with <ChoiceGroup>."
    );
    // Fallback 또는 에러 처리 (필요에 따라)
    return {
      name: "default-group",
      value: new Set(),
      toggleChoice: () => {},
      registerChoice: () => {},
      unregisterChoice: () => {},
      groupRefs: React.useRef(new Set()),
      isRadioMode: false,
      groupImages: undefined,
      maxSelection: undefined,
      allChecked: false,
      setAllChecked: () => {},
    };
  }
  return context;
};

interface ChoiceChildProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string; // 선택 항목의 고유 ID (value로도 사용됨)
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  // 개별 자식에 오버라이드할 수 있는 이미지
  images?: {
    on?: string;
    off?: string;
    onHover?: string;
    offHover?: string;
  };
}

/**
 * ChoiceChild 컴포넌트: 개별 선택 항목 (체크박스 또는 라디오 버튼)을 나타냅니다.
 * @param {ChoiceChildProps} props - id, className, style, children, images
 */
const ChoiceChild = forwardRef<HTMLInputElement, ChoiceChildProps>(
  ({ id, className, style, children, onChange, images, ...rest }, ref) => {
    const {
      name,
      value,
      toggleChoice, // 이름 변경
      registerChoice, // 이름 변경
      unregisterChoice, // 이름 변경
      isRadioMode,
      groupImages,
    } = useChoiceGroup();

    const isChecked = value.has(id);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isHovered, setIsHovered] = useState(false);

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

    useEffect(() => {
      registerChoice(id); // 이름 변경
      return () => {
        unregisterChoice(id); // 이름 변경
      };
    }, [id, registerChoice, unregisterChoice]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isRadioMode) {
        toggleChoice(id, true);
      } else {
        toggleChoice(id, !isChecked);
      }
      onChange?.(e);
    };

    React.useImperativeHandle(ref, () => inputRef.current!);

    return (
      <div
        className={className}
        style={{
          ...style,
          position: "relative",
          display: "inline-block",
          width: hasImages ? "24px" : undefined,
          height: hasImages ? "24px" : undefined,
          cursor: "pointer",
          backgroundImage: backgroundImage,
          backgroundSize: hasImages ? "contain" : undefined,
          backgroundRepeat: hasImages ? "no-repeat" : undefined,
          backgroundPosition: hasImages ? "center" : undefined,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => inputRef.current?.click()}
      >
        <input
          type={isRadioMode ? "radio" : "checkbox"}
          id={`${name}-${id}`}
          name={name}
          value={id}
          checked={isChecked}
          onChange={handleChange}
          ref={inputRef}
          style={{
            opacity: hasImages ? 0 : 1,
            position: hasImages ? "absolute" : "static",
            width: hasImages ? "100%" : "auto",
            height: hasImages ? "100%" : "auto",
            cursor: "pointer",
            ...(hasImages && { top: 0, left: 0 }),
          }}
          {...rest}
        />
        {!hasImages && children}
      </div>
    );
  }
);

ChoiceChild.displayName = "ChoiceChild";
export default ChoiceChild;
