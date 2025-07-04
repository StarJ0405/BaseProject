import { requester } from "App";
import { createContext, useContext, useEffect, useState } from "react";
import { log } from "shared/utils/Utils";

export const CSSContext = createContext({
  CSS: Object,
  addCSS: (key, value) => { },
  removeCSS: (key) => { },
});

function CSSProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [CSS, setCSS] = useState({});
  const addCSS = (key, value) => {
    CSS[key] = value;
    setCSS({ ...CSS });
  };
  const removeCSS = (key) => {
    delete CSS[key];
    setCSS({ ...CSS });
  };
  useEffect(() => {
    // setIsLoading(true);
    // document.documentElement.style.setProperty(
    //   "--white-hover",
    //   colorConfig?.whiteHover
    // );
    // setIsLoading(false);
  }, []);

  return (
    <CSSContext.Provider value={{ CSS, addCSS, removeCSS }}>
      {!isLoading && children}
    </CSSContext.Provider>
  );
}

export default CSSProvider;
export const useCSS = () => useContext(CSSContext);
