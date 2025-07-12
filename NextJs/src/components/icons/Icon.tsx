// app/components/Icon/Icon.tsx
"use client"; // 이 컴포넌트는 클라이언트 컴포넌트임을 명시

import React, { useEffect, useState } from "react";
// Next.js의 Image 컴포넌트 사용 (만약 커스텀 Image 컴포넌트라면 그 경로를 사용)
import Center from "@/components/center/Center"; // 사용자 정의 컴포넌트
import Div from "@/components/div/Div"; // 사용자 정의 컴포넌트
import { log } from "@/shared/utils/Functions"; // 사용자 정의 함수
import NextImage from "next/image";
import { ReactSVG } from "react-svg"; // SVG 파일을 동적으로 로드하기 위해 react-svg 유지
import Image from "../Image/Image";
import { DirectionalStyleInterface } from "@/shared/utils/Interfaces";

// Props 타입 정의 (any 대신 구체적인 타입 사용 권장)
interface IconProps {
  projectly?: boolean;
  center?: boolean;
  src?: string; // extraSrc (resources/images/ 접두사)
  type?: "png" | "jpg" | "jpeg" | "gif" | "svg" | string; // 확장자
  name: string; // 파일 이름 (예: "my_icon", "logo.svg")
  size?: string | number; // 예: "100%", "24px"
  containerWidth?: string;
  width?: string | number;
  height?: string | number;
  cursor?: string;
  borderRadius?: string;
  border?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  padding?: string;
  paddingTop?: string;
  paddingRight?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  margin?: string;
  marginTop?: string;
  marginRight?: string;
  marginBottom?: string;
  marginLeft?: string;
  opacity?: number;
  hidden?: boolean;
  color?: string; // SVG fill/stroke
  fill?: string; // SVG fill
  stroke?: string; // SVG stroke
  draggable?: boolean;
  selectable?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onMouseDown?: (event: React.MouseEvent) => void;
  className?: string;
}

