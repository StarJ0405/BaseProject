import { elkRequester, requester } from "App";
import Div from "components/div/Div";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import P from "components/P/P";
import { useEffect, useState } from "react";
import useLanguageNavigate from "shared/hooks/useNavigate";
import style from "./PartnersCard.module.css";

function PartnersCard({ customerData }) {
  const languageNavigate = useLanguageNavigate();
  const [visit, setVisit] = useState();
  const [totalSubscriber, setTotalSubscriber] = useState(0);
  const [totalPoint, setTotalPoint] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const moveActivity = () => {
    languageNavigate("/mypage/activity");
  };

  useEffect(() => {
    setIsMounted(true);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    end.setMonth(end.getMonth() + 1);
    end.setDate(0);
    elkRequester.getVisit(
      { keyword: customerData?.id, start_date: start, end_date: end },
      (res) => setVisit(res?.aggregations?.clientip_terms?.buckets?.length)
    );
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [isMounted]);

  const fetchLogs = async () => {
    try {
      const response = await requester.getLogLink({ type: "파트너스" });
      // if (response?.logs) {
      setTotalPoint(response?.sum || 0);
      setTotalSubscriber(response?.regist || 0);
      // totalLogs(response?.logs);
      // }
    } catch (e) {}
  };

  const totalLogs = (logs) => {
    setTotalSubscriber(logs.length);
    const totalPoints = logs.reduce((sum, log) => {
      const point = typeof log.point === "number" ? log.point : 0;
      return sum + point;
    }, 0);
    setTotalPoint(totalPoints);
  };

  return (
    <Div className={style.container}>
      <VerticalFlex gap={10}>
        <FlexChild>
          <P
            size={24}
            weight={700}
            color="#353535"
            onClick={moveActivity}
            cursor={"pointer"}
          >
            shareLinkActivity
          </P>
        </FlexChild>
        <FlexChild>
          <P color={"#8B8B8B"} size={16}>
            linkSharingRevenueGeneration
          </P>
        </FlexChild>
        <FlexChild padding={20}>
          <HorizontalFlex>
            <FlexChild>
              <VerticalFlex gap={10}>
                <FlexChild justifyContent={"center"}>
                  <P size={28} weight={700} color={"#353535"}>
                    {totalSubscriber || 0}
                  </P>
                </FlexChild>
                <FlexChild justifyContent={"center"}>
                  <P color={"#8B8B8B"} size={17}>
                    subscriber
                  </P>
                </FlexChild>
              </VerticalFlex>
            </FlexChild>
            <FlexChild>
              <VerticalFlex gap={10}>
                <FlexChild justifyContent={"center"}>
                  <P size={28} weight={700} color={"#353535"}>
                    {visit || 0}
                  </P>
                </FlexChild>
                <FlexChild justifyContent={"center"}>
                  <P color={"#8B8B8B"} size={17}>
                    visitor
                  </P>
                </FlexChild>
              </VerticalFlex>
            </FlexChild>
            <FlexChild>
              <VerticalFlex gap={10}>
                <FlexChild justifyContent={"center"}>
                  <P size={28} color={"var(--main-color)"} weight={700}>
                    {totalPoint || 0}P
                  </P>
                </FlexChild>
                <FlexChild justifyContent={"center"}>
                  <P color={"#8B8B8B"} size={17}>
                    signUpPoint
                  </P>
                </FlexChild>
              </VerticalFlex>
            </FlexChild>
          </HorizontalFlex>
        </FlexChild>
        <FlexChild className={style.btn} onClick={moveActivity}>
          <P size={17} color={"white"} weight={600}>
            activityDetail
          </P>
        </FlexChild>
      </VerticalFlex>
    </Div>
  );
}
export default PartnersCard;
