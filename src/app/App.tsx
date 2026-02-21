import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import logoUrl from '../Goodrich logo.png';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SplashScreen } from './components/SplashScreen';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { FarmPracticesPage } from './pages/FarmPracticesPage';
import { ShopPage } from './pages/ShopPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentPage } from './pages/PaymentPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { AccountPage } from './pages/AccountPage';
import { Toaster } from './components/ui/sonner';
import { AppChatWidget } from './components/AppChatWidget';
import { toApiUrl } from './lib/api';

function AppContent() {
  const { currentPage, setCurrentPage, language } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === 'string') {
        if (input.startsWith('/api/') || input === '/api' || input.startsWith('/uploads/')) {
          return originalFetch(toApiUrl(input), init);
        }
      } else if (input instanceof Request) {
        const currentOrigin = window.location.origin;
        if (input.url.startsWith(`${currentOrigin}/api/`) || input.url.startsWith(`${currentOrigin}/uploads/`)) {
          const rewrittenUrl = input.url.replace(currentOrigin, '').replace(/^/, '');
          return originalFetch(toApiUrl(rewrittenUrl), init);
        }
      }
      return originalFetch(input, init);
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  useEffect(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 0, 0, size, size);
      ctx.restore();

      const href = canvas.toDataURL('image/png');
      let link = document.querySelector("link[rel='icon']");
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'icon');
        document.head.appendChild(link);
      }
      link.setAttribute('type', 'image/png');
      link.setAttribute('href', href);
    };
    img.src = logoUrl;
  }, []);

  useEffect(() => {
    const syncFromPath = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin-dashboard') {
        setCurrentPage('admin');
      } else if (path === '/account') {
        setCurrentPage('account');
      } else if (path === '/forgot-password') {
        setCurrentPage('forgot-password');
      } else if (path === '/reset-password') {
        setCurrentPage('reset-password');
      }
    };
    syncFromPath();
    window.addEventListener('popstate', syncFromPath);
    return () => window.removeEventListener('popstate', syncFromPath);
  }, [setCurrentPage]);
  
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'about':
        return <AboutPage />;
      case 'practices':
        return <FarmPracticesPage />;
      case 'shop':
        return <ShopPage />;
      case 'gallery':
        return <GalleryPage />;
      case 'contact':
        return <ContactPage />;
      case 'cart':
        return <CartPage />;
      case 'login':
        return <LoginPage />;
      case 'forgot-password':
        return <ForgotPasswordPage />;
      case 'reset-password':
        return <ResetPasswordPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'payment':
        return <PaymentPage />;
      case 'orders':
        return <OrderHistoryPage />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'admin':
        return <AdminPage />;
      case 'account':
        return <AccountPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {showSplash ? (
        <SplashScreen />
      ) : (
        <>
          <Header />
          <main className="flex-1">
            {renderPage()}
          </main>
          <Footer />
        </>
      )}
      <Toaster />
      {!showSplash ? <AppChatWidget /> : null}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
