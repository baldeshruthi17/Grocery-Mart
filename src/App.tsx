import React, { useEffect } from 'react';
import { StateProvider, useAppState } from './context/StateContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';

// Customer pages
import { HomePage } from './pages/customer/HomePage';
import { ProductsPage } from './pages/customer/ProductsPage';
import { ProductDetailsPage } from './pages/customer/ProductDetailsPage';
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrderSuccessPage } from './pages/customer/OrderSuccessPage';
import { OrdersPage } from './pages/customer/OrdersPage';

// Admin page portal hub & login gate
import { AdminHub } from './pages/admin/AdminHub';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

// Delivery Boy / Rider Dashboard Page
import { DeliveryDashboardPage } from './pages/delivery/DeliveryDashboardPage';

const AppContent: React.FC = () => {
  const { currentPath, currentAdmin, navigate, showToast } = useAppState();

  const cleanPath = currentPath.split('?')[0] || '';

  const isRiderRoute = cleanPath === '#/delivery';

  // Protected Admin route redirection and enforcement logic
  useEffect(() => {
    if (cleanPath.startsWith('#/admin') && !currentAdmin) {
      // Direct access attempt to dashboard without authenticating: Redirect immediately & alert
      navigate('#/');
      showToast('Unauthorized access. Admin authentication credentials required.', 'error');
    } else if (cleanPath === '#/store-control' && currentAdmin) {
      // If user logs in successfully, redirect them to the active admin panel
      navigate('#/admin');
    }
  }, [cleanPath, currentAdmin]);

  // Route selector matching hashes
  const renderActiveRoute = () => {
    if (cleanPath === '' || cleanPath === '#/') {
      return <HomePage />;
    }
    if (cleanPath === '#/products') {
      return <ProductsPage />;
    }
    if (cleanPath.startsWith('#/product/')) {
      return <ProductDetailsPage />;
    }
    if (cleanPath === '#/cart') {
      return <CartPage />;
    }
    if (cleanPath.startsWith('#/checkout')) {
      return <CheckoutPage />;
    }
    if (cleanPath.startsWith('#/order-success')) {
      return <OrderSuccessPage />;
    }
    if (cleanPath === '#/orders') {
      return <OrdersPage />;
    }
    if (cleanPath.startsWith('#/admin')) {
      if (!currentAdmin) {
        // Render fallback home content briefly while route redirects
        return <HomePage />;
      }
      return <AdminHub />;
    }
    if (cleanPath === '#/store-control') {
      if (currentAdmin) {
        return <AdminHub />;
      }
      return <AdminLoginPage />;
    }
    if (cleanPath === '#/delivery') {
      return <DeliveryDashboardPage />;
    }

    // Default fallback to HomePage
    return <HomePage />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 font-sans antialiased selection:bg-brand-500 selection:text-white">
      
      {/* Universal Sticky Header - Hidden for Rider Route for standalone mobile experience */}
      {!isRiderRoute && <Header />}

      {/* Main viewport area, centering layout fluidly */}
      <main className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200 ${isRiderRoute ? 'pt-4 pb-12' : ''}`}>
        {renderActiveRoute()}
      </main>

      {/* Universal Footer section - Hidden for Rider Route */}
      {!isRiderRoute && <Footer />}

      {/* Reusable Toast Notifications with animated banners */}
      <ToastContainer />

    </div>
  );
};

export default function App() {
  return (
    <StateProvider>
      <AppContent />
    </StateProvider>
  );
}
