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
export const getProducts = async (filters = {}) => {
  if (!db) return { products: [], error: "Not available server-side" };
  try {
    const productsCollection = collection(db, "products");
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
  if (!db) return { product: null, error: "Not available server-side" };
  try {
    const productsCollection = collection(db, "products");
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

export const createOrder = async (orderData) => {
  if (!db) return { id: null, error: "Not available server-side" };
  try {
    const ordersCollection = collection(db, "orders");
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

// User profiles
export const getUserProfile = async (uid) => {
  if (!db) return { profile: null, error: "Not available server-side" };
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return { profile: null, error: null };
    return { profile: snap.data(), error: null };
  } catch (error) {
    return { profile: null, error: error.message };
  }
};

export const saveUserProfile = async (uid, data) => {
  if (!db) return { success: false, error: "Not available server-side" };
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { ...data, updatedAt: Timestamp.now() }).catch(async () => {
      // doc doesn't exist yet — create it
      const { setDoc } = await import("firebase/firestore");
      await setDoc(userRef, { ...data, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserOrders = async (userId) => {
  if (!db) return { orders: [], error: "Not available server-side" };
  try {
    const ordersCollection = collection(db, "orders");
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
