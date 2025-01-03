import { Button, Input, Radio } from "antd";
import Modal from "antd/es/modal/Modal";
import { ErrorMessage, Form, Field, Formik } from "formik";
import * as Yup from "yup";
import { useProductContext } from "../../../context/ProductContext";
import { updateProduct } from "../../../services/productService";
import { Alert } from "antd";
import { useState } from "react";

const ModalStockProduct = ({
  handleModalStockProduct,
  selectedProducts,
  setSelectedProducts,
}) => {
  const { state, dispatch } = useProductContext();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [operationType, setOperationType] = useState("add");

  const validationSchema = Yup.object({
    stock: Yup.number()
      .required("Stok zorunludur!")
      .integer("Stok tam sayı olmalıdır!")
      .min(0, "Stok negatif olamaz!"),
  });

  const handleSubmit = async (values) => {
    const { stock } = values;
    const updatedProducts = selectedProducts.map((product) => {
      let newStock;
      if (operationType === "add") {
        newStock = product.stock + stock;
      } else if (operationType === "subtract") {
        newStock = product.stock - stock;
      }
      if (newStock < 0) {
        setAlertMessage(`Ürün "${product.name}" için yeterli stok yok!`);
        setShowAlert(true);
        return null;
      }

      return {
        ...product,
        stock: newStock,
        inStock: newStock > 0,
      };
    });

    if (updatedProducts.some((product) => product === null)) {
      return;
    }

    updatedProducts.forEach(async (updateProductData) => {
      const updatedProduct = await updateProduct(
        updateProductData.id,
        updateProductData
      );
      dispatch({ type: "UPDATE_PRODUCT", payload: updatedProduct });

      state.products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      );
      setSelectedProducts((prevSelected) =>
        prevSelected.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
    });

    handleModalStockProduct();
  };

  return (
    <Modal
      title="Toplu Stock İşlemi"
      open={true}
      onCancel={handleModalStockProduct}
      footer={null}
    >
      {showAlert && (
        <Alert
          message="Hatalı İşlem!"
          description={alertMessage}
          type="error"
          closable
          onClose={() => setShowAlert(false)}
        />
      )}
      <Formik
        initialValues={{ stock: 0 }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {() => (
          <Form>
            <div style={{ marginBottom: "16px" }}>
              <label>İşlem Türü: </label>
              <Radio.Group
                value={operationType}
                onChange={(e) => setOperationType(e.target.value)}
              >
                <Radio value="add">Stok Ekle</Radio>
                <Radio value="subtract">Stok Çıkar</Radio>
              </Radio.Group>
            </div>

            <label>
              {operationType === "add"
                ? "Eklemek İstediğiniz Stok Adedini Giriniz: "
                : "Çıkarmak İstediğiniz Stok Adedini Giriniz: "}
            </label>
            <Field name="stock" as={Input} type="number" placeholder="Stok" />
            <ErrorMessage
              name="stock"
              component="div"
              className="error-message"
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Button type="primary" htmlType="submit">
                {operationType === "add" ? "Stok Ekle" : "Stok Çıkar"}
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ModalStockProduct;
