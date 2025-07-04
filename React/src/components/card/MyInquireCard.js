import { requester } from "App";
import Container from "components/container/Container";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import P from "components/P/P";
import { AuthContext } from "providers/AuthProvider";
import { useContext, useEffect, useState } from "react";
import style from "./MyInquireCard.module.scss";
import Div from "components/div/Div";
import Icon from "components/icons/Icon";
import dummyImage from "resources/images/product01.png";
import Image from "components/Image/Image";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "providers/LanguageProvider";
import useLanguageNavigate from "shared/hooks/useNavigate";

function MyInquire() {
  const navigate = useNavigate();
  const { flagCode } = useContext(LanguageContext);
  const languageNavigate = useLanguageNavigate();

  const { customerData } = useContext(AuthContext);

  const [article, setArticle] = useState([]);
  const [comments, setComments] = useState([]);
  const [productData, setProductData] = useState({});
  const [product, setProduct] = useState([]);

  const fetchInquires = async () => {
    try {
      const response = await requester.getInquire({
        // expand: ["board", "variant.product.store"],
        expand: "board,variant.product.store",
        order: "updated_at.DESC",
      });
      const filteredArticles = response?.articles?.filter(
        (article) =>
          article.board?.name === "QnA" &&
          article.customer_id === customerData?.id
      );
      setArticle(filteredArticles);
    } catch (error) {}
  };

  const fetchCommnets = async () => {
    try {
      await requester.getComments(
        {
          select: "content,article_id",
          limit: 5,
          offset: 0,
        },
        (result) => {
          setComments(result.comments);
        }
      );
    } catch {}
  };

  useEffect(() => {}, [article]);

  const getTimeDifference = (createdAt) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

    if (diffTime === 0) {
      return (
        <P size={14} color={"#bababa"}>
          today
        </P>
      );
    } else if (diffTime === 1) {
      return (
        <P size={14} color={"#bababa"}>
          yesterday
        </P>
      );
    } else {
      return (
        <>
          <P size={14} color={"#bababa"} paddingRight={4}>
            {diffTime}
          </P>
          <P size={14} color={"#bababa"}>
            fewDaysAgo
          </P>
        </>
      );
    }
  };

  useEffect(() => {
    if (customerData) fetchCommnets();
  }, [customerData]);
  useEffect(() => {
    if (customerData) fetchInquires();
  }, [customerData]);

  return (
    <Container padding={35}>
      <VerticalFlex gap={26} alignItems={"flex-start"} height={"100%"}>
        <FlexChild width={"fit-content"}>
          <P
            size={24}
            weight={700}
            color="#353535"
            cursor={"pointer"}
            onClick={() => {
              languageNavigate(`/mypage/inquiry`);
            }}
          >
            inquiryDetail
          </P>
        </FlexChild>
        <FlexChild height={"calc(100% - 62px)"}>
          {article && article?.length > 0 ? (
            <VerticalFlex gap={22}>
              {article.slice(0, 3).map((data, index) => {
                const articleComment = comments.filter(
                  (comment) => comment?.article_id === data?.id
                );

                return (
                  <FlexChild
                    key={index}
                    borderBottom={
                      index !== article.slice(0, 3).length - 1
                        ? "1px solid #EEEEEE"
                        : "none"
                    }
                    paddingBottom={
                      index !== article.slice(0, 3).length - 1 ? "20px" : "0"
                    }
                  >
                    <VerticalFlex>
                      <FlexChild paddingBottom={8}>
                        <HorizontalFlex
                          justifyContent={"flex-start"}
                          alignItems="flex-start"
                          cursor={"pointer"}
                          onClick={() =>
                            languageNavigate(
                              `/product/details/${data?.variant?.product_id}`
                            )
                          }
                        >
                          <FlexChild
                            width={"fit-content"}
                            borderRadius={3}
                            overflowX={"hidden"}
                            overflowY={"hidden"}
                          >
                            <Image
                              width={63}
                              height={63}
                              src={data?.variant?.product?.thumbnail}
                            />
                          </FlexChild>
                          <FlexChild width={345} paddingLeft={8}>
                            <VerticalFlex alignItems={"flex-start"}>
                              <FlexChild width={"100%"}>
                                <P color={"#bababa"}>
                                  {data?.variant?.product?.store?.name}
                                </P>
                              </FlexChild>
                              <FlexChild width={"100%"}>
                                <P className={style.productNameTxtBox}>
                                  {data?.variant?.product?.title}
                                </P>
                              </FlexChild>
                            </VerticalFlex>
                          </FlexChild>
                        </HorizontalFlex>
                      </FlexChild>
                      <FlexChild position={"relative"}>
                        <HorizontalFlex gap={8} alignItems="flex-start">
                          {/* <FlexChild
                            width={63}
                            height={63}
                            backgroundColor={"#eeeeee"}
                            borderRadius={3}
                            justifyContent={"center"}
                          >
                            <P color={"#676767"}>underReview</P>
                          </FlexChild> */}
                          <FlexChild>
                            <VerticalFlex height={"100%"} gap={8}>
                              <FlexChild>
                                <P
                                  size={14}
                                  weight={500}
                                  color={"var(--main-color)"}
                                >
                                  [{data.title}]
                                </P>
                              </FlexChild>
                              <FlexChild>
                                <P className={style.qnaTxtBox} size={14}>
                                  {data.content}
                                </P>
                              </FlexChild>
                            </VerticalFlex>
                          </FlexChild>
                        </HorizontalFlex>
                        <FlexChild
                          width={"fit-content"}
                          height={62}
                          alignItems="flex-start"
                          position={"absolute"}
                          right={0}
                        >
                          <VerticalFlex
                            justifyContent={"space-between"}
                            alignItems={"flex-end"}
                            height={62}
                          >
                            <FlexChild justifyContent={"flex-end"}>
                              {getTimeDifference(data.created_at)}
                            </FlexChild>
                            {/* <FlexChild width={"fit-content"}>
                              <HorizontalFlex gap={8}>
                                <FlexChild>
                                  <P
                                    size={14}
                                    color={"#8b8b8b"}
                                    cursor={"pointer"}
                                  >
                                    수정
                                  </P>
                                </FlexChild>
                                <FlexChild>
                                  <P
                                    size={14}
                                    color={"#8b8b8b"}
                                    cursor={"pointer"}
                                  >
                                    삭제
                                  </P>
                                </FlexChild>
                              </HorizontalFlex>
                            </FlexChild> */}
                          </VerticalFlex>
                        </FlexChild>
                      </FlexChild>
                      <FlexChild paddingTop={8}>
                        <Div
                          border="1px solid #eeeeee"
                          borderRadius={3}
                          padding={13}
                        >
                          <VerticalFlex gap={10} position={"relative"}>
                            <FlexChild alignItems="flex-start">
                              <Icon
                                name={"qnaQuestion"}
                                width={"fit-content"}
                              />
                              <P
                                paddingLeft={8}
                                color={"#494949"}
                                size={14}
                                width={340}
                                className={style.qnaTxtBox}
                              >
                                {data.content}
                              </P>
                            </FlexChild>
                            <FlexChild>
                              {articleComment?.length > 0 ? (
                                articleComment?.map((comment) => (
                                  <FlexChild key={comment.id}>
                                    <Icon
                                      name={"qnaAnswer"}
                                      width={"fit-content"}
                                    />
                                    <P
                                      paddingLeft={8}
                                      color={"#494949"}
                                      size={14}
                                    >
                                      {comment.content}
                                    </P>
                                  </FlexChild>
                                ))
                              ) : (
                                <FlexChild>
                                  <P
                                    paddingLeft={8}
                                    color={"#bababa"}
                                    size={14}
                                  >
                                    noAnswer
                                  </P>
                                </FlexChild>
                              )}
                            </FlexChild>
                          </VerticalFlex>
                        </Div>
                      </FlexChild>
                    </VerticalFlex>
                  </FlexChild>
                );
              })}
            </VerticalFlex>
          ) : (
            <Div
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
              padding={"20px 0"}
            >
              <P size={20} color={"#cbcbcb"} weight={400}>
                noInquiryHistory
              </P>
            </Div>
          )}
        </FlexChild>
      </VerticalFlex>
    </Container>
  );
}
export default MyInquire;
