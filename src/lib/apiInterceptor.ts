/**
 * JangaonMart Hyperlocal Network Interceptor
 * Intercepts outbound fetch requests in the browser to act as a realistic server backend.
 * This connects the Delivery Boy Dashboard to the same central localStorage 'jang_orders' 
 * that the Customer and Admin dashboards use.
 */

// Native fetch backup
const nativeFetch = window.fetch;

// Predefined static available riders/delivery boys
const STATIC_DELIVERY_BOYS = [
  {
    id: "rider-1",
    name: "Arjun Kumar",
    email: "arjun@jangaonmart.com",
    username: "arjun",
    password: "rider123",
    token: "jwt-token-arjun-9921",
    phone: "+91 98765 43210",
    avatar: "🛵",
    vehicle: "EV Pulsar Cargo",
    status: "active"
  },
  {
    id: "rider-2",
    name: "Rajesh Singh",
    email: "rajesh@jangaonmart.com",
    username: "rajesh",
    password: "rider123",
    token: "jwt-token-rajesh-7723",
    phone: "+91 87654 32109",
    avatar: "🚲",
    vehicle: "EV Ola Cargo Sport",
    status: "active"
  },
  {
    id: "rider-3",
    name: "Kiran Goud",
    email: "kiran@jangaonmart.com",
    username: "kiran",
    password: "rider123",
    token: "jwt-token-kiran-5541",
    phone: "+91 76543 21098",
    avatar: "🏍️",
    vehicle: "Splendor Pro Heavy",
    status: "active"
  }
];

// Exported mutable reference to preserve imported usages
export const DELIVERY_BOYS: typeof STATIC_DELIVERY_BOYS = [...STATIC_DELIVERY_BOYS];

// Dynamic Sync-Back logic to instantly match localStorage additions
export function syncDynamicRiders() {
  try {
    const stored = localStorage.getItem("jang_riders");
    const dynamicArray = stored ? JSON.parse(stored) : [];
    
    // Clear the exported list and re-populate with base + newly added ones
    DELIVERY_BOYS.length = 0;
    DELIVERY_BOYS.push(...STATIC_DELIVERY_BOYS);
    
    dynamicArray.forEach((r: any) => {
      // Avoid duplicate keys
      if (!DELIVERY_BOYS.some(existing => existing.id === r.id)) {
        DELIVERY_BOYS.push({
          id: r.id || `rider-${r.username}`,
          name: r.name,
          email: r.email || `${r.username}@jangaonmart.com`,
          username: r.username,
          password: r.password, // hashed or plain
          token: r.token || `jwt-token-${r.username}-${Math.floor(Math.random() * 9000 + 1000)}`,
          phone: r.phone || "+91 99999 88888",
          avatar: r.avatar || "🛵",
          vehicle: r.vehicle || "EV Jangaon Express",
          status: r.status || "active"
        });
      }
    });
  } catch (error) {
    console.warn("[apiInterceptor] Failed to sync dynamic riders:", error);
  }
}

// Initialize on module load
try {
  syncDynamicRiders();
} catch (e) {}

// Listen to storage events for real-time changes
if (typeof window !== "undefined") {
  window.addEventListener("storage", () => {
    syncDynamicRiders();
  });
}

// Simple SHA-256 cryptographic verification helper for secure password storage
async function verifyPassword(storedValue: string, plainText: string): Promise<boolean> {
  if (storedValue === plainText) return true;
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashedHex = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
    return storedValue === hashedHex;
  } catch (e) {
    return false;
  }
}

// Helper to construct mock HTTP Response
function createJsonResponse(data: any, status: number = 200, statusText: string = "OK") {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  return new Response(blob, {
    status,
    statusText,
    headers: { "Content-Type": "application/json" }
  });
}

