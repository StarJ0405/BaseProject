import AccordionChild from "components/accordion/AccordionChild";
import AccordionWrapper from "components/accordion/AccordionWrapper";
import Div from "components/div/Div";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import Icon from "components/icons/Icon";
import Image from "components/Image/Image";
import P from "components/P/P";
import { useAuth } from "providers/AuthProvider";
import { useCategory } from "providers/CategoryProvider";
import { useLanguage } from "providers/LanguageProvider";
import { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import { Cookies, getCookieOption } from "shared/utils/Utils";
import style from "./MobileCategoryHeader.module.css";
import MobileSortHeader from "./MobileSortHeader";

function MobileCategoryHeader() {
  const { flagCode } = useLanguage();
  const {
    selectedCategory,
    categories,
    setSelectedCategory,
    category: _category,
  } = useCategory();
  const [delay, setDelay] = useState(false);
  const [cookies, setCookie] = useCookies([Cookies.INFO, Cookies.APP]);
  const { customerData } = useAuth();
  const [info, setInfo] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [categoryList, setCategoryList] = useState([]);
  const [ScrollActive, secScrollActive] = useState("");
  const prevScrollY = useRef(0);
  useEffect(() => {
    setTimeout(() => {
      setDelay(true);
    }, 100);
  }, []);
  useEffect(() => {
    if (delay) {
      setInfo(!customerData && !cookies[Cookies.INFO]);
    }
  }, [delay, cookies, info, customerData]);
  useEffect(() => {
    if (_category)
      setCategoryList(
        _category?.mpath
          ?.split(".")
          .filter((f) => !!f)
          .reduce(
            (acc, id) => {
              let find;
              find = acc?.categories
                ? acc.categories.find((f) => f.id === id)
                : categories.find((f) => f.id === id);
              acc.categories = find?.category_children;
              acc.list = [...acc.list, find];
              return acc;
            },
            { categories: null, list: [] }
          )?.list || []
      );
  }, [_category]);
  useEffect(() => {
    // 헤더 스크롤 시 클래스 추가
    // 헤더 높이값을 가져와서 처리하는게 맞지만 바로 처리해야 해서 클래스만 넣어줌
    let ticking = false;
    const headerScrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          if (currentScrollY <= 0) {
            secScrollActive("");
          } else if (currentScrollY > prevScrollY.current) {
            secScrollActive(style.scroll_active);
          } else {
            secScrollActive("");
          }

          // if(currentScrollY > prevScrollY.current) {
          //   secScrollActive(style.scroll_active);
          // } else {
          //   secScrollActive('');
          // }

          prevScrollY.current = currentScrollY;
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", headerScrollHandler);

    return () => window.removeEventListener("scroll", headerScrollHandler);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [selectedCategory]);
  useEffect(() => {
    if (isOverlayVisible) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none"; // 모바일 터치 스크롤 방지
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }

    // cleanup: 컴포넌트 unmount 시도 대비
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOverlayVisible]);

  const handleCategoryClick = (category, force = false) => {
    setSelectedCategory(category.id);
    if (
      category?.category_children?.filter((f) => Number(f.count) > 0)?.length >
        0 &&
      !force
    )
      return;
    if (isOverlayVisible) {
      setIsOverlayVisible(false); // 오버레이 열려 있을 때만 닫기
    }
    // const overlay = document.querySelector(
    //   `.${style.overlay.replace("+", "\\+")}`
    // );
    // if (overlay.classList.contains(style.isOverlayVisible)) {
    //   setTimeout(() => {
    //     overlay.classList.remove(style.isOverlayVisible);
    //   }, 300);
    // }
  };

  const toggleOverlay = () => {
    // setIsOverlayVisible(!isOverlayVisible);
    // const overlay = document.querySelector(
    //   `.${style.overlay.replace("+", "\\+")}`
    // );
    // overlay.classList.toggle(style.isOverlayVisible);

    setIsOverlayVisible((prev) => !prev);
  };

  const hasMore = !!categoryList[categoryList?.length - 1]?.category_children;
  return (
    <Div
      className={`${style.headerContainer} ${ScrollActive}`}
      top={!cookies[Cookies.APP] ? 90 : 50}
    >
      <VerticalFlex height={"100%"}>
        <HorizontalFlex height={"100%"} gap={10}>
          <FlexChild padding={"7px 5px"} overflowX={"auto"}>
            <HorizontalFlex justifyContent={"flex-start"}>
              {categoryList?.length > 0 &&
                categoryList?.[categoryList?.length - 1]?.id !== "all" && (
                  <Icon
                    name="back"
                    size={16}
                    containerWidth={"fit-content"}
                    cursor={"pointer"}
                    onClick={() =>
                      handleCategoryClick(
                        categoryList?.[
                          categoryList?.length - 2 + (hasMore ? 0 : -1)
                        ] || {
                          id: "all",
                        }
                      )
                    }
                  />
                )}
              {(categoryList?.length > 0 &&
              categoryList?.[categoryList?.length - 1]?.id !== "all"
                ? [
                    // {
                    //   ...(hasMore
                    //     ? categoryList[categoryList?.length - 1]
                    //     : categoryList[categoryList?.length - 2]),
                    //   rank: -1,
                    //   borderRight: "1px solid #dadada",
                    //   color: hasMore ? null : "#8b8b8b",
                    // },
                    ...categoryList
                      .slice(0, categoryList?.length + (hasMore ? 0 : -1))
                      .map((category, index) => {
                        const last =
                          index ===
                          categoryList?.length - 1 + (hasMore ? 0 : -1);
                        return {
                          ...category,
                          rank: index - categoryList?.length,
                          color: hasMore && last ? null : "#8b8b8b",
                          borderRight: last && "1px solid #dadada",
                        };
                      })
                      .reduce((acc, now) => {
                        if (acc?.length > 0) {
                          return [...acc, { name: ">" }, now];
                        }
                        return [now];
                      }, []),
                    ...(categoryList[categoryList?.length - 1]
                      ?.category_children ||
                      categoryList?.[categoryList?.length - 2]
                        ?.category_children ||
                      []),
                  ]
                : categories
              )
                ?.sort((c1, c2) => c1.rank - c2.rank)
                ?.map((category, index) =>
                  category?.id ? (
                    <FlexChild
                      key={index}
                      width={"fit-content"}
                      padding={"4px 10px"}
                      cursor={"pointer"}
                      borderRight={category?.borderRight}
                      onClick={() => handleCategoryClick(category)}
                    >
                      <P
                        size={14}
                        weight={400}
                        color={
                          category?.color ||
                          (_category?.mpath?.includes(category.id)
                            ? "var(--main-color)"
                            : "#8b8b8b")
                        }
                      >
                        {flagCode === "cn"
                          ? category.name
                          : category.metadata?.name || category.name}
                      </P>
                    </FlexChild>
                  ) : (
                    <FlexChild key={index} width={"fit-content"}>
                      <Icon
                        name="nextBtn_gray"
                        size={10}
                        containerWidth={"max-width"}
                      />
                    </FlexChild>
                  )
                )}
            </HorizontalFlex>
          </FlexChild>
          <FlexChild width={"30px"} onClick={toggleOverlay}>
            <Div cursor={"pointer"}>
              <Icon name={"unfoldBtn-2_2x"} width={"20px"} />
            </Div>
          </FlexChild>
        </HorizontalFlex>
      </VerticalFlex>
      {info && (
        <FlexChild
          padding={"8px 8px 8px 12px"}
          boxSizing={"border-box"}
          borderTop={"1px solid rgb(238, 238, 238)"}
          position={"relative"}
          justifyContent={"flex-start"}
        >
            <Div
            // maxWidth={"300px"}
            maxWidth={flagCode === "cn" ? "300px" : "280px"}
            containerWidth="max-content"
            >
                <Icon
                    width={"100%"}
                    name={`21_info_${flagCode}`}
                />
            </Div>
            <Div
                position={"absolute"}
                right={6}
                width={"max-content"}
                cursor={"pointer"}
                onClick={() =>
                setCookie(
                    Cookies.INFO,
                    true,
                    getCookieOption({ maxAge: 60 * 60 * 24 })
                )
                }
            >
                <Icon name="closeBtn2x" size={28} />
            </Div>
        </FlexChild>
      )}
      <Div
        className={`${style.overlay} ${
          isOverlayVisible ? style.isOverlayVisible : ""
        }`}
      >
        <VerticalFlex>
          <FlexChild height={49}>
            <HorizontalFlex>
              <FlexChild padding={"0px 15px"} overflowX={"auto"}>
                <P size={16} color={"#353535"} weight={600}>
                  categoryList
                </P>
              </FlexChild>
              <FlexChild>
                <MobileSortHeader setIsOverlayVisible={setIsOverlayVisible} />
              </FlexChild>
              <FlexChild width={"30px"} onClick={toggleOverlay}>
                <Div cursor={"pointer"}>
                  <Icon name={"foldBtn-2_2x"} width={"20px"} />
                </Div>
              </FlexChild>
            </HorizontalFlex>
          </FlexChild>
          <FlexChild className={style.categoryScroll}>
            <HorizontalFlex alignItems="flex-start">
              <FlexChild
                width={"32%"}
                height={"calc(100dvh - 153px)"}
                overflowY={"auto"}
              >
                <VerticalFlex justifyContent={"flex-start"} height={"100%"}>
                  {categories
                    .sort((c1, c2) => c1.rank - c2.rank)
                    .map((category, index) => (
                      <FlexChild
                        key={`${category?.id}_${index}`}
                        borderRight={"1px solid #eee"}
                        borderTop={index === 0 ? "" : "1px solid #eee"}
                        backgroundColor={
                          _category?.mpath?.includes(category.id)
                            ? "#FFF7F9"
                            : "#ffffff"
                        }
                        padding={"16px 0"}
                        justifyContent={"center"}
                        cursor={"pointer"}
                        className={style.selectedCategory}
                        onClick={() => handleCategoryClick(category)}
                      >
                        <VerticalFlex gap={10}>
                          <FlexChild width={"fit-content"}>
                            <Div
                              backgroundColor={"#ffffff"}
                              width={50}
                              height={50}
                              borderRadius={"50%"}
                            >
                              <Image
                                src={category.thumbnail}
                                width={"100%"}
                                height={"100%"}
                                borderRadius={"50%"}
                              />
                            </Div>
                          </FlexChild>
                          <FlexChild width={"fit-content"}>
                            <P
                              size={13}
                              weight={400}
                              color={
                                _category?.mpath?.includes(category.id)
                                  ? "var(--main-color)"
                                  : "#8b8b8b"
                              }
                            >
                              {flagCode === "cn"
                                ? category.name
                                : category.metadata?.name}
                            </P>
                          </FlexChild>
                        </VerticalFlex>
                      </FlexChild>
                    ))}
                </VerticalFlex>
              </FlexChild>
              <FlexChild height={"calc(100dvh - 153px)"} overflowY={"auto"}>
                <AccordionWrapper key={categoryList?.[0]?.id} gap={0}>
                  <AccordionChild
                    borderTop={"unset"}
                    borderRight={"unset"}
                    borderLeft={"unset"}
                    header={
                      <P
                        size={14}
                        weight={500}
                        color={
                          _category?.id === categoryList?.[0]?.id
                            ? "var(--main-color)"
                            : "#8b8b8b"
                        }
                      >
                        all
                      </P>
                    }
                  />
                  {categoryList[0]?.category_children
                    ?.filter((f) => Number(f.count) > 0)
                    ?.sort((c1, c2) => c1.rank - c2.rank)
                    .map((category, index) => {
                      const child = category?.category_children;
                      return (
                        <AccordionChild
                          key={`detail_${category?.id}`}
                          onClick={() => handleCategoryClick(category)}
                          borderTop={"unset"}
                          borderLeft={"unset"}
                          header={
                            <P
                              size={14}
                              weight={500}
                              color={
                                _category?.mpath?.includes(category.id)
                                  ? "var(--main-color)"
                                  : "#8b8b8b"
                              }
                            >
                              {flagCode === "cn"
                                ? category.name
                                : category.metadata?.name || category.name}
                            </P>
                          }
                        >
                          {child?.filter((f) => Number(f.count) > 0)?.length >
                            0 && (
                            <>
                              <P
                                size={14}
                                padding={5}
                                cursor={"pointer"}
                                color={
                                  _category.id === category?.id
                                    ? "var(--main-color)"
                                    : "#8b8b8b"
                                }
                                onClick={() =>
                                  handleCategoryClick(category, true)
                                }
                              >
                                all
                              </P>
                              {child
                                ?.filter((f) => Number(f.count) > 0)
                                ?.sort((c1, c2) => c1.rank - c2.rank)
                                ?.map((category2) => (
                                  <P
                                    key={`detail_${category2?.id}`}
                                    size={14}
                                    padding={5}
                                    cursor={"pointer"}
                                    color={
                                      _category?.mpath?.includes(category2.id)
                                        ? "var(--main-color)"
                                        : "#8b8b8b"
                                    }
                                    onClick={() =>
                                      handleCategoryClick(category2)
                                    }
                                  >
                                    {flagCode === "cn"
                                      ? category2.name
                                      : category2.metadata?.name ||
                                        category2.name}
                                  </P>
                                ))}
                            </>
                          )}
                        </AccordionChild>
                      );
                    })}
                </AccordionWrapper>
              </FlexChild>
            </HorizontalFlex>
          </FlexChild>
        </VerticalFlex>
      </Div>
    </Div>
  );
}

export default MobileCategoryHeader;
