import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import logoImage from '../../Goodrich logo.png';

export function Header() {
  const { currentPage, setCurrentPage, cart, isAdmin, adminLogout, isUserLoggedIn, userLogout, authUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Show number of distinct cart line items as notification count (not total trays)
  const totalItems = cart.length;
  // Keep total trays for order details or summaries
  const totalTrays = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'practices', label: 'Farm Practices' },
    { id: 'shop', label: 'Shop' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' },
  ];

  const profileInitials = () => {
    const source = authUser?.name || authUser?.email || 'U';
    const parts = source.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };
  
  const handleNavClick = (pageId: string) => {
    setCurrentPage(pageId);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-[#A0522D] bg-[#8B4513] shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img 
              src={logoImage}
              alt="Goodrich Farm Logo"
              className="h-14 w-14 rounded-full border-2 border-[#FFD700] bg-white p-1 object-cover"
            />
            <div className="hidden sm:block">
              <div className="text-2xl font-bold text-[#FFFDD0]">Goodrich</div>
              <div className="text-xs text-[#FAF3E0]">Fresh Farm Eggs</div>
            </div>
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  currentPage === item.id
                    ? 'bg-[#C41E3A] text-white'
                    : 'text-[#FFFDD0] hover:bg-[#A0522D]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
          
          {/* Cart & Admin */}
          <div className="flex items-center gap-3">
            {isAdmin && (
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="secondary" className="bg-[#FFD700] text-[#3D2817]">
                  Admin
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={adminLogout}
                  className="text-[#FFFDD0] hover:bg-[#A0522D]"
                >
                  Logout
                </Button>
              </div>
            )}
            {isUserLoggedIn && (
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="secondary" className="bg-[#FFD700] text-[#3D2817]">
                  User
                </Badge>
              </div>
            )}

            <button
              onClick={() => {
                if (isUserLoggedIn) {
                  handleNavClick('account');
                  return;
                }
                sessionStorage.setItem('postLoginRedirect', 'account');
                handleNavClick('login');
              }}
              title={isUserLoggedIn ? 'My Account' : 'Sign In'}
              className="relative h-11 w-11 rounded-full border-2 border-[#FFD700] bg-white flex items-center justify-center overflow-hidden"
            >
              {authUser?.avatarUrl ? (
                <img
                  src={authUser.avatarUrl}
                  alt={authUser.name || 'User'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-[#8B4513]">
                  {isUserLoggedIn ? profileInitials() : <User className="h-5 w-5" />}
                </span>
              )}
            </button>
            
            <button
              onClick={() => handleNavClick('cart')}
              title={`Items: ${totalItems} * Trays: ${totalTrays}`}
              className="relative p-2 rounded-md bg-[#C41E3A] text-white hover:bg-[#FF6B6B] transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-[#FFD700] text-[#3D2817] border-2 border-[#8B4513]">
                  {totalItems}
                </Badge>
              )}
            </button>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-[#FFFDD0] hover:bg-[#A0522D] transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 border-t border-[#A0522D] mt-2 pt-4">
            <div className="flex flex-col gap-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-4 py-3 rounded-md text-left transition-colors ${
                    currentPage === item.id
                      ? 'bg-[#C41E3A] text-white'
                      : 'text-[#FFFDD0] hover:bg-[#A0522D]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  if (isUserLoggedIn) {
                    handleNavClick('account');
                    return;
                  }
                  sessionStorage.setItem('postLoginRedirect', 'account');
                  handleNavClick('login');
                }}
                className="px-4 py-3 rounded-md text-left text-[#FFFDD0] hover:bg-[#A0522D] transition-colors"
              >
                {isUserLoggedIn ? 'My Account' : 'Sign In'}
              </button>
              {isAdmin && (
                <>
                  <div className="px-4 py-2 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-[#FFD700] text-[#3D2817]">
                      Admin Mode
                    </Badge>
                  </div>
                  <button
                    onClick={() => {
                      adminLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-md text-left text-[#FFFDD0] hover:bg-[#A0522D] transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
              {isUserLoggedIn && (
                <>
                  <div className="px-4 py-2 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-[#FFD700] text-[#3D2817]">
                      User
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

