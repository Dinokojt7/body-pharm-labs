"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";

import { useCartStore } from "@/lib/stores/cart-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { processOrder, generateOrderNumber } from "@/lib/services/order-service";
import { getUserProfile } from "@/lib/firebase/firestore";
import productsData from "@/lib/data/products.json";

// Lookup map so we can always resolve images even if missing from the cart item
const productImageMap = Object.fromEntries(
  productsData.map((p) => [p.id, p.imageString || null])
);

const REQUIRED_FIELDS = ["email", "firstName", "lastName", "phone", "address", "city", "postalCode", "country"];

const CheckoutForm = ({
  subtotal,
  tax,
  shippingCost,
  total,
  memberDiscount = 0,
  loading,
  setLoading,
}) => {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { selectedCurrency, formatPrice } = useCurrency();

  const [isMounted, setIsMounted] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "South Africa",
    phone: "",
    notes: "",
  });

  // Mount + pre-fill from user profile
  useEffect(() => {
    setIsMounted(true);
    if (!user?.uid) return;

    // Pre-fill email from auth
    setFormData((prev) => ({ ...prev, email: user.email || "" }));

    // Pre-fill rest from saved Firestore profile
    getUserProfile(user.uid).then(({ profile: p }) => {
      if (!p) return;
      const nameParts = (p.displayName || "").split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      setFormData((prev) => ({
        ...prev,
        firstName: firstName || prev.firstName,
        lastName: lastName || prev.lastName,
        phone: p.phone || prev.phone,
        address: p.address?.line1 || prev.address,
        city: p.address?.city || prev.city,
        postalCode: p.address?.zip || prev.postalCode,
        country: p.address?.country || prev.country,
      }));
    });
  }, [user?.uid, user?.email]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationError) setValidationError("");
  };

  const validateForm = () => {
    for (const field of REQUIRED_FIELDS) {
      if (!formData[field]?.trim()) {
        const labels = {
          email: "Email", firstName: "First name", lastName: "Last name",
          phone: "Phone number", address: "Street address",
          city: "City", postalCode: "Postal code", country: "Country",
        };
        return `${labels[field]} is required before proceeding to payment.`;
      }
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(formData.email)) return "Please enter a valid email address.";
    return null;
  };

  const handlePaystackPayment = async () => {
    if (!isMounted) return;

    const error = validateForm();
    if (error) {
      setValidationError(error);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setValidationError("");

    const orderNumber = generateOrderNumber();
    const reference = `${orderNumber}-${Date.now()}`;

    const orderData = {
      orderNumber,
      customer: {
        email: formData.email.toLowerCase().trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
      },
      shippingAddress: {
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country,
      },
      items: items.map((item) => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.selectedSize || null,
        image: item.image || productImageMap[item.id] || null,
      })),
      subtotal,
      tax,
      shipping: shippingCost,
      memberDiscount,
      total,
      currency: selectedCurrency,
      notes: formData.notes.trim(),
      userId: user?.uid || null,
      status: "pending_payment",
      paystackReference: null,
      paidAt: null,
    };

    try {
      const result = await processOrder(orderData);
      if (!result.success) throw new Error(result.error);
      const orderId = result.orderId;

      const res = await fetch("/api/paystack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          email: formData.email.toLowerCase().trim(),
          currency: selectedCurrency,
          reference,
          metadata: {
            orderId,
            orderNumber,
            customerName: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          },
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Payment initialization failed");

      // Redirect to Paystack hosted checkout — callback_url handles the rest
      window.location.href = data.authorization_url;
    } catch (err) {
      console.error("Checkout error:", err);
      setValidationError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handlePaystackPayment();
  };

  if (!isMounted) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded focus:border-black focus:outline-none text-sm transition-colors";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Validation banner */}
      {validationError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{validationError}</p>
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-white rounded p-6 border border-gray-200">
        <h3 className="text-sm font-bold tracking-widest uppercase mb-5">Contact Information</h3>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Email <span className="text-red-400">*</span></label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="First name"
              />
            </div>
            <div>
              <label className={labelClass}>Last Name <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Last name"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Phone <span className="text-red-400">*</span></label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="+27 82 000 0000"
            />
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded p-6 border border-gray-200">
        <h3 className="text-sm font-bold tracking-widest uppercase mb-5">Shipping Address</h3>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Street Address <span className="text-red-400">*</span></label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={inputClass}
              placeholder="123 Main Street"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>City <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Cape Town"
              />
            </div>
            <div>
              <label className={labelClass}>Postal Code <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="8001"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Country <span className="text-red-400">*</span></label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className={inputClass}
            >
              <option value="South Africa">South Africa</option>
              <option value="United States">United States</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Netherlands">Netherlands</option>
            </select>
          </div>
        </div>
      </div>

      {/* Order Notes */}
      <div className="bg-white rounded p-6 border border-gray-200">
        <h3 className="text-sm font-bold tracking-widest uppercase mb-5">Order Notes <span className="text-gray-400 font-normal normal-case">(optional)</span></h3>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          placeholder="Any special instructions?"
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-4 rounded text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing…
          </>
        ) : (
          `Pay ${formatPrice(total)}`
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        All fields marked <span className="text-red-400">*</span> are required before payment.
      </p>
    </form>
  );
};

export default CheckoutForm;
