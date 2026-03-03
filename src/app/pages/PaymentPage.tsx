import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, ClipboardCopy, Package, PhoneCall, UserCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';

interface ManualPaymentResponse {
  payment?: {
    id: string;
    ref: string;
    status: string;
    receiverName?: string;
    receiverPhone?: string;
    amount: number;
    expiresAt?: number;
  };
}

export function PaymentPage() {
  const {
    cart,
    cartTotal,
    clearCart,
    setCurrentPage,
    isUserLoggedIn,
    authUser,
    authToken,
    loadPayments
  } = useApp();
  const { t } = useI18n();
  const [orderData, setOrderData] = useState({
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    fulfillmentMethod: 'delivery' as 'pickup' | 'delivery',
    deliveryAddress: '',
    deliveryZone: 'local' as 'local' | 'regional' | 'national',
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<ManualPaymentResponse['payment'] | null>(null);

  const receiverName = 'MUREKEYISONI Francine';
  const receiverPhone = '0786584808';
  const paymentWindowMinutes = 30;

  useEffect(() => {
    const savedOrderData = sessionStorage.getItem('checkoutData');
    if (savedOrderData) {
      setOrderData(JSON.parse(savedOrderData));
    }
  }, []);

  useEffect(() => {
    if (!isUserLoggedIn) {
      toast.error(t('payment.signInRequired'));
      setCurrentPage('login');
    }
  }, [isUserLoggedIn, setCurrentPage]);

  useEffect(() => {
    if (!orderData.customerName && authUser?.name) {
      setOrderData((prev) => ({
        ...prev,
        customerName: authUser.name,
        customerEmail: authUser.email || prev.customerEmail,
        customerId: authUser.customerId || prev.customerId
      }));
    }
  }, [authUser, orderData.customerName]);

  const deliveryFees: { [key in 'local' | 'regional' | 'national']: number } = {
    local: 3000,
    regional: 10000,
    national: 15000
  };

  const deliveryFee = orderData.fulfillmentMethod === 'pickup' ? 0 : deliveryFees[orderData.deliveryZone];
  const totalAmount = cartTotal + deliveryFee;

  const normalizeRwandaPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.startsWith('250') && digits.length === 12) return `+${digits}`;
    if (digits.startsWith('07') && digits.length === 10) return `+250${digits.slice(1)}`;
    if (digits.startsWith('7') && digits.length === 9) return `+250${digits}`;
    return value.trim();
  };

  const formattedDeadline = useMemo(() => {
    if (!paymentRequest?.expiresAt) return null;
    return new Date(paymentRequest.expiresAt).toLocaleTimeString();
  }, [paymentRequest?.expiresAt]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied.');
    } catch (err) {
      toast.error('Failed to copy.');
    }
  };

  const handleSubmit = async () => {
    if (!authToken) {
      toast.error('Please sign in to continue payment');
      setCurrentPage('login');
      return;
    }

    if (!cart.length) {
      toast.error('Your cart is empty');
      setCurrentPage('shop');
      return;
    }

    const normalizedPhone = normalizeRwandaPhone(orderData.customerPhone);
    const trimmedAddress = orderData.deliveryAddress.trim();

    if (!orderData.customerName.trim() || !normalizedPhone || !orderData.customerEmail.trim()) {
      toast.error('Missing required checkout information');
      setCurrentPage('checkout');
      return;
    }

    if (!/^\+2507\d{8}$/.test(normalizedPhone)) {
      toast.error('Use a valid Rwanda phone number (e.g. +2507XXXXXXXX).');
      setCurrentPage('checkout');
      return;
    }

    if (orderData.fulfillmentMethod === 'delivery' && (!trimmedAddress || !orderData.deliveryDate)) {
      toast.error('Missing required checkout information');
      setCurrentPage('checkout');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/payments/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          order: {
            ...orderData,
            customerPhone: normalizedPhone,
            customerEmail: orderData.customerEmail.trim(),
            customerName: orderData.customerName.trim(),
            deliveryAddress: orderData.fulfillmentMethod === 'delivery' ? trimmedAddress : '',
            items: cart,
            totalAmount: cartTotal,
            deliveryFee,
            deliveryZone: orderData.deliveryZone,
            fulfillmentMethod: orderData.fulfillmentMethod,
            customerId: orderData.customerId || authUser?.customerId
          }
        })
      });
      const data: ManualPaymentResponse = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as any).error || t('payment.createRequestFailed'));
      }
      if (!data.payment) {
        throw new Error(t('payment.missingReference'));
      }

      sessionStorage.removeItem('checkoutData');
      clearCart();
      await loadPayments('user');
      setPaymentRequest(data.payment);
      toast.success(t('payment.submitted'));
      setCurrentPage('home');
    } catch (err: any) {
      toast.error(err?.message || t('payment.submitFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (paymentRequest) {
    return (
      <div className="min-h-screen bg-[#FFFDD0] flex items-center justify-center">
        <Card className="max-w-xl w-full p-8 bg-white border-2 border-[#D2B48C] text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-[#228B22] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-[#3D2817] mb-2">{t('payment.submittedTitle')}</h2>
          <p className="text-[#6B5344] mb-6">
            {t('payment.submittedDesc')}
          </p>

          <div className="bg-[#F0EAD6] rounded-lg p-4 mb-6 text-left space-y-2">
            <p className="text-sm text-[#6B5344]">
              <span className="font-semibold">{t('payment.reference')}:</span> {paymentRequest.ref}
            </p>
            <p className="text-sm text-[#6B5344]">
              <span className="font-semibold">{t('payment.amount')}:</span> {paymentRequest.amount.toLocaleString()} FRW
            </p>
            {formattedDeadline && (
              <p className="text-sm text-[#6B5344]">
                <span className="font-semibold">{t('payment.window')}:</span> {t('payment.until')} {formattedDeadline}
              </p>
            )}
          </div>

          <Button
            onClick={() => setCurrentPage('orders')}
            className="w-full bg-[#C41E3A] hover:bg-[#FF6B6B] text-white font-semibold"
            size="lg"
          >
            {t('payment.viewOrderStatus')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      <section className="py-12 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FFFDD0] mb-2">{t('payment.title')}</h1>
            <p className="text-lg text-[#FAF3E0]">{t('payment.subtitle')}</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-8 bg-white border-2 border-[#D2B48C] space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#C41E3A] text-white flex items-center justify-center">
                    <PhoneCall className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#3D2817]">{t('payment.sendTitle')}</h2>
                    <p className="text-sm text-[#6B5344]">
                      {t('payment.sendDesc', { minutes: paymentWindowMinutes })}
                    </p>
                  </div>
                </div>

                <div className="bg-[#F0EAD6] border border-[#D2B48C] rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#6B5344] uppercase tracking-wide">{t('payment.receiverNumber')}</p>
                      <p className="text-lg font-semibold text-[#3D2817]">{receiverPhone}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                      onClick={() => handleCopy(receiverPhone)}
                    >
                      <ClipboardCopy className="h-4 w-4 mr-2" />
                      {t('payment.copy')}
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <UserCircle2 className="h-5 w-5 text-[#C41E3A]" />
                    <p className="text-sm text-[#6B5344]">
                      {t('payment.receiverName')}: <span className="font-semibold text-[#3D2817]">{receiverName}</span>
                    </p>
                  </div>
                </div>


                <div className="bg-[#FFF5F5] border border-[#F3B7B7] rounded-lg p-4 text-sm text-[#6B5344] flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#C41E3A] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#3D2817]">{t('payment.important')}</p>
                    <p>{t('payment.importantLine1')}</p>
                    <p>{t('payment.importantLine2')}</p>
                    <p>After payment, admin will call you to coordinate pickup or delivery outside the app.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#D2B48C] flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-[#D2B48C] text-[#3D2817] hover:bg-[#F0EAD6]"
                    onClick={() => setCurrentPage('checkout')}
                  >
                    {t('payment.backToCheckout')}
                  </Button>
                  <Button
                    type="button"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#C41E3A] hover:bg-[#FF6B6B] text-white font-semibold disabled:opacity-50"
                    size="lg"
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? t('payment.submitting') : t('payment.iHavePaid')}
                  </Button>
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-6 bg-white border-2 border-[#D2B48C] sticky top-4">
                <h2 className="text-2xl font-bold text-[#3D2817] mb-6 flex items-center gap-2">
                  <Package className="h-6 w-6 text-[#C41E3A]" />
                  {t('payment.orderSummary')}
                </h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-[#D2B48C]">
                  {cart.map((item: any) => (
                    <div key={item.product.id} className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[#3D2817]">{item.product.name}</p>
                        <p className="text-sm text-[#6B5344]">{t('payment.qty')} {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-[#3D2817]">
                        {(item.product.price * item.quantity).toLocaleString()} FRW
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-[#6B5344]">
                    <span>{t('payment.subtotal')}</span>
                    <span className="font-semibold">{cartTotal.toLocaleString()} FRW</span>
                  </div>
                  <div className="flex justify-between text-[#6B5344]">
                    <span>{t('payment.deliveryFee')}</span>
                    <span className="font-semibold">{deliveryFee.toLocaleString()} FRW</span>
                  </div>
                  <div className="pt-2 border-t border-[#D2B48C] flex justify-between">
                    <span className="font-bold text-[#3D2817]">{t('payment.total')}</span>
                    <span className="text-2xl font-bold text-[#C41E3A]">
                      {totalAmount.toLocaleString()} FRW
                    </span>
                  </div>
                </div>

                <div className="bg-[#F0EAD6] rounded-lg p-4 text-sm text-[#6B5344]">
                  <p className="font-semibold text-[#3D2817] mb-2">{t('payment.windowTitle')}</p>
                  <p>{t('payment.windowDesc', { minutes: paymentWindowMinutes })}</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
