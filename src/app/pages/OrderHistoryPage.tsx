import { useEffect, useState } from 'react';
import { Package, Calendar, MapPin, User, Phone, Mail, Eye, Filter, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';

export function OrderHistoryPage() {
  const {
    orders,
    payments,
    setCurrentPage,
    loadOrders,
    loadPayments,
    retryPayment,
    isUserLoggedIn,
    clearOrderHistory
  } = useApp();
  const { t, language } = useI18n();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const localeMap = { en: 'en-US', rw: 'rw-RW', sw: 'sw-TZ', fr: 'fr-FR' } as const;
  const locale = localeMap[language];

  useEffect(() => {
    if (!isUserLoggedIn) {
      setCurrentPage('login');
      return;
    }
    loadOrders('user');
    loadPayments('user');
  }, [isUserLoggedIn, setCurrentPage]);

  // Filter orders by status
  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'out-for-delivery':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleClearHistory = async () => {
    if (!confirm('Clear your entire order history? This cannot be undone.')) return;
    try {
      await clearOrderHistory();
      toast.success(t('orders.historyCleared'));
    } catch (err: any) {
      toast.error(err?.message || t('orders.clearFailed'));
    }
  };

  const handleRetryPayment = async (ref: string) => {
    try {
      const newRef = await retryPayment(ref);
      toast.success(t('orders.retryStarted', { ref: newRef }));
    } catch (err: any) {
      toast.error(err?.message || t('orders.retryFailed'));
    }
  };

  const visiblePayments = payments.filter((payment) => !payment.orderId);
  const canRetry = (payment: typeof payments[number]) =>
    payment.status === 'failed' && payment.method !== 'manual-momo';

  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FFFDD0] mb-2 flex items-center gap-3">
              <Package className="h-10 w-10" />
              {t('orders.title')}
            </h1>
            <p className="text-lg text-[#FAF3E0]">
              {t('orders.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {visiblePayments.length > 0 && (
            <Card className="p-6 bg-white border-2 border-[#D2B48C] mb-8">
              <h2 className="text-2xl font-bold text-[#3D2817] mb-4">{t('orders.paymentRequests')}</h2>
              <div className="space-y-3">
                {visiblePayments.map((payment) => (
                  <div
                    key={`${payment.id}-${payment.ref}`}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border border-[#F0EAD6] rounded-lg p-4"
                  >
                    <div>
                      <p className="text-sm text-[#6B5344]">{t('orders.ref')}: {payment.ref}</p>
                      <p className="font-semibold text-[#3D2817]">
                        {t('orders.amount')}: {payment.amount?.toLocaleString?.() || payment.amount} FRW
                      </p>
                      <p className="text-xs text-[#6B5344]">
                        {t('orders.status')}: {payment.status}
                        {payment.failureReason ? ` | ${payment.failureReason}` : ''}
                      </p>
                      {payment.expiresAt && (
                        <p className="text-xs text-[#6B5344]">
                          {t('orders.expires')}: {new Date(payment.expiresAt).toLocaleTimeString(locale)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {canRetry(payment) && (
                        <Button
                          size="sm"
                          className="bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
                          onClick={() => handleRetryPayment(payment.ref)}
                          disabled={payment.status === 'successful'}
                        >
                          {t('orders.retryPayment')}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {orders.length === 0 ? (
            <Card className="p-12 bg-white border-2 border-[#D2B48C] text-center">
              <Package className="h-20 w-20 text-[#D2B48C] mx-auto mb-6" />
              <h2 className="text-3xl mb-2 text-[#3D2817]">{t('orders.noOrders')}</h2>
              <p className="text-[#6B5344] mb-8">
                {t('orders.noOrdersDesc')}
              </p>
              <Button
                onClick={() => setCurrentPage('shop')}
                className="bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
                size="lg"
              >
                {t('orders.browseProducts')}
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Filter Section */}
              <Card className="p-6 bg-white border-2 border-[#D2B48C]">
                <div className="flex items-center gap-3 mb-4">
                  <Filter className="h-5 w-5 text-[#C41E3A]" />
                  <h2 className="text-lg font-bold text-[#3D2817]">{t('orders.filterByStatus')}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setSelectedStatus('all')}
                    className={`${
                      selectedStatus === 'all'
                        ? 'bg-[#C41E3A] text-white'
                        : 'bg-[#F0EAD6] text-[#3D2817] hover:bg-[#D2B48C]'
                    }`}
                    size="sm"
                  >
                    {t('orders.allOrders')}
                  </Button>
                  {['pending', 'confirmed', 'processing', 'out-for-delivery', 'delivered', 'cancelled'].map(status => (
                    <Button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`${
                        selectedStatus === status
                          ? 'bg-[#C41E3A] text-white'
                          : 'bg-[#F0EAD6] text-[#3D2817] hover:bg-[#D2B48C]'
                      }`}
                      size="sm"
                    >
                      {getStatusLabel(status)}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={handleClearHistory}
                    variant="outline"
                    className="border-[#C41E3A] text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('orders.clearHistory')}
                  </Button>
                </div>
              </Card>

              {/* Orders List */}
              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <Card className="p-8 bg-white border-2 border-[#D2B48C] text-center">
                    <p className="text-[#6B5344]">{t('orders.noneForStatus')}</p>
                  </Card>
                ) : (
                  filteredOrders.map(order => (
                    <Card key={order.id} className="p-6 bg-white border-2 border-[#D2B48C] hover:border-[#FFD700] transition-colors">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                        {/* Order ID */}
                        <div>
                          <p className="text-sm text-[#6B5344] mb-1">{t('orders.orderId')}</p>
                          <p className="font-bold text-[#3D2817]">{order.id}</p>
                        </div>

                        {/* Date */}
                        <div>
                          <p className="text-sm text-[#6B5344] mb-1 flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {t('orders.orderDate')}
                          </p>
                          <p className="font-semibold text-[#3D2817]">
                            {new Date(order.createdAt).toLocaleDateString(locale)}
                          </p>
                        </div>

                        {/* Total Amount */}
                        <div>
                          <p className="text-sm text-[#6B5344] mb-1">{t('orders.totalAmount')}</p>
                          <p className="font-bold text-[#C41E3A]">
                            {(order.totalAmount + order.deliveryFee).toLocaleString()} FRW
                          </p>
                        </div>

                        {/* Items Count */}
                        <div>
                          <p className="text-sm text-[#6B5344] mb-1">{t('orders.items')}</p>
                          <p className="font-semibold text-[#3D2817]">
                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} {t('orders.pieces')}
                          </p>
                        </div>

                        {/* Status */}
                        <div>
                          <p className="text-sm text-[#6B5344] mb-1">{t('orders.status')}</p>
                          <Badge className={`border-2 ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </Badge>
                          {order.paymentStatus && (
                            <p className="text-xs text-[#6B5344] mt-1">
                              Payment: {order.paymentStatus}
                              {order.paypackRef ? ` (${order.paypackRef})` : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-t border-b border-[#D2B48C]">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-[#C41E3A] flex-shrink-0 mt-0.5" />
                          <div>
                          <p className="text-sm text-[#6B5344]">{t('orders.deliveryAddress')}</p>
                            <p className="font-semibold text-[#3D2817] text-sm">{order.deliveryAddress}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-[#6B5344] mb-1">{t('orders.deliveryDate')}</p>
                          <p className="font-semibold text-[#3D2817]">
                            {new Date(order.deliveryDate).toLocaleDateString(locale)}
                          </p>
                          {order.deliveryTimeWindow && (
                            <p className="text-xs text-[#6B5344]">{order.deliveryTimeWindow}</p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="bg-[#8B4513] hover:bg-[#A0522D] text-white"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {t('orders.viewDetails')}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-2xl text-[#3D2817]">
                                Order Details - {order.id}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Customer Info */}
                              <div className="bg-[#F0EAD6] p-4 rounded-lg">
                                <h3 className="font-bold text-[#3D2817] mb-3 flex items-center gap-2">
                                  <User className="h-5 w-5" />
                                  {t('orders.customerInformation')}
                                </h3>
                                <div className="space-y-2">
                                  <p className="text-sm text-[#6B5344]">
                                    <span className="font-semibold">{t('orders.name')}:</span> {order.customerName}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-[#C41E3A]" />
                                    <p className="text-sm text-[#6B5344]">{order.customerPhone}</p>
                                  </div>
                                  {order.customerEmail && (
                                    <div className="flex items-center gap-2">
                                      <Mail className="h-4 w-4 text-[#C41E3A]" />
                                      <p className="text-sm text-[#6B5344]">{order.customerEmail}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Items */}
                              <div>
                                <h3 className="font-bold text-[#3D2817] mb-3">{t('orders.orderItems')}</h3>
                                <div className="space-y-2">
                                  {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 bg-[#F0EAD6] rounded-lg">
                                      <div>
                                        <p className="font-semibold text-[#3D2817]">{item.product.name}</p>
                                        <p className="text-sm text-[#6B5344]">{t('orders.quantity')}: {item.quantity}</p>
                                      </div>
                                      <p className="font-bold text-[#C41E3A]">
                                        {(item.product.price * item.quantity).toLocaleString()} FRW
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Pricing */}
                              <div className="bg-[#F0EAD6] p-4 rounded-lg">
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-[#6B5344]">{t('orders.subtotal')}:</span>
                                    <span className="font-semibold text-[#3D2817]">
                                      {order.totalAmount.toLocaleString()} FRW
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[#6B5344]">{t('orders.deliveryFee')}:</span>
                                    <span className="font-semibold text-[#3D2817]">
                                      {order.deliveryFee.toLocaleString()} FRW
                                    </span>
                                  </div>
                                  <div className="border-t border-[#D2B48C] pt-2 flex justify-between">
                                    <span className="font-bold text-[#3D2817]">{t('orders.total')}:</span>
                                    <span className="text-2xl font-bold text-[#C41E3A]">
                                      {(order.totalAmount + order.deliveryFee).toLocaleString()} FRW
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Notes */}
                              {order.notes && (
                                <div>
                                  <h3 className="font-bold text-[#3D2817] mb-2">{t('orders.notes')}</h3>
                                  <p className="text-sm text-[#6B5344] bg-[#F0EAD6] p-3 rounded-lg">
                                    {order.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Back to Shopping */}
          <div className="mt-8 text-center">
            <Button
              onClick={() => setCurrentPage('shop')}
              variant="outline"
              className="border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
              size="lg"
            >
              {t('orders.continueShopping')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
