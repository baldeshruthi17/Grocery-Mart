import React from 'react';
import { useAppState } from '../context/StateContext';
import { ShoppingBag, Phone, Mail, MapPin, ShieldCheck, Heart, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate, currentUser, currentAdmin } = useAppState();

  // Retrieve delivery boy session state from localStorage and keep synced
  const [hasRider, setHasRider] = React.useState(() => {
    return !!localStorage.getItem('jang_rider_auth');
  });

  React.useEffect(() => {
    const checkRider = () => {
      setHasRider(!!localStorage.getItem('jang_rider_auth'));
    };
    window.addEventListener('storage', checkRider);
    checkRider();
    return () => {
      window.removeEventListener('storage', checkRider);
    };
  }, [currentUser, currentAdmin]);

  // Show only if not logged in as Customer, Admin, or Rider
  const showDeliveryLogin = !currentUser && !currentAdmin && !hasRider;

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => navigate('#/')}>
              <div className="bg-brand-600 text-white p-2 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-display text-xl font-extrabold tracking-tight text-white">
                Jangaon<span className="text-brand-500">Mart</span>
              </span>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed">
              Jangaon's very own hyperlocal online grocery store. Bringing fresh farm vegetables, dairy, grains, and staples straight to your doorstep within 60 minutes.
            </p>

            <div className="flex items-center gap-2 pt-2 text-brand-400">
              <Clock className="w-4 h-4 animate-spin-slow" />
              <span className="text-xs font-bold uppercase tracking-wider">Fast delivery: 8:00 AM - 10:00 PM</span>
            </div>
          </div>

          {/* Quick categories navigation */}
          <div>
            <h3 className="text-white font-display font-bold text-sm tracking-widest uppercase mb-4">
              Grocery Categories
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span onClick={() => navigate('#/products')} className="hover:text-white transition cursor-pointer text-gray-400">
                  Staples & Flours
                </span>
              </li>
              <li>
                <span onClick={() => navigate('#/products')} className="hover:text-white transition cursor-pointer text-gray-400">
                  Rice & Grains
                </span>
              </li>
              <li>
                <span onClick={() => navigate('#/products')} className="hover:text-white transition cursor-pointer text-gray-400">
                  Farm Fresh Vegetables
                </span>
              </li>
              <li>
                <span onClick={() => navigate('#/products')} className="hover:text-white transition cursor-pointer text-gray-400">
                  Dairy & Premium Cheese
                </span>
              </li>
              <li>
                <span onClick={() => navigate('#/products')} className="hover:text-white transition cursor-pointer text-gray-400">
                  Snacks & Beverages
                </span>
              </li>
            </ul>
          </div>

          {/* Hyperlocal landmarks where we deliver */}
          <div>
            <h3 className="text-white font-display font-bold text-sm tracking-widest uppercase mb-4">
              Jangaon Coverage Area
            </h3>
            <p className="text-xs text-gray-400 mb-3">
              We deliver to any doorstep within 5km of Jangaon Town, including:
            </p>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-xs text-gray-400">
              <li className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                <span>Station Road</span>
              </li>
              <li className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                <span>Siddipet Road</span>
              </li>
              <li className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                <span>Chowrasta Area</span>
              </li>
              <li className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                <span>Court Colony</span>
              </li>
              <li className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                <span>Dharmakancharam</span>
              </li>
              <li className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-brand-500 shrink-0" />
                <span>Narmetta Road</span>
              </li>
            </ul>
          </div>

          {/* Contact Support */}
          <div className="space-y-4">
            <h3 className="text-white font-display font-bold text-sm tracking-widest uppercase">
              Get in Touch
            </h3>
            
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300">
                <Phone className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Call Jangaon Store</p>
                <p className="font-semibold text-gray-200">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-300">
                <Mail className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email Support</p>
                <p className="font-semibold text-gray-200">orders@jangaonmart.com</p>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-gray-500 border-t border-gray-800 flex items-center gap-1.5 justify-start">
              <ShieldCheck className="w-4 h-4 text-brand-500" />
              <span>Verified Supermarket Partners in Jangaon</span>
            </div>
          </div>

        </div>

        {/* Footer Bottom copyright area */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} JangaonMart. Developed for Jangaon, Telangana, India.</p>
          <div className="flex items-center gap-3">
            {showDeliveryLogin && (
              <>
                <a href="#/delivery" className="hover:text-white transition">Delivery Partner login</a>
                <span>•</span>
              </>
            )}
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3 h-3 fill-red-500 text-red-500" /> in Jangaon
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
