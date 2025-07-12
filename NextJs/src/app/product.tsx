"use client";

import DatePicker from "@/components/date-picker/DatePicker";
import Dummy from "@/components/dummy/Dummy";
import { useEffect, useState } from "react";

export default function ProductList({
  products: init_products,
}: {
  products: Array<any>;
}) {
  const [products, setPorudcts] = useState(init_products);
  const [page, setPage] = useState(0);
  const [maxPage, setMaxPage] = useState(0);

  useEffect(() => {
    fetch(
      `https://puffukorea.com/api/store/products?order=created_at.DESC&limit=10&offset=${
        page * 10
      }`
    ).then(async (response) => {
      if (response.ok) {
        const data: any = await response.json();
        console.log(data);
        setPorudcts(data.products);
        setMaxPage(data.count);
      }
    });
  }, [page]);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {products.map((product) => (
          <p key={product.id}>{product?.metadata?.title || product.title}</p>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        <button onClick={() => setPage(Math.max(0, page - 1))}>pre</button>
        <p>{page}</p>
        <button onClick={() => setPage(Math.min(page + 1, maxPage))}>
          next
        </button>
      </div>
      <div style={{ display: "flex" }}>
        <button onClick={() => {}}>test</button>
        <button onClick={() => {}}>test2</button>
      </div>
      <Dummy height={10} />
    </div>
  );
}
