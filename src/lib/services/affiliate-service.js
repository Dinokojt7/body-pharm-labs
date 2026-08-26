import { auth } from "../firebase/config";

export const createAffiliate = async ({ name, email, discountCode }) => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return { success: false, error: "Not authenticated" };

    const res = await fetch("/api/admin/affiliates/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, name, email, discountCode }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteAffiliate = async (uid) => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return { success: false, error: "Not authenticated" };

    const res = await fetch("/api/admin/affiliates/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, uid }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
