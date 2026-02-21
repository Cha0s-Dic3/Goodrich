import { ShoppingCart, Menu, X, User, Languages } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import logoImage from '../../Goodrich logo.png';
import { toAssetUrl } from '../lib/api';

export function Header() {
  const { currentPage, setCurrentPage, cart, isAdmin, adminLogout, isUserLoggedIn, authUser, language, setLanguage } = useApp();
  const { t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Show number of distinct cart line items as notification count (not total trays)
  const totalItems = cart.length;
  // Keep total trays for order details or summaries
  const totalTrays = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  const navItems = [
    { id: 'home', label: t('header.nav.home') },
    { id: 'about', label: t('header.nav.about') },
    { id: 'practices', label: t('header.nav.practices') },
    { id: 'shop', label: t('header.nav.shop') },
    { id: 'gallery', label: t('header.nav.gallery') },
    { id: 'contact', label: t('header.nav.contact') },
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
              alt={t('header.logoAlt')}
              className="h-14 w-14 rounded-full border-2 border-[#FFD700] bg-white p-1 object-cover"
            />
            <div className="hidden sm:block">
              <div className="text-2xl font-bold text-[#FFFDD0]">{t('header.brand')}</div>
              <div className="text-xs text-[#FAF3E0]">{t('header.tagline')}</div>
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
            <div className="hidden md:flex items-center gap-2 notranslate">
              <Languages className="h-4 w-4 text-[#FFFDD0]" />
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value as 'en' | 'rw' | 'sw' | 'fr')}
                className="h-9 rounded-md border border-[#FFD700] bg-[#A0522D] px-2 text-sm text-[#FFFDD0] focus:outline-none"
                aria-label={t('header.language.label')}
              >
                <option value="rw">{t('header.language.rw')}</option>
                <option value="en">{t('header.language.en')}</option>
                <option value="sw">{t('header.language.sw')}</option>
                <option value="fr">{t('header.language.fr')}</option>
              </select>
            </div>

            {isAdmin && (
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="secondary" className="bg-[#FFD700] text-[#3D2817]">
                  {t('header.role.admin')}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={adminLogout}
                  className="text-[#FFFDD0] hover:bg-[#A0522D]"
                >
                  {t('header.logout')}
                </Button>
              </div>
            )}
            {isUserLoggedIn && (
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="secondary" className="bg-[#FFD700] text-[#3D2817]">
                  {t('header.role.user')}
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
              title={isUserLoggedIn ? t('header.account.myAccount') : t('header.account.signIn')}
              className="relative h-11 w-11 rounded-full border-2 border-[#FFD700] bg-white flex items-center justify-center overflow-hidden"
            >
              {authUser?.avatarUrl ? (
                <img
                  src={toAssetUrl(authUser.avatarUrl)}
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
              title={t('header.cartTitle', { items: totalItems, trays: totalTrays })}
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
              <div className="px-4 py-2 flex items-center gap-2 notranslate">
                <Languages className="h-4 w-4 text-[#FFD700]" />
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as 'en' | 'rw' | 'sw' | 'fr')}
                  className="w-full rounded-md border border-[#FFD700] bg-[#A0522D] px-2 py-2 text-sm text-[#FFFDD0] focus:outline-none"
                  aria-label={t('header.language.label')}
                >
                  <option value="rw">{t('header.language.rw')}</option>
                  <option value="en">{t('header.language.en')}</option>
                  <option value="sw">{t('header.language.sw')}</option>
                  <option value="fr">{t('header.language.fr')}</option>
                </select>
              </div>

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
                {isUserLoggedIn ? t('header.account.myAccount') : t('header.account.signIn')}
              </button>
              {isAdmin && (
                <>
                  <div className="px-4 py-2 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-[#FFD700] text-[#3D2817]">
                      {t('header.role.adminMode')}
                    </Badge>
                  </div>
                  <button
                    onClick={() => {
                      adminLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-md text-left text-[#FFFDD0] hover:bg-[#A0522D] transition-colors"
                  >
                    {t('header.logout')}
                  </button>
                </>
              )}
              {isUserLoggedIn && (
                <>
                  <div className="px-4 py-2 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-[#FFD700] text-[#3D2817]">
                      {t('header.role.user')}
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

