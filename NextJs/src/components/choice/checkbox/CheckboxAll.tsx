"use client";
import React, {
  forwardRef,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { CheckboxGroupContext } from "./CheckboxGroup";

interface CheckboxAllProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
 * CheckboxAll 컴포넌트: 그룹 내 모든 체크박스를 선택하거나 해제합니다.
 * @param {CheckboxAllProps} props - className, style, children, images
 */
const CheckboxAll = forwardRef<HTMLInputElement, CheckboxAllProps>(
  ({ className, style, children, onChange, images, ...rest }, ref) => {
    const context = useContext(CheckboxGroupContext);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    if (!context) {
      console.error(
        "CheckboxAll must be used within a CheckboxGroup. Ensure you have wrapped CheckboxAll with <CheckboxGroup>."
      );
      return null;
    }

    const { name, allChecked, setAllChecked, groupImages } = context;

    // 이미지 경로 결정 로직
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
      setAllChecked(!allChecked);
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
        onClick={() => inputRef.current?.click()} // div 클릭 시 input 클릭
      >
        <input
          type="checkbox"
          id={`${name}-all`}
          name={`${name}-all`}
          checked={allChecked}
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

CheckboxAll.displayName = "CheckboxAll";
export default CheckboxAll;
