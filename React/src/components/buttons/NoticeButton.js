import { requester } from "App";
import Center from "components/center/Center";
import FlexChild from "components/flex/FlexChild";
import VerticalFlex from "components/flex/VerticalFlex";
import Icon from "components/icons/Icon";
import P from "components/P/P";
import { AuthContext } from "providers/AuthProvider";
import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useConfig } from "shared/hooks/useConfig";
import useLanguageNavigate from "shared/hooks/useNavigate";
import style from "./NoticeButton.module.css";

function NoticeButton() {
  const { getConfig } = useConfig();
  const { customerData } = useContext(AuthContext);
  const currentLocation = useLocation();
  const languageNavigate = useLanguageNavigate();
  const [hide, setHide] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  const hidePath = [
    "cart",
    "/feed/details",
    "customerInquiryList/write",
    "signup",
  ];

  useEffect(() => {
    setHide(hidePath.some((path) => currentLocation.pathname.includes(path)));
  }, [currentLocation]);

  useEffect(() => {
    const date = new Date();
    date.setTime(
      date.getTime() -
        (getConfig("default")?.newNotice || 14 * 1000 * 60 * 60 * 24)
    );

    requester.getArticles(
      {
        expand: "board",
        board_name: "notification",
        created_at: `'${date.toISOString()}'~`,
      },
      ({ articles }) => {
        setShowNotice(articles?.length);
      }
    );
    // requester.getArticles(
    //   { expand: "board", board_name: "notification" },
    //   (result) => {
    //     const now = new Date();
    //     const recentNotice = result.articles?.find((article) => {
    //       const createDate = new Date(article.created_at);
    //       const days =
    //         (now.getTime() - createDate.getTime()) / (1000 * 60 * 60 * 24);
    //       return days <= 3;
    //     });

    //     if (recentNotice) {
    //       setShowNotice(true);
    //     }
    //   }
    // );
  }, []);

  const moveNotice = () => {
    languageNavigate("notice");
  };

  if (hide || !showNotice) {
    return null;
  }

  return (
    <div
      className={`${style.pcNoticeButton} ${
        customerData?.id ? style.loginmoveBottom : ""
      }`}
      onClick={moveNotice}
    >
      <VerticalFlex>
        <FlexChild>
          <P className={style.latest_txt}>new</P>
        </FlexChild>
        <FlexChild>
          <Center>
            <Icon name="noticeIcon" width={40} />
          </Center>
        </FlexChild>
      </VerticalFlex>
    </div>
  );
}

export default NoticeButton;
