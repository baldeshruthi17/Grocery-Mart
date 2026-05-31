import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, Order, User, Admin, OrderStatus, Address } from '../types';
import { initialProducts } from '../data/dummyData';
import { geocodeAddress } from '../lib/geo';
import { 
  getUserDoc, 
  saveUserDoc, 
  getProductsDocList, 
  saveProductDoc, 
  updateProductStockDoc, 
  saveOrderDoc, 
  getOrdersDocList, 
  updateOrderStatusDocObj, 
  assignOrderRiderDocObj,
  deleteProductDocObj
} from '../services/dbService';

export const getShopDetails = (productCategory: string) => {
  const cat = (productCategory || '').toLowerCase();
  if (cat === 'dairy') {
    return { shopId: 'shop-dairy', shopName: 'Krishna Dairy' };
  } else if (cat === 'vegetables' || cat === 'fruits') {
    return { shopId: 'shop-fresh', shopName: 'Jangaon Fresh Mart' };
  } else if (cat === 'snacks' || cat === 'beverages') {
    return { shopId: 'shop-superstore', shopName: 'Blinkit Superstore' };
  } else {
    return { shopId: 'shop-kirana', shopName: 'Sri Balaji Kirana' };
  }
};

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface StateContextType {
  // Routing
  currentPath: string;
  navigate: (path: string) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;

  // Catalog
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, newStock: number) => void;

  // Shopping Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  deliveryFee: number;
  cartTotal: number;

  // Authentication & Users
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loginUser: (email: string, phone: string) => Promise<User>;
  registerUser: (name: string, email: string, phone: string, address: string) => Promise<User>;
  logoutUser: () => void;
  addAddress: (fullAddress: string, landmark?: string) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // Admin Session
  currentAdmin: Admin | null;
  adminLogin: (email: string, password: string) => Promise<Admin>;
  adminLogout: () => void;

  // Orders Management
  orders: Order[];
  placeOrder: (
    customerName: string,
    phone: string,
    fullAddress: string,
    landmark: string,
    deliverySlot: string,
    notes?: string,
    paymentMethod?: 'COD' | 'ONLINE',
    payment_status?: 'PENDING' | 'PAID',
    transaction_id?: string,
    razorpay_order_id?: string,
    razorpay_payment_id?: string,
    discountAmount?: number,
    overallDeliveryFee?: number
  ) => Promise<Order[]>;
  confirmStoredOrdersPayment: (
    orderIds: string[],
    transactionId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string
  ) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignDeliveryBoy: (orderId: string, riderId?: string, riderName?: string) => void;
  reorder: (order: Order) => void;

  // Toasts
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
}

