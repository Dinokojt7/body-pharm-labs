/**
 * Product image storage — backed by Cloudflare R2.
 * Upload/delete go through API routes so credentials stay server-side.
 */

export const uploadProductImage = async (file, productId) => {
  try {
    const ext = file.name.split(".").pop().toLowerCase();
    const key = `products/${productId}-${Date.now()}.${ext}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", key);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

    const { url, error } = await res.json();
    if (error) throw new Error(error);
    return { url, error: null };
  } catch (err) {
    return { url: null, error: err.message };
  }
};

export const deleteProductImage = async (downloadUrl) => {
  if (!downloadUrl) return;
  try {
    await fetch("/api/delete-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: downloadUrl }),
    });
  } catch {
    // non-fatal
  }
};
