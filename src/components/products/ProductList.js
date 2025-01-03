import React, { useState, useRef } from "react";
import { Table, Input, Button, Select, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useProductContext } from "../../context/ProductContext";
import ModalAddProduct from "./modals/ModalAddProduct";
import ModalUpdateProduct from "./modals/ModalUpdateProduct";
import ModalStockProduct from "./modals/ModalStockProduct";
import { deleteProduct } from "../../services/productService";

const { Search } = Input;
const { Option } = Select;

const ProductList = () => {
  const { state, dispatch } = useProductContext();
  const [modalAddProduct, setModalAddProduct] = useState(false);
  const [modalUpdateProduct, setModalUpdateProduct] = useState(false);
  const [modalStockProduct, setModalStockProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState();
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [filteredInfo, setFilteredInfo] = useState({});
  const [sortedInfo, setSortedInfo] = useState({});
  const searchInput = useRef(null);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    const filterValue = selectedKeys[0];
    setFilteredInfo((prev) => ({
      ...prev,
      [dataIndex]: filterValue ? [filterValue] : null,
    }));
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`${dataIndex === "price" ? "Fiyat" : "Stok"} ara`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block", width: 188 }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Ara
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            Kapat
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />
    ),
    onFilter: (value, record) => {
      if (!value) return true;
      const recordValue = record[dataIndex];
      if (typeof recordValue === "number") {
        return recordValue.toString().includes(value);
      }
      return recordValue.toString().toLowerCase().includes(value.toLowerCase());
    },
    filteredValue: filteredInfo[dataIndex] || null,
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  const handleChange = (pagination, filters, sorter) => {
    setFilteredInfo(filters);
    setSortedInfo(sorter);
  };

  const clearFilters = () => {
    setFilteredInfo({});
    dispatch({
      type: "SET_FILTER",
      payload: {
        inStock: "all",
        searchQuery: "",
      },
    });
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
    dispatch({
      type: "SET_FILTER",
      payload: {
        inStock: "all",
        searchQuery: "",
      },
    });
  };

  const columns = [
    {
      title: "İsim",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === "name" ? sortedInfo.order : null,
    },
    {
      title: "Fiyat",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => a.price - b.price,
      sortOrder: sortedInfo.columnKey === "price" ? sortedInfo.order : null,
      ...getColumnSearchProps("price"),
    },
    {
      title: "Stok",
      dataIndex: "stock",
      key: "stock",
      sorter: (a, b) => a.stock - b.stock,
      sortOrder: sortedInfo.columnKey === "stock" ? sortedInfo.order : null,
      ...getColumnSearchProps("stock"),
    },

    {
      title: "Stok Durumu",
      dataIndex: "inStock",
      key: "inStock",
      filters: [
        { text: "Stokta Var", value: true },
        { text: "Stokta Yok", value: false },
      ],
      filteredValue: filteredInfo.inStock || null,
      onFilter: (value, record) => record.inStock === value,
      render: (text) => (text ? "Stokta Var" : "Stokta Yok"),
    },
    {
      title: "İşlemler",
      key: "action",
      render: (text, record) => (
        <span>
          <Button type="link" onClick={() => handleModalUpdateProduct(record)}>
            Düzenle
          </Button>
          <Button type="link" onClick={() => handleDelete(record.id)}>
            Sil
          </Button>
        </span>
      ),
    },
  ];

  const handleSearchGlobal = (value) => {
    dispatch({ type: "SET_FILTER", payload: { searchQuery: value } });
  };

  const handleStockFilter = (value) => {
    dispatch({ type: "SET_FILTER", payload: { inStock: value } });
  };

  const handleDelete = async (id) => {
    try {
      await deleteProduct(id);
      dispatch({ type: "DELETE_PRODUCT", payload: id });

      setSelectedProducts((prevSelected) =>
        prevSelected.filter((product) => product.id !== id)
      );
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const handleModalAddProduct = () => {
    setModalAddProduct((prev) => !prev);
  };
  const handleModalUpdateProduct = (product) => {
    setSelectedProduct(product);
    setModalUpdateProduct((prev) => !prev);
  };
  const handleModalStockProduct = () => {
    setModalStockProduct((prev) => !prev);
  };

  const filteredProducts = state.products
    .filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(state.filters.searchQuery.toLowerCase());
      const matchesStock =
        state.filters.inStock === "all" ||
        (state.filters.inStock === "inStock" && product.inStock) ||
        (state.filters.inStock === "outOfStock" && !product.inStock);
      return matchesSearch && matchesStock;
    })
    .map((product) => ({ ...product, key: product.id }));

  return (
    <div>
      <Space style={{ gap: 16, marginBottom: "20px" }}>
        <Search
          placeholder="Ürün Ara"
          onSearch={handleSearchGlobal}
          style={{ width: 200 }}
          value={state.filters.searchQuery}
          onChange={(e) =>
            dispatch({
              type: "SET_FILTER",
              payload: { searchQuery: e.target.value },
            })
          }
        />
        <Select
          defaultValue="all"
          style={{ width: 120 }}
          onChange={handleStockFilter}
        >
          <Option value="all">Hepsi</Option>
          <Option value="inStock">Stokta Var</Option>
          <Option value="outOfStock">Stokta yok</Option>
        </Select>
        <Button type="primary" onClick={handleModalAddProduct}>
          Ürün Ekle
        </Button>
        {selectedProducts.length > 1 && (
          <Button type="primary" onClick={handleModalStockProduct}>
            Update Stocks of Selected Products
          </Button>
        )}
        <Button onClick={clearFilters}>Filtreleri Temizle</Button>
        <Button onClick={clearAll}>Filtreleri ve Sıralamayı Temizle</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredProducts}
        onChange={handleChange}
        rowSelection={{
          type: "checkbox",
          onChange: (selectedRowKeys, selectedRows) => {
            setSelectedProducts(selectedRows);
          },
        }}
      />

      {modalAddProduct && (
        <ModalAddProduct handleModalAddProduct={handleModalAddProduct} />
      )}
      {modalUpdateProduct && (
        <ModalUpdateProduct
          handleModalUpdateProduct={handleModalUpdateProduct}
          selectedProduct={selectedProduct}
          setSelectedProducts={setSelectedProducts}
        />
      )}
      {modalStockProduct && (
        <ModalStockProduct
          handleModalStockProduct={handleModalStockProduct}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
        />
      )}
    </div>
  );
};

export default ProductList;