function Icon({
  projectly = false,
  center = true,
  src: extraSrc = "images/", // 기본값을 "images/"로 변경하여 resources/images/와 호환
  type = "png",
  name,
  size = "100%",
  containerWidth,
  width,
  height,
  cursor,
  borderRadius,
  border,
  borderTop,
  borderRight,
  borderBottom,
  borderLeft,
  padding,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  margin,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  opacity,
  hidden,
  color,
  fill,
  stroke,
  draggable = false,
  selectable = false,
  onClick,
  onMouseDown,
  className,
}: IconProps) {
  const [iconComponent, setIconComponent] = useState<React.ReactNode | null>(
    null
  );
  const [isClient, setIsClient] = useState(false); // 클라이언트 환경인지 확인

  // 클라이언트에서만 실행되어야 하는 로직을 위해 useEffect 사용
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getDirectionalStyles = (): DirectionalStyleInterface => {
    const styles: DirectionalStyleInterface = {};
    // padding 처리
    if (padding || paddingTop || paddingRight || paddingBottom || paddingLeft) {
      if (padding) styles.padding = padding;
      if (paddingTop) styles.paddingTop = paddingTop;
      if (paddingRight) styles.paddingRight = paddingRight;
      if (paddingBottom) styles.paddingBottom = paddingBottom;
      if (paddingLeft) styles.paddingLeft = paddingLeft;
    }

    // margin 처리
    if (margin || marginTop || marginRight || marginBottom || marginLeft) {
      if (margin) styles.margin = margin;
      if (marginTop) styles.marginTop = marginTop;
      if (marginRight) styles.marginRight = marginRight;
      if (marginBottom) styles.marginBottom = marginBottom;
      if (marginLeft) styles.marginLeft = marginLeft;
    }

    // border 처리
    if (border || borderTop || borderRight || borderBottom || borderLeft) {
      if (border) styles.border = border;
      if (borderTop) styles.borderTop = borderTop;
      if (borderRight) styles.borderRight = borderRight;
      if (borderBottom) styles.borderBottom = borderBottom;
      if (borderLeft) styles.borderLeft = borderLeft;
    }

    return styles;
  };

  // 이미지 URL을 동적으로 구성하는 함수
  const getResourceUrl = (): string => {
    if (!name) return "";

    const split = name.split(".");
    // 파일명에 확장자가 없으면 type Prop을 사용하여 확장자 추가
    const fileName = (split.length > 1 ? name : `${name}.${type}`).replace(
      "..",
      "."
    ); // ".." 같은 잘못된 경로 방지

    // process.env.NEXT_PUBLIC_APP_MODE (Next.js 표준 환경 변수)
    // 클라이언트에서 환경 변수에 접근하기 위해 NEXT_PUBLIC_ 접두사 필수
    const mode = process.env.NEXT_PUBLIC_APP_MODE;
    const modePath = projectly && mode ? `${mode}/` : "";

    // public/resources/images/ (extraSrc) / (dev/prod) / file.png
    // public 디렉토리의 루트를 기준으로 절대 경로를 구성
    const baseUrl = "/resources/";
    const fullPath = `${baseUrl}${extraSrc}${modePath}${fileName}`.replace(
      /\/\//g,
      "/"
    ); // 중복 슬래시 제거
    return fullPath;
  };

  const finalSrc = getResourceUrl();
  const isSvg = type === "svg" || name.includes(".svg");

  useEffect(() => {
    if (!isClient || !name || !finalSrc) {
      setIconComponent(null);
      return;
    }

    try {
      if (isSvg) {
        // SVG는 ReactSVG를 사용하되, src에 직접 URL을 전달
        setIconComponent(
          <ReactSVG
            src={finalSrc} // URL 경로 전달
            cursor={cursor}
            draggable={draggable}
            onClick={onClick}
            onMouseDown={onMouseDown}
            opacity={opacity}
            beforeInjection={(svg: any) => {
              // SVG 요소의 스타일 직접 조작
              svg.style.width = width || size || "100%";
              svg.style.height = height || size || "100%";
              svg.style.stroke = stroke || color || "none"; // 기본값 "none"
              svg.style.fill = fill || color || "currentColor"; // 기본값 "currentColor"
              svg.style.opacity = opacity;
              svg.style.strokeLinecap = "round";
              svg.style.strokeLinejoin = "round";
              svg.style.strokeWidth = "2px";
            }}
          />
        );
      } else {
        // Next.js의 Image 컴포넌트 사용 (JPG, PNG 등)
        setIconComponent(
          <Image
            src={finalSrc} // URL 경로 전달
            alt={name || "icon"}
            // width, height는 필수 prop입니다. 문자열 값을 숫자로 파싱하거나, 부모로부터 상속받아야 합니다.
            // 여기서는 문자열을 허용하는 커스텀 Image 컴포넌트일 수 있으므로 그대로 둡니다.
            // Next.js의 기본 Image 컴포넌트는 숫자 값을 요구합니다.
            // 실제 사용 시 width={parseInt(width || size) || 100} 등으로 변환 필요
            width={width || size || 50} // Next.js Image는 숫자 width/height 필요
            height={height || size || 50} // 숫자로 변환 또는 적절한 fallback 제공
            draggable={draggable}
            style={{
              cursor: cursor,
              // Other styles like selectable, contextmenu, strokeLinecap etc. are not
              // directly supported by Next.js Image and apply to SVG or specific elements.
              // If your custom Image component supports them, keep them.
              opacity: opacity,
              // objectFit: 'contain' // 이미지가 잘리지 않고 비율 유지하도록
            }}
            onClick={onClick}
            onMouseDown={onMouseDown}
          />
        );
      }
    } catch (error) {
      log("Error loading icon:", error);
      setIconComponent(null);
    }
  }, [
    isClient,
    name,
    finalSrc,
    isSvg,
    type,
    width,
    height,
    size,
    cursor,
    draggable,
    onClick,
    onMouseDown,
    opacity,
    color,
    fill,
    stroke,
  ]); // 모든 의존성 포함

  // 아이콘이 로딩되기 전에는 빈 문자열 대신 null을 반환하여 렌더링되지 않도록
  if (!iconComponent) {
    return null;
  }

  return (
    <Div
      borderRadius={borderRadius}
      width={containerWidth || width || size}
      position="relative"
      height={height || size}
      className={className}
      opacity={opacity}
      hidden={hidden}
      {...getDirectionalStyles()}
    >
      {center ? (
        <Center width={"100%"} height={"100%"}>
          {iconComponent}
        </Center>
      ) : (
        <>{iconComponent}</>
      )}
    </Div>
  );
}

export default Icon;
