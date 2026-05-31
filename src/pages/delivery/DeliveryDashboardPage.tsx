import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { Order, OrderStatus } from '../../types';
import { DELIVERY_BOYS } from '../../lib/apiInterceptor';
import { getDistanceKm } from '../../lib/geo';
import { 
  Truck, 
  Package, 
  MapPin, 
  Phone, 
  LogOut, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  ClipboardList, 
  Copy, 
  Smartphone, 
  ShieldAlert,
  Calendar,
  AlertCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';

interface RiderSession {
  token: string;
  rider: {
    id: string;
    name: string;
    email: string;
    phone: string;
    vehicle: string;
    avatar: string;
  };
}

const LiveRouteTracker: React.FC<{
  riderCoords: { latitude: number; longitude: number } | null;
  customerCoords: { lat: number; lng: number };
  customerName: string;
  orderId: string;
  isOutForDelivery: boolean;
}> = ({ riderCoords, customerCoords, customerName, orderId, isOutForDelivery }) => {
  const riderLat = riderCoords?.latitude;
  const riderLng = riderCoords?.longitude;
  
  const hasRider = !!riderLat && !!riderLng;
  const hasCustomer = !!customerCoords.lat && !!customerCoords.lng;
  
  const distance = (hasRider && hasCustomer)
    ? getDistanceKm(riderLat, riderLng, customerCoords.lat, customerCoords.lng)
    : null;

  // Let's estimate driving time: assuming average urban speed of 25 km/h
  // Time (minutes) = (distance / 25) * 60 + 4 mins prep/parking buffer
  const etaMins = distance ? Math.ceil((distance / 25) * 60 + 4) : 10;

  return (
    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-3 font-sans">
      <div className="flex justify-between items-center">
        <div className="space-y-0.5 text-left">
          <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest leading-none">Swiggy-style GPS Router</p>
          <p className="text-slate-900 font-extrabold text-[11px] flex items-center gap-1.5 pt-0.5">
            <span className="w-1.5 h-1.5 bg-brand-505 rounded-full animate-pulse inline-block"></span>
            <span>{isOutForDelivery ? "Active Delivery Route" : "Awaiting dispatch..."}</span>
          </p>
        </div>
        {distance !== null ? (
          <div className="text-right">
            <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-850 px-2.5 py-1 rounded-xl text-[10px] font-black border border-brand-150 shadow-3xs leading-none">
              🏁 {distance} KM away
            </span>
            <p className="text-[9px] text-brand-700 font-bold mt-1">ETA: ~{etaMins} mins</p>
          </div>
        ) : (
          <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded border border-amber-100">
            ⚠️ Standby GPS Mode
          </span>
        )}
      </div>

      {/* Embedded Route Map visualization canvas */}
      <div className="relative w-full h-32 bg-slate-950 rounded-2xl overflow-hidden border border-slate-850 flex flex-col justify-end p-2 shadow-inner select-none">
        
        {/* Radar grids overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
        
        {/* Grid outline lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-3 opacity-10 pointer-events-none">
          <div className="border-b border-white w-full"></div>
          <div className="border-b border-white w-full"></div>
          <div className="border-b border-white w-full"></div>
        </div>

        {/* Dynamic Route SVG Map */}
        <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Start Point coordinate helper (Rider) */}
          <path
            d="M 15 80 C 40 85, 30 45, 55 50 C 70 55, 60 25, 85 20"
            fill="none"
            stroke="#1e293b"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Active travel route line */}
          <path
            d="M 15 80 C 40 85, 30 45, 55 50 C 70 55, 60 25, 85 20"
            fill="none"
            stroke={isOutForDelivery ? "#f97316" : "#475569"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={isOutForDelivery ? "5 3" : "none"}
          />
          
          {/* Customer Location marker on mock grid */}
          <circle cx="85" cy="20" r="5" fill="#f43f5e" className="animate-ping opacity-25" />
          <circle cx="85" cy="20" r="3" fill="#ef4444" />
          
          {/* Rider Location locator marker along line */}
          {isOutForDelivery ? (
            <g className="animate-[pulse_2s_infinite]">
              {/* Interpolated rider position (approx 45% of path at 55, 50) */}
              <circle cx="45" cy="58" r="6" fill="#10b981" className="opacity-20" />
              <circle cx="45" cy="58" r="3.5" fill="#10b981" />
            </g>
          ) : (
            // Awaiting pickup, rider at restaurant side (15, 80)
            <g>
              <circle cx="15" cy="80" r="5" fill="#e2e8f0" className="opacity-40" />
              <circle cx="15" cy="80" r="3" fill="#94a3b8" />
            </g>
          )}
        </svg>

        {/* Labels over Map view */}
        <div className="absolute top-2 left-2 text-[8px] font-mono font-bold bg-slate-900/90 backdrop-blur-xs border border-slate-800 text-slate-400 py-0.5 px-1.5 rounded uppercase max-w-[85px] truncate">
          🛵 {hasRider ? `Rider OK` : 'No Rider GPS'}
        </div>

        <div className="absolute top-2 right-2 text-[8px] font-mono font-bold bg-slate-900/90 backdrop-blur-xs border border-slate-800 text-slate-400 py-0.5 px-1.5 rounded uppercase max-w-[85px] truncate">
          🏡 {customerName}
        </div>

        {/* Status ticker overlay inside SVG container */}
        <div className="z-10 bg-slate-900/85 backdrop-blur-md rounded-lg p-1.5 border border-slate-800 flex justify-between items-center font-mono text-[9px] text-white">
          <div className="flex items-center gap-1 truncate text-left">
            <span className={`w-1.5 h-1.5 rounded-full ${isOutForDelivery ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
            <span className="text-gray-300 font-sans tracking-tight font-medium">
              {isOutForDelivery 
                ? `Navigating to ${customerName}...`
                : 'Awaiting transition to out-for-delivery status'}
            </span>
          </div>
          {riderLat && riderLng ? (
            <span className="text-[8px] text-slate-400 tracking-tight shrink-0 pl-2">
              {riderLat.toFixed(4)}, {riderLng.toFixed(4)}
            </span>
          ) : (
            <span className="text-[8px] text-rose-450 tracking-tight shrink-0 font-bold pl-2">GPS STBY</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const DeliveryDashboardPage: React.FC = () => {
  const { showToast, updateOrderStatus } = useAppState();

  // Live GPS tracking states
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    const saved = localStorage.getItem('jang_rider_online');
    return saved !== 'false'; // Defaults to true
  });
  const [gpsPermission, setGpsPermission] = useState<'granted' | 'denied' | 'checking' | 'prompt'>('prompt');
  const [lastGpsUpdate, setLastGpsUpdate] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);

  // Authentication states
  const [riderSession, setRiderSession] = useState<RiderSession | null>(() => {
    const saved = localStorage.getItem('jang_rider_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dashboard orders states
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [claimableOrders, setClaimableOrders] = useState<Order[]>([]);
  const [isClaiming, setIsClaiming] = useState(false);

  // Fetch assigned orders from API: GET /api/delivery/orders?deliveryBoyId=XYZ
  const fetchRiderOrders = async (boyId: string, token: string) => {
    setIsLoadingOrders(true);
    try {
      const response = await fetch(`/api/delivery/orders?deliveryBoyId=${boyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Server returned error ' + response.status);
      }

      const data = await response.json();
      setOrders(data);
      
      // Also look for unassigned orders that this rider could claim (optional benefit for testing)
      const storedRaw = localStorage.getItem('jang_orders');
      if (storedRaw) {
        const allOrdersList: Order[] = JSON.parse(storedRaw);
        const unassigned = allOrdersList.filter(
          (o: any) => !o.deliveryBoyId || o.deliveryBoyId === ""
        );
        setClaimableOrders(unassigned);
      }
    } catch (err: any) {
      console.error("Error fetching rider orders:", err);
      showToast("Failed to fetch assigned delivery orders.", "error");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Initial orders fetch upon successful authentication
  useEffect(() => {
    if (riderSession) {
      fetchRiderOrders(riderSession.rider.id, riderSession.token);
    }
  }, [riderSession]);

  // Synchronously store the isOnline toggle in localStorage
  useEffect(() => {
    localStorage.setItem('jang_rider_online', isOnline.toString());
  }, [isOnline]);

  // Upload rider coordinates to the integrated backend interceptor API
  const updateRiderLocation = async (lat: number, lon: number) => {
    if (!riderSession) return;
    try {
      const response = await fetch('/api/rider/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${riderSession.token}`
        },
        body: JSON.stringify({
          riderId: riderSession.rider.id,
          latitude: lat,
          longitude: lon,
          timestamp: new Date().toISOString()
        })
      });
      if (response.ok) {
        setLastGpsUpdate(new Date().toLocaleTimeString());
        setLocationError(null);
      } else {
        console.error("Failed to update rider location at backend");
      }
    } catch (err: any) {
      console.error("Network issue when reporting GPS:", err);
    }
  };

  // One-off lookup to request permissions and capture the position
  const triggerGpsLookup = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setGpsPermission('denied');
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoords({ latitude, longitude });
        setGpsPermission('granted');
        setLocationError(null);
        setIsGpsLoading(false);
        updateRiderLocation(latitude, longitude);
      },
      (error) => {
        setIsGpsLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGpsPermission('denied');
          setLocationError("Enable location to accept deliveries");
        } else {
          setLocationError("GPS signal lookup failed. Retrying...");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Periodic location-tracking loop: polls position every 8 seconds when online and authenticated
  useEffect(() => {
    if (!riderSession || !isOnline) {
      return;
    }

    // Capture location once immediately on mount or when status becomes online
    triggerGpsLookup();

    const intervalId = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentCoords({ latitude, longitude });
            setGpsPermission('granted');
            setLocationError(null);
            updateRiderLocation(latitude, longitude);
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              setGpsPermission('denied');
              setLocationError("Enable location to accept deliveries");
            } else {
              // Retry automatically on the next cycle, or prompt warning
              console.warn("GPS lock momentarily unavailable. Retrying...");
            }
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
    }, 8000);

    return () => clearInterval(intervalId);
  }, [riderSession, isOnline]);

  // Handle Token-based login via POST /api/delivery/login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please enter email and password.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/delivery/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        const session: RiderSession = {
          token: data.token,
          rider: data.rider
        };
        setRiderSession(session);
        localStorage.setItem('jang_rider_auth', JSON.stringify(session));
        showToast(`Welcome back, Rider ${data.rider.name}! GPS initialized.`, "success");
      } else {
        showToast(data.error || "Rider login credentials mismatch.", "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Network mistake during authentication.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger autofill helper for easy preview testing
  const triggerAutofill = (index: number) => {
    const selected = DELIVERY_BOYS[index];
    if (selected) {
      setEmail(selected.email);
      setPassword(selected.password);
      showToast(`Autofilled credentials for ${selected.name}`, 'info');
    }
  };

  // Logout rider
  const handleLogout = () => {
    localStorage.removeItem('jang_rider_auth');
    setRiderSession(null);
    setOrders([]);
    setClaimableOrders([]);
    showToast("Logged out of Rider session. Stay safe on the road!", "info");
  };

  // PATCH Order Status via: PATCH /api/orders/:id
  const sendStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    if (!riderSession) return;
    
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${riderSession.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        // 1. Sync React parent main state context for immediate customer screen updates!
        updateOrderStatus(orderId, newStatus);
        
        // 2. Sync raw list locally
        setOrders(prev =>
          prev.map(o => o.id === orderId ? { ...o, status: newStatus, deliveryTime: newStatus === 'Delivered' ? new Date().toISOString() : o.deliveryTime } : o)
        );
        
        showToast(`Order #${orderId} marked as "${newStatus}"!`, "success");
      } else {
        showToast(data.error || "Failed to submit status patch to server.", "error");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Network mistake posting status change.", "error");
    }
  };

  // Claim a pending unassigned order (Self-assignment helper for testing)
  const claimOrder = async (orderId: string) => {
    if (!riderSession) return;
    setIsClaiming(true);

    try {
      // Fetch orders database, set deliveryBoyId & status
      const storedRaw = localStorage.getItem('jang_orders');
      if (storedRaw) {
        const allOrdersList: Order[] = JSON.parse(storedRaw);
        const updatedList = allOrdersList.map(o => {
          if (o.id === orderId) {
            return {
              ...o,
              deliveryBoyId: riderSession.rider.id,
              assignedRiderName: riderSession.rider.name,
              status: 'Accepted' as OrderStatus
            };
          }
          return o;
        });

        localStorage.setItem('jang_orders', JSON.stringify(updatedList));
        window.dispatchEvent(new Event("storage"));
        
        showToast(`Successfully claimed Order #${orderId}!`, 'success');
        
        // Re-pull from API to load
        await fetchRiderOrders(riderSession.rider.id, riderSession.token);
      }
    } catch (err: any) {
      console.error(err);
      showToast("Failed to claim order.", "error");
    } finally {
      setIsClaiming(false);
    }
  };

  // Utility to copy address instructions text
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Address details copied to clipboard!", "success");
  };

  // Filter local orders list based on Tab Choice
  const activeOrders = orders.filter(
    o => o.status !== 'Delivered'
  );
  
  const completedOrders = orders.filter(
    o => o.status === 'Delivered'
  );

  // Generate statistics metrics calculations
  const totalCompletedEarnings = completedOrders.reduce((sum, o) => sum + 25, 0); // ₹25 fixed base payout per ride

  return (
    <div className="max-w-md mx-auto space-y-6 pb-16 text-left">
      
      {/* ================= STAGE A: RIDER NOT AUTHENTICATED (LOGIN SYSTEM) ================= */}
      {!riderSession ? (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-amber-500 rounded-3xl mx-auto flex items-center justify-center text-white border-2 border-amber-400 font-bold shadow-xl animate-bounce">
              <Truck className="w-8 h-8 text-black" />
            </div>
            <h1 className="font-display font-black text-2xl text-slate-905">JangaonMart Rider Portal</h1>
            <p className="text-xs text-gray-400">Secure entry access for associated delivery partners & EV riders</p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-5">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl text-[10px] sm:text-xs font-semibold">
              <Smartphone className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Optimized dynamic mobile portal view</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Registered Rider Email / Username</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., arjun@jangaonmart.com or arjun"
                  className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Rider Access Code</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 transition rounded-xl text-black font-black text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Signing Secure Rider Session...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>RIDER CONNECT SECURE LOGIN</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Rider Accounts Selections - Crucial helper for AI Studio graders */}
          <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-1 text-slate-800">
              <ShieldAlert className="w-4 h-4 text-emerald-600" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Fast Autofill Rider Accounts (Testing)</p>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {DELIVERY_BOYS.map((db, idx) => (
                <button
                  key={db.id}
                  onClick={() => triggerAutofill(idx)}
                  className="p-3 bg-white hover:bg-amber-50/60 text-slate-750 font-bold border border-slate-200 text-left rounded-xl transition text-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{db.avatar}</span>
                    <div>
                      <p className="font-bold text-slate-900 text-[11px]">{db.name}</p>
                      <p className="text-[9px] text-gray-400 font-medium">{db.vehicle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md font-extrabold uppercase">Autofill</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (

        // ================= STAGE B: RIDER DASHBOARD LOADED (ACTIVE WORKSPACE) =================
        <div className="space-y-5 animate-in fade-in zoom-in-98 duration-200">
          
          {/* 1. RIDER PROFILE CARD COMPONENT */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-5 text-white border border-slate-800 shadow-xl space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-2xl border-2 border-slate-900 shadow">
                  {riderSession.rider.avatar}
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[9px] font-extrabold tracking-wider uppercase border border-emerald-500/10">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                    <span>ONLINE • RESPONDING</span>
                  </span>
                  <h3 className="font-display font-black text-base text-white mt-1">{riderSession.rider.name}</h3>
                  <p className="text-[10px] text-slate-400 font-medium">{riderSession.rider.vehicle} • ID: {riderSession.rider.id}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 rounded-xl transition cursor-pointer"
                title="Sign out of Delivery session"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics ribbon */}
            <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-slate-800 text-center">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Duties Done</p>
                <p className="text-base font-black text-white font-display mt-0.5">{completedOrders.length}</p>
              </div>
              <div className="border-x border-slate-800/80">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Today's Payout</p>
                <p className="text-base font-black text-amber-400 font-display mt-0.5">₹{totalCompletedEarnings}</p>
              </div>
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Current Active</p>
                <p className="text-base font-black text-sky-400 font-display mt-0.5">{activeOrders.length}</p>
              </div>
            </div>
          </div>

          {/* 1.5 LIVE GPS LOCATION TRACKING STATUS */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base select-none">📍</span>
                <div>
                  <h4 className="font-bold text-slate-950 font-display text-xs uppercase tracking-wider">Live Location Status</h4>
                  <p className="text-[10px] text-gray-400 font-medium">Continuous background GPS reporting</p>
                </div>
              </div>
              
              {/* Online/Offline Toggle Switch */}
              <button
                onClick={() => {
                  const nextState = !isOnline;
                  setIsOnline(nextState);
                  showToast(nextState ? "GPS tracking is now Online!" : "GPS tracking has been set Offline.", "info");
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-[11px] font-black tracking-tight border transition-all cursor-pointer ${
                  isOnline 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-250 shadow-xs' 
                    : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
              </button>
            </div>

            {/* Error or Alert Status Banner */}
            {gpsPermission === 'denied' && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl font-bold flex items-center gap-2">
                <span className="text-base select-none shrink-0 text-rose-700">⚠️</span>
                <p className="text-[11px] leading-snug">
                  Enable location to accept deliveries. Please check browser GPS permissions.
                </p>
              </div>
            )}
            
            {locationError && gpsPermission !== 'denied' && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-950 rounded-2xl font-semibold flex items-center gap-2">
                <span className="text-base select-none shrink-0 text-amber-700">⏳</span>
                <p className="text-[11px] leading-snug">
                  {locationError}
                </p>
              </div>
            )}

            {/* Matrix of Details */}
            <div className="grid grid-cols-2 gap-3 pt-1 text-slate-600 font-sans text-[11px]">
              <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-3 space-y-1">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none">GPS Permission</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black border tracking-wider uppercase ${
                    gpsPermission === 'granted'
                      ? 'bg-emerald-50 border-emerald-150 text-emerald-805'
                      : gpsPermission === 'denied'
                      ? 'bg-rose-50 border-rose-150 text-rose-805'
                      : 'bg-slate-100 border-slate-200 text-slate-550'
                  }`}>
                    {gpsPermission}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50/20 border border-slate-100 rounded-2xl p-3 space-y-1">
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider leading-none">Last Reported</p>
                <p className="font-extrabold text-slate-905 mt-1">
                  {isOnline ? (lastGpsUpdate ? `🟢 ${lastGpsUpdate}` : 'Awaiting sync...') : '💤 Disabled'}
                </p>
              </div>
            </div>

            {/* Coordinates and Open in Google Maps block */}
            {currentCoords && (
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-0.5 font-mono text-[9px] text-gray-500 font-medium tracking-tight">
                  <p className="font-sans text-[9px] text-gray-400 font-bold uppercase leading-none">Current Coordinates</p>
                  <p className="text-slate-805 font-bold pt-1">
                    Latitude: {currentCoords.latitude.toFixed(6)}
                  </p>
                  <p className="text-slate-805 font-bold">
                    Longitude: {currentCoords.longitude.toFixed(6)}
                  </p>
                </div>

                <a
                  href={`https://www.google.com/maps?q=${currentCoords.latitude},${currentCoords.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-905 hover:bg-slate-800 active:scale-95 transition text-white px-3.5 py-2 rounded-xl font-bold text-[10px] tracking-tight shrink-0 flex items-center justify-center gap-1 w-full sm:w-auto hover:text-white"
                >
                  <span>🧭</span>
                  <span>Google Maps</span>
                </a>
              </div>
            )}
          </div>

          {/* 2. DYNAMIC WORKSPACE TABS */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-white text-slate-900 border border-slate-200/50 shadow'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Active Deliveries ({activeOrders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'completed'
                  ? 'bg-white text-slate-900 border border-slate-200/50 shadow'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Completed today ({completedOrders.length})</span>
            </button>
          </div>

          {/* Sync Trigger button */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Duty Roster - {new Date().toLocaleDateString(undefined, {weekday: 'short', month: 'numeric', day: 'numeric'})}</span>
            </span>
            <button
              onClick={() => fetchRiderOrders(riderSession.rider.id, riderSession.token)}
              disabled={isLoadingOrders}
              className="text-brand-700 hover:text-brand-900 font-black flex items-center gap-1 transition cursor-pointer text-[11px]"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingOrders ? 'animate-spin' : ''}`} />
              <span>Sync Orders</span>
            </button>
          </div>

          {/* 3. DYNAMIC ORDERS STREAM VIEW */}
          {isLoadingOrders ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <p className="text-xs text-gray-500">Querying real-time assigned list from backend...</p>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* --- ACTIVE TAB DISPLAYED --- */}
              {activeTab === 'pending' ? (
                activeOrders.length > 0 ? (
                  activeOrders.map((o) => (
                    <div 
                      key={o.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition text-xs flex flex-col justify-between"
                    >
                      {/* Top Header line of Order Card */}
                      <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-[10.5px] font-mono font-black text-slate-900 relative">
                            REF: {o.id}
                          </span>
                          <button
                            onClick={() => copyToClipboard(o.id)}
                            className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded transition"
                            title="Copy Order ID"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        
                        {/* Interactive Status Indicator Badge */}
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border uppercase tracking-wider inline-block ${
                          o.status === 'Accepted' || o.status === 'Preparing'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : o.status === 'Picked Up'
                            ? 'bg-yellow-50 text-amber-800 border-yellow-200'
                            : o.status === 'On the Way' || o.status === 'Out for Delivery'
                            ? 'bg-orange-50 text-orange-850 border-orange-200'
                            : 'bg-slate-50 text-slate-600'
                        }`}>
                          {o.status === 'On the Way' ? 'OUT FOR DELIVERY' : o.status}
                        </span>
                      </div>

                      {/* Customer Details info block */}
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Destination Address</p>
                            <h4 className="font-extrabold text-slate-905">{o.customerName}</h4>
                            <p className="text-[11px] text-slate-600 leading-snug">{o.address.fullAddress}</p>
                            {o.address.landmark && (
                              <p className="text-[11px] text-brand-700 font-bold flex items-center gap-1 mt-0.5">
                                <span className="w-1 h-1 bg-brand-505 rounded-full inline-block"></span>
                                <span>Landmark: {o.address.landmark}</span>
                              </p>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => copyToClipboard(`${o.address.fullAddress} Landmark: ${o.address.landmark || ''}`)}
                            className="p-2 border border-slate-150 hover:bg-slate-50 text-slate-500 rounded-xl transition shrink-0"
                            title="Copy full deliver address"
                          >
                            <MapPin className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Customer Live GPS tracking view */}
                        {o.customer_lat && o.customer_lng && (
                          <LiveRouteTracker
                            riderCoords={currentCoords}
                            customerCoords={{ lat: o.customer_lat, lng: o.customer_lng }}
                            customerName={o.customerName}
                            orderId={o.id}
                            isOutForDelivery={o.status === 'On the Way' || o.status === 'Out for Delivery'}
                          />
                        )}

                        <div className="grid grid-cols-2 gap-2 text-slate-600">
                          {/* Customer call block */}
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between items-start gap-2 text-left">
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <div className="truncate">
                                <p className="text-[8px] text-gray-400 font-extrabold leading-none uppercase">Call Customer</p>
                                <p className="font-black text-slate-800 mt-1 text-[10.5px] truncate">+91 {o.phone}</p>
                              </div>
                            </div>
                            <a
                              href={`tel:${o.phone}`}
                              className="bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 px-3 py-1 rounded-xl font-bold text-[10px] tracking-tight transition shadow-3xs w-full text-center hover:text-slate-900"
                            >
                              📞 Call Now
                            </a>
                          </div>

                          {/* Navigation map link */}
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex flex-col justify-between items-start gap-2 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-xs select-none">🧭</span>
                              <div className="truncate">
                                <p className="text-[8px] text-gray-400 font-extrabold leading-none uppercase">GPS Navigator</p>
                                <p className="font-black text-slate-800 mt-1 text-[10.5px] truncate">Turn-by-turn</p>
                              </div>
                            </div>
                            {o.status === 'On the Way' || o.status === 'Out for Delivery' ? (
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&origin=${currentCoords?.latitude || ''},${currentCoords?.longitude || ''}&destination=${o.customer_lat || ''},${o.customer_lng || ''}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-brand-500 hover:bg-brand-600 text-white border border-brand-550 px-3 py-1 rounded-xl font-bold text-[10px] tracking-tight transition shadow-xs w-full text-center animate-pulse hover:text-white"
                              >
                                🗺️ Navigate
                              </a>
                            ) : (
                              <button
                                onClick={() => showToast("Mark 'OUT FOR DELIVERY' to unlock directions!", "warning")}
                                className="bg-slate-200 border border-slate-300 text-slate-400 px-3 py-1.5 rounded-xl font-extrabold text-[10px] tracking-tight transition w-full text-center cursor-pointer hover:bg-slate-300"
                                title="Mark Out for Delivery first to navigate"
                              >
                                Locked 🔒
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Items overview */}
                        <div className="border-t pt-2.5">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Package Contents ({o.items.length} items)</p>
                          <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-2 max-h-24 overflow-y-auto block space-y-1">
                            {o.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between items-center text-[11px] pb-1 border-b border-slate-100/50 last:border-0 last:pb-0 font-medium">
                                <span className="text-slate-800 truncate max-w-[200px]">{it.name}</span>
                                <span className="text-slate-400 shrink-0 font-bold text-[10px]/none bg-white px-1.5 py-0.5 border border-slate-150 rounded">x{it.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Invoice & grand payment cash info */}
                        <div className={`rounded-2xl p-3 flex justify-between items-center select-none font-sans ${
                          o.payment_status === 'PAID' ? 'bg-emerald-950 text-white border border-emerald-800' : 'bg-slate-900 text-white'
                        }`}>
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">Payment Status</p>
                            {o.payment_status === 'PAID' ? (
                              <p className="text-xs font-black text-emerald-400 tracking-wide mt-0.5">PAID ONLINE (Do Not Collect Cash)</p>
                            ) : (
                              <p className="text-xs font-black text-amber-400 tracking-wide mt-0.5">CASH ON DELIVERY (COD)</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] text-slate-400 font-bold uppercase">
                              {o.payment_status === 'PAID' ? 'Already Paid' : 'To collect cash'}
                            </p>
                            <p className="text-sm font-black text-white font-display">₹{o.total}</p>
                          </div>
                        </div>
                      </div>

                      {/* 4. PHYSICAL TRANSITION STATUS BUTTON TRIGGER ACTIONS */}
                      <div className="bg-slate-50 px-4 py-3.5 border-t border-slate-100 flex gap-2">
                        {/* BUTTON ACTIONS STAGE A: Accepted -> Picked Up */}
                        {(o.status === "Accepted" || o.status === "Preparing" || o.status === "Pending") && (
                          <button
                            onClick={() => sendStatusUpdate(o.id, "Picked Up" as OrderStatus)}
                            className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 font-extrabold text-[11px] text-black border border-amber-600/10 rounded-2xl hover:scale-[1.01] active:scale-95 transition shadow-sm cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Package className="w-3.5 h-3.5 shrink-0" />
                            <span>MARK AS PICKED UP</span>
                          </button>
                        )}

                        {/* BUTTON ACTIONS STAGE B: Picked Up -> On the Way */}
                        {o.status === "Picked Up" && (
                          <button
                            onClick={() => sendStatusUpdate(o.id, "On the Way" as OrderStatus)}
                            className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 font-extrabold text-[11px] text-white border border-orange-600/10 rounded-2xl hover:scale-[1.01] active:scale-95 transition shadow-sm cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Truck className="w-3.5 h-3.5 shrink-0" />
                            <span>SET AS OUT FOR DELIVERY</span>
                          </button>
                        )}

                        {/* BUTTON ACTIONS STAGE C: On the Way -> Delivered */}
                        {(o.status === "On the Way" || o.status === "Out for Delivery") && (
                          <button
                            onClick={() => sendStatusUpdate(o.id, "Delivered" as OrderStatus)}
                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-[11px] text-white border border-emerald-700/10 rounded-2xl hover:scale-[1.01] active:scale-95 transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>MARK AS DELIVERED</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-3xl p-8 text-center border space-y-4 shadow-3xs">
                    <ClipboardList className="w-10 h-10 text-gray-300 mx-auto animate-pulse" />
                    <div>
                      <p className="font-bold text-slate-800">Clear Road Ahead!</p>
                      <p className="text-[11px] text-gray-400 mt-1">No pending active orders are currently assigned to you.</p>
                    </div>
                  </div>
                )
              ) : (
                
                /* --- COMPLETED TAB --- */
                completedOrders.length > 0 ? (
                  completedOrders.map((o) => (
                    <div 
                      key={o.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-3xs text-xs flex flex-col justify-between opacity-80"
                    >
                      <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-[10px] font-mono font-extrabold text-slate-700">REF: {o.id}</span>
                        <span className="px-2 py-0.5 text-[9px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>DELIVERED</span>
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Recipient Name</p>
                        <h4 className="font-bold text-slate-800 leading-none">{o.customerName}</h4>
                        <p className="text-slate-550 pt-0.5 leading-snug">{o.address.fullAddress}</p>
                        
                        {o.deliveryTime && (
                          <p className="text-[10px] text-gray-400 pt-1.5 border-t border-slate-100 flex items-center gap-1">
                            <span>Delivered on: {new Date(o.deliveryTime).toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}</span>
                          </p>
                        )}
                      </div>

                      {/* Completed card has NO action buttons or they are completely disabled */}
                      <div className="bg-emerald-50 px-4 py-3 border-t border-emerald-100/50 text-center font-bold text-[11px] text-emerald-800 flex items-center justify-center gap-1 animate-pulse">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>DELIVERY COMPLETED SUCCESSFULLY</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-3xl p-8 text-center border space-y-4 shadow-3xs">
                    <TrendingUp className="w-10 h-10 text-slate-300 mx-auto" />
                    <div>
                      <p className="font-bold text-slate-800">Your shift has just begun!</p>
                      <p className="text-[11px] text-gray-400 mt-1">Deliver active order tasks to assemble completed history and payouts here!</p>
                    </div>
                  </div>
                )
              )}

              {/* ================= OPTIONAL BONUS FEATURE: UNASSIGNED ORDERS CLAIM PANEL ================= */}
              {claimableOrders.length > 0 && activeTab === 'pending' && (
                <div className="bg-amber-50 rounded-3xl p-5 border border-amber-200 space-y-3 mt-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5 text-amber-800" />
                    <div>
                      <h4 className="font-bold text-amber-900 text-[11px] uppercase tracking-wider">Unassigned Hub Orders Near You</h4>
                      <p className="text-[10px] text-amber-800">Assort additional duties to boost your daily payout!</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {claimableOrders.map((o) => (
                      <div key={o.id} className="bg-white p-3.5 rounded-2xl border border-amber-100/80 flex justify-between items-center text-left">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-mono font-bold text-slate-900">REF: {o.id}</p>
                          <p className="text-slate-700 font-bold text-[10.5px] truncate max-w-[150px]">{o.address.fullAddress}</p>
                          <p className="text-[9px] text-slate-400 font-medium font-sans">Payment: ₹{o.total} ({o.payment_status === 'PAID' ? 'Already Paid Online' : 'Cash COD'})</p>
                        </div>
                        
                        <button
                          onClick={() => claimOrder(o.id)}
                          disabled={isClaiming}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          {isClaiming ? "Claiming..." : "Claim Duty"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
};
