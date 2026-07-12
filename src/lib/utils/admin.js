// Supports a comma-separated NEXT_PUBLIC_ADMIN_UIDS env var for multiple admins,
// falling back to the legacy single-UID NEXT_PUBLIC_ADMIN_UID.
const ADMIN_UIDS = [
  ...(process.env.NEXT_PUBLIC_ADMIN_UIDS || "").split(","),
  process.env.NEXT_PUBLIC_ADMIN_UID,
  process.env.NEXT_PUBLIC_CO_ADMIN_UID,
].map((s) => (s || "").trim()).filter(Boolean);

export const isAdmin = (uid) => !!uid && ADMIN_UIDS.includes(uid);
