"use client";

import Dummy from "@/components/dummy/Dummy";
import useData from "@/shared/hooks/data/useData";
import useClientEffect from "@/shared/hooks/useClientEffect";
import SocketRequester, { socketRequester } from "@/shared/SocketRequester";
import axios from "axios";
import { useEffect, useState } from "react";
export default function ProductList({
  products: init_products,
}: {
  products: any;
}) {
  // const [products, setPorudcts] = useState(init_products);

  const [page, setPage] = useState(0);
  const [maxPage, setMaxPage] = useState(
    Math.ceil(Number(init_products?.count) / 10)
  );
  const { origin, products = [] } = useData(
    "products",
    {
      order: "created_at.DESC",
      limit: 10,
      offset: 0,
      page: page,
    },
    (condition) => {
      return fetch(
        `https://puffukorea.com/api/store/products?order=created_at.DESC&limit=10&offset=${
          condition?.page * 10
        }`
      ).then((res) => res.json());
    },
    {
      onReprocessing: (data) => data?.products || [],
      fallbackData: init_products,
    }
  );
  useClientEffect(
    () => {
      console.log("?");
      socketRequester.subscribe("/links/1", (res) =>
        console.log("socket", res)
      );
      (async () => {
        console.log("try to mok_api");
        const ressponse = await axios.get(
          `https://ppakdam.com/mok/mok_api_gettoken`
        );
        console.log(ressponse);
      })();
    },
    [],
    true
  );

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          padding: 10,
          margin: "0 10px",
          maxWidth: "calc(100% - 20px -20px)",
          border: "1px solid #dadada",
        }}
      >
        {products.map((product: any) => (
          <p
            style={{
              padding: 10,
              border: "1px solid #111",
              borderRadius: 10,
            }}
            key={product.id}
          >
            {product?.metadata?.title || product.title}
          </p>
        ))}
      </div>
      <button
        onClick={() =>
          socketRequester.publish("/links", { index: 1, message: "knock" })
        }
      >
        test
      </button>
      <Dummy height={20} />
    </div>
  );
}
