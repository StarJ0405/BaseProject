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
import adultMark from "resources/icons/21세 마크.png";
import HeartIcon from "resources/icons/heart";
import useLanguageNavigate from "shared/hooks/useNavigate";
import style from "./ProductCard.module.css";
import Icon from "components/icons/Icon";
import noImage from "resources/images/noImage.png";
import { useTranslation } from "react-i18next";

const RECENTLY_VIEWED_KEY = "recently_viewed_products";

function ProductCard({
  cardType,
  product,
  isSimple = false,
  updateProduct,
  addInterest,
  removeInterest,
  onClick,
  isSimilarProduct = false,
  hidePrice = false,
  // hideComment = false,
  type = "product",
}) {
  const languageNavigate = useLanguageNavigate();
  const { money } = useContext(LanguageContext);
  const { isMobile } = useContext(BrowserDetectContext);
  const { customerData } = useContext(AuthContext);
  const { flagCode } = useContext(LanguageContext);
  const { t } = useTranslation();

  // const addToRecentlyViewed = (productId) => {
  //     let storedIds = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY)) || [];
  //     storedIds = storedIds.filter(id => id !== productId);
  //     storedIds.unshift(productId);
  //     if (storedIds.length > 10) {
  //         storedIds.pop();
  //     }
  //     localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(storedIds));
  // };

  const onProductClick = () => {
    languageNavigate(`/product/details/${product.id}`, {
      state: { product },
    });
  };
  // const onProductClick = () => {
  //   NiceModal.show("mobileProductDetail", {
  //     onProduct: product,
  //   });
  // };

  const checkAdultProduct = () => {
    NiceModal.show("confirm", {
      message: "thisProductIsForAdultsOnly",
      confirmText: "check",
    });
  };

  const cardClick = () => {
    if (product.adult === true && !customerData) {
      languageNavigate(`/login`);
      return;
    }
    if (product.adult === true && customerData?.adult !== true) {
      checkAdultProduct();
      return;
    }
    onClick ? onClick() : onProductClick();
  };

  const handleToggleInterest = async (e) => {
    e.stopPropagation();
    if (!customerData) {
      languageNavigate(`/login`);
      return;
    }
    try {
      if (product?.interest) {
        await NiceModal.show("confirm", {
          message: "wannaDeleteWishList",
          confirmText: t("check"),
          cancelText: t("cancelFunction"),
          onConfirm: async () => {
            await removeInterest(product?.interest);
            product.interest = null;
            product.interests = Number(product.interests) - 1;
          },
          onCancel: () => {},
        });
        // await removeInterest(product?.interest);
        // product.interest = null;
        // product.interests = Number(product.interests) - 1;
      } else {
        const interest = await addInterest(product.id);
        product.interest = interest?.id;
        product.interests = Number(product.interests) + 1;
      }
      // await updateProduct(await requester.getProduct(product.id));
    } catch (error) {}
  };

  const discount =
    product?.discount_price !== undefined &&
    product.discount_price !== null &&
    parseInt(product.discount_price) !== parseInt(product.price);

  const cardTypes = cardType === "slide";

  return (
    <Div
      className={`${
        cardTypes ? style.slideCardWrapper : style.productCardWrapper
      }`}
      marginBottom={isMobile ? 5 : cardTypes ? 0 : 20}
      justifyContent={"center"}
      onClick={cardClick}
      // backgroundColor={'#ccc'}
    >
      {product && (
        <VerticalFlex gap={cardTypes ? 15 : 5}>
          <FlexChild justifyContent={"center"} maxWidth={"100%"}>
            {product.adult === true && customerData?.adult !== true ? (
              // <Image width={"100%"} src={adultMark} />
              <>
                <img
                  src={adultMark}
                  alt="Adult Mark Image"
                  style={{
                    width: "100%",
                  }}
                />
              </>
            ) : (
              // <Image
              //   width={"100%"}
              //   src={product?.metadata?.small || product.thumbnail}
              //   alt="Product Image"
              // />
              <div
                className={`${
                  cardTypes ? style.slideCard_wrap : style.feedCard_wrap
                }`}
                style={{
                  height: cardTypes ? (!isMobile ? "261px" : "151px") : "auto",
                }}
              >
                <img
                  src={product?.metadata?.small || product.thumbnail || noImage}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = noImage;
                  }}
                  alt="Product Image"
                  style={{
                    width: "100%",
                    aspectRatio: "6 / 7",
                    objectFit: "cover",
                  }}
                />
                {type == "feed" && (
                  <>
                    <div
                      className={style.feedIcon}
                      style={{
                        width: "20px",
                        height: "20px",
                        backgroundColor: "#353535",
                        opacity: 0.5,
                        borderRadius: "50%",
                      }}
                    ></div>
                    <Icon
                      className={style.feedIcon}
                      borderRadius={"50%"}
                      width={20}
                      height={"auto"}
                      name="feedIcon"
                    />
                  </>
                )}
              </div>
            )}
          </FlexChild>
          <FlexChild
            padding={
              isMobile ? "6px 10px 10px 10px" : cardTypes ? "0 9px 10px" : 10
            }
          >
            <VerticalFlex gap={5}>
              <FlexChild minHeight={cardTypes ? 48 : "auto"}>
                {/* alignItems={cardTypes ? 'start' : 'center'} */}
                <P
                  lineClamp={2}
                  textOverflow={"ellipsis"}
                  whiteSpace={"wrap"}
                  overflow={"hidden"}
                  size={isMobile ? 14 : 16}
                  weight={cardTypes ? 500 : "normal"}
                  color={cardTypes ? "#000" : "#353535"}
                >
                  {flagCode === "cn"
                    ? product?.title
                    : product?.metadata?.title}
                </P>
              </FlexChild>
              {!hidePrice && (product.price || product.price === 0) && (
                <>
                  {discount && (
                    <FlexChild>
                      <P
                        size={!isSimilarProduct ? 18 : 15}
                        weight={700}
                        color={"var(--main-color)"}
                        display={"flex"}
                        alignItems={"center"}
                      >
                        {Math.round(
                          (1 - product.discount_price / product.price) * 100
                        )}
                        %
                        <span
                          style={{
                            textDecoration: "line-through",
                            color: "#BABABA",
                            marginLeft: "8px",
                            fontSize: "12px",
                            fontWeight: 400,
                            paddingTop: "4px",
                          }}
                        >
                          {parseInt(product.price).toLocaleString()}
                          {money}
                        </span>
                      </P>
                    </FlexChild>
                  )}
                </>
              )}

              {/* {hideComment && <FlexChild></FlexChild>} */}

              <FlexChild>
                <HorizontalFlex justifyContent={"space-between"}>
                  {hidePrice && (
                    <FlexChild>
                      <P
                        size={!isSimilarProduct ? 18 : 16}
                        weight={700}
                        color={"#353535"}
                      >
                        {product.store?.name}
                      </P>
                    </FlexChild>
                  )}
                  {!hidePrice && (product.price || product.price === 0) && (
                    <FlexChild>
                      <P
                        size={
                          !isSimilarProduct
                            ? cardTypes
                              ? !isMobile
                                ? 22
                                : 18
                              : 18
                            : 16
                        }
                        weight={700}
                        color={cardTypes ? "#000" : "#353535"}
                      >
                        {discount
                          ? parseInt(product.discount_price).toLocaleString()
                          : parseInt(product.price).toLocaleString()}

                        {cardTypes ? (
                          <span style={{ color: "#000" }}>
                            {money}
                          </span>
                        ) : (
                          <span style={{ color: "#353535" }}>{money}</span>
                        )}
                      </P>
                    </FlexChild>
                  )}
                  {!isSimple && (
                    <FlexChild
                      width={"initial"}
                      onClick={handleToggleInterest}
                      padding={"5px 0px"}
                    >
                      <Center>
                        <HorizontalFlex width={"max-content"} gap={5}>
                          <HeartIcon
                            stroke={
                              product?.interest
                                ? "var(--main-color)"
                                : "#8B8B8B"
                            }
                            isFilled={product?.interest}
                          />
                          <P
                            color={
                              product?.interest
                                ? "var(--main-color)"
                                : "#8b8b8b"
                            }
                          >
                            {product.interests}
                          </P>
                        </HorizontalFlex>
                      </Center>
                    </FlexChild>
                  )}
                </HorizontalFlex>
              </FlexChild>
            </VerticalFlex>
          </FlexChild>
        </VerticalFlex>
      )}
    </Div>
  );
}

export default ProductCard;
