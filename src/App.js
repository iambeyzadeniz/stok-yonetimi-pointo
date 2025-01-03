import React from "react";
import { ProductProvider } from "./context/ProductContext";
import ProductList from "./components/products/ProductList";

const App = () => {
  return (
    <ProductProvider>
      <div style={{ padding: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <img
            src="/pointo.svg"
            alt="Logo"
            style={{ width: "100px", height: "80px" }}
          />
          <h1
            style={{
              fontSize: "26px",
              fontWeight: 400,
              letterSpacing: " 0.5px",
              marginBottom: "auto",
              marginTop: "auto",
            }}
          >
            Stok Yönetimi
          </h1>
        </div>
        <ProductList />
      </div>
    </ProductProvider>
  );
};

export default App;
