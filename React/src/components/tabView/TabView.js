import P from "components/P/P";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { Cookies } from "shared/utils/Utils";
import style from "./TabView.module.css";

function TabView({ tabs, activeTab, setActiveTab, isModal }) {
  const [cookies] = useCookies([Cookies.APP]);
  const [scrollTo, setScrollTo] = useState("");
  const navRef = useRef(null);
  const sentinelRef = useRef(null); // 기준이 될 감시 포인트

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setScrollTo(style.fixed);
        } else {
          setScrollTo("");
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: "0px",
      }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, []);

  const navTabBack = () => {
    if (navRef.current) {
      sentinelRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div>
      {
        // navRef 위치 체크용
        navRef ? <div ref={sentinelRef} style={{ height: "1px" }} /> : null
      }
      {/* Tab Navigation */}
      <div
        ref={navRef}
        className={`${style.tabContainer} ${scrollTo}`}
        style={isModal ? undefined : { top: cookies[Cookies.APP] ? 50 : 90 }}
      >
        {Object.keys(tabs).map((tabKey) => (
          <div
            key={tabKey}
            className={`${style.tab} ${
              activeTab === tabKey ? style.activeTab : ""
            }`}
            onClick={() => {
              setActiveTab(tabKey);
              navTabBack();
            }}
          >
            <P>{tabs[tabKey].label}</P>
          </div>
        ))}
      </div>
      <div className={style.tabBottomLine}></div>
      <div>{tabs[activeTab]?.content}</div>{" "}
      {/* activeTab에 해당하는 컨텐츠 표시 */}
    </div>
  );
}

export default TabView;
