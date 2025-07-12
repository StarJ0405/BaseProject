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

interface ChoiceAllProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  images?: {
    on?: string; // 모든 항목이 선택되었을 때 이미지
    off?: string; // 모든 항목이 선택되지 않았을 때 이미지 (또는 일부만 선택)
    onHover?: string;
    offHover?: string;
  };
}

/**
 * ChoiceAll 컴포넌트: ChoiceGroup 내의 모든 항목을 선택/해제하는 기능을 제공합니다.
 * maxSelection이 1일 때는 표시되지 않습니다.
 * @param {ChoiceAllProps} props - className, style, children, images
 */
const ChoiceAll = forwardRef<HTMLInputElement, ChoiceAllProps>(
  ({ className, style, children, onChange, images, ...rest }, ref) => {
    const context = useContext(ChoiceGroupContext);

    if (!context) {
      console.error(
        "ChoiceAll must be used within a ChoiceGroup. Ensure you have wrapped ChoiceAll with <ChoiceGroup>."
      );
      return null; // 컨텍스트가 없으면 렌더링하지 않음
    }

    const {
      name,
      isRadioMode,
      allChecked,
      setAllChecked,
      groupImages, // ChoiceGroup에서 전달된 공용 이미지 사용 가능
    } = context;

    // 라디오 모드에서는 ChoiceAll을 렌더링하지 않음
    if (isRadioMode) {
      return null;
    }

    const inputRef = useRef<HTMLInputElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // 이미지 경로 결정 로직 (개별 images prop > groupImages)
    const currentImages = images || groupImages;
    const hasImages = currentImages?.on && currentImages?.off;

    const backgroundImage = useMemo(() => {
      if (hasImages) {
        if (allChecked) {
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
    }, [allChecked, isHovered, hasImages, currentImages]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setAllChecked(!allChecked); // 모든 항목 선택/해제
      onChange?.(e); // Prop으로 전달된 onChange 호출
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
          type="checkbox" // ChoiceAll은 항상 체크박스
          id={`${name}-all`}
          name={`${name}-all`}
          checked={allChecked}
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

ChoiceAll.displayName = "ChoiceAll";
export default ChoiceAll;
