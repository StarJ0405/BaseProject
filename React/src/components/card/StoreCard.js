import NiceModal from "@ebay/nice-modal-react";
import { requester } from "App";
import Div from "components/div/Div";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import Icon from "components/icons/Icon";
import Image from "components/Image/Image";
import P from "components/P/P";
import { t } from "i18next";
import { AuthContext } from "providers/AuthProvider";
import { BrowserDetectContext } from "providers/BrowserEventProvider";
import { LanguageContext } from "providers/LanguageProvider";
import { useContext, useEffect } from "react";
import HeartIcon from "resources/icons/heart";
import useLanguageNavigate from "shared/hooks/useNavigate";
import style from "./StoreCard.module.css";
import ProductCard from "./ProductCard";
import useInterests from "shared/hooks/useInterests";
import { useTranslation } from "react-i18next";

function StoreCard({ store, fetchStores }) {
  const { customerData } = useContext(AuthContext);
  const languageNavigate = useLanguageNavigate();
  const { money } = useContext(LanguageContext);
  const { isMobile } = useContext(BrowserDetectContext);
  const { t } = useTranslation();
  const { addInterest, removeInterest } = useInterests("product", true);

  const handleToggleFollow = async (e, store) => {
    e.stopPropagation();
    // 로그인 여부 체크
    if (customerData?.id) {
      let data = {
        customer_id: customerData?.id,
        store_id: store.id,
      };
      try {
        if (store.follow) {
          const confirmDeleteFollow = async (text) => {
            if (text === "confirm") {
              await requester.deleteFollow(data);
              store.follow = null;
              store.follows = Number(store.follows) - 1;
              // const index = stores.indexOf((f) => (f.id = store.id));
              // stores[index] = store;
              // setStores([...stores]);
              fetchStores();
            } else {
              return;
            }
          };

          // await requester.deleteFollow(data);
          // store.follow = null;
          // store.follows = Number(store.follows) - 1;
          // const index = stores.indexOf((f) => (f.id = store.id));
          // stores[index] = store;
          // setStores([...stores]);

          NiceModal.show("confirm", {
            message: "wannaCancelFollow",
            confirmText: t("check"),
            cancelText: t("cancelFunction"),
            onConfirm: () => confirmDeleteFollow("confirm"),
            onCancel: () => confirmDeleteFollow("false"),
          });
        } else {
          //팔로우 중이지 않다면
          const follow = await requester.addFollow(data);
          store.follow = follow;
          store.follows = Number(store.follows) + 1;
          // const index = stores.indexOf((f) => (f.id = store.id));
          // stores[index] = store;
          // setStores([...stores]);
          fetchStores();

          NiceModal.show("confirm", {
            message: t("haveBeenFollowed"),
            confirmText: "check",
          });
        }
      } catch (error) {}
    } else {
      languageNavigate("login");
      return;
    }
  };
  const handleToggleInterest = async (item) => {
    if (!customerData) {
      languageNavigate(`/login`);
      return;
    }
    try {
      if (item.interest) {
        await NiceModal.show("confirm", {
          message: "wannaDeleteWishList",
          confirmText: t("check"),
          cancelText: t("cancelFunction"),
          onConfirm: async () => {
            await removeInterest(item.interest);
            fetchStores();
          },
          onCancel: () => {},
        });
      } else {
        await addInterest(item.id);
        fetchStores();
      }
    } catch (error) {}
  };

  const onStoreClick = () => {
    languageNavigate(`/store/detail/${store.id}`);
  };

  const onProductClick = (item) => {
    languageNavigate(`/product/details/${item.id}`, {
      state: { item },
    });
  };

  return (
    <Div className={style.container}>
      {isMobile ? (
        <VerticalFlex>
          <FlexChild padding={15} borderBottom={"1px solid #ebebeb"}>
            <VerticalFlex gap={6}>
              <FlexChild>
                <HorizontalFlex>
                  <FlexChild
                    className={style.thumbnail}
                    width={"max-content"}
                    onClick={onStoreClick}
                  >
                    {store?.metadata?.thumbnail ? (
                      <Image
                        src={store?.metadata?.thumbnail}
                        width={"54px"}
                        borderRadius={"50%"}
                      />
                    ) : (
                      <Icon
                        name={"applyStoreIcon"}
                        width={"54px"}
                        height={"54px"}
                      />
                    )}
                  </FlexChild>
                  <FlexChild
                    backgroundColor={
                      store.follow ? "#ffffff" : "var(--main-color)"
                    }
                    padding={"5px 13px"}
                    borderRadius={5}
                    border={"1px solid var(--main-color)"}
                    width={"fit-content"}
                    onClick={(e) => handleToggleFollow(e, store)}
                    cursor={"pointer"}
                  >
                    <P color={store.follow ? "var(--main-color)" : "#ffffff"} fontSize={13}>
                      {store.follow ? "unfollow" : "follow"}
                    </P>
                  </FlexChild>
                </HorizontalFlex>
              </FlexChild>
              <FlexChild>
                <Div>
                  <P
                    color={"#494949"}
                    size={18}
                    weight={600}
                    paddingBottom={10}
                    whiteSpace={"nowrap"}
                    overflow={"hidden"}
                    textOverflow={"ellipsis"}
                  >
                    {store.name}
                  </P>
                  <P 
                    color={"#bababa"} 
                    size={13} 
                    weight={500}
                    whiteSpace={"nowrap"}
                    overflow={"hidden"}
                    textOverflow={"ellipsis"}
                  >
                    {store.metadata.description}
                  </P>
                </Div>
              </FlexChild>
            </VerticalFlex>
          </FlexChild>
          <FlexChild padding={15}>
            <VerticalFlex gap={10}>
              {store?.populars?.map((item) => {
                return (
                  <>
                    <FlexChild>
                      <HorizontalFlex gap={10}>
                        <FlexChild
                          className={style.thumbnail}
                          width={"24%"}
                          onClick={() => onProductClick(item)}
                        >
                          {/* <Image src={item.thumbnail} width={"90%"} height={"90%"} borderRadius={10} /> */}
                          <img
                            src={item.thumbnail}
                            style={{
                              objectFit: "cover",
                              width: "100%",
                              height: "100%",
                              borderRadius: "10px",
                            }}
                          />
                        </FlexChild>
                        <FlexChild alignItems={"flex-start"} width={"70%"}>
                          <VerticalFlex gap={8}>
                            <FlexChild>
                              <P
                                whiteSpace={"nowrap"}
                                overflow={"hidden"}
                                textOverflow={"ellipsis"}
                                weight={500}
                                fontSize={14}
                                color={"#353535"}
                              >
                                {item.title}
                              </P>
                            </FlexChild>
                            <FlexChild>
                              <HorizontalFlex>
                                <FlexChild 
                                    justifyContent={"flex-start"}
                                >
                                  <P
                                    color={"#353535"} 
                                    weight={700}
                                    fontSize={15}
                                  >
                                        {item.price}
                                        {money}
                                  </P>
                                  
                                </FlexChild>
                                <FlexChild justifyContent={"flex-end"} gap={5}>
                                  <HeartIcon
                                    onClick={() => {
                                      handleToggleInterest(item);
                                    }}
                                    stroke={
                                      item?.interest
                                        ? "var(--main-color)"
                                        : "#8B8B8B"
                                    }
                                    isFilled={item?.interest}
                                  />
                                  <P color={"#8B8B8B"}>{item.interests}</P>
                                </FlexChild>
                              </HorizontalFlex>
                            </FlexChild>
                          </VerticalFlex>
                        </FlexChild>
                      </HorizontalFlex>
                    </FlexChild>
                  </>
                );
              })}
            </VerticalFlex>
          </FlexChild>
        </VerticalFlex>
      ) : (
        <VerticalFlex>
          <FlexChild padding={20} borderBottom={"1px solid #ebebeb"}>
            <VerticalFlex>
              <FlexChild>
                <HorizontalFlex gap={15} alignItems={"flex-start"}>
                  <FlexChild
                    className={style.thumbnail}
                    width={"max-content"}
                    onClick={onStoreClick}
                  >
                    {store?.metadata?.thumbnail ? (
                      <Image
                        src={store?.metadata?.thumbnail}
                        width={"56px"}
                        borderRadius={"50%"}
                      />
                    ) : (
                      <Icon
                        name={"applyStoreIcon"}
                        width={"56px"}
                        height={"56px"}
                      />
                    )}
                  </FlexChild>
                  <FlexChild width={"58%"}>
                    <Div>
                      <P
                        color={"#494949"}
                        size={20}
                        weight={600}
                        paddingBottom={8}
                        whiteSpace={"nowrap"}
                        overflow={"hidden"}
                        textOverflow={"ellipsis"}
                      >
                        {store.name}
                      </P>
                      <P 
                        color={"#bababa"} 
                        size={14} 
                        weight={500}
                        whiteSpace={"nowrap"}
                        overflow={"hidden"}
                        textOverflow={"ellipsis"}
                      >
                        {store.metadata.description}
                      </P>
                    </Div>
                  </FlexChild>
                  <FlexChild
                    backgroundColor={
                      store.follow ? "#ffffff" : "var(--main-color)"
                    }
                    padding={"5px 13px"}
                    borderRadius={5}
                    border={"1px solid var(--main-color)"}
                    width={"fit-content"}
                    onClick={(e) => handleToggleFollow(e, store)}
                    cursor={"pointer"}
                  >
                    <P color={store.follow ? "var(--main-color)" : "#ffffff"}>
                      {store.follow ? "unfollow" : "follow"}
                    </P>
                  </FlexChild>
                </HorizontalFlex>
              </FlexChild>
            </VerticalFlex>
          </FlexChild>
          <FlexChild padding={20}>
            <HorizontalFlex gap={16} justifyContent={"flex-start"} alignItems={"flex-start"}>
              {store?.populars?.map((item) => {
                return (
                  <>
                    <FlexChild width={"max-content"}>
                      <VerticalFlex alignItems={"flex-start"}>
                        <FlexChild
                          className={style.thumbnail}
                          justifyContent={"flex-start"}
                          width={"100%"}
                          onClick={() => onProductClick(item)}
                        >
                          <img
                            src={item.thumbnail}
                            style={{
                              objectFit: "cover",
                              width: "100%",
                              height: "100%",
                              borderRadius: "10px",
                            }}
                          />
                        </FlexChild>
                        <FlexChild width={"96%"}>
                          <VerticalFlex>
                            <FlexChild>
                              <P
                              height={48}
                                lineClamp={2}
                                whiteSpace={"normal"}
                                overflow={"hidden"}
                                textOverflow={"ellipsis"}
                                color={"#353535"}
                                fontSize={16}
                              >
                                {item.title}
                              </P>
                            </FlexChild>
                            <FlexChild justifyContent={"flex-start"}>
                                <P
                                    color={"#353535"}
                                    fontSize={16}
                                    weight={700}
                                >
                                    {item.price}
                                    {money}
                                </P>
                            </FlexChild>
                            <FlexChild justifyContent={"flex-start"} gap={5}>
                              <HeartIcon
                                onClick={() => {
                                  handleToggleInterest(item);
                                }}
                                stroke={
                                  item?.interest
                                    ? "var(--main-color)"
                                    : "#8B8B8B"
                                }
                                isFilled={item?.interest}
                              />
                              <P color={"#8B8B8B"}>{item.interests}</P>
                            </FlexChild>
                          </VerticalFlex>
                        </FlexChild>
                      </VerticalFlex>
                    </FlexChild>
                  </>
                );
              })}
            </HorizontalFlex>
          </FlexChild>
        </VerticalFlex>
      )}
    </Div>
  );
}
export default StoreCard;
