"use client";
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import clsx from "clsx";
import styles from "./ToggleSwitch.module.css";

// Toggle 컴포넌트에서 외부에 노출할 함수들의 타입 정의
export interface ToggleHandle {
  toggle: () => void;
  setStatus: (newStatus: boolean) => void;
  isStatus: () => boolean;
}

/**
 * 이미지 관련 설정을 위한 인터페이스
 */
interface ImageConfig {
  /** 토글이 켜졌을 때 표시될 기본 이미지의 URL (src). */
  onSrc: string;
  /** 토글이 꺼졌을 때 표시될 기본 이미지의 URL (src). */
  offSrc: string;
  /** 토글이 켜진 상태에서 마우스 오버 시 표시될 이미지의 URL (src). */
  onHoverSrc?: string;
  /** 토글이 꺼진 상태에서 마우스 오버 시 표시될 이미지의 URL (src). */
  offHoverSrc?: string;
}

// Toggle 컴포넌트의 Props 타입 정의
interface ToggleProps {
  /**
   * 이미지 관련 설정을 포함하는 객체입니다.
   * 이 prop이 제공되면 CSS 배경 대신 이미지를 렌더링합니다.
   * onSrc와 offSrc는 필수로 제공되어야 합니다.
   */
  imageConfig?: ImageConfig;
  /**
   * 토글 상태가 변경될 때 호출되는 콜백 함수.
   * 현재 토글 상태를 인자로 받습니다.
   * @default () => {}
   */
  onChange?: (newStatus: boolean) => void;
  /**
   * 토글의 초기 상태 또는 제어되는 상태를 설정합니다.
   * @default false
   */
  status?: boolean;
  /**
   * 토글의 활성화/비활성화 여부를 설정합니다.
   * @default false
   */
  disabled?: boolean;
  /**
   * 사용자 정의 className을 추가합니다.
   */
  className?: string;
  /**
   * 토글의 배경색을 직접 지정합니다. (선택 사항)
   */
  backgroundColorOn?: string;
  backgroundColorOff?: string;
  /**
   * 토글의 버튼(원) 색상을 직접 지정합니다. (선택 사항)
   */
  thumbColor?: string;
  /**
   * 마우스 오버 시 호버 효과를 적용할지 여부.
   * `imageConfig`가 없어도 `thumb` 및 `track`에는 호버 효과가 적용됩니다.
   * @default true
   */
  enableHover?: boolean;
}

const Toggle = forwardRef<ToggleHandle, ToggleProps>(
  (
    {
      imageConfig = {
        onSrc: "resources/images/switch_on.png",
        offSrc: "resources/images/switch_off.png",
      }, // 객체 형태로 이미지 src들을 받음
      onChange = () => {},
      status: controlledStatus = false,
      disabled = false,
      className,
      backgroundColorOn,
      backgroundColorOff,
      thumbColor,
      enableHover = true,
    },
    ref
  ) => {
    const [internalStatus, setInternalStatus] =
      useState<boolean>(controlledStatus);
    const [isHovered, setIsHovered] = useState<boolean>(false);

    useEffect(() => {
      setInternalStatus(controlledStatus);
    }, [controlledStatus]);

    useImperativeHandle(ref, () => ({
      toggle() {
        if (disabled) return;
        const newStatus = !internalStatus;
        setInternalStatus(newStatus);
        onChange(newStatus);
      },
      setStatus(newStatus: boolean) {
        if (disabled) return;
        setInternalStatus(newStatus);
        onChange(newStatus);
      },
      isStatus() {
        return internalStatus;
      },
    }));

    const handleClick = () => {
      if (disabled) return;
      const newStatus = !internalStatus;
      setInternalStatus(newStatus);
      onChange(newStatus);
    };

    const handleMouseEnter = () => {
      if (enableHover && !disabled) {
        setIsHovered(true);
      }
    };

    const handleMouseLeave = () => {
      if (enableHover && !disabled) {
        setIsHovered(false);
      }
    };

    const shouldUseImages =
      imageConfig && imageConfig.onSrc && imageConfig.offSrc;

    const toggleContainerStyle: React.CSSProperties = {
      backgroundColor: shouldUseImages
        ? undefined
        : internalStatus
        ? backgroundColorOn || undefined
        : backgroundColorOff || undefined,
    };

    const toggleButtonStyle: React.CSSProperties = {
      backgroundColor: thumbColor ? thumbColor : undefined,
    };

    const currentOnImageSrc =
      isHovered && imageConfig?.onHoverSrc
        ? imageConfig.onHoverSrc
        : imageConfig?.onSrc;

    const currentOffImageSrc =
      isHovered && imageConfig?.offHoverSrc
        ? imageConfig.offHoverSrc
        : imageConfig?.offSrc;

    return (
      <div
        className={clsx(
          styles.toggleContainer,
          internalStatus && styles.active,
          disabled && styles.disabled,
          enableHover && !disabled && styles.enableHover,
          shouldUseImages && styles.hasImageConfig,
          className
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={
          !shouldUseImages && (backgroundColorOn || backgroundColorOff)
            ? toggleContainerStyle
            : undefined
        }
        role="switch"
        aria-checked={internalStatus}
        aria-disabled={disabled}
      >
        {!shouldUseImages && (
          <div
            className={styles.toggleButton}
            style={thumbColor ? toggleButtonStyle : undefined}
          />
        )}

        {shouldUseImages && (
          <div className={styles.imageContainer}>
            <img src={currentOffImageSrc} alt="Off" className={styles.off} />
            <img src={currentOnImageSrc} alt="On" className={styles.on} />
          </div>
        )}
      </div>
    );
  }
);
Toggle.displayName = "Toggle";

export default Toggle;
