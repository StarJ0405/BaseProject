"use client";
import React, {
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { RadioGroupContext } from "./RadioGroup"; // RadioGroupContext 가져오기

// RadioGroupContext 사용 훅
const useRadioGroup = () => {
  const context = useContext(RadioGroupContext);
  if (!context) {
    console.error(
      "RadioChild must be used within a RadioGroup. Ensure you have wrapped RadioChild with <RadioGroup>."
    );
    // Fallback 또는 에러 처리 (필요에 따라)
    return {
      name: "default-radio-group",
      value: null,
      selectRadio: () => {},
      registerRadio: () => {},
      unregisterRadio: () => {},
      groupRefs: React.useRef(new Set<string>()),
      groupImages: undefined,
    };
  }
  return context;
};

interface RadioChildProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string; // 라디오 버튼의 고유 ID (value로도 사용됨)
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  images?: {
    on?: string; // 선택되었을 때 이미지
    off?: string; // 선택되지 않았을 때 이미지
    onHover?: string; // 선택되었을 때 호버 이미지
    offHover?: string; // 선택되지 않았을 때 호버 이미지
  };
}

/**
 * RadioChild 컴포넌트: 개별 라디오 버튼을 나타냅니다.
 * @param {RadioChildProps} props - id, className, style, children, images
 */
const RadioChild = forwardRef<HTMLInputElement, RadioChildProps>(
  ({ id, className, style, children, onChange, images, ...rest }, ref) => {
    const {
      name,
      value, // RadioGroup에서 현재 선택된 값
      selectRadio,
      registerRadio,
      unregisterRadio,
      groupImages,
    } = useRadioGroup();

    // 현재 라디오 버튼이 선택되었는지 여부
    const isChecked = value === id;
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

    // 마운트 시 라디오 버튼 등록, 언마운트 시 등록 해제
    useEffect(() => {
      registerRadio(id);
      return () => {
        unregisterRadio(id);
      };
    }, [id, registerRadio, unregisterRadio]);

    // 내부 input의 change 이벤트 처리
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // 라디오 버튼은 선택되면 항상 true이므로 e.target.checked를 그대로 사용해도 무방합니다.
      // 하지만 우리는 그룹 컨텍스트를 통해 상태를 관리하므로, 단순히 이 라디오를 선택하도록 합니다.
      selectRadio(id); // <--- 이 라디오 버튼을 선택하도록 group context에 알림
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
          type="radio" // type을 "radio"로 변경
          id={`${name}-${id}`}
          name={name}
          value={id} // id를 value로 사용
          checked={isChecked} // isChecked 사용
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

RadioChild.displayName = "RadioChild";
export default RadioChild;
