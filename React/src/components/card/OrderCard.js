import Div from "components/div/Div";
import FlexChild from "components/flex/FlexChild";
import HorizontalFlex from "components/flex/HorizontalFlex";
import VerticalFlex from "components/flex/VerticalFlex";
import React, { useContext, useEffect, useState } from "react";
import style from "./OrderCard.module.css";
import P from "components/P/P";
import { useNavigate } from "react-router-dom";
import { LanguageContext } from "providers/LanguageProvider";
import { requester } from "App";

function OrderCard() {
  const navigate = useNavigate();
  const { flagCode } = useContext(LanguageContext);

  const [orderList, setOrderList] = useState([]);

  const [waiting, setWaiting] = useState(0);
  const [preparing, setPreparing] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [complete, setComplete] = useState(0);

  const fetchOrders = async () => {
    try {
      const response = await requester.getCustomerOrders({
        limit: "20",
        offset: "0",
      });

      if (response?.orders?.length > 0) {
        setOrderList(response.orders);
      }
    } catch (error) {}
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    let waiting = 0;
    let preparing = 0;
    let shipping = 0;
    let completed = 0;

    orderList.forEach((order) => {
      const { status, payment_status, fulfillment_status } = order;
      if (
        status === "pending" &&
        payment_status === "captured" &&
        fulfillment_status === "not_fulfilled"
      ) {
        waiting += 1;
      } else if (
        status === "pending" &&
        payment_status === "captured" &&
        fulfillment_status === "fulfilled"
      ) {
        preparing += 1;
      } else if (
        status === "pending" &&
        payment_status === "captured" &&
        fulfillment_status === "partially_shipped"
      ) {
        shipping += 1;
      } else if (
        status === "completed" &&
        payment_status === "captured" &&
        fulfillment_status === "shipped"
      ) {
        completed += 1;
      }
    });

    setWaiting(waiting);
    setPreparing(preparing);
    setShipping(shipping);
    setComplete(completed);
  }, [orderList]);

  return (
    <Div className={style.container} width={960}>
      <VerticalFlex gap={10}>
        <FlexChild>
          <P
            size={24}
            weight={700}
            color="#353535"
            cursor={"pointer"}
            onClick={() => {
              navigate(`/${flagCode}/mypage/order`);
            }}
          >
            myOrder
          </P>
        </FlexChild>
        <FlexChild>
          <P color={"#8B8B8B"} size={16}>
            orderGuide
          </P>
        </FlexChild>
        <FlexChild padding={20} width={"55%"}>
          <HorizontalFlex>
            <FlexChild>
              <VerticalFlex gap={10}>
                <FlexChild justifyContent={"center"}>
                  <P size={28} weight={700} color={"#353535"}>
                    {waiting}
                  </P>
                </FlexChild>
                <FlexChild justifyContent={"center"}>
                  <P color={"#8B8B8B"} size={17}>
                    waitingForProduct
                  </P>
                </FlexChild>
              </VerticalFlex>
            </FlexChild>
            <FlexChild>
              <VerticalFlex gap={10}>
                <FlexChild justifyContent={"center"}>
                  <P size={28} weight={700} color={"#353535"}>
                    {preparing}
                  </P>
                </FlexChild>
                <FlexChild justifyContent={"center"}>
                  <P color={"#8B8B8B"} size={17}>
                    preparingDelivery
                  </P>
                </FlexChild>
              </VerticalFlex>
            </FlexChild>
            <FlexChild>
              <VerticalFlex gap={10}>
                <FlexChild justifyContent={"center"}>
                  <P size={28} weight={700} color={"#353535"}>
                    {shipping}
                  </P>
                </FlexChild>
                <FlexChild justifyContent={"center"}>
                  <P color={"#8B8B8B"} size={17}>
                    inDelivery
                  </P>
                </FlexChild>
              </VerticalFlex>
            </FlexChild>
            <FlexChild>
              <VerticalFlex gap={10}>
                <FlexChild justifyContent={"center"}>
                  <P size={28} color={"var(--main-color)"} weight={700}>
                    {complete}
                  </P>
                </FlexChild>
                <FlexChild justifyContent={"center"}>
                  <P color={"#8B8B8B"} size={17}>
                    completeDelivery
                  </P>
                </FlexChild>
              </VerticalFlex>
            </FlexChild>
          </HorizontalFlex>
        </FlexChild>

        <FlexChild
          className={style.btn}
          width={"50%"}
          onClick={() => {
            navigate(`/${flagCode}/mypage/order`);
          }}
        >
          <P size={17} color={"var(--main-color)"} weight={600}>
            confirmMyOrder
          </P>
        </FlexChild>
      </VerticalFlex>
    </Div>
  );
}
export default OrderCard;
