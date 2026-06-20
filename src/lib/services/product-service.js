import { getProducts, getProductBySlug } from "../firebase/firestore";

export const fetchProducts = async (filters = {}) => {
  try {
    const { products, error } = await getProducts(filters);
    if (error) return { products: [], source: "firebase" };
    return { products, source: "firebase" };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: [], source: "firebase" };
  }
};

export const fetchProductBySlug = async (slug) => {
  try {
    const { product, error } = await getProductBySlug(slug);
    if (error || !product) return { product: null, source: "firebase" };
    return { product, source: "firebase" };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { product: null, source: "firebase" };
  }
};

export const getRelatedProducts = async (product, limit = 4) => {
  const { products } = await fetchProducts();

  // Filter by same category, exclude current product
  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, limit);

  return related;
};