// Define custom fetch routing handler
const patchedFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlString = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  
  // Only intercept relative or local /api routes
  if (urlString.includes("/api/")) {
    // Bypass interceptor to allow live payment calls to reach our Node Express backend
    if (urlString.endsWith("/api/create-order") || urlString.endsWith("/api/verify-payment")) {
      return nativeFetch(input, init);
    }

    console.group(`🌐 [API Network Outbound] -> ${init?.method || "GET"} ${urlString}`);
    if (init?.headers) {
      console.log("Headers:", init.headers);
    }
    if (init?.body) {
      console.log("Payload Body:", init.body);
    }

    try {
      // 1. Delivery Boy REST Login
      if (urlString.endsWith("/api/delivery/login") && init?.method === "POST") {
        const body = JSON.parse(init.body as string || "{}");
        const loginQuery = (body.email || "").toLowerCase().trim();
        const inputPass = body.password || "";

        let verifiedRider = null;
        let isInactive = false;

        for (const r of DELIVERY_BOYS) {
          const rEmail = (r.email || "").toLowerCase();
          const rUser = (r.username || "").toLowerCase();
          if (rEmail === loginQuery || rUser === loginQuery) {
            // Verify password
            const isMatch = await verifyPassword(r.password, inputPass);
            if (isMatch) {
              if (r.status === "inactive") {
                isInactive = true;
              } else {
                verifiedRider = r;
              }
              break;
            }
          }
        }

        if (isInactive) {
          console.warn("Rider account is currently deactivated/inactive");
          console.groupEnd();
          return createJsonResponse({ success: false, error: "Rider account is inactive. Access denied." }, 401, "Unauthorized");
        }

        if (verifiedRider) {
          console.log("Rider Authenticated successfully!", verifiedRider);
          console.groupEnd();
          return createJsonResponse({
            success: true,
            token: verifiedRider.token,
            rider: {
              id: verifiedRider.id,
              name: verifiedRider.name,
              email: verifiedRider.email,
              phone: verifiedRider.phone,
              vehicle: verifiedRider.vehicle,
              avatar: verifiedRider.avatar
            }
          });
        } else {
          console.warn("Invalid authentication credentials");
          console.groupEnd();
          return createJsonResponse({ success: false, error: "Invalid credentials or rider offline." }, 401, "Unauthorized");
        }
      }

      // 2. Fetch Assigned Orders: GET /api/delivery/orders?deliveryBoyId=XYZ
      if (urlString.includes("/api/delivery/orders") && (init?.method === "GET" || !init?.method)) {
        // Parse rider ID from query parameters
        const urlObj = new URL(urlString, window.location.origin);
        const deliveryBoyId = urlObj.searchParams.get("deliveryBoyId");

        // Auth token validation check (Authorization: Bearer <token>)
        const headersObj = (init?.headers || {}) as Record<string, string>;
        const authHeader = headersObj["Authorization"] || headersObj["authorization"] || "";
        const token = authHeader.replace("Bearer ", "").trim();

        const authorizedRider = DELIVERY_BOYS.find(r => r.token === token);
        if (!authorizedRider) {
          console.warn("Authentication missing or token mismatch!");
          console.groupEnd();
          return createJsonResponse({ error: "Missing or invalid authorization token" }, 403, "Forbidden");
        }

        // Retrieve standard JangaonMart orders from localStorage
        const storedOrdersRaw = localStorage.getItem("jang_orders");
        let orders = storedOrdersRaw ? JSON.parse(storedOrdersRaw) : [];

        // If the database has absolutely 0 orders (or 0 assigned to this rider), 
        // let's do a helpful seeding process so the tester has orders to interact with!
        const hasAssigned = orders.some((o: any) => o.deliveryBoyId === deliveryBoyId);
        if (orders.length === 0 || !hasAssigned) {
          // If no orders exist, create a few realistic local ones
          if (orders.length === 0) {
            orders = [
              {
                id: "JM-772910",
                userId: "demo-user-1",
                customerName: "Venkatesh Rao",
                phone: "9848022338",
                address: {
                  fullAddress: "Plot No 44, Court Colony, Jangaon, Telangana",
                  landmark: "Opposite Sessions Court Bench",
                  deliverySlot: "Morning slot (8 AM - 11 AM)"
                },
                items: [
                  { productId: "prod-1", name: "Fresh Heritage Pure Milk", price: 34, quantity: 2, image: "🥦" },
                  { productId: "prod-3", name: "Premium Basmati Rice", price: 110, quantity: 1, image: "🌾" }
                ],
                subtotal: 178,
                deliveryFee: 15,
                total: 193,
                paymentMethod: "COD",
                status: "Accepted",
                orderDate: new Date().toISOString()
              },
              {
                id: "JM-541299",
                userId: "demo-user-2",
                customerName: "Mallesh Goud",
                phone: "9100882312",
                address: {
                  fullAddress: "H No 3-12/A, Siddipet Road, Jangaon, Telangana",
                  landmark: "Near Sri Venkateshwara Temple Chowrasta",
                  deliverySlot: "Evening slot (5 PM - 8 PM)"
                },
                items: [
                  { productId: "prod-4", name: "Refined Sunflower Oil", price: 125, quantity: 2, image: "🌾" },
                  { productId: "prod-5", name: "Farm Fresh Large Eggs", price: 45, quantity: 1, image: "🥛" }
                ],
                subtotal: 295,
                deliveryFee: 15,
                total: 310,
                paymentMethod: "COD",
                status: "Pending",
                orderDate: new Date().toISOString()
              }
            ];
          }

          // Force-assign these orders to our rider so that they are guaranteed to see orders
          orders = orders.map((o: any, idx: number) => {
            if (!o.deliveryBoyId || o.deliveryBoyId === "") {
              return {
                ...o,
                deliveryBoyId: deliveryBoyId,
                assignedRiderName: authorizedRider.name,
                // Ensure status is logical for a delivery rider (Accepted or Preparing)
                status: o.status === "Pending" ? "Accepted" : o.status
              };
            }
            return o;
          });

          // Sync back to central storage
          localStorage.setItem("jang_orders", JSON.stringify(orders));
          // Dispatch storage event to alert other modules
          window.dispatchEvent(new Event("storage"));
        }

        // Filter orders assigned to this delivery boy
        const riderOrders = orders.filter((o: any) => o.deliveryBoyId === deliveryBoyId);
        
        console.log(`Matched ${riderOrders.length} assigned orders for riderID: ${deliveryBoyId}`);
        console.groupEnd();
        return createJsonResponse(riderOrders);
      }

      // 2.5 Rider GPS Location Tracking Endpoint: POST /api/rider/location
      if (urlString.endsWith("/api/rider/location") && init?.method === "POST") {
        const bodyObj = JSON.parse(init.body as string || "{}");
        const { riderId, latitude, longitude, timestamp } = bodyObj;

        console.log(`[GPS Interceptor] Processing Location update for Raider: ${riderId}. Lat=${latitude}, Lon=${longitude}`);

        const storedLocationsRaw = localStorage.getItem("rider_locations");
        let locations = storedLocationsRaw ? JSON.parse(storedLocationsRaw) : [];

        // Structure a uniform lookup entry representation
        const newLocationRecord = {
          rider_id: riderId,
          latitude: Number(latitude),
          longitude: Number(longitude),
          updated_at: timestamp || new Date().toISOString()
        };

        const existingIdx = locations.findIndex((loc: any) => loc.rider_id === riderId);
        if (existingIdx !== -1) {
          locations[existingIdx] = newLocationRecord;
        } else {
          locations.push(newLocationRecord);
        }

        localStorage.setItem("rider_locations", JSON.stringify(locations));
        
        // Broadcast updates for real-time customer and admin map views to sync
        window.dispatchEvent(new Event("storage"));

        console.log(`[GPS Interceptor] Updated. Total riders tracked: ${locations.length}`);
        console.groupEnd();
        
        return createJsonResponse({ success: true, riderId, location: newLocationRecord });
      }

      // 3. Status Update API: PATCH /api/orders/:id
      if (urlString.includes("/api/orders/") && init?.method === "PATCH") {
        const urlParts = urlString.split("/");
        const orderId = urlParts[urlParts.length - 1]?.split("?")[0];
        const bodyObj = JSON.parse(init.body as string || "{}");
        const newStatus = bodyObj.status;

        console.log(`Processing Order patch query. OrderId: ${orderId}, TargetStatus: ${newStatus}`);

        // Read orders
        const storedOrdersRaw = localStorage.getItem("jang_orders");
        const orders = storedOrdersRaw ? JSON.parse(storedOrdersRaw) : [];

        let matched = false;
        const updatedOrders = orders.map((o: any) => {
          if (o.id === orderId) {
            matched = true;
            return {
              ...o,
              status: newStatus,
              deliveryTime: newStatus === "Delivered" ? new Date().toISOString() : o.deliveryTime
            };
          }
          return o;
        });

        if (matched) {
          localStorage.setItem("jang_orders", JSON.stringify(updatedOrders));
          
          // Force a React context sync by custom document trigger or storage dispatch
          window.dispatchEvent(new Event("storage"));
          
          console.log(`Order status successfully patched to "${newStatus}"!`);
          console.groupEnd();
          return createJsonResponse({ success: true, orderId, updatedStatus: newStatus });
        } else {
          console.warn(`Order ${orderId} not found in central database!`);
          console.groupEnd();
          return createJsonResponse({ error: `Order ${orderId} not found` }, 404, "Not Found");
        }
      }
    } catch (err: any) {
      console.error("AJAX custom interceptor errored out:", err);
      console.groupEnd();
      return nativeFetch(input, init);
    }
  }

  // Fallback to normal HTTP Fetch for non-/api assets
  return nativeFetch(input, init);
};

// Implement robust global proxying hook shadowing Window.prototype.fetch
try {
  Object.defineProperty(window, 'fetch', {
    value: patchedFetch,
    writable: true,
    configurable: true
  });
} catch (e) {
  console.warn("Could not redefine window.fetch using Object.defineProperty. Falling back to direct mutation:", e);
  try {
    (window as any).fetch = patchedFetch;
  } catch (err2) {
    console.error("Fatal: Browser sandbox prevents fetch interception.", err2);
  }
}
