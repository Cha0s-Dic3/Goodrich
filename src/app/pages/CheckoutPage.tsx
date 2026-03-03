import { useEffect, useState } from 'react';
import { MapPin, Mail, Package, Calendar, Clock, LocateFixed } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

interface DeliveryEstimate {
  trays: number;
  distanceKm: number;
  chargeableKm: number;
  deliveryFee: number;
}

export function CheckoutPage() {
  const { cart, cartTotal, setCurrentPage, isUserLoggedIn, authUser, authToken } = useApp();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    fulfillmentMethod: 'delivery' as 'pickup' | 'delivery',
    deliveryAddress: '',
    deliveryDate: '',
    deliveryTimeWindow: '9:00 AM - 12:00 PM',
    notes: '',
    locationMeta: null as null | {
      latitude: number;
      longitude: number;
      accuracy: number;
      mapUrl: string;
      resolvedAddress?: string;
      capturedAt: string;
    }
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [deliveryEstimate, setDeliveryEstimate] = useState<DeliveryEstimate | null>(null);
  const [isEstimatingDelivery, setIsEstimatingDelivery] = useState(false);
  const [deliveryEstimateError, setDeliveryEstimateError] = useState<string | null>(null);

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

  const totalTrays = cart.reduce((sum, item) => sum + item.quantity, 0);
  const fallbackDeliveryFee = formData.fulfillmentMethod === 'pickup' ? 0 : totalTrays * 300;
  const deliveryFee = deliveryEstimate?.deliveryFee ?? fallbackDeliveryFee;
  const totalAmount = cartTotal + deliveryFee;

  useEffect(() => {
    if (formData.fulfillmentMethod === 'pickup') {
      setDeliveryEstimate({ trays: totalTrays, distanceKm: 0, chargeableKm: 0, deliveryFee: 0 });
      setDeliveryEstimateError(null);
      setIsEstimatingDelivery(false);
      return;
    }

    if (!cart.length) {
      setDeliveryEstimate(null);
      setDeliveryEstimateError(null);
      setIsEstimatingDelivery(false);
      return;
    }

    const hasDestination =
      Boolean(formData.deliveryAddress.trim()) ||
      (Number.isFinite(formData.locationMeta?.latitude) && Number.isFinite(formData.locationMeta?.longitude));
    if (!hasDestination) {
      setDeliveryEstimate(null);
      setDeliveryEstimateError(null);
      setIsEstimatingDelivery(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsEstimatingDelivery(true);
      try {
        const res = await fetch('/api/delivery/estimate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fulfillmentMethod: formData.fulfillmentMethod,
            deliveryAddress: formData.deliveryAddress,
            locationMeta: formData.locationMeta,
            items: cart
          }),
          signal: controller.signal
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.estimate) {
          throw new Error(data?.error || 'Failed to estimate delivery fee');
        }
        setDeliveryEstimate(data.estimate);
        setDeliveryEstimateError(null);
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setDeliveryEstimate(null);
        setDeliveryEstimateError(err?.message || 'Unable to estimate delivery fee');
      } finally {
        setIsEstimatingDelivery(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    cart,
    formData.fulfillmentMethod,
    formData.deliveryAddress,
    formData.locationMeta,
    totalTrays
  ]);

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

  const normalizeRwandaPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('250') && digits.length === 12) {
      return `+${digits}`;
    }
    if (digits.startsWith('07') && digits.length === 10) {
      return `+250${digits.slice(1)}`;
    }
    if (digits.startsWith('7') && digits.length === 9) {
      return `+250${digits}`;
    }
    return value.trim();
  };

  const isValidRwandaPhone = (value: string) => {
    return /^\+2507\d{8}$/.test(value);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported on this device.');
      return;
    }

    setIsLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;
        let resolvedAddress = '';
        try {
          const reverse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          if (reverse.ok) {
            const reverseData = await reverse.json();
            resolvedAddress = reverseData?.display_name || '';
          }
        } catch (err) {
          // Keep coordinates fallback if reverse geocoding fails.
        }
        setFormData((prev) => ({
          ...prev,
          deliveryAddress: resolvedAddress
            ? `${resolvedAddress}\n${mapUrl}`
            : `Current location: ${lat}, ${lng}\n${mapUrl}`,
          locationMeta: {
            latitude: Number(lat),
            longitude: Number(lng),
            accuracy: Number(position.coords.accuracy || 0),
            mapUrl,
            resolvedAddress: resolvedAddress || undefined,
            capturedAt: new Date().toISOString()
          }
        }));
        setIsLocating(false);
        toast.success('Current location added to delivery address.');
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please allow location access and enter address manually if needed.');
          toast.error('Location permission denied. Please allow location access.');
          return;
        }
        setLocationError('Unable to fetch current location. Please type your address manually.');
        toast.error('Failed to get current location.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = formData.customerName.trim();
    const normalizedPhone = normalizeRwandaPhone(formData.customerPhone);
    const trimmedEmail = formData.customerEmail.trim();
    const trimmedAddress = formData.deliveryAddress.trim();

    if (!trimmedName || !normalizedPhone || !trimmedEmail) {
      toast.error(t('checkout.fillRequired'));
      return;
    }

    if (!isValidRwandaPhone(normalizedPhone)) {
      toast.error('Use a valid Rwanda phone number (e.g. +2507XXXXXXXX).');
      return;
    }

    if (formData.fulfillmentMethod === 'delivery' && (!trimmedAddress || !formData.deliveryDate)) {
      toast.error(t('checkout.fillRequired'));
      return;
    }

    const payload = {
      name: trimmedName,
      phone: normalizedPhone,
      email: trimmedEmail,
      address: formData.fulfillmentMethod === 'delivery' ? trimmedAddress : ''
    };

    const persistCheckout = () => {
      sessionStorage.setItem(
        'checkoutData',
        JSON.stringify({
          ...formData,
          customerName: trimmedName,
          customerPhone: normalizedPhone,
          customerEmail: trimmedEmail,
          deliveryAddress: formData.fulfillmentMethod === 'delivery' ? trimmedAddress : ''
        })
      );
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
                        <label htmlFor="fulfillmentMethod" className="block text-sm font-semibold text-[#3D2817] mb-2">
                          Order Method *
                        </label>
                        <Select
                          value={formData.fulfillmentMethod}
                          onValueChange={(value) => handleSelectChange('fulfillmentMethod', value)}
                        >
                          <SelectTrigger className="border-[#D2B48C]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="delivery">Delivery</SelectItem>
                            <SelectItem value="pickup">Pickup (I will come and take my order)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label htmlFor="deliveryAddress" className="block text-sm font-semibold text-[#3D2817] mb-2">
                          {t('checkout.deliveryAddress')}{formData.fulfillmentMethod === 'delivery' ? ' *' : ''}
                        </label>
                        <div className="mb-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleUseCurrentLocation}
                            disabled={formData.fulfillmentMethod === 'pickup' || isLocating}
                            className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                          >
                            <LocateFixed className="h-4 w-4 mr-2" />
                            {isLocating ? 'Locating...' : 'Use Current Location'}
                          </Button>
                        </div>
                        {locationError && (
                          <p className="text-xs text-[#C41E3A] mb-2">{locationError}</p>
                        )}
                        <Textarea
                          id="deliveryAddress"
                          name="deliveryAddress"
                          placeholder={t('checkout.deliveryAddressPlaceholder')}
                          value={formData.deliveryAddress}
                          onChange={handleInputChange}
                          required={formData.fulfillmentMethod === 'delivery'}
                          disabled={formData.fulfillmentMethod === 'pickup'}
                          rows={3}
                          className="border-[#D2B48C] focus:border-[#FFD700]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label htmlFor="deliveryDate" className="block text-sm font-semibold text-[#3D2817] mb-2">
                            {t('checkout.preferredDate')}{formData.fulfillmentMethod === 'delivery' ? ' *' : ''}
                          </label>
                          <Input
                            id="deliveryDate"
                            name="deliveryDate"
                            type="date"
                            value={formData.deliveryDate}
                            onChange={handleInputChange}
                            required={formData.fulfillmentMethod === 'delivery'}
                            disabled={formData.fulfillmentMethod === 'pickup'}
                            className="border-[#D2B48C] focus:border-[#FFD700]"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="deliveryTimeWindow" className="block text-sm font-semibold text-[#3D2817] mb-2">
                          {t('checkout.preferredWindow')}
                        </label>
                        <Select
                          value={formData.deliveryTimeWindow}
                          onValueChange={(value) => handleSelectChange('deliveryTimeWindow', value)}
                          disabled={formData.fulfillmentMethod === 'pickup'}
                        >
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
                  {formData.fulfillmentMethod === 'delivery' && deliveryEstimate && (
                    <div className="text-xs text-[#6B5344]">
                      Distance {deliveryEstimate.distanceKm.toFixed(2)} km (charged {deliveryEstimate.chargeableKm} km) x {deliveryEstimate.trays} trays x 300 FRW
                    </div>
                  )}
                  {formData.fulfillmentMethod === 'delivery' && isEstimatingDelivery && (
                    <div className="text-xs text-[#6B5344]">Estimating delivery distance...</div>
                  )}
                  {formData.fulfillmentMethod === 'delivery' && deliveryEstimateError && (
                    <div className="text-xs text-[#C41E3A]">{deliveryEstimateError}</div>
                  )}
                  <div className="pt-2 border-t border-[#D2B48C] flex justify-between">
                    <span className="font-bold text-[#3D2817]">{t('checkout.total')}</span>
                    <span className="text-2xl font-bold text-[#C41E3A]">
                      {totalAmount.toLocaleString()} FRW
                    </span>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="bg-[#F0EAD6] rounded-lg p-4 text-sm text-[#6B5344] space-y-2">
                  {formData.fulfillmentMethod === 'delivery' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[#C41E3A]" />
                        <span>{t('checkout.deliveryDateHint')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#C41E3A]" />
                        <span>{t('checkout.deliveryWindowHint')}</span>
                      </div>
                    </>
                  ) : (
                    <span>Pickup selected. Admin will call you to coordinate pickup details.</span>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
