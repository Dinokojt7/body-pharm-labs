import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

// Products
export const productsCollection = collection(db, "products");

export const getProducts = async (filters = {}) => {
  try {
    let q = query(productsCollection, orderBy("featured", "desc"));

    if (filters.category) {
      q = query(q, where("category", "==", filters.category));
    }

    if (filters.featured) {
      q = query(q, where("featured", "==", true));
    }

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { products, error: null };
  } catch (error) {
    return { products: [], error: error.message };
  }
};

export const getProductBySlug = async (slug) => {
  try {
    const q = query(productsCollection, where("slug", "==", slug));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { product: null, error: "Product not found" };
    }

    const doc = snapshot.docs[0];
    const product = { id: doc.id, ...doc.data() };

    return { product, error: null };
  } catch (error) {
    return { product: null, error: error.message };
  }
};

// Orders
export const ordersCollection = collection(db, "orders");

export const createOrder = async (orderData) => {
  try {
    const order = {
      ...orderData,
      createdAt: Timestamp.now(),
      status: "pending",
      statusHistory: [
        {
          status: "pending",
          timestamp: Timestamp.now(),
          note: "Order received",
        },
      ],
    };

    const docRef = await addDoc(ordersCollection, order);
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const updateOrderStatus = async (orderId, status, note = "") => {
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return { success: false, error: "Order not found" };
    }

    const currentData = orderSnap.data();
    const statusHistory = [
      ...(currentData.statusHistory || []),
      {
        status,
        timestamp: Timestamp.now(),
        note,
      },
    ];

    await updateDoc(orderRef, {
      status,
      statusHistory,
      updatedAt: Timestamp.now(),
    });

    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserOrders = async (userId) => {
  try {
    const q = query(
      ordersCollection,
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { orders, error: null };
  } catch (error) {
    return { orders: [], error: error.message };
  }
};
