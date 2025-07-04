import { BrowserDetectContext } from "providers/BrowserEventProvider";
import { LanguageContext } from "providers/LanguageProvider";
import { useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";

function useNavigate() {
  const navigate = useNavigate();

  // const languageNavigate = useCallback(
  //   (path, options) => {
  //     if (typeof path === "number") {
  //       navigate(path);
  //       return;
  //     }
  //     if (path.includes("http")) {
  //       if (options?.new) {
  //         window.open(path);
  //       } else window.location.href = path.replace(/\/\//g, "/");
  //       return;
  //     }

  //     const fullPath = String(
  //       `${isMobile ? "/m" : ""}/${options?.lang || flagCode}/${path}`
  //     ).replace(/\/\/+/g, "/");
  //     if (options?.new) {
  //       delete options.new;
  //       window.open(window.location.origin + fullPath);
  //     } else navigate(fullPath, options);
  //   },
  //   [flagCode, navigate]
  // );

  return navigate;
}
export default useNavigate;
