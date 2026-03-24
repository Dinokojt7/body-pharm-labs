import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";

/**
 * Upload a product image file to Firebase Storage.
 * Returns the public download URL.
 */
export const uploadProductImage = async (file, productId) => {
  if (!storage) return { url: null, error: "Storage not available" };
  try {
    const ext = file.name.split(".").pop().toLowerCase();
    const path = `products/${productId}-${Date.now()}.${ext}`;
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return { url, error: null };
  } catch (error) {
    return { url: null, error: error.message };
  }
};

/**
 * Delete an image from Firebase Storage by its full download URL.
 * Silently ignores errors (e.g. file already deleted).
 */
export const deleteProductImage = async (downloadUrl) => {
  if (!storage || !downloadUrl) return;
  try {
    // Extract the path from the URL
    const url = new URL(downloadUrl);
    const pathEncoded = url.pathname.split("/o/")[1]?.split("?")[0];
    if (!pathEncoded) return;
    const path = decodeURIComponent(pathEncoded);
    await deleteObject(ref(storage, path));
  } catch {
    // ignore — file may not exist
  }
};
