import React, { createContext, useContext, useReducer, useEffect } from "react";
import { getProducts } from "../services/productService";

const ProductContext = createContext();

const initialState = {
  products: [],
  loading: true,
  error: null,
  filters: {
    inStock: "all",
    searchQuery: "",
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "FETCH_SUCCESS":
      return { ...state, products: action.payload, loading: false };
    case "FETCH_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((product) =>
          product.id === action.payload.id ? action.payload : product
        ),
      };
    case "ADD_PRODUCT":
      return {
        ...state,
        products: [...state.products, action.payload],
      };
    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter(
          (product) => product.id !== action.payload
        ),
      };
    case "SET_FILTER":
      return { ...state, filters: { ...state.filters, ...action.payload } };
    default:
      return state;
  }
};

export const ProductProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const products = await getProducts();
        dispatch({ type: "FETCH_SUCCESS", payload: products });
      } catch (error) {
        dispatch({ type: "FETCH_ERROR", payload: error.message });
      }
    };
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ state, dispatch }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => useContext(ProductContext);
