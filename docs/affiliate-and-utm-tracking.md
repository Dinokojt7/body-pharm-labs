# Affiliate Tracking & UTM Attribution — How It Works


## 1. Admin side

1. Create a % discount code as usual on `/admin/dashboard/discounts` (unchanged from before).
2. Go to `/admin/dashboard/affiliates` → **New Affiliate** → enter name, email, and pick one of the existing discount codes (codes already linked to another affiliate are filtered out of the picker).
3. On submit, the server (`/api/admin/affiliates/create`) verifies you're really an admin, checks the code exists and isn't already claimed, creates a real Firebase Auth login for the affiliate (no password set), writes an `affiliates/{uid}` Firestore doc (`name`, `email`, `discountCode`, `active`, `createdAt`), generates a password-set link, and emails it to the affiliate.
4. If the email can't be sent (e.g. SMTP not configured), the admin UI shows the raw set-password link directly so you can send it manually.
5. `name` can be edited later; `email` and `discountCode` **cannot** — to relink an affiliate to a different code, delete and re-create them (this is deliberate, since changing the code would silently orphan their historical stats).
6. The **Active** toggle only affects the affiliate's own login/dashboard access — it does **not** touch the underlying discount code. If you want the code itself to stop giving customers a discount, deactivate it separately on the Discounts page.
7. **Delete** removes both the Firestore doc and the actual Firebase Auth login in one action — the affiliate is locked out immediately, not just hidden.
8. Each affiliate's row shows live stats: count of **paid** orders and total revenue where `order.discountCode` matches their code. The `/admin/dashboard` tile shows a live affiliate count.
9. `/admin/dashboard/marketing` shows a separate, code-independent view: all paid orders grouped by `utm_source`/`campaign` (with a date filter), for tracking ad/social campaigns regardless of whether a discount code was used.

## 2. Affiliate side

1. Affiliate receives the invite email → clicks the set-password link (Firebase-hosted page) → sets a password → lands back on `/affiliate/login`.
2. Logs in with email + password at `/affiliate/login`.
3. The app looks up `affiliates/{their uid}`. If the doc doesn't exist or `active` is `false`, they're signed out immediately with "Access denied."
4. If active, they land on `/affiliate/dashboard`, showing **only their own numbers**: their name, their code, count of paid orders, and total revenue (ZAR) for orders where `discountCode` matches theirs.
5. The order list below shows order number, date, amount, and payment status only — **no customer name, email, or address** is ever shown to an affiliate.
6. "Forgot password?" on the login page lets them self-serve a reset at any time afterward — they don't need to ask the admin again.
7. If the admin deactivates or deletes them, the very next login attempt or dashboard refresh is denied at the Firestore rules level — access is cut off immediately, not eventually.

## 3. Customer side (with or without an affiliate's code)

1. If a customer arrives via a link containing `?utm_source=...&utm_medium=...&utm_campaign=...` (etc.), those values are captured into their browser's local storage the first time — **first-touch only**, never overwritten by a later visit or a later direct/organic visit in the same browser.
2. At checkout, the customer can optionally enter a discount code in the promo field. **There is no distinction, from the customer's perspective or the checkout system's behavior, between a plain promo code and one linked to an affiliate** — same validation, same discount, same UI. The customer never sees or needs to know an affiliate is involved.
3. On successful payment, the order is marked `paid` and the discount's usage counter increments — unchanged from before.
4. The order permanently stores two independent things: the `discountCode` used (if any) and the captured `utm` data (if any, from step 1). Neither affects pricing or the checkout flow — they're attribution data only, read later by the reporting pages.
5. Afterward:
   - If the code used is linked to an affiliate, that order now counts toward that affiliate's dashboard stats and the admin's per-affiliate stats.
   - If the code isn't linked to any affiliate (a normal promo code, or no code at all), it simply doesn't show up in any affiliate's numbers.
   - Regardless of code, the order also rolls into the Marketing report, bucketed by its captured `utm_source` — or under **"Direct/Unknown"** if no UTM data was ever captured for that customer (including all orders placed before this feature existed).
