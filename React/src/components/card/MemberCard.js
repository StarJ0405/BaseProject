import Div from "components/div/Div";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import React, { useContext, useEffect, useState } from "react";
import style from "./MemberCard.module.css";
import P from "components/P/P";
import HeartIcon from "resources/icons/heart";
import GearIcon from "resources/icons/gear";
import { LanguageContext } from "providers/LanguageProvider";
import { useNavigate } from "react-router-dom";
import useLanguageNavigate from "shared/hooks/useNavigate";
import Icon from "components/icons/Icon";
import { requester } from "App";
import NiceModal from "@ebay/nice-modal-react";
import { log } from "shared/utils/Utils";

function MemberCard({ flagCode, customerData }) {
  const { first_name } = customerData
  const languageNavigate = useLanguageNavigate();
  const navigate = useNavigate();
  const [user, setUser] = useState([]);
  const [point, setPoint] = useState(0);

  useEffect(() => {
    requester.getPoint({}, ({ point }) => setPoint(point));
  }, []);
  const moveFollowStore = () => {
    languageNavigate("/mypage/followStore");
  };
  const moveWishList = () => {
    languageNavigate("/mypage/wishlist");
  };
  const moveEditInfo = () => {
    NiceModal.show("editInfo", { email: customerData.email });
  };

  useEffect(() => {
    requester.getCurrentCustomer({}, ({ customer }) => {
      setUser(customer);
    });
  }, []);

  const moveMyPoint = () => {
    languageNavigate("/mypage/point");
  };
  const moveCertification = () => {
    NiceModal.show("certification", { first_name, notLogin: true });
  };

  return (
    <Div className={style.container} width={470}>
      <VerticalFlex gap={35}>
        <FlexChild>
          <VerticalFlex gap={25}>
            <HorizontalFlex gap={20} alignItems={"center"} justifyContent={"center"}>
              <FlexChild
                borderRadius={"50%"}
                width={80}
                height={80}
                overflowX={"hidden"}
                overflowY={"hidden"}
              >
                {user?.thumbnail ? (
                  <img
                    src={user.thumbnail}
                    style={{ width: "100%", height: "100%" }}
                  />
                ) : (
                  <Icon
                    name={"defaultProfile"}
                    width={"100%"}
                    height={"100%"}
                  />
                )}
              </FlexChild>
              {!customerData?.metadata?.certification && (
                <FlexChild justifyContent="center">
                  <Div>
                    <Div padding={"0 0 10px 0"}>
                      <P color="#8B8B8B" size={15} weight={400}  >
                        certificationDescription
                      </P>
                    </Div>
                    <Div className={style.certificationBtn} onClick={moveCertification}>
                      <P color="var(--main-color)" size={15} weight={600} >
                        goCertification
                      </P>
                    </Div>
                  </Div>
                </FlexChild>
              )}
            </HorizontalFlex>
            <HorizontalFlex alignItems="flex-start">
              <FlexChild alignItems={"center"}>
                <VerticalFlex alignItems={"flex-start"} gap={4}>
                  <FlexChild alignItems={"flex-end"}>
                    <P
                      color={"#353535"}
                      size={30}
                      textAlign={"start"}
                      weight={600}
                    >
                      {customerData?.first_name}
                    </P>
                    <P
                      textAlign={"bottom"}
                      size={20}
                      color={"#8B8B8B"}
                      weight={500}
                      paddingBottom={4}
                      paddingLeft={10}
                    >
                      member
                    </P>
                  </FlexChild>
                  <FlexChild
                    cursor={"pointer"}
                    width={"fit-content"}
                    onClick={() => moveMyPoint()}
                  >
                    <P
                      textAlign={"bottom"}
                      size={18}
                      color={"#8B8B8B"}
                      weight={500}
                    >
                      signUpPoint
                    </P>{" "}
                    <P
                      size={18}
                      paddingLeft={4}
                      textAlign={"start"}
                      weight={700}
                      color={"var(--main-color)"}
                    >
                      {" "}
                      {point.toLocaleString()}P
                    </P>
                  </FlexChild>
                </VerticalFlex>
              </FlexChild>
              <FlexChild
                width={"fit-content"}
                justifyContent={"flex-end"}
                alignItems={"center"}
                marginTop={15}
                onClick={moveEditInfo}
              >
                <P
                  size={16}
                  color={"#8B8B8B"}
                  weight={500}
                  cursor={"pointer"}
                  paddingRight={10}
                >
                  <GearIcon />
                </P>
                <P size={16} color={"#8B8B8B"} weight={500} cursor={"pointer"}>
                  editPersonalInformation
                </P>
              </FlexChild>
            </HorizontalFlex>
          </VerticalFlex>
        </FlexChild>
        <FlexChild>
          <HorizontalFlex gap={10}>
            <FlexChild className={style.btn} onClick={moveWishList}>
              <Icon name={"heartRed"} width={"fit-content"} />
              <P size={17} color={"var(--main-color)"} weight={600}>
                listOfInterests
              </P>
            </FlexChild>
            <FlexChild className={style.btn} onClick={moveFollowStore}>
              <Icon name={"storeRed"} width={"fit-content"} />
              <P size={17} color={"var(--main-color)"} weight={600}>
                followStore
              </P>
            </FlexChild>
          </HorizontalFlex>
        </FlexChild>
      </VerticalFlex>
    </Div>
  );
}
export default MemberCard;
