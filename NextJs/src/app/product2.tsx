"use client";

import Dummy from "@/components/dummy/Dummy";
import useInfiniteData from "@/shared/hooks/data/useInfiniteData";
export default function ProductList2({
  products: init_products,
}: {
  products: any;
}) {
  const {
    products = [],
    page,
    setPage,
    Load,
  } = useInfiniteData(
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
      fallbackData: [init_products],
      refresh: {
        keepPreviousData: true,
      },
      cache: {
        persistSize: true,
      },
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
          border: "1px solid #dadada",
          maxWidth: "calc(100% - 20px -20px)",
        }}
      >
        {products.map((product: any) => (
          <p
            style={{
              padding: 10,
              border: "1px solid #111",
              borderRadius: 10,
            }}
            key={`${product.id}_2`}
          >
            {product?.metadata?.title || product.title}
          </p>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => Load()}>Load more</button>
        <button>{page}</button>
        <button onClick={() => setPage(page + 10)}>load until +10</button>
      </div>

      <Dummy height={20} />
    </div>
  );
}
