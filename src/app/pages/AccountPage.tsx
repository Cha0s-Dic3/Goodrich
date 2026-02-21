import { useEffect, useMemo, useState } from 'react';
import { Camera, Mail, Phone, User, LogOut, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { toAssetUrl } from '../lib/api';

export function AccountPage() {
  const {
    authUser,
    isUserLoggedIn,
    setCurrentPage,
    uploadAvatar,
    updateUserProfile,
    userLogout,
    orders,
    loadOrders
  } = useApp();
  const { t } = useI18n();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    avatarUrl: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!isUserLoggedIn) {
      sessionStorage.setItem('postLoginRedirect', 'account');
      setCurrentPage('login');
      return;
    }
    loadOrders('user');
  }, [isUserLoggedIn, setCurrentPage]);

  useEffect(() => {
    if (authUser) {
      setFormData({
        name: authUser.name || '',
        email: authUser.email || '',
        phone: authUser.phone || '',
        avatarUrl: authUser.avatarUrl || ''
      });
    }
  }, [authUser]);

  const initials = useMemo(() => {
    const source = authUser?.name || authUser?.email || '';
    if (!source) return 'U';
    const parts = source.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [authUser]);

  const totalPaid = orders.reduce((sum, order) => sum + order.totalAmount + order.deliveryFee, 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error(t('account.nameEmailRequired'));
      return;
    }
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        avatarUrl: formData.avatarUrl.trim()
      });
      toast.success(t('account.profileUpdated'));
    } catch (err: any) {
      toast.error(err?.message || t('account.profileUpdateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('account.chooseImage'));
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const avatarUrl = await uploadAvatar(file);
      setFormData((prev) => ({ ...prev, avatarUrl }));
      await updateUserProfile({ avatarUrl });
      toast.success(t('account.photoUploaded'));
    } catch (err: any) {
      toast.error(err?.message || t('account.photoUploadFailed'));
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  if (!authUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      <section className="py-12 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FFFDD0] mb-2">{t('account.title')}</h1>
            <p className="text-lg text-[#FAF3E0]">{t('account.subtitle')}</p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="p-6 bg-white border-2 border-[#D2B48C]">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-[#F0EAD6] border-2 border-[#8B4513] overflow-hidden flex items-center justify-center">
                  {formData.avatarUrl ? (
                    <img
                      src={toAssetUrl(formData.avatarUrl)}
                      alt={authUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-[#8B4513]">{initials}</span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl text-[#3D2817]">{authUser.name}</h2>
                  <p className="text-sm text-[#6B5344]">{t('account.customerId')}: {authUser.customerId}</p>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-sm text-[#6B5344]">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#C41E3A]" />
                  {authUser.email}
                </div>
                {authUser.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#C41E3A]" />
                    {authUser.phone}
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F0EAD6] rounded-lg border border-[#D2B48C]">
                  <p className="text-xs text-[#6B5344]">{t('account.totalOrders')}</p>
                  <p className="text-2xl text-[#3D2817]">{orders.length}</p>
                </div>
                <div className="p-4 bg-[#F0EAD6] rounded-lg border border-[#D2B48C]">
                  <p className="text-xs text-[#6B5344]">{t('account.totalPaid')}</p>
                  <p className="text-2xl text-[#C41E3A]">{totalPaid.toLocaleString()} FRW</p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Button
                  onClick={() => setCurrentPage('orders')}
                  className="w-full bg-[#8B4513] hover:bg-[#A0522D] text-white"
                >
                  <Package className="h-4 w-4 mr-2" />
                  {t('account.viewOrderHistory')}
                </Button>
                <Button
                  onClick={userLogout}
                  variant="outline"
                  className="w-full border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('account.logout')}
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-white border-2 border-[#D2B48C] lg:col-span-2">
              <h2 className="text-2xl text-[#3D2817] mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-[#C41E3A]" />
                {t('account.profileDetails')}
              </h2>
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#3D2817] mb-2">{t('account.fullName')}</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="border-[#D2B48C] focus:border-[#FFD700]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3D2817] mb-2">{t('account.emailAddress')}</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border-[#D2B48C] focus:border-[#FFD700]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3D2817] mb-2">{t('account.phoneNumber')}</label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="border-[#D2B48C] focus:border-[#FFD700]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3D2817] mb-2">{t('account.profilePhoto')}</label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAvatarUpload(e.target.files?.[0] || null)}
                      className="border-[#D2B48C] focus:border-[#FFD700]"
                    />
                    <div className="w-12 h-12 bg-[#F0EAD6] border-2 border-[#D2B48C] rounded-md flex items-center justify-center">
                      <Camera className="h-5 w-5 text-[#8B4513]" />
                    </div>
                  </div>
                  {isUploadingAvatar && (
                    <p className="text-xs text-[#6B5344] mt-2">{t('account.uploadingPhoto')}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
                  >
                    {isSaving ? t('account.saving') : t('account.saveChanges')}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
