import { Button, Input } from "antd";
import Modal from "antd/es/modal/Modal";
import { ErrorMessage, Form, Field, Formik } from "formik";
import { useProductContext } from "../../../context/ProductContext";
import * as Yup from "yup";
import { updateProduct } from "../../../services/productService";

const ModalUpdateProduct = ({
  handleModalUpdateProduct,
  selectedProduct,
  setSelectedProducts,
}) => {
  const { state, dispatch } = useProductContext();

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Ürün adı zorunludur!")
      .test("is-product-unique", "Bu isimde bir ürün zaten var!", (value) => {
        return !state.products.some(
          (product) =>
            product.name.toLowerCase() === value.toLowerCase() &&
            product.id !== selectedProduct.id
        );
      }),
    price: Yup.number()
      .required("Fiyat zorunludur!")
      .positive("Fiyat pozitif olmalıdır!"),
    stock: Yup.number()
      .required("Stok zorunludur!")
      .integer("Stok tam sayı olmalıdır!")
      .min(0, "Stok negatif olamaz!"),
  });

  const handleSubmit = async (values) => {
    try {
      const productData = {
        ...values,
        inStock: values.stock > 0,
      };

      const updatedProduct = await updateProduct(
        selectedProduct.id,
        productData
      );
      dispatch({ type: "UPDATE_PRODUCT", payload: updatedProduct });

      setSelectedProducts((prevSelected) =>
        prevSelected.map((product) =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );

      handleModalUpdateProduct();
    } catch (error) {
      console.error("Ürün kaydedilirken hata oluştu:", error);
    }
  };
  return (
    <Modal
      title="Ürün Güncelleme Formu"
      open={true}
      onCancel={handleModalUpdateProduct}
      footer={null}
    >
      <Formik
        initialValues={{
          name: selectedProduct.name,
          price: selectedProduct.price,
          stock: selectedProduct.stock,
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          handleSubmit(values);
        }}
        enableReinitialize={true}
      >
        {() => (
          <Form
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "5px",
            }}
          >
            <label>Ürün Adı Giriniz : </label>
            <Field name="name" as={Input} placeholder="Ürün Adı" />
            <ErrorMessage
              name="name"
              component="div"
              className="error-message"
            />

            <label>Ürün Fiyatı Giriniz : </label>
            <Field name="price" as={Input} type="number" placeholder="Fiyat" />
            <ErrorMessage
              name="price"
              component="div"
              className="error-message"
            />

            <label>Ürün Stock Adedi Giriniz : </label>
            <Field name="stock" as={Input} type="number" placeholder="Stok" />
            <ErrorMessage
              name="stock"
              component="div"
              className="error-message"
            />

            <Button type="primary" htmlType="submit">
              Ürün Güncelle
            </Button>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ModalUpdateProduct;
