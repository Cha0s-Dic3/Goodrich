import { useEffect, useState } from 'react';
import { Lock, LayoutDashboard, Package, ShoppingCart, Users, TrendingUp, Megaphone, MessageSquare, Images, CreditCard, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { OrderManagement } from '../components/admin/OrderManagement';
import { InventoryManagement } from '../components/admin/InventoryManagement';
import { CustomerManagement } from '../components/admin/CustomerManagement';
import { CustomerAccounts } from '../components/admin/CustomerAccounts';
import { AnnouncementManagement } from '../components/admin/AnnouncementManagement';
import { Reports } from '../components/admin/Reports';
import { MessagesManagement } from '../components/admin/MessagesManagement';
import { GalleryManagement } from '../components/admin/GalleryManagement';
import { PaymentsManagement } from '../components/admin/PaymentsManagement';
import { PasswordResetsManagement } from '../components/admin/PasswordResetsManagement';
import { toast } from 'sonner';

export function AdminPage() {
  const {
    isAdmin,
    isUserLoggedIn,
    adminLogin,
    adminLoginError,
    loadOrders,
    loadCustomers,
    loadMessages,
    refreshProducts,
    loadPayments
  } = useApp();
  const { t } = useI18n();
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPassword, setShowPassword] = useState(false);
  
  useEffect(() => {
    if (isAdmin) {
      loadOrders('admin');
      loadCustomers();
      loadMessages();
      loadPayments('admin');
      refreshProducts();
    }
  }, [isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUserLoggedIn) {
      toast.error(t('admin.userLoggedIn'));
      return;
    }
    const success = await adminLogin(loginData.username, loginData.password);
    if (!success) {
      toast.error(adminLoginError || t('admin.invalidCredentials'));
    }
  };
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#FFFDD0] flex items-center justify-center py-20">
        <Card className="p-12 max-w-md w-full bg-white border-2 border-[#D2B48C]">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#8B4513] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-10 w-10 text-[#FFFDD0]" />
            </div>
            <h2 className="text-3xl mb-2 text-[#3D2817]">{t('admin.loginTitle')}</h2>
            <p className="text-[#6B5344]">{t('admin.loginSubtitle')}</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block mb-2 text-[#3D2817]">{t('admin.username')}</label>
              <Input
                type="text"
                required
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                placeholder={t('admin.usernamePlaceholder')}
                className="border-[#D2B48C] focus:border-[#C41E3A]"
              />
            </div>
            
            <div>
              <label className="block mb-2 text-[#3D2817]">{t('admin.password')}</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                placeholder={t('admin.passwordPlaceholder')}
                className="border-[#D2B48C] focus:border-[#C41E3A]"
              />
              <label className="mt-2 flex items-center gap-2 text-xs text-[#6B5344]">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                Show password
              </label>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
              size="lg"
            >
              {t('admin.login')}
            </Button>
          </form>
          
        </Card>
      </div>
    );
  }
  
  const tabs = [
    { id: 'dashboard', label: t('admin.tabs.dashboard'), icon: LayoutDashboard },
    { id: 'orders', label: t('admin.tabs.orders'), icon: ShoppingCart },
    { id: 'payments', label: t('admin.tabs.payments'), icon: CreditCard },
    { id: 'inventory', label: t('admin.tabs.inventory'), icon: Package },
    { id: 'password-resets', label: t('admin.tabs.passwordResets'), icon: KeyRound },
    { id: 'announcements', label: t('admin.tabs.announcements'), icon: Megaphone },
    { id: 'messages', label: t('admin.tabs.messages'), icon: MessageSquare },
    { id: 'gallery', label: t('admin.tabs.gallery'), icon: Images },
    { id: 'customers', label: t('admin.tabs.customers'), icon: Users },
    { id: 'accounts', label: t('admin.tabs.accounts'), icon: Users },
    { id: 'reports', label: t('admin.tabs.reports'), icon: TrendingUp },
  ];
  
  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      {/* Header */}
      <div className="bg-[#8B4513] text-[#FFFDD0] py-6 border-b-4 border-[#FFD700]">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl">{t('admin.dashboardTitle')}</h1>
          <p className="text-[#FAF3E0]">{t('admin.dashboardSubtitle')}</p>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="bg-[#F0EAD6] border-b-2 border-[#D2B48C] sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-2 py-4">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  className={
                    activeTab === tab.id
                      ? 'bg-[#C41E3A] hover:bg-[#FF6B6B] text-white'
                      : 'border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white'
                  }
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'payments' && <PaymentsManagement />}
        {activeTab === 'inventory' && <InventoryManagement />}
        {activeTab === 'password-resets' && <PasswordResetsManagement />}
        {activeTab === 'announcements' && <AnnouncementManagement />}
        {activeTab === 'messages' && <MessagesManagement />}
        {activeTab === 'gallery' && <GalleryManagement />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'accounts' && <CustomerAccounts />}
        {activeTab === 'reports' && <Reports />}
      </div>
    </div>
  );
}