const StateContext = createContext<StateContextType | undefined>(undefined);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- 1. Router State (Hash Routing) ---
  const [currentPath, setCurrentPath] = useState<string>('#/');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      setCurrentPath(hash);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initialize
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  // --- 2. Toast management ---
  const [toasts, setToasts] = useState<Toast[]>([]);
  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- 3. Core Database Persistence (Simulating Firestore/Storage via localStorage) ---
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('jang_products');
    const itemsList = saved ? JSON.parse(saved) : initialProducts;
    return itemsList.map((p: any) => {
      const shop = getShopDetails(p.category);
      return {
        ...p,
        shopId: p.shopId || shop.shopId,
        shopName: p.shopName || shop.shopName,
      };
    });
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('jang_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('jang_orders');
    if (saved) {
      try {
        const parsed: Order[] = JSON.parse(saved);
        let migrated = false;
        const updated = parsed.map(o => {
          if (!o.customer_lat || !o.customer_lng) {
            migrated = true;
            const geo = geocodeAddress(o.address.fullAddress, o.address.landmark);
            return {
              ...o,
              customer_lat: geo.lat,
              customer_lng: geo.lng,
              delivery_address: o.delivery_address || `${o.address.fullAddress}${o.address.landmark ? ` (Landmark: ${o.address.landmark})` : ''}`
            };
          }
          return o;
        });
        if (migrated) {
          localStorage.setItem('jang_orders', JSON.stringify(updated));
        }
        return updated;
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem('jang_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentAdmin, setCurrentAdminState] = useState<Admin | null>(() => {
    const saved = localStorage.getItem('jang_admin');
    return saved ? JSON.parse(saved) : null;
  });

  // Sync state to localStorage on modification
  useEffect(() => {
    localStorage.setItem('jang_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('jang_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('jang_orders', JSON.stringify(orders));
  }, [orders]);

  // Sync with Cloud Firestore on Initialization
  useEffect(() => {
    const initializeFirebaseData = async () => {
      try {
        // Load products from Cloud Firestore
        const cloudProducts = await getProductsDocList();
        if (cloudProducts && cloudProducts.length > 0) {
          setProducts(cloudProducts);
        } else {
          // Cloud catalog empty: Seed initial catalog to Firebase
          console.log("Seeding products to Cloud Firestore...");
          for (const prod of products) {
            await saveProductDoc(prod);
          }
        }
      } catch (err) {
        console.warn("Could not sync cloud catalog: check rules or connectivity.", err);
      }

      try {
        // Hydrate from Cloud Firestore
        const cloudOrders = await getOrdersDocList();
        if (cloudOrders && cloudOrders.length > 0) {
          setOrders((prev) => {
            const merged = [...prev];
            cloudOrders.forEach((cloudOrder) => {
              const matchIdx = merged.findIndex((o) => o.id === cloudOrder.id);
              if (matchIdx >= 0) {
                merged[matchIdx] = cloudOrder;
              } else {
                merged.push(cloudOrder);
              }
            });
            return merged.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
          });
        }
      } catch (err) {
        console.warn("Could not retrieve cloud order transactions:", err);
      }
    };

    initializeFirebaseData();
  }, []);

  // Handle cross-context tab/iframe database real-time sync
  useEffect(() => {
    const handleSync = () => {
      const savedOrders = localStorage.getItem('jang_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        if (JSON.stringify(parsed) !== JSON.stringify(orders)) {
          setOrders(parsed);
        }
      }
      const savedProducts = localStorage.getItem('jang_products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        if (JSON.stringify(parsed) !== JSON.stringify(products)) {
          setProducts(parsed);
        }
      }
    };
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
    };
  }, [orders, products]);

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('jang_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('jang_user');
    }
  };

  const setCurrentAdmin = (admin: Admin | null) => {
    setCurrentAdminState(admin);
    if (admin) {
      localStorage.setItem('jang_admin', JSON.stringify(admin));
    } else {
      localStorage.removeItem('jang_admin');
    }
  };

  // --- 4. Catalog Functions ---
  const addProduct = (newProd: Omit<Product, 'id' | 'createdAt'>) => {
    const productWithId: Product = {
      ...newProd,
      id: `prod-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [productWithId, ...prev]);
    saveProductDoc(productWithId).catch(err => console.warn("Firestore addProduct error:", err));
    showToast(`Product "${newProd.name}" added successfully!`, 'success');
  };

  const updateProduct = (updatedProd: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
    saveProductDoc(updatedProd).catch(err => console.warn("Firestore updateProduct error:", err));
    showToast(`Product details updated!`, 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductDocObj(id).catch(err => console.warn("Firestore deleteProduct error:", err));
    showToast(`Product deleted successfully.`, 'info');
  };

  const updateStock = (id: string, newStock: number) => {
    const targetStock = Math.max(0, newStock);
    const availableState = targetStock > 0;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: targetStock, isAvailable: availableState } : p))
    );
    updateProductStockDoc(id, targetStock, availableState).catch(err => console.warn("Firestore updateStock error:", err));
  };

  // --- 5. Shopping Cart Functions ---
  const addToCart = (product: Product, quantity: number = 1) => {
    // Check stock
    if (product.stock < quantity) {
      showToast(`Sorry, only ${product.stock} units of ${product.name} left in stock!`, 'warning');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        const potentialQty = existing.quantity + quantity;
        if (potentialQty > 50) {
          showToast(`Maximum purchase limit per item is 50 units!`, 'warning');
          return prevCart;
        }
        if (product.stock < potentialQty) {
          showToast(`Cannot add more. Solid out of ${product.name}!`, 'warning');
          return prevCart;
        }
        showToast(`Increased quantity of ${product.name} in cart!`, 'success');
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: potentialQty } : item
        );
      }
      showToast(`Added ${product.name} (${product.unit}) to cart!`, 'success');
      return [...prevCart, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const item = cart.find((c) => c.product.id === productId);
    if (item && item.product.stock < quantity) {
      showToast(`Only ${item.product.stock} units are available!`, 'warning');
      return;
    }
    if (quantity > 50) {
      showToast(`Maximum selection limit is 50.`, 'warning');
      return;
    }
    setCart((prev) =>
      prev.map((c) => (c.product.id === productId ? { ...c, quantity } : c))
    );
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find((c) => c.product.id === productId);
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
    if (item) {
      showToast(`Removed "${item.product.name}" from cart.`, 'info');
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  // Subtotal, Delivery fee, Total helper computations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = cartSubtotal === 0 ? 0 : cartSubtotal >= 499 ? 0 : 29; // Free delivery above ₹499
  const cartTotal = cartSubtotal + deliveryFee;

  // --- 6. Auth/User Registration (Firestore/Client Hybrid Simulation) ---
  const loginUser = async (email: string, phone: string): Promise<User> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate async auth api delay
    setIsLoading(false);

    // Clean formats
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/\D/g, '');
    const userUid = `u-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`;

    try {
      const cloudUser = await getUserDoc(userUid);
      if (cloudUser) {
        setCurrentUser(cloudUser);
        localStorage.setItem(`jang_user_profile_${cleanEmail}`, JSON.stringify(cloudUser));
        showToast(`Welcome back, ${cloudUser.name}!`, 'success');
        return cloudUser;
      }
    } catch (err) {
      console.warn("Firestore loginUser profile read failed:", err);
    }

    // Check fallback local profile
    const savedUserString = localStorage.getItem(`jang_user_profile_${cleanEmail}`);
    if (savedUserString) {
      const loadedUser = JSON.parse(savedUserString);
      setCurrentUser(loadedUser);
      saveUserDoc(loadedUser).catch(err => console.warn("Firestore copy save failed:", err));
      showToast(`Welcome back, ${loadedUser.name}!`, 'success');
      return loadedUser;
    }

    // Default registered profile template
    const newUser: User = {
      uid: userUid,
      email: cleanEmail,
      name: email.split('@')[0].toUpperCase(),
      phone: cleanPhone || '9876543210',
      address: [
        {
          id: 'addr-default',
          fullAddress: 'H.No 4-12, Near Bus Stand, Jangaon, Telangana',
          landmark: 'Hanuman Temple',
          isDefault: true,
        },
      ],
      createdAt: new Date().toISOString(),
      role: 'customer',
    };

    saveUserDoc(newUser).catch(err => console.warn("Could not write profile to Firestore:", err));
    localStorage.setItem(`jang_user_profile_${cleanEmail}`, JSON.stringify(newUser));
    setCurrentUser(newUser);
    showToast(`Account successfully loaded or created!`, 'success');
    return newUser;
  };

  const registerUser = async (name: string, email: string, phone: string, address: string): Promise<User> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsLoading(false);

    const cleanEmail = email.trim().toLowerCase();
    const userUid = `u-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`;

    const newUser: User = {
      uid: userUid,
      email: cleanEmail,
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      address: [
        {
          id: `addr-${Math.random().toString(36).substring(2, 5)}`,
          fullAddress: address.trim(),
          isDefault: true,
        },
      ],
      createdAt: new Date().toISOString(),
      role: 'customer',
    };

    saveUserDoc(newUser).catch(e => console.warn("Could not register user to Firestore:", e));
    localStorage.setItem(`jang_user_profile_${newUser.email}`, JSON.stringify(newUser));
    setCurrentUser(newUser);
    showToast(`Registration successful! Welcome ${name}.`, 'success');
    return newUser;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    showToast(`You have signed out.`, 'info');
    navigate('#/');
  };

  const addAddress = (fullAddress: string, landmark?: string) => {
    if (!currentUser) return;
    const newAddr: Address = {
      id: `addr-${Math.random().toString(36).substring(2, 5)}`,
      fullAddress: fullAddress.trim(),
      landmark: landmark?.trim(),
      isDefault: currentUser.address.length === 0,
    };
    const updatedUser = {
      ...currentUser,
      address: [...currentUser.address, newAddr],
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(`jang_user_profile_${currentUser.email}`, JSON.stringify(updatedUser));
    saveUserDoc(updatedUser).catch(e => console.warn("Could not save address set in Firestore:", e));
    showToast(`New delivery address added!`, 'success');
  };

  const deleteAddress = (id: string) => {
    if (!currentUser) return;
    const updatedAddress = currentUser.address.filter((a) => a.id !== id);
    // If we deleted default, set first one as default
    if (updatedAddress.length > 0 && !updatedAddress.some((a) => a.isDefault)) {
      updatedAddress[0].isDefault = true;
    }
    const updatedUser = {
      ...currentUser,
      address: updatedAddress,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(`jang_user_profile_${currentUser.email}`, JSON.stringify(updatedUser));
    saveUserDoc(updatedUser).catch(e => console.warn("Could not delete address in Firestore:", e));
    showToast(`Address removed.`, 'info');
  };

  const setDefaultAddress = (id: string) => {
    if (!currentUser) return;
    const updatedAddress = currentUser.address.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    const updatedUser = {
      ...currentUser,
      address: updatedAddress,
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(`jang_user_profile_${currentUser.email}`, JSON.stringify(updatedUser));
    saveUserDoc(updatedUser).catch(e => console.warn("Could not update default address in Firestore:", e));
    showToast(`Default address set!`, 'success');
  };

  // --- 7. Admin Session Control ---
  const adminLogin = async (email: string, password: string): Promise<Admin> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);

    // Bootstrap check for pre-authorized admins: baldeshruthi17@gmail.com is authorized
    if (
      (email.trim().toLowerCase() === 'baldeshruthi17@gmail.com' ||
        email.trim().toLowerCase() === 'admin@jangaonmart.com') &&
      password === 'admin123'
    ) {
      const adminSession: Admin = {
        email: email.trim().toLowerCase(),
        name: email.includes('baldeshruthi') ? 'Shruthi Balde' : 'Admin Manager',
        role: 'super-admin',
        createdAt: new Date().toISOString(),
      };
      setCurrentAdmin(adminSession);
      showToast(`Access granted! Welcome Creator ${adminSession.name}.`, 'success');
      return adminSession;
    } else {
      showToast(`Invalid admin credentials. Please use creator email and "admin123"`, 'error');
      throw new Error(`Admin unauthorized!`);
    }
  };

  const adminLogout = () => {
    setCurrentAdmin(null);
    showToast(`Logged out from Admin Dashboard.`, 'info');
    navigate('#/');
  };

  // --- 8. Hyperlocal Orders Engine & Realistic Status Simulator ---
  const placeOrder = async (
    customerName: string,
    phone: string,
    fullAddress: string,
    landmark: string,
    deliverySlot: string,
    notes?: string,
    paymentMethod: 'COD' | 'ONLINE' = 'COD',
    payment_status: 'PENDING' | 'PAID' = 'PENDING',
    transaction_id: string = '',
    razorpay_order_id: string = '',
    razorpay_payment_id: string = '',
    discountAmount: number = 0,
    overallDeliveryFee: number = -1
  ): Promise<Order[]> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);

    if (cart.length === 0) {
      showToast(`Your cart is empty!`, 'error');
      throw new Error(`Cart empty`);
    }

    const uniqueShops = Array.from(new Set(cart.map(item => {
      const shop = getShopDetails(item.product.category);
      return item.product.shopId || shop.shopId;
    }))) as string[];

    const actualDeliveryFee = overallDeliveryFee >= 0 ? overallDeliveryFee : (cartSubtotal >= 499 ? 0 : 29);
    const ordersToCreate: Order[] = [];
    const coords = geocodeAddress(fullAddress, landmark);

    uniqueShops.forEach((selectedShopId, index) => {
      const shopItems = cart.filter(item => {
        const shop = getShopDetails(item.product.category);
        return (item.product.shopId || shop.shopId) === selectedShopId;
      });

      const shopSubtotal = shopItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

      let shopDeliveryFee = 0;
      let shopDiscount = 0;

      if (uniqueShops.length === 1) {
        shopDeliveryFee = actualDeliveryFee;
        shopDiscount = discountAmount;
      } else {
        if (index === uniqueShops.length - 1) {
          const summedPrevDelivery = ordersToCreate.reduce((sum, o) => sum + o.deliveryFee, 0);
          const summedPrevDiscount = ordersToCreate.reduce((sum, o) => {
            const discOffset = o.subtotal + o.deliveryFee - o.total;
            return sum + (discOffset > 0 ? discOffset : 0);
          }, 0);
          shopDeliveryFee = Math.max(0, actualDeliveryFee - summedPrevDelivery);
          shopDiscount = Math.max(0, discountAmount - summedPrevDiscount);
        } else {
          shopDeliveryFee = Math.round((shopSubtotal / cartSubtotal) * actualDeliveryFee);
          shopDiscount = Math.round((shopSubtotal / cartSubtotal) * discountAmount);
        }
      }

      const shopTotal = Math.max(0, shopSubtotal + shopDeliveryFee - shopDiscount);
      const orderId = `JM-${100000 + Math.floor(Math.random() * 900000)}`;
      const firstProductCat = shopItems[0]?.product.category;
      const { shopName } = getShopDetails(firstProductCat);

      // ONLINE payment flows start as 'Pending' in JangaonMart system
      const initialStatus: OrderStatus = (paymentMethod === 'ONLINE' && payment_status === 'PENDING') ? 'Pending' : 'Accepted';
      const initialOrderStatus = (paymentMethod === 'ONLINE' && payment_status === 'PENDING') ? 'PENDING' : 'ACCEPTED';

      const newOrder: Order = {
        id: orderId,
        order_id: orderId,
        userId: currentUser?.uid || 'guest-user',
        customerName: customerName,
        phone: phone,
        address: {
          fullAddress,
          landmark,
          deliverySlot,
        },
        items: shopItems.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
          shopId: selectedShopId,
          shopName: item.product.shopName || shopName
        })),
        subtotal: shopSubtotal,
        deliveryFee: shopDeliveryFee,
        total: shopTotal,
        total_amount: shopTotal,
        paymentMethod: paymentMethod,
        payment_method: paymentMethod,
        payment_status: payment_status,
        transaction_id: transaction_id,
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        status: initialStatus,
        order_status: initialOrderStatus as any,
        orderDate: new Date().toISOString(),
        customer_lat: coords.lat,
        customer_lng: coords.lng,
        delivery_address: `${fullAddress}${landmark ? ` (Landmark: ${landmark})` : ''}`,
        shopId: selectedShopId,
        shop_id: selectedShopId,
        shopName: shopItems[0]?.product.shopName || shopName
      };

      ordersToCreate.push(newOrder);
    });

    // Save newly generated orders to the central state list
    setOrders((prev) => [...ordersToCreate, ...prev]);

    // Save newly generated orders to Firestore
    ordersToCreate.forEach((order) => {
      saveOrderDoc(order).catch(err => console.warn("Firestore saveOrderDoc error:", err));
    });

    // For direct cash transactions or pre-confirmed prepayments, immediately execute stock and cart updates
    if (paymentMethod === 'COD' || payment_status === 'PAID') {
      setProducts((prev) =>
        prev.map((p) => {
          const itemOrdered = cart.find((c) => c.product.id === p.id);
          if (itemOrdered) {
            const updatedStock = Math.max(0, p.stock - itemOrdered.quantity);
            updateProductStockDoc(p.id, updatedStock, updatedStock > 0).catch(err => console.warn("Firestore updateStock error:", err));
            return {
              ...p,
              stock: updatedStock,
              isAvailable: updatedStock > 0,
            };
          }
          return p;
        })
      );
      clearCart();
      const primaryId = ordersToCreate[0]?.id;
      showToast(`Order placed successfully with ${uniqueShops.length} shops!`, 'success');
      navigate(`#/order-success/${primaryId}`);
    }

    return ordersToCreate;
  };

  const confirmStoredOrdersPayment = (
    orderIds: string[],
    transactionId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string
  ) => {
    // 1. Mark target initialized orders within state as PAID and CONFIRMED (Accepted)
    setOrders((prev) =>
      prev.map((o) => {
        if (orderIds.includes(o.id)) {
          const updatedOrder = {
            ...o,
            status: 'Accepted' as OrderStatus,
            order_status: 'ACCEPTED' as any,
            payment_status: 'PAID' as any,
            transaction_id: transactionId,
            razorpay_order_id: razorpayOrderId,
            razorpay_payment_id: razorpayPaymentId,
          };
          saveOrderDoc(updatedOrder).catch(err => console.warn("Firestore saveOrderDoc error:", err));
          return updatedOrder;
        }
        return o;
      })
    );

    // 2. Perform catalog stock subtraction
    setProducts((prev) =>
      prev.map((p) => {
        const itemOrdered = cart.find((c) => c.product.id === p.id);
        if (itemOrdered) {
          const updatedStock = Math.max(0, p.stock - itemOrdered.quantity);
          updateProductStockDoc(p.id, updatedStock, updatedStock > 0).catch(err => console.warn("Firestore updateStock error:", err));
          return {
            ...p,
            stock: updatedStock,
            isAvailable: updatedStock > 0,
          };
        }
        return p;
      })
    );

    // 3. Purge shopping basket state
    clearCart();

    const mainId = orderIds[0];
    showToast(`Prepayment Verified! Dispatching your ${orderIds.length} orders!`, 'success');
    navigate(`#/order-success/${mainId}`);
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedOrder = { ...o, status, deliveryTime: status === 'Delivered' ? new Date().toISOString() : undefined };
          const order_status = status === 'Delivered' ? 'DELIVERED' : (status === 'Out for Delivery' ? 'OUT_FOR_DELIVERY' : undefined);
          updateOrderStatusDocObj(orderId, status, order_status).catch(err => console.warn("Firestore updateOrderStatus error:", err));
          return updatedOrder;
        }
        return o;
      })
    );
  };

  const assignDeliveryBoy = (orderId: string, riderId?: string, riderName?: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const updatedOrder = { ...o, deliveryBoyId: riderId, assignedRiderName: riderName };
          assignOrderRiderDocObj(orderId, riderId, riderName).catch(err => console.warn("Firestore assignRider error:", err));
          return updatedOrder;
        }
        return o;
      })
    );
  };

  const reorder = (order: Order) => {
    let anyAdded = false;
    order.items.forEach((item) => {
      const matchProd = products.find((p) => p.id === item.productId);
      if (matchProd && matchProd.stock > 0) {
        addToCart(matchProd, Math.min(item.quantity, matchProd.stock));
        anyAdded = true;
      }
    });

    if (anyAdded) {
      showToast(`Items from order ${order.id} added to cart!`, 'success');
      navigate('#/cart');
    } else {
      showToast(`Sorry, these products are currently out of stock.`, 'error');
    }
  };

  // --- 9. Background Hyperlocal Realtime simulator (Disabled for manual control) ---
  // Status changes are fully manual and driven by Admin and Rider actions as requested by User.

  return (
    <StateContext.Provider
      value={{
        currentPath,
        navigate,
        isLoading,
        setIsLoading,

        products,
        setProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,

        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        deliveryFee,
        cartTotal,

        currentUser,
        setCurrentUser,
        loginUser,
        registerUser,
        logoutUser,
        addAddress,
        deleteAddress,
        setDefaultAddress,

        currentAdmin,
        adminLogin,
        adminLogout,

        orders,
        placeOrder,
        confirmStoredOrdersPayment,
        updateOrderStatus,
        assignDeliveryBoy,
        reorder,

        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within a StateProvider');
  }
  return context;
};
