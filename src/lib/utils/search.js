// Shared product search matching used by the navbar quick-search and the shop page.
// Builds one lowercase blob per product from every field a customer is likely to
// search by, then requires each whitespace-separated query token to appear
// somewhere in it (so word order / which field doesn't matter).
function productSearchText(product) {
  const benefits = Array.isArray(product.benefits)
    ? product.benefits.join(" ")
    : product.benefits;

  return [
    product.name,
    product.subtitle,
    product.category,
    product.type,
    product.description,
    product.details,
    benefits,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function matchesSearchQuery(product, query) {
  const q = query?.trim().toLowerCase();
  if (!q) return true;

  const tokens = q.split(/\s+/).filter(Boolean);
  const text = productSearchText(product);
  return tokens.every((token) => text.includes(token));
}

export function searchProducts(products, query) {
  return products.filter((p) => matchesSearchQuery(p, query));
}
