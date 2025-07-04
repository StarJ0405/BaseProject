import { cilMediaPlay } from "@coreui/icons";
import CIcon from "@coreui/icons-react";
import Center from "components/center/Center";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import Image from "components/Image/Image";
import P from "components/P/P";
import style from "./FeedCard.module.css";
import { useContext } from "react";
import { LanguageContext } from "providers/LanguageProvider";

function FeedCard({ feed, onClick, marginBottom }) {
  const { money } = useContext(LanguageContext);
  const getLowestPriceVariant = () => {
    if (!feed.variants?.length) {
      return null;
    }

    const result = feed.variants.reduce((lowest, current) => {
      const lowestPrice = lowest.discount_price || lowest.price;
      const currentPrice = current.discount_price || current.price;

      return currentPrice < lowestPrice ? current : lowest;
    }, feed.variants[0]);

    return result;
  };

  const lowestPriceVariant = getLowestPriceVariant();

  return (
    <div
      className={style.feedCardWrapper}
      onClick={onClick}
      style={{ marginBottom: marginBottom }}
    >
      <VerticalFlex gap={5}>
        <FlexChild justifyContent={"center"} maxWidth={"100%"}>
          <div className={style.filter}>
            {feed?.src && (
              <div className={style.overlay}>
                <div className={style.overlayIconBackground}></div>
                <div className={style.overlayIcon}>
                  <Center>
                    <CIcon icon={cilMediaPlay} />
                  </Center>
                </div>
              </div>
            )}
            <Image
              className={style.thumbnail}
              width={"100%"}
              src={feed.thumbnail}
              alt="Feed Image"
            />
          </div>
        </FlexChild>
        <FlexChild padding={10}>
          <VerticalFlex gap={5}>
            <FlexChild>
              <P size={15} weight={500} color={"#353535"}>
                {feed.title}
              </P>
            </FlexChild>
            {/* <FlexChild padding={"0 0 10px 0"}>
                            <span style={{ textDecoration: "line-through", color: "#BABABA", marginLeft: "6px", fontSize: "12px", fontWeight: 400, paddingTop: "4px" }}>
                                {lowestPriceVariant?.price?.toLocaleString()}{money}
                            </span>
                        </FlexChild> */}
            <FlexChild>
              <HorizontalFlex justifyContent={"space-between"}>
                <FlexChild>
                  <P size={20} weight={700} color={"#353535"}>
                    {lowestPriceVariant?.price?.toLocaleString()}
                    {money}
                  </P>
                </FlexChild>
              </HorizontalFlex>
            </FlexChild>
          </VerticalFlex>
        </FlexChild>
      </VerticalFlex>
    </div>
  );
}
export default FeedCard;
