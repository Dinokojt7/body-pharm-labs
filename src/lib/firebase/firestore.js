import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy,
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

// Create user document on first sign-in (uses uid as doc ID)
export const createUserDoc = async (uid, data) => {
  if (!db) return { success: false, error: "Not available server-side" };
  try {
    const { setDoc } = await import("firebase/firestore");
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) return { success: true, error: null }; // already created
    await setDoc(userRef, {
      uid,
      ...data,
      createdAt: Timestamp.now(),
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

export const updateOrderPayment = async (orderId, { status, paystackReference, paidAt }) => {
  if (!db) return { success: false, error: "Not available server-side" };
  try {
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) return { success: false, error: "Order not found" };

    const current = orderSnap.data();
    const statusHistory = [
      ...(current.statusHistory || []),
      { status, timestamp: Timestamp.now(), note: status === "paid" ? "Payment confirmed" : "Payment failed" },
    ];

    await updateDoc(orderRef, {
      status,
      statusHistory,
      ...(paystackReference && { paystackReference }),
      ...(paidAt && { paidAt }),
      updatedAt: Timestamp.now(),
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getOrderByNumber = async (orderNumber, email) => {
  if (!db) return { order: null, error: "Not available server-side" };
  try {
    const q = query(
      collection(db, "orders"),
      where("orderNumber", "==", orderNumber.toUpperCase().trim()),
      where("customer.email", "==", email.toLowerCase().trim()),
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return { order: null, error: null };
    const d = snapshot.docs[0];
    return { order: { id: d.id, ...d.data() }, error: null };
  } catch (error) {
    return { order: null, error: error.message };
  }
};

export const getOrderById = async (orderId) => {
  if (!db) return { order: null, error: "Not available server-side" };
  try {
    const snap = await getDoc(doc(db, "orders", orderId));
    if (!snap.exists()) return { order: null, error: null };
    return { order: { id: snap.id, ...snap.data() }, error: null };
  } catch (error) {
    return { order: null, error: error.message };
  }
};

export const deleteOrder = async (orderId) => {
  if (!db) return { success: false, error: "Not available server-side" };
  try {
    const { deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, "orders", orderId));
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserOrders = async (userId) => {
  if (!db) return { orders: [], error: "Not available server-side" };
  try {
    const ordersCollection = collection(db, "orders");
    // No orderBy here — avoids requiring a composite Firestore index.
    // Sort client-side instead.
    const q = query(ordersCollection, where("userId", "==", userId));

    const snapshot = await getDocs(q);
    const orders = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => {
        const aMs = a.createdAt?.toMillis?.() ?? new Date(a.createdAt ?? 0).getTime();
        const bMs = b.createdAt?.toMillis?.() ?? new Date(b.createdAt ?? 0).getTime();
        return bMs - aMs;
      });

    return { orders, error: null };
  } catch (error) {
    return { orders: [], error: error.message };
  }
};

// ─── Realtime subscriptions ────────────────────────────────────────────────

// Subscribe to all orders for a user. Returns an unsubscribe function.
// callback receives { orders, error }
export const subscribeToUserOrders = (userId, callback) => {
  if (!db) {
    callback({ orders: [], error: "Firestore not available" });
    return () => {};
  }
  const q = query(collection(db, "orders"), where("userId", "==", userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => {
          const aMs = a.createdAt?.toMillis?.() ?? new Date(a.createdAt ?? 0).getTime();
          const bMs = b.createdAt?.toMillis?.() ?? new Date(b.createdAt ?? 0).getTime();
          return bMs - aMs;
        });
      callback({ orders, error: null });
    },
    (error) => callback({ orders: [], error: error.message })
  );
};

// Subscribe to a single order document by Firestore doc ID.
// callback receives { order, error }
export const subscribeToOrder = (orderId, callback) => {
  if (!db) {
    callback({ order: null, error: "Firestore not available" });
    return () => {};
  }
  return onSnapshot(
    doc(db, "orders", orderId),
    (snap) => {
      if (snap.exists()) {
        callback({ order: { id: snap.id, ...snap.data() }, error: null });
      } else {
        callback({ order: null, error: null });
      }
    },
    (error) => callback({ order: null, error: error.message })
  );
};
