import { Button, Input } from "antd";
import Modal from "antd/es/modal/Modal";
import { ErrorMessage, Form, Field, Formik } from "formik";
import * as Yup from "yup";
import { addProduct } from "../../../services/productService";
import { useProductContext } from "../../../context/ProductContext";

const ModalAddProduct = ({ handleModalAddProduct }) => {
  const { state, dispatch } = useProductContext();

  const validationSchema = Yup.object({
    name: Yup.string()
      .required("Ürün adı zorunludur!")
      .test("is-product-unique", "Bu isimde bir ürün zaten var!", (value) => {
        return !state.products.some(
          (product) => product.name.toLowerCase() === value.toLowerCase()
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

      const newProduct = await addProduct(productData);
      dispatch({ type: "ADD_PRODUCT", payload: newProduct });
      handleModalAddProduct();
    } catch (error) {
      console.error("Ürün kaydedilirken hata oluştu:", error);
    }
  };

  return (
    <Modal
      title="Ürün Ekleme Formu"
      open={true}
      onCancel={handleModalAddProduct}
      footer={null}
    >
      <Formik
        initialValues={{ name: "", price: 0, stock: 0 }}
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
              Ürün Ekle
            </Button>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ModalAddProduct;
