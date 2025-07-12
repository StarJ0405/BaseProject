"use client";
import Hls from "hls.js";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

const HLSVideo = forwardRef(
  (
    {
      src,
      poster,
      width,
      height = "100%",
      border,
      errorReplace = false,
      autoPlay = true,
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
    const [hasError, setHasError] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const videoRef = useRef<any>(null);
    const hlsRef = useRef<any>(null);
    useImperativeHandle(ref, () => ({
      setIsPlaying(status: boolean) {
        if (status) {
          videoRef.current.play().catch(() => {
            setIsPlaying(false);
          });
        } else {
          videoRef.current.pause();
        }
        setIsPlaying(status);
      },
    }));
    useEffect(() => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: 60, // 최대 60초 버퍼링
          maxMaxBufferLength: 120, // 최대 120초까지 확장
          liveSyncDuration: 3, // 라이브 스트림에서 동기화 유지
          liveMaxLatencyDuration: 10, // 최대 지연 허용 시간
          maxLoadingDelay: 3, // 네트워크 지연 허용 시간
          minAutoBitrate: 200000, // 최소 자동 비트레이트 (200kbps)
          enableWorker: true, // Web Worker 사용하여 성능 향상
          lowLatencyMode: true, // 저지연 모드 활성화
        });

        hls.loadSource(src);
        hls.attachMedia(videoRef.current);
        hlsRef.current = hls;
      }

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
      };
    }, [src]);

    const togglePlay = () => {
      if (videoRef.current) {
        if (videoRef.current.paused) {
          videoRef.current.play();
          setIsPlaying(true);
        } else {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      }
    };

    return errorReplace && hasError ? (
      <div style={{ width, height, border, backgroundColor: "white" }} />
    ) : (
      <div style={{ position: "relative", cursor: "pointer", height: height }}>
        <video
          // style={{ border, width: '100%', height: '100%' }}
          // style={{ border, width: "100%", height: height, }}
          style={{ border, width: "100%", maxHeight: "100%" }}
          width={width}
          height={height}
          ref={videoRef}
          poster={poster}
          autoPlay={autoPlay}
          loop
          // muted
          playsInline
          onClick={togglePlay}
          onError={() => setHasError(true)}
        />
        {!isPlaying && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              width: "50px",
              height: "50px",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              borderRadius: "50%",
              padding: "15px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* 재생 아이콘 */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </div>
    );
  }
);

export default HLSVideo;
