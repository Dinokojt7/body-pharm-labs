import { getProducts, getProductBySlug } from "../firebase/firestore";
import localProducts from "../data/products.json";

export const fetchProducts = async (filters = {}) => {
  try {
    // Try Firebase first
    const { products, error } = await getProducts(filters);

    if (!error && products.length > 0) {
      return { products, source: "firebase" };
    }

    // Fallback to local data
    let filteredProducts = [...localProducts];

    if (filters.category) {
      filteredProducts = filteredProducts.filter(
        (p) => p.category === filters.category,
      );
    }

    if (filters.featured) {
      filteredProducts = filteredProducts.filter((p) => p.featured === true);
    }

    return { products: filteredProducts, source: "local" };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { products: localProducts, source: "local" };
  }
};

export const fetchProductBySlug = async (slug) => {
  try {
    // Try Firebase first
    const { product, error } = await getProductBySlug(slug);

    if (!error && product) {
      return { product, source: "firebase" };
    }

    // Fallback to local data
    const localProduct = localProducts.find(
      (p) => p.name.toLowerCase().replace(/\s+/g, "-") === slug,
    );

    if (localProduct) {
      return { product: localProduct, source: "local" };
    }

    return { product: null, source: "local" };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { product: null, source: "local" };
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
