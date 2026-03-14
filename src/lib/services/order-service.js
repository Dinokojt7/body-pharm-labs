import { createOrder, updateOrderStatus } from "../firebase/firestore";
import { useCartStore } from "../stores/cart-store";

export const processOrder = async (orderData) => {
  try {
    // Create order in Firebase
    const { id, error } = await createOrder(orderData);

    if (error) {
      throw new Error(error);
    }

    // Clear cart after successful order
    useCartStore.getState().clearCart();

    return {
      success: true,
      orderId: id,
      message: "Order created successfully",
    };
  } catch (error) {
    console.error("Order processing error:", error);
    return {
      success: false,
      error: error.message || "Failed to process order",
    };
  }
};

export const calculateOrderTotals = (items, shippingCost = 0) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.15; // 15% VAT (South Africa)
  const total = subtotal + tax + shippingCost;

  return {
    subtotal,
    tax,
    shipping: shippingCost,
    total,
  };
};

export const validateOrder = (orderData) => {
  const errors = [];

  if (!orderData.items || orderData.items.length === 0) {
    errors.push("Cart is empty");
  }

  if (!orderData.customer.email) {
    errors.push("Customer email is required");
  }

  if (!orderData.shippingAddress) {
    errors.push("Shipping address is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
