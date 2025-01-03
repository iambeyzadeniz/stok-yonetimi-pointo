import { API_URL } from "../constants/constans";

export const getProducts = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error("Failed to fetch products");
  return response.json();
};

export const addProduct = async (product) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!response.ok) throw new Error("Failed to add product");
  return response.json();
};

export const updateProduct = async (id, product) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });
  if (!response.ok) throw new Error("Failed to update product");
  return response.json();
};

export const deleteProduct = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete product");
  return id;
};
