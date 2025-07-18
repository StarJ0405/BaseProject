const fetchProducts = async () => {
  const response = await fetch(
    "https://puffukorea.com/api/store/products?order=Random()&limit=10",
    {
      next: { revalidate: 0 },
    }
  ); // 상품 데이터를 가져오는 API 엔드포인트
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  return data;
  // return data.products;
};

export default async function Home() {
  const products = await fetchProducts();

  return (
    <div style={{ height: "100vh", width: "100vw", gap: 10 }}>
      {/* <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h1>기본 불러오기</h1>
        <ProductList products={products} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h1>무한 스크롤</h1>
        <ProductList2 products={products} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h1>페이징</h1>
        <ProductList3 products={products} />
      </div> */}
    </div>
  );
}
