import AccordionChild from "components/accordion/AccordionChild";
import AccordionWrapper from "components/accordion/AccordionWrapper";
import Container from "components/container/Container";
import Div from "components/div/Div";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import Icon from "components/icons/Icon";
import Image from "components/Image/Image";
import P from "components/P/P";
import { useAuth } from "providers/AuthProvider";
import { useCategory } from "providers/CategoryProvider";
import { LanguageContext } from "providers/LanguageProvider";
import { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Cookies, getCookieOption } from "shared/utils/Utils";
import style from "./CategoryHeader.module.css";
import SortHeader from "./SortHeader";

function CategoryHeader() {
  const {
    selectedCategory,
    categories,
    setSelectedCategory,
    category: _category,
  } = useCategory();
  const [delay, setDelay] = useState(false);
  const [cookies, setCookie] = useCookies([Cookies.INFO]);
  const { customerData } = useAuth();
  const [info, setInfo] = useState(false);
  const { flagCode } = useContext(LanguageContext);
  const [categoryList, setCategoryList] = useState([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [selectedCategory]);

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
  const handleCategoryClick = (category, force = false) => {
    setSelectedCategory(category.id);
    if (
      category?.category_children?.filter((f) => Number(f.count) > 0)?.length >
        0 &&
      !force
    )
      return;
    const overlay = document.querySelector(
      `.${style.overlay.replace("+", "\\+")}`
    );
    if (overlay.classList.contains(style.isOverlayVisible)) {
      setTimeout(() => {
        overlay.classList.remove(style.isOverlayVisible);
      }, 300);
    }
  };

  const toggleOverlay = () => {
    // setIsOverlayVisible(!isOverlayVisible);
    const overlay = document.querySelector(
      `.${style.overlay.replace("+", "\\+")}`
    );
    overlay.classList.toggle(style.isOverlayVisible);
  };

  const removeOverlayVisible = () => {
    const overlay = document.querySelector(
      `.${style.overlay.replace("+", "\\+")}`
    );
    if (overlay?.classList.contains(style.isOverlayVisible)) {
      overlay.classList.remove(style.isOverlayVisible);
    }
  };
  const hasMore = !!categoryList[categoryList?.length - 1]?.category_children;
  return (
    <Div className={style.headerContainer}>
      <Container maxWidth={1440} minWidth={1440}>
        <VerticalFlex>
          <FlexChild>
            <HorizontalFlex>
              <FlexChild padding={"1px 0 1px 12px"} width={"100%"}>
                <HorizontalFlex
                  justifyContent={"flex-start"}
                  className={style.hideScrollbar}
                  overflowX={"auto"}
                >
                  {categoryList?.length > 0 &&
                    categoryList?.[categoryList?.length - 1]?.id !== "all" && (
                      <Icon
                        name="back"
                        size={18}
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
                            size={15}
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
                            size={12}
                            containerWidth={"max-width"}
                          />
                        </FlexChild>
                      )
                    )}
                </HorizontalFlex>
                <FlexChild width={"50px"} onClick={toggleOverlay}>
                  <Div cursor={"pointer"}>
                    <Icon name={"unfoldBtn"} />
                  </Div>
                </FlexChild>
              </FlexChild>
            </HorizontalFlex>
          </FlexChild>
        </VerticalFlex>
      </Container>
      {info && (
        <FlexChild
          padding={"8px 0 8px 12px"}
          borderTop={"1px solid rgb(238, 238, 238)"}
          position={"relative"}
        >
          <FlexChild justifyContent={"center"}>
            <Icon width={"auto"} height={28} name={`21_info_${flagCode}`} />
          </FlexChild>
          <Div
            position={"absolute"}
            right={10}
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
      <Div className={style.overlay}>
        <Container maxWidth={1440}>
          <VerticalFlex paddingTop={4}>
            <FlexChild>
              <HorizontalFlex>
                <FlexChild
                  padding={`${1}px 25px ${1}px 24px`}
                  overflowX={"auto"}
                >
                  <P size={20} color={"#353535"} weight={700}>
                    categoryList
                  </P>
                </FlexChild>
                <FlexChild width={"fit-content"}>
                  <SortHeader onSortClick={removeOverlayVisible} />
                </FlexChild>
                <FlexChild width={"50px"} onClick={toggleOverlay}>
                  <Div cursor={"pointer"}>
                    <Icon name={"foldBtn"} />
                  </Div>
                </FlexChild>
              </HorizontalFlex>
            </FlexChild>
            <HorizontalFlex
              padding={"4px 20px"}
              flexWrap={"wrap"}
              gap={10}
              justifyContent={"flex-start"}
            >
              {categories
                ?.sort((c1, c2) => c1.rank - c2.rank)
                ?.map((category, index) => (
                  <FlexChild
                    key={index}
                    width={"16%"}
                    border={
                      _category?.mpath?.includes(category.id)
                        ? "1px solid #FF7E98"
                        : "1px solid #eeeeee"
                    }
                    borderRadius={3}
                    backgroundColor={
                      _category?.mpath?.includes(category.id)
                        ? "#FFF7F9"
                        : "#ffffff"
                    }
                    padding={"20px 0"}
                    justifyContent={"center"}
                    cursor={"pointer"}
                    className={style.selectedCategory}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <VerticalFlex gap={10}>
                      <FlexChild width={"fit-content"}>
                        <Div
                          backgroundColor={"#ffffff"}
                          width={70}
                          height={70}
                          borderRadius={"50%"}
                        >
                          <Image
                            borderRadius={"100%"}
                            src={category?.thumbnail}
                            width={"100%"}
                            height={"100%"}
                          />
                        </Div>
                      </FlexChild>
                      <FlexChild width={"fit-content"}>
                        <P
                          size={16}
                          weight={400}
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
                      </FlexChild>
                    </VerticalFlex>
                  </FlexChild>
                ))}
            </HorizontalFlex>
            {categoryList?.length > 0 &&
              categoryList[0]?.category_children?.filter(
                (f) => Number(f.count) > 0
              )?.length > 0 && (
                <FlexChild padding={"12px 20px"}>
                  <AccordionWrapper key={categoryList?.[0]?.id} gap={0}>
                    <AccordionChild
                      header={
                        <P
                          size={18}
                          weight={600}
                          color={
                            _category?.id === categoryList?.[0]?.id
                              ? "var(--main-color)"
                              : "#353535"
                          }
                        >
                          all
                        </P>
                      }
                      onClick={() =>
                        handleCategoryClick(categoryList?.[0], true)
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
                            header={
                              <P
                                size={18}
                                weight={600}
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
                                  size={17}
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
                                      size={17}
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
              )}
          </VerticalFlex>
        </Container>
      </Div>
    </Div>
  );
}

export default CategoryHeader;
