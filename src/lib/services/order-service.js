export const generateOrderNumber = () => {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const l1 = letters[Math.floor(Math.random() * letters.length)];
  const l2 = letters[Math.floor(Math.random() * letters.length)];
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `${l1}${l2}${digits}`;
};

export const processOrder = async (orderData) => {
  if (typeof window === "undefined") {
    throw new Error("processOrder can only be called on the client");
  }

  try {
    const { createOrder } = await import("../firebase/firestore");
    const { id, error } = await createOrder(orderData);

    if (error) throw new Error(error);

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

export const updateOrderStatusService = async (orderId, status, note = "") => {
  try {
    const { updateOrderStatus } = await import("../firebase/firestore");
    return await updateOrderStatus(orderId, status, note);
  } catch (error) {
    console.error("Error updating order status:", error);
    return { success: false, error: error.message };
  }
};

export const calculateOrderTotals = (items, shippingCost = 0) => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.15;
  const total = subtotal + tax + shippingCost;
  return { subtotal, tax, shipping: shippingCost, total };
};

export const validateOrder = (orderData) => {
  const errors = [];
  if (!orderData.items || orderData.items.length === 0)
    errors.push("Cart is empty");
  if (!orderData.customer.email) errors.push("Customer email is required");
  if (!orderData.shippingAddress) errors.push("Shipping address is required");
  return { isValid: errors.length === 0, errors };
};
