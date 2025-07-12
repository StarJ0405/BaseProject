"use client";
import { forwardRef, lazy, Suspense, useImperativeHandle, useRef } from "react";
const HLSVideo = lazy(() => import("./HLSPlayerVideo"));

const HLSPlayer = forwardRef(
  (
    {
      src,
      poster,
      width,
      autoPlay = true,
      height = "100%",
      border,
      errorReplace = false,
    }: {
      src: string;
      poster?: string;
      width?: string | number;
      autoPlay?: boolean;
      height?: string | number;
      border?: string;
      errorReplace?: boolean;
    },
    ref
  ) => {
    const videoRef = useRef<any>(null);
    useImperativeHandle(ref, () => ({
      setIsPlaying(status: boolean) {
        videoRef.current.setIsPlaying(status);
      },
    }));
    return (
      <Suspense
        fallback={
          <div style={{ width, height, border, backgroundColor: "white" }} />
        }
      >
        <HLSVideo
          ref={videoRef}
          src={src}
          poster={poster}
          width={width}
          height={height}
          border={border}
          errorReplace={errorReplace}
          autoPlay={autoPlay}
        />
      </Suspense>
    );
  }
);

export default HLSPlayer;
