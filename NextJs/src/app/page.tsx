import ProductList from "./product";

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

  return data.products;
};

export default async function Home() {
  const products = await fetchProducts();

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <h1>상품 목록</h1>
      <ProductList products={products} />
    </div>
  );
}
