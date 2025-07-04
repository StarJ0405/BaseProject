// import { fas } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BrowserDetectContext } from "providers/BrowserEventProvider";
import { useContext, useEffect, useState } from "react";
import style from "./TopButton.module.css";
import Center from "components/center/Center";
import VerticalFlex from "components/flex/VerticalFlex";
import FlexChild from "components/flex/FlexChild";
import P from "components/P/P";
import Icon from "components/icons/Icon";
import { useLocation } from "react-router-dom";

function TopButton() {
  const { width, isMobile, languageCode } = useContext(BrowserDetectContext);
  const currentLocation = useLocation();
  const highBottomPath = [
    "cart",
    "notice/detail",
    "inquiry/detail",
    "mypage/delivery",
    "customerInquiryList",
  ]; // 추가 경로 가능
  const productDetailPath = ["product/details"];

  const [isHighBottomPage, setIsHighBottomPage] = useState(false);
  const [isProductDetailPage, setIsProductDetailPage] = useState(false);
  const [hide, setHide] = useState(false);
  const hidePath = [
    "/feed/details",
    "customerInquiryList/write",
    "signup"
  ];
  const [visible, setVisible] = useState(`${style.visible}`);

    useEffect(() => {
        const TopvisibleHidden = () => {
            if(window.scrollY === 0) {
                setVisible(`${style.hidden}`);
            } else {
                setVisible(`${style.visible}`);
            }
        }

        window.addEventListener('scroll', TopvisibleHidden);
        TopvisibleHidden();

        return () => {
            window.removeEventListener('scroll', TopvisibleHidden);
        };
    }, []);
    

  useEffect(() => {
    setIsHighBottomPage(
      highBottomPath.some((path) => currentLocation.pathname.includes(path))
    );
    setIsProductDetailPage(
      productDetailPath.some((path) => currentLocation.pathname.includes(path))
    );
    setHide(hidePath.some((path) => currentLocation.pathname.includes(path)));
  }, [currentLocation]);

  const onTopButtonClick = () => {
    window.scrollTo(0, window.offsetTop);
  };

  

  return (
    !hide && (
      <div
        className={
          isMobile
            ? `${style.mobileTopButton} ${
                isHighBottomPage ? style.highBottom : ""
              } ${isProductDetailPage ? style.productDetail : ""} ${visible}`
            : style.pcTopButton
        }
        onClick={onTopButtonClick}
      >
        <VerticalFlex>
          <FlexChild>
            <Center>
              <Icon name="arrowTop" width={17} />
            </Center>
          </FlexChild>
          {!isMobile && (
            <FlexChild>
              <Center>
                <P weight={600} size={12} color={"#666"}>
                  TOP
                </P>
              </Center>
            </FlexChild>
          )}
        </VerticalFlex>
      </div>
    )
  );
}

export default TopButton;
