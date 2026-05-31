import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where,
  deleteDoc
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { User, Product, Order, OrderStatus } from "../types";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

// Hardened error handler complying with Zero-Trust compliance specifications
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore DB Error boundary caught:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ================= USERS SERVICE =================

export const getUserDoc = async (uid: string): Promise<User | null> => {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, "users", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const saveUserDoc = async (user: User): Promise<void> => {
  const path = `users/${user.uid}`;
  try {
    const docRef = doc(db, "users", user.uid);
    await setDoc(docRef, user);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

// ================= PRODUCTS SERVICE =================

export const getProductsDocList = async (): Promise<Product[]> => {
  const path = "products";
  try {
    const snap = await getDocs(collection(db, "products"));
    const list: Product[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Product);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const saveProductDoc = async (product: Product): Promise<void> => {
  const path = `products/${product.id}`;
  try {
    const docRef = doc(db, "products", product.id);
    await setDoc(docRef, product);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateProductStockDoc = async (productId: string, stock: number, isAvailable: boolean): Promise<void> => {
  const path = `products/${productId}`;
  try {
    const docRef = doc(db, "products", productId);
    await updateDoc(docRef, { stock, isAvailable });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// ================= ORDERS SERVICE =================

export const saveOrderDoc = async (order: Order): Promise<void> => {
  const path = `orders/${order.id}`;
  try {
    const docRef = doc(db, "orders", order.id);
    await setDoc(docRef, order);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getOrdersDocList = async (): Promise<Order[]> => {
  const path = "orders";
  try {
    const snap = await getDocs(collection(db, "orders"));
    const list: Order[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Order);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const updateOrderStatusDocObj = async (orderId: string, status: OrderStatus, orderStatus?: string): Promise<void> => {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, "orders", orderId);
    const updatePayload: any = { status };
    if (orderStatus) {
      updatePayload.order_status = orderStatus;
    }
    await updateDoc(docRef, updatePayload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const assignOrderRiderDocObj = async (orderId: string, riderId?: string, riderName?: string): Promise<void> => {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, "orders", orderId);
    await updateDoc(docRef, {
      deliveryBoyId: riderId || null,
      assignedRiderName: riderName || null,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

// ================= DELIVERY PARTNERS (RIDER) SERVICE =================

export interface RiderPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  status: "active" | "inactive";
  avatar: string;
}

export const getDeliveryPartnersDocList = async (): Promise<RiderPartner[]> => {
  const path = "deliveryPartners";
  try {
    const snap = await getDocs(collection(db, "deliveryPartners"));
    const list: RiderPartner[] = [];
    snap.forEach((d) => {
      list.push(d.data() as RiderPartner);
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
};

export const saveDeliveryPartnerDoc = async (partner: RiderPartner): Promise<void> => {
  const path = `deliveryPartners/${partner.id}`;
  try {
    const docRef = doc(db, "deliveryPartners", partner.id);
    await setDoc(docRef, partner);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const updateDeliveryPartnerStatusDoc = async (partnerId: string, status: "active" | "inactive"): Promise<void> => {
  const path = `deliveryPartners/${partnerId}`;
  try {
    const docRef = doc(db, "deliveryPartners", partnerId);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteProductDocObj = async (id: string): Promise<void> => {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, "products", id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};
