import { auth } from "../firebase/config";

export const sendCampaignEmail = async ({ subject, message, recipients }) => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return { success: false, error: "Not authenticated" };

    const res = await fetch("/api/admin/campaigns/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, subject, message, recipients }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
