import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { Order, OrderStatus } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { getDistanceKm } from '../../lib/geo';
import { DELIVERY_BOYS } from '../../lib/apiInterceptor';
import {
  Package,
  Clock,
  MapPin,
  ClipboardList,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  LogOut,
  ChevronDown,
  ChevronUp,
  User,
  Key,
  Smartphone,
  CheckCircle2,
  Phone,
  Lock,
} from 'lucide-react';

interface LiveTrackingBoardProps {
  order: Order;
  riderLocation: { latitude: number; longitude: number; updated_at?: string } | null;
  riderProfile: any;
}

const LiveTrackingBoard: React.FC<LiveTrackingBoardProps> = ({ order, riderLocation, riderProfile }) => {
  const customerLat = order.customer_lat;
  const customerLng = order.customer_lng;

  const hasRider = !!riderLocation?.latitude && !!riderLocation?.longitude;
  const hasCustomer = !!customerLat && !!customerLng;

  const distance = (hasRider && hasCustomer)
    ? getDistanceKm(riderLocation.latitude, riderLocation.longitude, customerLat, customerLng)
    : null;

  // Average speed 25 km/h + prep buffer
  const etaMins = distance ? Math.ceil((distance / 25) * 60 + 3) : null;

  return (
    <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-4 sm:p-5 space-y-4 font-sans text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-lg shadow-3xs">
            {riderProfile?.avatar || "🛵"}
          </div>
          <div className="text-left">
            <span className="text-[9px] text-brand-600 font-extrabold uppercase tracking-widest leading-none">Your Assigned Rider</span>
            <h4 className="font-extrabold text-slate-900 text-xs mt-0.5">{order.assignedRiderName || riderProfile?.name || "JangaonMart Courier"}</h4>
            <p className="text-[10px] text-gray-450">{riderProfile?.vehicle || "EV Eco Cargo Carrier"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {riderProfile?.phone && (
            <a
              href={`tel:${riderProfile.phone}`}
              className="flex-1 sm:flex-none text-center bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold px-3.5 py-2 rounded-2xl transition shadow-3xs flex items-center justify-center gap-1 hover:text-slate-900"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Contact Rider</span>
            </a>
          )}
        </div>
      </div>

      {/* Render Swiggy interactive map tracker */}
      <div className="relative w-full h-32 bg-slate-950 rounded-2xl overflow-hidden border border-slate-900 shadow-inner flex flex-col justify-end p-2 md:p-3 select-none">
        
        {/* Dot pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-45"></div>

        {/* Dynamic Map graphics using curved paths */}
        <svg className="absolute inset-0 w-full h-full p-4" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Main street pipeline overlay */}
          <path
            d="M 12 85 C 38 78, 25 45, 50 48 C 72 50, 65 24, 88 15"
            fill="none"
            stroke="#1e293b"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Glowing active path line */}
          <path
            d="M 12 85 C 38 78, 25 45, 50 48 C 72 50, 65 24, 88 15"
            fill="none"
            stroke={order.status === 'On the Way' || order.status === 'Out for Delivery' ? "#06b6d4" : "#475569"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={order.status === 'On the Way' || order.status === 'Out for Delivery' ? "5 3" : "none"}
          />

          {/* Customer destination point (house) at end (88, 15) */}
          <circle cx="88" cy="15" r="5" fill="#f43f5e" className="animate-ping opacity-35" />
          <circle cx="88" cy="15" r="3" fill="#ef4444" />

          {/* Moto-rider locator marker progressing along curves */}
          {order.status === 'On the Way' || order.status === 'Out for Delivery' ? (
            <g>
              <circle cx="48" cy="48" r="6" fill="#06b6d4" className="opacity-25 animate-ping" />
              <circle cx="48" cy="48" r="3.5" fill="#06d48b" />
            </g>
          ) : (
            // Rider at shop / awaiting pickup side (12, 85)
            <g>
              <circle cx="12" cy="85" r="5" fill="#cbd5e1" className="opacity-40" />
              <circle cx="12" cy="85" r="3" fill="#64748b" />
            </g>
          )}
        </svg>

        {/* Indicators labels overlays */}
        <div className="absolute top-2.5 left-2.5 text-[8.5px] font-bold bg-slate-900/95 backdrop-blur-xs border border-slate-800 text-slate-400 py-0.5 px-2 rounded-md uppercase">
          🏪 JangaonMart Hub
        </div>

        <div className="absolute top-2.5 right-2.5 text-[8.5px] font-bold bg-slate-900/95 backdrop-blur-xs border border-slate-800 text-slate-400 py-0.5 px-2 rounded-md uppercase">
          🏡 Your House
        </div>

        {/* Live coordinate tracking text board at map footer */}
        <div className="z-10 bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-xl p-2 flex justify-between items-center text-[9px] font-mono text-white">
          <div className="flex items-center gap-1.5 truncate text-left">
            <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'On the Way' || order.status === 'Out for Delivery' ? 'bg-cyan-400 animate-pulse' : 'bg-slate-400'}`}></span>
            <span className="text-gray-300 font-sans tracking-tight truncate max-w-[200px]">
              {order.status === 'On the Way' || order.status === 'Out for Delivery'
                ? `Rider Arjun is en-route. Watch them approach live!`
                : `Preparing packages. Rider joining pickup queue soon.`}
            </span>
          </div>
          {distance !== null ? (
            <span className="text-cyan-400 font-extrabold shrink-0 pl-2 text-right">
              🏁 {distance} km (~{etaMins}m)
            </span>
          ) : (
            <span className="text-gray-400 shrink-0 pl-2">Syncing GPS...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export const OrdersPage: React.FC = () => {
  const {
    orders,
    currentUser,
    loginUser,
    registerUser,
    logoutUser,
    reorder,
    navigate,
  } = useAppState();

  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Delivered'>('All');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Synchronized rider locations state
  const [riderLocations, setRiderLocations] = useState<any[]>(() => {
    const raw = localStorage.getItem('rider_locations');
    return raw ? JSON.parse(raw) : [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const raw = localStorage.getItem('rider_locations');
      if (raw) {
        setRiderLocations(JSON.parse(raw));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sign In / Register States
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123'); // Preset password
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [authError, setAuthError] = useState('');

  // OTP Verification Simulation fields
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (loginMethod === 'email') {
      if (!email.trim() || !email.includes('@')) {
        setAuthError('Please enter a valid email address');
        return;
      }
      try {
        await loginUser(email.trim(), '9876543210');
      } catch (err) {
        setAuthError('Authentication failed. Check constraints.');
      }
    } else {
      // Phone verification path
      const cleanPhone = phone.trim().replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setAuthError('Please enter a correct 10-digit Indian phone (e.g., 9876543210)');
        return;
      }

      if (!otpSent) {
        setOtpSent(true);
        setAuthError('');
        return;
      }

      if (otpCode.trim().length !== 4) {
        setAuthError('Please input the 4-digit OTP code sent via sms');
        return;
      }

      try {
        // Authenticate phone numbers
        await loginUser(`user-${cleanPhone}@jangaonmart.com`, cleanPhone);
        setOtpSent(false);
        setOtpCode('');
      } catch (err) {
        setAuthError('Phone sign-in failed.');
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!name.trim()) {
      setAuthError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setAuthError('A valid email address is required');
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setAuthError('Enter a valid 10-digit phone number');
      return;
    }
    if (!address.trim() || address.trim().length < 10) {
      setAuthError('Please provide a complete Jangaon delivery address');
      return;
    }

    try {
      await registerUser(name.trim(), email.trim(), cleanPhone, address.trim());
    } catch (err) {
      setAuthError('Registration aborted. Try different fields.');
    }
  };

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  // Filter orders by active customer tab
  const activeCustomerOrders = orders.filter((o) => {
    // If not logged in, can display simulated orders or guest orders (matched to uid)
    const matchesUser = o.userId === (currentUser?.uid || 'guest-user');
    if (!matchesUser) return false;

    if (activeTab === 'Pending') {
      return o.status !== 'Delivered';
    }
    if (activeTab === 'Delivered') {
      return o.status === 'Delivered';
    }
    return true;
  });

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Preparing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Out for Delivery':
        return 'bg-orange-100 text-orange-850 border-orange-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-150 text-gray-700';
    }
  };

  // Helper to map order status indices for timelines
  const getStatusStepIndex = (status: OrderStatus) => {
    const steps: OrderStatus[] = ['Pending', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
    return steps.indexOf(status);
  };

  // Timeline list items
  const timelineSteps = [
    { title: 'Ordered', desc: 'Received by store' },
    { title: 'Confirmed', desc: 'supermarket packed' },
    { title: 'Bagged & Sealed', desc: 'Dispatched soon' },
    { title: 'In Transit', desc: 'Rider on Station Rd' },
    { title: 'Delivered', desc: 'Completed at door' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 text-left">
      
      {/* 1. If customer IS NOT logged in, prompt sign in */}
      {!currentUser ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-sm max-w-md mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow">
              <SmartCircleIcon />
            </div>
            <h2 className="font-display font-black text-xl text-slate-800 tracking-tight">Access Your Orders</h2>
            <p className="text-xs text-gray-500">Sign in to track orders and save Jangaon locations</p>
          </div>

          {/* Dual Toggle tabs */}
          <div className="grid grid-cols-2 border border-slate-150 rounded-xl p-1 bg-slate-50">
            <button
              onClick={() => {
                setAuthMode('signin');
                setAuthError('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                authMode === 'signin' ? 'bg-white text-brand-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setAuthError('');
              }}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                authMode === 'register' ? 'bg-white text-brand-700 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              New Account
            </button>
          </div>

          {/* Form blocks */}
          {authMode === 'signin' ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              
              {/* Login selection method tabs */}
              <div className="flex gap-4 justify-center py-1">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('email');
                    setAuthError('');
                    setOtpSent(false);
                  }}
                  className={`text-xs font-semibold ${
                    loginMethod === 'email' ? 'text-brand-650 underline decoration-2 underline-offset-4' : 'text-gray-400'
                  }`}
                >
                  Email & Password
                </button>
                <span className="text-gray-200">|</span>
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod('phone');
                    setAuthError('');
                    setOtpSent(false);
                  }}
                  className={`text-xs font-semibold ${
                    loginMethod === 'phone' ? 'text-brand-650 underline decoration-2 underline-offset-4' : 'text-gray-400'
                  }`}
                >
                  WhatsApp OTP Verify
                </button>
              </div>

              {loginMethod === 'email' ? (
                <div className="space-y-3">
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold text-gray-500">Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="e.g., shru@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                      />
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <div className="flex justify-between">
                      <label className="text-[11px] font-bold text-gray-500">Password</label>
                    </div>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                        required
                      />
                      <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Phone and simulated OTP login pattern */
                <div className="space-y-3">
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold text-gray-500">WhatsApp / Mobile Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={10}
                        placeholder="10-digit phone (e.g., 9876543210)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none"
                        disabled={otpSent}
                        required
                      />
                      <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {otpSent && (
                    <div className="space-y-1 text-left animate-in slide-in-from-top-2 duration-150">
                      <div className="flex justify-between items-center bg-brand-50 text-brand-900 p-2.5 rounded-xl border border-brand-100 text-[10px] font-medium leading-relaxed mb-2">
                        <span>Simulated OTP Code 4432 dispatched via WhatsApp!</span>
                      </div>
                      <label className="text-[11px] font-bold text-gray-500">Enter Verified 4-Digit OTP Code</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="Enter 4432 to test"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50/50 rounded-xl focus:outline-none text-center font-mono letter-spacing-4 tracking-widest text-base"
                        required
                      />
                    </div>
                  )}
                </div>
              )}

              {authError && <p className="text-[10px] text-red-500 font-semibold">{authError}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
              >
                {loginMethod === 'phone' && !otpSent ? 'Send OTP Code' : 'Verify & Continue'}
              </button>
            </form>
          ) : (
            /* Register fields form */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-505">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g., Shruthi Balde"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-505">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g., shruthi@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-505">Mobile Phone (WhatsApp)</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-505">Doorstep Address in Jangaon</label>
                <textarea
                  placeholder="H.No, Area name, JangaonTown"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50"
                  required
                />
              </div>

              {authError && <p className="text-[10px] text-red-500 font-semibold">{authError}</p>}

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs cursor-pointer shadow"
              >
                Create Account & Sign In
              </button>
            </form>
          )}

          {/* Quick preset account load indicator */}
          {authMode === 'signin' && (
            <div className="border-t border-slate-100 pt-3.5 text-center">
              <span className="text-[10px] text-gray-400">Quick Test Credentials:</span>
              <div className="flex gap-2 justify-center mt-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('shruthi@jangaonmart.com');
                    setPassword('admin123');
                    setLoginMethod('email');
                  }}
                  className="bg-slate-50 hover:bg-slate-100 text-[10px] border px-2 py-1 rounded text-slate-650 font-bold transition"
                >
                  Shruthi (Default User)
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* 2. Logged in customer view panel */
        <div className="space-y-6">
          
          {/* Header profile welcome section */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-lg font-bold shadow shadow-brand-500/20 uppercase">
                {currentUser.name[0]}
              </div>
              <div className="space-y-0.5">
                <h1 className="font-display font-extrabold text-xl text-slate-800">
                  Welcome to JangaonMart, {currentUser.name}!
                </h1>
                <p className="text-xs text-gray-450 leading-relaxed">
                  Ref: {currentUser.email} • Mobile: +91 {currentUser.phone}
                </p>
              </div>
            </div>

            <button
              onClick={logoutUser}
              className="px-3.5 py-2 hover:bg-red-50 border border-slate-150 rounded-xl text-xs font-bold text-red-650 transition flex items-center gap-1.5 hover:border-red-100"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>

          {/* Order selection tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-3">
            
            {/* Toggles */}
            <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border">
              {(['All', 'Pending', 'Delivered'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    activeTab === tab
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-550/10'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab} Orders
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 font-medium">
              Showing {activeCustomerOrders.length} orders
            </p>
          </div>

          {/* Orders History List with expanding timelines */}
          {activeCustomerOrders.length > 0 ? (
            <div className="space-y-4">
              {activeCustomerOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                const activeStep = getStatusStepIndex(order.status);

                return (
                  <div
                    key={order.id}
                    className={`bg-white border rounded-3xl transition overflow-hidden shadow-xs ${
                      isExpanded ? 'border-brand-500/30 shadow-md' : 'border-slate-100 hover:border-slate-350'
                    }`}
                  >
                    {/* Collapsed view summary */}
                    <div
                      onClick={() => toggleExpandOrder(order.id)}
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border flex items-center justify-center text-slate-705 shrink-0">
                          <Package className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-black text-slate-800">{order.id}</span>
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                          
                          <p className="text-[10px] text-gray-400">
                            Ordered: {new Date(order.orderDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Pricing + Chevron controls */}
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between max-sm:border-t max-sm:pt-2.5 border-slate-50">
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-gray-400 font-medium">{order.items.length} items</p>
                          <p className="text-sm font-black text-brand-600 font-display">₹{order.total}</p>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400">
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </div>
                    </div>

                    {/* Expanded details container */}
                    {isExpanded && (
                      <div className="border-t border-slate-50 p-5 sm:p-6 bg-slate-50/40 space-y-6 animate-in slide-in-from-top-2 duration-200">
                        
                        {/* 1. Dynamic Real-time tracking timeline bar */}
                        <div className="space-y-4">
                          <p className="text-[10px] text-center text-brand-650 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Real-Time Hyperlocal Dispatch Timeline</span>
                          </p>
                          
                          <div className="grid grid-cols-5 gap-1.5 relative pt-4 pb-2 text-center select-none">
                            {/* Connect Line */}
                            <div className="absolute top-6 left-5 right-5 h-1 bg-gray-250 z-0">
                              <div
                                className="h-full bg-brand-500 transition-all duration-500"
                                style={{ width: `${(activeStep / 4) * 100}%` }}
                              />
                            </div>

                            {timelineSteps.map((step, idx) => {
                              const isCompleted = activeStep >= idx;
                              const isActive = activeStep === idx;
                              return (
                                <div key={step.title} className="flex flex-col items-center space-y-2 z-10 relative">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition ${
                                      isActive
                                        ? 'bg-brand-600 border-white text-white shadow shadow-brand-500 ring-2 ring-brand-500 ring-offset-2'
                                        : isCompleted
                                        ? 'bg-brand-500 border-white text-white'
                                        : 'bg-white border-gray-300 text-gray-400'
                                    }`}
                                  >
                                    <span className="text-[10px] font-bold">{idx + 1}</span>
                                  </div>
                                  <div className="space-y-0.5">
                                    <p className={`text-[10px] font-bold ${isActive ? 'text-brand-700 font-extrabold' : isCompleted ? 'text-gray-805' : 'text-gray-400'}`}>
                                      {step.title}
                                    </p>
                                    <p className="hidden md:block text-[9px] text-gray-400">{step.desc}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Live Dispatch Rider Track Map, if assigned */}
                        {order.deliveryBoyId && (
                          <LiveTrackingBoard
                            order={order}
                            riderLocation={riderLocations.find((loc: any) => loc.rider_id === order.deliveryBoyId) || null}
                            riderProfile={DELIVERY_BOYS.find(b => b.id === order.deliveryBoyId) || null}
                          />
                        )}

                        {/* 2. Items list detail */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          
                          <div className="space-y-3">
                            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Groceries Checked</p>
                            <div className="space-y-2 bg-white rounded-2xl border p-4 max-h-56 overflow-y-auto">
                              {order.items.map((item) => (
                                <div key={item.productId} className="flex justify-between items-center text-xs py-1">
                                  <span className="font-medium text-gray-800 shrink-0 select-none truncate max-w-[155px]">
                                    {item.name}
                                  </span>
                                  <span className="text-gray-400 text-[11px]">x{item.quantity}</span>
                                  <span className="font-semibold text-gray-900 shrink-0">₹{item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery Destination info */}
                          <div className="space-y-4">
                            <div className="space-y-1.5 text-xs text-slate-600">
                              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Delivery Address</p>
                              <div className="bg-white rounded-2xl border p-4 space-y-1.5">
                                <p className="font-bold text-gray-900">{order.customerName}</p>
                                <p className="leading-tight text-gray-500">{order.address.fullAddress}</p>
                                {order.address.landmark && (
                                  <p className="text-[10px] text-brand-700 bg-brand-50 rounded pl-1 font-bold inline-block">
                                    Landmark: {order.address.landmark}
                                  </p>
                                )}
                                <p className="pt-2 border-t border-slate-50 text-[10px] text-slate-400 tracking-wide font-semibold mt-1">
                                  SLOT: {order.address.deliverySlot}
                                </p>
                              </div>
                            </div>

                            {/* Easy Reordering button triggers */}
                            <button
                              onClick={() => reorder(order)}
                              className="w-full py-3.5 bg-brand-50 hover:bg-brand-600 text-brand-750 hover:text-white border border-brand-200 font-extrabold rounded-2xl text-xs transition cursor-pointer select-none flex items-center justify-center gap-1.5 hover:shadow hover:shadow-brand-50"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Reorder All Items</span>
                            </button>
                          </div>

                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty list of orders */
            <div className="bg-white border rounded-3xl p-10 text-center max-w-md mx-auto space-y-3">
              <ClipboardList className="w-10 h-10 text-gray-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-display font-bold text-gray-750">No Orders Placed Yet</h3>
                <p className="text-xs text-gray-400">
                  Your current history is clear. Order from the grocery library above to watch it progress.
                </p>
              </div>
              <button
                onClick={() => navigate('#/products')}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold"
              >
                Browse Grocery Catalog
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

// Simple Icon fallback helper
const SmartCircleIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
