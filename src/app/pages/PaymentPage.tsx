import { useState, useEffect, useRef } from 'react';
import { CreditCard, Smartphone, Building2, CheckCircle, Package, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

export function PaymentPage() {
  const {
    cart,
    cartTotal,
    clearCart,
    setCurrentPage,
    isUserLoggedIn,
    authUser,
    authToken,
    loadOrders
  } = useApp();
  const [orderData, setOrderData] = useState({
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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile' | 'bank'>('mobile');
  const [mobileProvider, setMobileProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [processingMessage, setProcessingMessage] = useState<string | null>(null);
  const [txnRef, setTxnRef] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(45);
  const timerRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);
  const pollStartRef = useRef<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paidAmount, setPaidAmount] = useState<number | null>(null);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });

  // Load order data from sessionStorage (passed from CheckoutPage)
  useEffect(() => {
    const savedOrderData = sessionStorage.getItem('checkoutData');
    if (savedOrderData) {
      setOrderData(JSON.parse(savedOrderData));
    }
  }, []);

  useEffect(() => {
    if (!isUserLoggedIn) {
      toast.error('Please sign in to continue payment');
      setCurrentPage('login');
    }
  }, [isUserLoggedIn, setCurrentPage]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  const deliveryFees: { [key in 'local' | 'regional' | 'national']: number } = {
    local: 3000,
    regional: 10000,
    national: 15000
  };

  const cancelPayment = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    setIsProcessing(false);
    setProcessingMessage('Payment cancelled by user');
    setTxnRef(null);
    setTransactionId(null);
    setCountdown(45);
  };

  const deliveryFee = deliveryFees[orderData.deliveryZone];
  const totalAmount = cartTotal + deliveryFee;

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData((prev: typeof cardData) => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (paymentMethod !== 'mobile') {
      toast.error('Only Mobile Money payments via Paypack are supported right now.');
      return;
    }

    if (!authToken) {
      toast.error('Please sign in to continue payment');
      setCurrentPage('login');
      return;
    }

    if (!orderData.customerPhone) {
      toast.error('Customer phone is required for Mobile Money payment');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingMessage("Sending payment request to customer's phone...");
      setCountdown(120);

      const res = await fetch('/api/paypack/cashin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`
        },
        body: JSON.stringify({
          order: {
            ...orderData,
            items: cart,
            totalAmount: cartTotal,
            deliveryFee,
            deliveryZone: orderData.deliveryZone,
            customerId: orderData.customerId || authUser?.customerId,
            notes: `${orderData.notes || ''}\nProvider: ${mobileProvider.toUpperCase()}`.trim()
          }
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      const ref = data.ref;
      if (!ref) {
        throw new Error('Missing payment reference');
      }

      setTxnRef(ref);
      setProcessingMessage(`Payment request sent to ${orderData.customerPhone}. Waiting for confirmation...`);

      timerRef.current = window.setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      pollStartRef.current = Date.now();
      pollRef.current = window.setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/paypack/transactions/${ref}`, {
            headers: { Authorization: `Bearer ${authToken}` }
          });
          const statusData = await statusRes.json().catch(() => ({}));
          if (!statusRes.ok) {
            throw new Error(statusData.error || 'Failed to check payment status');
          }

          const transaction = statusData.transaction || {};
          const status = transaction.status;
          if (status === 'successful') {
            if (pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            sessionStorage.removeItem('checkoutData');
            setIsProcessing(false);
            setPaymentComplete(true);
            setProcessingMessage('Payment confirmed. Completing order...');
            setPaidAmount(totalAmount);
            await loadOrders('user');
            toast.success('Payment successful! Your order has been confirmed.');
            clearCart();
            setTimeout(() => {
              setCurrentPage('orders');
            }, 1500);
          } else if (status === 'failed') {
            if (pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setIsProcessing(false);
            toast.error('Payment failed. Please try again.');
          } else {
            setProcessingMessage('Waiting for customer confirmation...');
          }
        } catch (err: any) {
          setProcessingMessage(err?.message || 'Checking payment status...');
        }

        const startedAt = pollStartRef.current || Date.now();
        if (Date.now() - startedAt > 120000) {
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setIsProcessing(false);
          toast.error('Payment timed out. Please try again.');
        }
      }, 4000);
    } catch (err: any) {
      setIsProcessing(false);
      toast.error(err?.message || 'Failed to initiate payment');
    }
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-[#FFFDD0] flex items-center justify-center">
        <Card className="max-w-md w-full p-8 bg-white border-2 border-[#D2B48C] text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-[#228B22] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-[#3D2817] mb-2">Payment Successful!</h2>
          <p className="text-[#6B5344] mb-6">
            Your order has been confirmed and will be delivered soon.
          </p>

          <div className="bg-[#F0EAD6] rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-[#6B5344] mb-2">
              <span className="font-semibold">Order Total:</span>{' '}
              {(paidAmount ?? totalAmount).toLocaleString()} FRW
            </p>
            <p className="text-sm text-[#6B5344]">
              <span className="font-semibold">Items:</span> {cart.length} product(s)
            </p>
          </div>

          <p className="text-sm text-[#6B5344] mb-6">
            A confirmation email has been sent to your email address. You can track your order status in your account.
          </p>

          <Button
            onClick={() => setCurrentPage('orders')}
            className="w-full bg-[#C41E3A] hover:bg-[#FF6B6B] text-white font-semibold"
            size="lg"
          >
            View My Orders
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FFFDD0] mb-2">Secure Payment</h1>
            <p className="text-lg text-[#FAF3E0]">Choose your preferred payment method</p>
          </div>
        </div>
      </section>

      {/* Payment Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Methods */}
            <div className="lg:col-span-2">
              <Card className="p-8 bg-white border-2 border-[#D2B48C]">
                <h2 className="text-2xl font-bold text-[#3D2817] mb-6">Payment Method</h2>

                {/* Payment Method Selection */}
                <div className="space-y-4 mb-8">
                  {/* Mobile Money */}
                  <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'mobile'
                      ? 'border-[#C41E3A] bg-[#FFF5F5]'
                      : 'border-[#D2B48C] bg-white hover:bg-[#F0EAD6]'
                  }`}>
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="payment"
                        value="mobile"
                        checked={paymentMethod === 'mobile'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'mobile' | 'bank')}
                        className="w-5 h-5 accent-[#C41E3A]"
                      />
                      <Smartphone className="h-6 w-6 text-[#C41E3A]" />
                      <div>
                        <p className="font-semibold text-[#3D2817]">Mobile Money</p>
                        <p className="text-sm text-[#6B5344]">MTN MoMo, Airtel Money</p>
                      </div>
                    </div>
                  </label>

                  {/* Credit/Debit Card */}
                  <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#C41E3A] bg-[#FFF5F5]'
                      : 'border-[#D2B48C] bg-white hover:bg-[#F0EAD6]'
                  }`}>
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="payment"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'mobile' | 'bank')}
                        disabled
                        className="w-5 h-5 accent-[#C41E3A]"
                      />
                      <CreditCard className="h-6 w-6 text-[#C41E3A]" />
                      <div>
                        <p className="font-semibold text-[#3D2817]">Credit/Debit Card</p>
                        <p className="text-sm text-[#6B5344]">Visa, Mastercard (coming soon)</p>
                      </div>
                    </div>
                  </label>

                  {/* Bank Transfer */}
                  <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-[#C41E3A] bg-[#FFF5F5]'
                      : 'border-[#D2B48C] bg-white hover:bg-[#F0EAD6]'
                  }`}>
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="payment"
                        value="bank"
                        checked={paymentMethod === 'bank'}
                        onChange={(e) => setPaymentMethod(e.target.value as 'card' | 'mobile' | 'bank')}
                        disabled
                        className="w-5 h-5 accent-[#C41E3A]"
                      />
                      <Building2 className="h-6 w-6 text-[#C41E3A]" />
                      <div>
                        <p className="font-semibold text-[#3D2817]">Bank Transfer</p>
                        <p className="text-sm text-[#6B5344]">Direct bank deposit (coming soon)</p>
                      </div>
                    </div>
                  </label>
                </div>

                {/* Payment Form */}
                <form onSubmit={handlePayment} className="space-y-6">
                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-[#3D2817] mb-4">Card Details</h3>

                      <div>
                        <label htmlFor="cardNumber" className="block text-sm font-semibold text-[#3D2817] mb-2">
                          Card Number
                        </label>
                        <Input
                          id="cardNumber"
                          name="cardNumber"
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          value={cardData.cardNumber}
                          onChange={handleCardInputChange}
                          maxLength={19}
                          className="border-[#D2B48C] focus:border-[#FFD700]"
                        />
                      </div>

                      <div>
                        <label htmlFor="cardName" className="block text-sm font-semibold text-[#3D2817] mb-2">
                          Cardholder Name
                        </label>
                        <Input
                          id="cardName"
                          name="cardName"
                          type="text"
                          placeholder="John Doe"
                          value={cardData.cardName}
                          onChange={handleCardInputChange}
                          className="border-[#D2B48C] focus:border-[#FFD700]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-semibold text-[#3D2817] mb-2">
                            Expiry Date
                          </label>
                          <Input
                            id="expiryDate"
                            name="expiryDate"
                            type="text"
                            placeholder="MM/YY"
                            value={cardData.expiryDate}
                            onChange={handleCardInputChange}
                            maxLength={5}
                            className="border-[#D2B48C] focus:border-[#FFD700]"
                          />
                        </div>

                        <div>
                          <label htmlFor="cvv" className="block text-sm font-semibold text-[#3D2817] mb-2">
                            CVV
                          </label>
                          <Input
                            id="cvv"
                            name="cvv"
                            type="password"
                            placeholder="123"
                            value={cardData.cvv}
                            onChange={handleCardInputChange}
                            maxLength={3}
                            className="border-[#D2B48C] focus:border-[#FFD700]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'mobile' && (
                    <div className="bg-[#F0EAD6] border border-[#D2B48C] rounded-lg p-4 text-sm text-[#6B5344]">
                      <div className="flex items-center gap-4 mb-3">
                        <AlertCircle className="h-5 w-5 text-[#C41E3A] flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Mobile Money Payment</p>
                          <p className="text-sm">We'll send a payment request via SMS to the number below.</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#3D2817] mb-1">Phone to charge</label>
                          <Input value={orderData.customerPhone} readOnly className="bg-white border-[#D2B48C]" />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#3D2817] mb-1">Provider</label>
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-2">
                              <input type="radio" name="provider" value="mtn" checked={mobileProvider === 'mtn'} onChange={() => setMobileProvider('mtn')} className="accent-[#C41E3A]" />
                              MTN
                            </label>
                            <label className="flex items-center gap-2">
                              <input type="radio" name="provider" value="airtel" checked={mobileProvider === 'airtel'} onChange={() => setMobileProvider('airtel')} className="accent-[#C41E3A]" />
                              Airtel
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm">After you click <strong>Pay</strong>, you'll receive a prompt on your phone. Reply exactly: <strong>1 &lt;your PIN&gt;</strong>, then reply <strong>YES</strong> when requested.</p>
                      </div>

                      {isProcessing && (
                        <div className="bg-white p-3 rounded border border-[#D2B48C] text-sm space-y-1 mb-3">
                          <p className="font-semibold">Processing</p>
                          <p>{processingMessage}</p>
                          <p>Waiting time: {countdown}s</p>
                          {txnRef && <p className="text-xs">Provider Ref: {txnRef}</p>}
                          {transactionId && <p className="text-xs">Transaction ID: {transactionId}</p>}
                          <div className="pt-2 flex gap-2">
                            <Button variant="ghost" onClick={cancelPayment}>Cancel Payment</Button>
                          </div>
                        </div>
                      )}

                      {!isProcessing && (
                        <div className="text-sm text-[#6B5344]">Click <strong>Pay</strong> to start mobile money payment flow.</div>
                      )}
                    </div>
                  )}

                  {paymentMethod === 'bank' && (
                    <div className="bg-[#F0EAD6] border border-[#D2B48C] rounded-lg p-4 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-[#C41E3A] flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-[#6B5344]">
                        <p className="font-semibold mb-2">Bank Transfer Details:</p>
                        <p className="mb-1">Bank: BK Bank Rwanda</p>
                        <p className="mb-1">Account: 1234567890</p>
                        <p>Reference: Your Order ID (will be sent after confirmation)</p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pt-6 border-t border-[#D2B48C] flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#D2B48C] text-[#3D2817] hover:bg-[#F0EAD6]"
                      onClick={() => setCurrentPage('checkout')}
                    >
                      Back to Checkout
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 bg-[#C41E3A] hover:bg-[#FF6B6B] text-white font-semibold disabled:opacity-50"
                      size="lg"
                    >
                      {isProcessing ? 'Processing...' : `Pay ${totalAmount.toLocaleString()} FRW`}
                    </Button>
                  </div>
                </form>

                {/* Security Badge */}
                <div className="mt-6 pt-6 border-t border-[#D2B48C] text-center text-sm text-[#6B5344]">
                  <p>🔒 Your payment information is secure and encrypted</p>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="p-6 bg-white border-2 border-[#D2B48C] sticky top-4">
                <h2 className="text-2xl font-bold text-[#3D2817] mb-6 flex items-center gap-2">
                  <Package className="h-6 w-6 text-[#C41E3A]" />
                  Order Summary
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-6 pb-6 border-b border-[#D2B48C]">
                  {cart.map((item: any) => (
                    <div key={item.product.id} className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-[#3D2817]">{item.product.name}</p>
                        <p className="text-sm text-[#6B5344]">Qty: {item.quantity}</p>
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
                    <span>Subtotal:</span>
                    <span className="font-semibold">{cartTotal.toLocaleString()} FRW</span>
                  </div>
                  <div className="flex justify-between text-[#6B5344]">
                    <span>Delivery Fee:</span>
                    <span className="font-semibold">{deliveryFee.toLocaleString()} FRW</span>
                  </div>
                  <div className="pt-2 border-t border-[#D2B48C] flex justify-between">
                    <span className="font-bold text-[#3D2817]">Total:</span>
                    <span className="text-2xl font-bold text-[#C41E3A]">
                      {totalAmount.toLocaleString()} FRW
                    </span>
                  </div>
                </div>

                {/* Payment Security */}
                <div className="bg-[#F0EAD6] rounded-lg p-4 text-sm text-[#6B5344] space-y-2">
                  <p className="font-semibold text-[#3D2817]">Safe & Secure</p>
                  <p>✓ SSL Encrypted</p>
                  <p>✓ PCI Compliant</p>
                  <p>✓ Money-back Guarantee</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
