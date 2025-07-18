"use client";

import Dummy from "@/components/dummy/Dummy";
import usePageData from "@/shared/hooks/data/usePageData";
import { QRCodeCanvas } from "qrcode.react";
export default function ProductList3({
  products: init_products,
}: {
  products: any;
}) {
  // const [products, setPorudcts] = useState(init_products);
  const {
    products = [],
    page,
    setPage,
    maxPage,
  } = usePageData(
    "products",
    (index) => {
      return {
        order: "created_at.DESC",
        limit: 20,
        offset: index * 20,
        page: index,
      };
    },
    (condition) => {
      return fetch(
        `https://puffukorea.com/api/store/products?order=created_at.DESC&limit=${
          condition.limit
        }&offset=${condition?.page * condition.limit}`
      ).then((res) => res.json());
    },
    (data) => {
      return Math.ceil(Number(data?.count) / data.limit);
    },
    {
      onReprocessing: (data) => data?.products || [],
      fallbackData: init_products,
    }
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
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setPage(Math.max(0, page - 1))}>pre</button>
        <button>{page}</button>
        <button onClick={() => setPage(Math.min(page + 1, maxPage))}>
          next
        </button>
      </div>
      <Dummy height={20} />
    </div>
  );
}
