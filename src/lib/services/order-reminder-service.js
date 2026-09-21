import { auth } from "../firebase/config";

export const sendAbandonedOrderReminders = async (orderIds, note = "") => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return { success: false, error: "Not authenticated" };

    const res = await fetch("/api/admin/orders/send-reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, orderIds, note }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
