import NiceModal from "@ebay/nice-modal-react";
import Center from "components/center/Center";
import Div from "components/div/Div";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import Image from "components/Image/Image";
import P from "components/P/P";
import { AuthContext } from "providers/AuthProvider";
import { BrowserDetectContext } from "providers/BrowserEventProvider";
import { LanguageContext } from "providers/LanguageProvider";
import { useContext } from "react";
import useLanguageNavigate from "shared/hooks/useNavigate";
import style from "./NoticeCard.module.css";
import Icon from "components/icons/Icon";
import { useTranslation } from "react-i18next";

const RECENTLY_VIEWED_KEY = "recently_viewed_products";

function NoticeCard({
  article,
  //   product,
  isSimple = false,
  updateProduct,
  addInterest,
  removeInterest,
  onClick,
  //   isSimilarProduct = false,
  //   hidePrice = false,
  // hideComment = false,
  type = "notice",
}) {
  const { isMobile } = useContext(BrowserDetectContext);

  // const onProductClick = () => {
  //   languageNavigate(`/notice/detail/${article.id}`, {
  //     state: { article },
  //   });
  // };

  const onProductClick = () => {
    NiceModal.show("mainNotice", {
      id: article.id,
      state: article,
    });
  };

  const cardClick = () => {
    onClick ? onClick() : onProductClick();
  };

  //   const handleToggleInterest = async (e) => {
  //     e.stopPropagation();
  //     if (!customerData) {
  //       languageNavigate(`/login`);
  //       return;
  //     }
  //     try {
  //       if (product?.interest) {
  //         await NiceModal.show("confirm", {
  //           message: "wannaDeleteWishList",
  //           confirmText: t("check"),
  //           cancelText: t("cancelFunction"),
  //           onConfirm: async () => {
  //             await removeInterest(product?.interest);
  //             product.interest = null;
  //             product.interests = Number(product.interests) - 1;
  //           },
  //           onCancel: () => { },
  //         });
  //         // await removeInterest(product?.interest);
  //         // product.interest = null;
  //         // product.interests = Number(product.interests) - 1;
  //       } else {
  //         const interest = await addInterest(product.id);
  //         product.interest = interest?.id;
  //         product.interests = Number(product.interests) + 1;
  //       }
  //       // await updateProduct(await requester.getProduct(product.id));
  //     } catch (error) {
  //     }
  //   };

  //   const discount =
  //     product?.discount_price !== undefined &&
  //     product.discount_price !== null &&
  //     parseInt(product.discount_price) !== parseInt(product.price);
  return (
    <Div
      className={style.NoticeCardWrapper}
      marginBottom={isMobile ? 5 : 20}
      justifyContent={"center"}
      onClick={cardClick}
    >
      {/* {product && ( */}
      <VerticalFlex gap={5} position={"relative"}>
        <FlexChild padding={"14px 10px 20px"}>
          <VerticalFlex gap={5}>
            <FlexChild>
              <P size={12} color={"#676767"} weight={"bold"}>
                announcement
              </P>
            </FlexChild>

            <FlexChild>
              <P
                lineClamp={2}
                textOverflow={"ellipsis"}
                whiteSpace={"wrap"}
                overflow={"hidden"}
                size={14}
                weight={"500"}
                color={"#353535"}
              >
                {/* {flagCode === "cn" ? product?.title : product?.metadata?.title} */}
                {/* 푸푸코리아 정기 업데이트 소식{" "} */}
                {/* 여기에 공지사항 제목 출력력 */}
                {article?.title}
              </P>
            </FlexChild>

            <FlexChild>
              <P
                lineClamp={1}
                textOverflow={"ellipsis"}
                whiteSpace={"wrap"}
                overflow={"hidden"}
                size={12}
                weight={"normal"}
                color={"#BABABA"}
              >
                {new Date(article.created_at).toLocaleDateString()}{" "}
                {/* 날짜출력 위치 */}
              </P>
            </FlexChild>
          </VerticalFlex>
        </FlexChild>
        <div className={style.noticeIcon}>
          <Icon name="noticeIcon" width={30} />
        </div>
      </VerticalFlex>
      {/* )} */}
    </Div>
  );
}

export default NoticeCard;
