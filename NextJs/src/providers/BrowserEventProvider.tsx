"use client";
import useNavigate from "@/shared/hooks/useNavigate";
import { Cookies } from "@/shared/utils/Data";
import { createContext, useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { isMobile } from "react-device-detect";

export const BrowserDetectContext = createContext({
  isInitMobile: false as boolean,
  isMobile: false as boolean,
  deviceType: "" as string,
  width: 0 as number,
  Agent: "" as string,
  isDev: false as boolean,
  version: 0 as number,
  app: "" as string,
  appStatus: "" as string,
});

const MOBILE_MAX_WIDTH = 768;
const TABLET_MAX_WIDTH = 1024;

function BrowserEventProvider({ children }: { children: React.ReactNode }) {
  const dev = process.env.NEXT_PUBLIC_DEV;
  const [cookies, setCookie] = useCookies([Cookies.MODE]);
  const { [Cookies.MODE]: mode } = cookies;
  const [deviceType, setDeviceType] = useState<string>("");
  const [version, setVesion] = useState(-1);
  const [app, setApp] = useState<string>("");
  const [appStatus, setAppStatus] = useState<string>("");
  const [userAgent, setUserAgent] = useState<string>("");
  const initialWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
  const [query, setQuery] = useState<string>("");
  const [width, setWidth] = useState(initialWidth);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setUserAgent(navigator?.userAgent);
    }
    if (typeof window !== "undefined") {
      setQuery(window.location.search.toString());
    }
  }, []);
  useEffect(() => {
    const device = [
      {
        name: "Android_WebView",
        keywords: ["AOS_WebView", "Android_WebView"],
      },
      {
        name: "iOS_WebView",
        keywords: ["iOS_WebView"],
      },
      { name: "iOS", keywords: ["iPhone", "iPad"] },
      {
        name: "Android",
        keywords: ["Android"],
      },
      {
        name: "PC",
        keywords: ["Windows", "Linux", "Macintosh"],
      },
    ];
    const find = device.find((d) =>
      d?.keywords?.some((keyword) =>
        String(userAgent)?.toLowerCase()?.includes(keyword?.toLowerCase())
      )
    );
    if (find?.name === "Android_WebView") {
      // window.setTokenFromNative = function (token: string) {
      //   if (token && token !== "unknown") setApp(token);
      // };
      // window.onPushPermissionChanged = function (status: string) {
      //   if (status === "granted") {
      //     setAppStatus("authorized");
      //   } else setAppStatus("denied");
      // };
      // if (window?.AndroidBridge) {
      //   const bridge = window.AndroidBridge;
      //   if (typeof bridge?.getToken === "function") {
      //     const token = bridge.getToken();
      //     if (token && token !== "unknown") setApp(token);
      //   }
      //   if (typeof bridge?.getAppVersion === "function") {
      //     const version = window.AndroidBridge.getAppVersion();
      //     setVesion(version);
      //   }
      //   if (typeof bridge?.getPushPermission === "function") {
      //     const status = window.AndroidBridge.getPushPermission();
      //     if (status === "granted") {
      //       setAppStatus("authorized");
      //     } else setAppStatus("denied");
      //   }
      // }
    } else if (find?.name === "iOS_WebView") {
      //   window.BRIDGE = {
      //     FCMTokenCallback: function (token) {
      //       if (token && token !== "") setApp(token);
      //     },
      //     pushPermissionCallback: function (status) {
      //       setAppStatus(status);
      //     },
      //   };
      //   if (window?.webkit?.messageHandlers?.iosBRIDGE) {
      //     window.webkit.messageHandlers.iosBRIDGE.postMessage("FCMToken");
      //     window.webkit.messageHandlers.iosBRIDGE.postMessage("pushPermission");
      //   }
    }

    setDeviceType(find ? find.name : "unknown");
  }, [userAgent]);
  // useEffect(() => {
  //   if (!app) {
  //     switch (appStatus) {
  //       case "authorized":
  //         if (deviceType === "iOS_WebView")
  //           window.webkit.messageHandlers.iosBRIDGE.postMessage("FCMToken");

  //         break;
  //       case "denied":
  //         break;
  //       case "notDetermined":
  //         if (deviceType === "iOS_WebView")
  //           window.webkit.messageHandlers.iosBRIDGE.postMessage("FCMToken");
  //         break;
  //       case "provisional":
  //         break;
  //       case "ephemeral":
  //         break;
  //       default:
  //         break;
  //     }
  //   }
  // }, [appStatus, app]);
  useEffect(() => {
    if (isMobile) {
      // 모바일 모드로 접속
      if (mode) {
        // state가 있는 경우 state에 따라 이동
        if (JSON.parse(mode)) {
          if (!window.location.pathname.startsWith("/m")) {
            navigate("/m" + window.location.pathname + (query || ""), {
              replace: true,
            });
          }
        } else if (window.location.pathname.startsWith("/m")) {
          navigate(
            window.location.pathname.replace("/m/", "/") + (query || ""),
            { replace: true }
          );
        }
      } else {
        // state가 없는 경우 모바일로 이동
        if (!window.location.pathname.startsWith("/m")) {
          navigate("/m" + window.location.pathname + (query || ""), {
            replace: true,
          });
        }
      }
    }
    // PC는 주소기반이라 따로 설정 필요 없음
  }, [mode]);
  useEffect(() => {
    window.addEventListener("resize", handleWindowSizeChange);
    return () => {
      window.removeEventListener("resize", handleWindowSizeChange);
    };
  }, []);
  const handleWindowSizeChange = () => {
    const newWidth = window.innerWidth;

    if (dev) {
      // 개발모드인 경우만 작동
      if (newWidth < MOBILE_MAX_WIDTH) {
        if (!window.location.pathname.startsWith("/m")) {
          navigate("/m" + window.location.pathname + (query || ""), {
            replace: true,
          });
          // navigate("/m");
        }
      } else if (window.location.pathname.startsWith("/m")) {
        navigate(window.location.pathname.replace("/m", "") + (query || ""), {
          replace: true,
        });
        // navigate("/");
      }
    }
    setWidth(newWidth);
  };
  return (
    <BrowserDetectContext.Provider
      value={{
        isInitMobile: isMobile,
        isMobile: isMobile
          ? mode
            ? JSON.parse(mode)
            : true
          : (typeof window !== "undefined" &&
              window.location.pathname.startsWith("/m")) ||
            (dev && width < MOBILE_MAX_WIDTH),
        deviceType, // 새로운 deviceType 상태 공개
        width,
        Agent: userAgent,
        isDev: !!dev,
        version,
        app,
        appStatus,
      }}
    >
      {children}
    </BrowserDetectContext.Provider>
  );
}

export default BrowserEventProvider;
export const useBrowserEvent = () => useContext(BrowserDetectContext);
