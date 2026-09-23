import { auth } from "../firebase/config";

// Every real Firebase Auth account, not just ones with a Firestore
// `users/{uid}` profile doc — see admin/users/list/route.js for why the
// two aren't the same thing.
export const getAllRegisteredUsers = async () => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return { success: false, error: "Not authenticated" };

    const res = await fetch("/api/admin/users/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const sendCampaignEmail = async ({ subject, message, recipients, images = [] }) => {
  try {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) return { success: false, error: "Not authenticated" };

    const res = await fetch("/api/admin/campaigns/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, subject, message, recipients, images }),
    });
    return await res.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
