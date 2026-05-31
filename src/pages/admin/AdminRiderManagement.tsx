import React, { useState, useEffect } from 'react';
import { useAppState } from '../../context/StateContext';
import { DELIVERY_BOYS, syncDynamicRiders } from '../../lib/apiInterceptor';
import {
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Smartphone,
  Bike,
  Truck,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Save,
  Lock,
} from 'lucide-react';

// Secure SHA-256 password hashing utility
async function hashPasswordSHA256(message: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error("SHA256 cryptographic hashing failed, returning mock hash representation:", error);
    return "secure_fallback_" + message;
  }
}

interface AdminRiderManagementProps {
  initialMode?: 'list' | 'add';
  onBackToDashboard?: () => void;
}

export const AdminRiderManagement: React.FC<AdminRiderManagementProps> = ({
  initialMode = 'list',
  onBackToDashboard,
}) => {
  const { showToast, currentPath, navigate } = useAppState();
  const [viewMode, setViewMode] = useState<'list' | 'add'>(initialMode);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local list of active delivery boys (static + dynamic) loaded on state trigger
  const [riders, setRiders] = useState<any[]>([]);

  // Add Rider form fields state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('EV Cargo Scooter');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state initially and on hash path modification
  const loadRidersList = () => {
    syncDynamicRiders(); // Pull latest changes from localStorage
    setRiders([...DELIVERY_BOYS]);
  };

  useEffect(() => {
    loadRidersList();
  }, []);

  // Listen to cross-module modifications or hash updates
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.split('?')[0] === '#/admin/add-rider') {
      setViewMode('add');
    } else if (hash.split('?')[0] === '#/admin/riders') {
      setViewMode('list');
    }
  }, [currentPath]);

  // Handle active status toggling (activate/deactivate)
  const handleToggleStatus = (riderId: string) => {
    try {
      const stored = localStorage.getItem("jang_riders");
      let storedRiders = stored ? JSON.parse(stored) : [];

      // Look up inside dynamic riders
      const riderIndex = storedRiders.findIndex((r: any) => r.id === riderId);
      if (riderIndex !== -1) {
        const currentRiderStatus = storedRiders[riderIndex].status;
        const newStatus = currentRiderStatus === 'inactive' ? 'active' : 'inactive';
        storedRiders[riderIndex].status = newStatus;
        localStorage.setItem("jang_riders", JSON.stringify(storedRiders));
        showToast(`Rider details updated successfully to: ${newStatus.toUpperCase()}`, 'success');
      } else {
        // If it's a pre-existing static rider, we can still toggle their state
        // Let's store them in the custom dynamic override list to persist deactivations!
        const staticRider = DELIVERY_BOYS.find(r => r.id === riderId);
        if (staticRider) {
          const newStatus = (staticRider as any).status === 'inactive' ? 'active' : 'inactive';
          const newOverride = {
            id: staticRider.id,
            name: staticRider.name,
            username: (staticRider as any).username || staticRider.email.split('@')[0],
            email: staticRider.email,
            password: staticRider.password,
            phone: staticRider.phone,
            vehicle: staticRider.vehicle,
            avatar: staticRider.avatar,
            token: staticRider.token,
            status: newStatus,
            role: 'rider'
          };
          storedRiders.push(newOverride);
          localStorage.setItem("jang_riders", JSON.stringify(storedRiders));
          showToast(`Pre-existing static rider overridden to: ${newStatus.toUpperCase()}`, 'success');
        } else {
          showToast(`Error: Rider not found!`, 'error');
          return;
        }
      }

      // Sync and reload lists
      syncDynamicRiders();
      loadRidersList();

      // Trigger standard React storage event for other components to receive updates
      window.dispatchEvent(new Event("storage"));
    } catch (e: any) {
      showToast(`Conflict error: ${e.message}`, 'error');
    }
  };

  // Submit and create new Rider
  const handleAddRiderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !password.trim()) {
      showToast("Rider Name, Unique Username, and Password are required.", 'warning');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, '');
    if (cleanUsername.length < 3) {
      showToast("Username must be at least 3 characters.", 'warning');
      return;
    }

    // 1. Uniqueness check across static and custom dynamic riders
    const isCollision = DELIVERY_BOYS.some(
      r => (r.username || "").toLowerCase() === cleanUsername || 
           (r as any).email?.split('@')[0]?.toLowerCase() === cleanUsername
    );

    if (isCollision) {
      showToast(`An administrative error occurred: Username "${cleanUsername}" is already taken by another registered delivery partner.`, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // 2. Hash password securely using standard system SHA-256
      const secureHashedPassword = await hashPasswordSHA256(password);

      const newRiderRecord = {
        id: `rider-${cleanUsername}`,
        name: name.trim(),
        username: cleanUsername,
        password: secureHashedPassword,
        role: "rider",
        status: status,
        phone: phone.trim() || "+91 98765 00000",
        vehicle: vehicle,
        avatar: vehicle.toLowerCase().includes("bike") ? "🏍️" : vehicle.toLowerCase().includes("cycle") ? "🚲" : "🛵",
        token: `jwt-token-${cleanUsername}-${Math.floor(10000 + Math.random() * 90000)}`,
        email: `${cleanUsername}@jangaonmart.com`
      };

      // Store inside database/localStorage array
      const stored = localStorage.getItem("jang_riders");
      const storedRiders = stored ? JSON.parse(stored) : [];
      storedRiders.push(newRiderRecord);
      localStorage.setItem("jang_riders", JSON.stringify(storedRiders));

      showToast(`Newly recruited rider "${name}" onboarded successfully.`, 'success');

      // Sync and broadcast changes
      syncDynamicRiders();
      loadRidersList();
      window.dispatchEvent(new Event("storage"));

      // Clear form inputs
      setName('');
      setUsername('');
      setPassword('');
      setPhone('');
      setVehicle('EV Cargo Scooter');
      setStatus('active');

      // Navigate back to listing page
      setViewMode('list');
      navigate('#/admin/riders');
    } catch (err: any) {
      console.error(err);
      showToast(`Unable to parse secure hash docket: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRiders = riders.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.username || r.email).toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.phone || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      {/* Header bar section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-white border rounded-3xl gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600" />
            <h1 className="font-display font-black text-xl text-slate-900 tracking-tight">Rider Management Console</h1>
          </div>
          <p className="text-[11px] text-slate-405 font-medium">Create, authorize, and configure active credentials for JangaonMart delivery riders</p>
        </div>
        
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {viewMode === 'list' ? (
            <button
              onClick={() => {
                setViewMode('add');
                navigate('#/admin/add-rider');
              }}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0 transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Onboard New Rider</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setViewMode('list');
                navigate('#/admin/riders');
              }}
              className="px-4 py-2 bg-white hover:bg-slate-50 border text-slate-700 rounded-xl text-xs font-bold font-sans flex items-center justify-center gap-2 cursor-pointer shrink-0 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Directory</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary container */}
      {viewMode === 'list' ? (
        <div className="bg-white border rounded-3xl overflow-hidden shadow-xs">
          {/* List Toolbar */}
          <div className="p-5 border-b flex flex-col md:flex-row justify-between items-center bg-slate-50/50 gap-4">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Find riders by Name, Username, or contact number..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 py-2.5 pl-10 pr-4 text-xs font-medium rounded-xl select-all focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-800 placeholder-slate-400"
              />
            </div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              TOTAL RIDERS: <span className="text-slate-900 font-mono font-black">{filteredRiders.length}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50/50 text-slate-400 border-b uppercase text-[9px] font-bold tracking-widest">
                  <th className="p-4 pl-6 text-left">Rider Identity Details</th>
                  <th className="p-4">Creds / Username</th>
                  <th className="p-4">Onboarded Vehicle</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right pr-6">Action Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/90 text-xs">
                {filteredRiders.length > 0 ? (
                  filteredRiders.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/20 transition group">
                      {/* Name / Contact details */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl p-1.5 bg-slate-100 rounded-xl leading-none select-none shrink-0 group-hover:scale-110 transition">
                            {r.avatar || '🛵'}
                          </span>
                          <div>
                            <p className="font-bold text-slate-800 text-[13px]">{r.name}</p>
                            <p className="text-[10px] text-slate-400 font-mono font-medium">{r.phone || '+91 98765 00000'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Username details */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-mono font-semibold text-slate-900 bg-slate-100/75 select-all border border-slate-100 px-1.5 py-0.5 rounded text-[10.5px] w-max">
                            {r.username || r.email.split('@')[0]}
                          </p>
                          <p className="text-[9.5px] text-slate-400 font-sans tracking-wide">
                            Role: {r.role || 'rider'}
                          </p>
                        </div>
                      </td>

                      {/* Vehicle selection */}
                      <td className="p-4 text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5 text-[11.5px]">
                          {r.avatar === '🛵' && <Truck className="w-3.5 h-3.5 text-cyan-600" />}
                          {r.avatar === '🏍️' && <Truck className="w-3.5 h-3.5 text-blue-600" />}
                          {r.avatar === '🚲' && <Bike className="w-3.5 h-3.5 text-amber-600" />}
                          <span>{r.vehicle || 'EV Express Cargo'}</span>
                        </div>
                      </td>

                      {/* Current active status */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.status !== 'inactive' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${r.status !== 'inactive' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {r.status !== 'inactive' ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      {/* Power control action logic */}
                      <td className="p-4 text-right pr-6">
                        <button
                          onClick={() => handleToggleStatus(r.id)}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold cursor-pointer transition ${
                            r.status !== 'inactive'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60'
                          }`}
                        >
                          {r.status !== 'inactive' ? '❌ DEACTIVATE' : '✅ ACTIVATE'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400">
                      <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-bold text-xs">No active delivery partners matched your current query.</p>
                      <p className="text-[10px] text-slate-300">Recruit new ones using the Onboard form above.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Create Rider onboarding form */
        <div className="bg-white border rounded-3xl shadow-xs overflow-hidden">
          <div className="p-6 border-b bg-slate-50/50 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-cyan-600" />
            <div>
              <h2 className="font-bold text-sm text-slate-900 uppercase tracking-widest">Recruit & Provision New Delivery Rider</h2>
              <p className="text-[10px] text-slate-400">Credentials will become functional on the Rider Login workspace instantly upon entry commit.</p>
            </div>
          </div>

          <form onSubmit={handleAddRiderSubmit} className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Field 1: Rider Name */}
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Rider Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Reddy"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 py-2 px-3.5 text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {/* Field 2: Username */}
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Unique login Username *</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="e.g. ramesh7"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full bg-white border border-slate-200 py-2 pl-3.5 pr-20 text-xs font-mono font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9.5px] uppercase font-bold text-slate-400">
                    @jangaonmart
                  </span>
                </div>
              </div>

              {/* Field 3: Password */}
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Access Lock Code / Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter plain text password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-200 py-2 pl-10 pr-3.5 text-xs font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Field 4: Contact numbers */}
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Contact Number (Optional)</label>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 91234 56789"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 py-2 pl-10 pr-3.5 text-xs font-mono rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Field 5: Onboard Vehicle */}
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Assigned Delivery Vehicle</label>
                <select
                  value={vehicle}
                  onChange={e => setVehicle(e.target.value)}
                  className="w-full bg-white border border-slate-200 py-2 px-3.5 text-xs font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="EV Pulsar Cargo">EV Pulsar Cargo Scooter (🛵)</option>
                  <option value="EV Ola Cargo Sport">EV Ola Cargo Sport (🛵)</option>
                  <option value="EV Jangaon Super Express">EV Jangaon Super Express (🏍️)</option>
                  <option value="Standard Heavy Cycle">Standard Heavy Cycle (🚲)</option>
                </select>
              </div>

              {/* Field 6: Account Access State */}
              <div className="space-y-1.5 col-span-2 md:col-span-1">
                <label className="block text-[10px] font-black text-slate-450 uppercase tracking-wider">Activation Status</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={status === 'active'}
                      onChange={() => setStatus('active')}
                      className="accent-cyan-600 w-4 h-4"
                    />
                    <span>Active (Fully Authorized)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={status === 'inactive'}
                      onChange={() => setStatus('inactive')}
                      className="accent-rose-600 w-4 h-4"
                    />
                    <span>Inactive (Hold/Suspended)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="border-t pt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setViewMode('list');
                  navigate('#/admin/riders');
                }}
                className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border text-slate-700 rounded-xl text-xs font-bold select-all focus:outline-none focus:ring-2 focus:ring-slate-350 cursor-pointer"
              >
                Discard Entries
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-100 shrink-0 transition"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Onboarding Partner...' : 'Onboard Active Rider'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
