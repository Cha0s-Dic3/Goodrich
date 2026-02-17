import { useEffect, useState } from 'react';
import { MapPin, Mail, Package, Calendar, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

export function CheckoutPage() {
  const { cart, cartTotal, setCurrentPage, isUserLoggedIn, authUser, authToken } = useApp();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    deliveryAddress: '',
    deliveryZone: 'local' as 'local' | 'regional' | 'national',
    deliveryDate: '',
    deliveryTimeWindow: '9:00 AM - 12:00 PM',
    notes: ''
  });

  useEffect(() => {
    if (!isUserLoggedIn) {
      toast.error(t('checkout.signInRequired'));
      sessionStorage.setItem('postLoginRedirect', 'checkout');
      setCurrentPage('login');
    }
  }, [isUserLoggedIn, setCurrentPage]);

  useEffect(() => {
    if (authUser) {
      setFormData(prev => ({
        ...prev,
        customerId: authUser.customerId,
        customerName: prev.customerName || authUser.name,
        customerEmail: prev.customerEmail || authUser.email
      }));
    }
  }, [authUser]);

  const deliveryFees = {
    local: 3000,
    regional: 10000,
    national: 15000
  };

  const deliveryFee = deliveryFees[formData.deliveryZone];
  const totalAmount = cartTotal + deliveryFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerPhone || !formData.customerEmail || !formData.deliveryAddress || !formData.deliveryDate) {
      toast.error(t('checkout.fillRequired'));
      return;
    }

    const payload = {
      name: formData.customerName,
      phone: formData.customerPhone,
      email: formData.customerEmail,
      address: formData.deliveryAddress
    };

    const persistCheckout = () => {
      sessionStorage.setItem('checkoutData', JSON.stringify(formData));
      toast.success(t('checkout.savedProceeding'));
      setCurrentPage('payment');
    };

    if (authToken) {
      fetch('/api/customers/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify(payload)
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || t('checkout.syncFailed'));
          }
        })
        .then(() => persistCheckout())
        .catch((err) => {
          toast.error(err.message || 'Failed to sync customer');
        });
      return;
    }

    persistCheckout();
  };

  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FFFDD0] mb-2">{t('checkout.title')}</h1>
            <p className="text-lg text-[#FAF3E0]">{t('checkout.subtitle')}</p>
          </div>
        </div>
      </section>

      {/* Checkout Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <Card className="p-8 bg-white border-2 border-[#D2B48C]">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Customer Information */}
                  <div>
                    <h2 className="text-2xl font-bold text-[#3D2817] mb-6 flex items-center gap-2">
                      <Mail className="h-6 w-6 text-[#C41E3A]" />
                      {t('checkout.customerInfo')}
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="customerName" className="block text-sm font-semibold text-[#3D2817] mb-2">
                          {t('checkout.fullName')} *
                        </label>
                        <Input
                          id="customerName"
                          name="customerName"
                          type="text"
                          placeholder={t('checkout.fullNamePlaceholder')}
                          value={formData.customerName}
                          onChange={handleInputChange}
                          required
                          className="border-[#D2B48C] focus:border-[#FFD700]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="customerPhone" className="block text-sm font-semibold text-[#3D2817] mb-2">
                            {t('checkout.phoneNumber')} *
                          </label>
                          <Input
                            id="customerPhone"
                            name="customerPhone"
                            type="tel"
                            placeholder={t('checkout.phonePlaceholder')}
                            value={formData.customerPhone}
                            onChange={handleInputChange}
                            required
                            className="border-[#D2B48C] focus:border-[#FFD700]"
                          />
                        </div>

                        <div>
                          <label htmlFor="customerEmail" className="block text-sm font-semibold text-[#3D2817] mb-2">
                            {t('checkout.emailAddress')} *
                          </label>
                          <Input
                            id="customerEmail"
                            name="customerEmail"
                            type="email"
                            placeholder={t('checkout.emailPlaceholder')}
                            value={formData.customerEmail}
                            onChange={handleInputChange}
                            required
                            className="border-[#D2B48C] focus:border-[#FFD700]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Information */}
                  <div className="pt-6 border-t border-[#D2B48C]">
                    <h2 className="text-2xl font-bold text-[#3D2817] mb-6 flex items-center gap-2">
                      <MapPin className="h-6 w-6 text-[#C41E3A]" />
                      {t('checkout.deliveryInfo')}
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="deliveryAddress" className="block text-sm font-semibold text-[#3D2817] mb-2">
                          {t('checkout.deliveryAddress')} *
                        </label>
                        <Textarea
                          id="deliveryAddress"
                          name="deliveryAddress"
                          placeholder={t('checkout.deliveryAddressPlaceholder')}
                          value={formData.deliveryAddress}
                          onChange={handleInputChange}
                          required
                          rows={3}
                          className="border-[#D2B48C] focus:border-[#FFD700]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="deliveryZone" className="block text-sm font-semibold text-[#3D2817] mb-2">
                            {t('checkout.deliveryZone')} *
                          </label>
                          <Select value={formData.deliveryZone} onValueChange={(value) => handleSelectChange('deliveryZone', value)}>
                            <SelectTrigger className="border-[#D2B48C]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="local">{t('checkout.zone.local')}</SelectItem>
                              <SelectItem value="regional">{t('checkout.zone.regional')}</SelectItem>
                              <SelectItem value="national">{t('checkout.zone.national')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label htmlFor="deliveryDate" className="block text-sm font-semibold text-[#3D2817] mb-2">
                            {t('checkout.preferredDate')} *
                          </label>
                          <Input
                            id="deliveryDate"
                            name="deliveryDate"
                            type="date"
                            value={formData.deliveryDate}
                            onChange={handleInputChange}
                            required
                            className="border-[#D2B48C] focus:border-[#FFD700]"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="deliveryTimeWindow" className="block text-sm font-semibold text-[#3D2817] mb-2">
                          {t('checkout.preferredWindow')}
                        </label>
                        <Select value={formData.deliveryTimeWindow} onValueChange={(value) => handleSelectChange('deliveryTimeWindow', value)}>
                          <SelectTrigger className="border-[#D2B48C]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="9:00 AM - 12:00 PM">{t('checkout.window.morning')}</SelectItem>
                            <SelectItem value="12:00 PM - 3:00 PM">{t('checkout.window.midday')}</SelectItem>
                            <SelectItem value="3:00 PM - 6:00 PM">{t('checkout.window.afternoon')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div className="pt-6 border-t border-[#D2B48C]">
                    <h2 className="text-xl font-bold text-[#3D2817] mb-4">{t('checkout.additionalNotes')}</h2>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder={t('checkout.notesPlaceholder')}
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="border-[#D2B48C] focus:border-[#FFD700]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-6 border-t border-[#D2B48C] flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#D2B48C] text-[#3D2817] hover:bg-[#F0EAD6]"
                      onClick={() => setCurrentPage('cart')}
                    >
                      {t('checkout.backToCart')}
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-[#C41E3A] hover:bg-[#FF6B6B] text-white font-semibold"
                      size="lg"
                    >
                      {t('checkout.proceedPayment')}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 bg-white border-2 border-[#D2B48C] sticky top-4">
                <h2 className="text-2xl font-bold text-[#3D2817] mb-6 flex items-center gap-2">
                  <Package className="h-6 w-6 text-[#C41E3A]" />
                  {t('checkout.orderSummary')}
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-6 pb-6 border-b border-[#D2B48C]">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[#3D2817]">{item.product.name}</p>
                        <p className="text-sm text-[#6B5344]">{t('checkout.qtyLabel')} {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-[#3D2817]">
                        {(item.product.price * item.quantity).toLocaleString()} FRW
                      </p>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-[#6B5344]">
                    <span>{t('checkout.subtotal')}</span>
                    <span className="font-semibold">{cartTotal.toLocaleString()} FRW</span>
                  </div>
                  <div className="flex justify-between text-[#6B5344]">
                    <span>{t('checkout.deliveryFee')}</span>
                    <span className="font-semibold">{deliveryFee.toLocaleString()} FRW</span>
                  </div>
                  <div className="pt-2 border-t border-[#D2B48C] flex justify-between">
                    <span className="font-bold text-[#3D2817]">{t('checkout.total')}</span>
                    <span className="text-2xl font-bold text-[#C41E3A]">
                      {totalAmount.toLocaleString()} FRW
                    </span>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-[#F0EAD6] rounded-lg p-4 text-sm text-[#6B5344] space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#C41E3A]" />
                    <span>{t('checkout.deliveryDateHint')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-[#C41E3A]" />
                    <span>{t('checkout.deliveryWindowHint')}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
