import { Trash2, Plus, Minus, ShoppingBag, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from 'sonner';

export function CartPage() {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, setCurrentPage, isUserLoggedIn } = useApp();
  const { t } = useI18n();
  
  const deliveryFee = 3000; // Default local delivery fee
  const totalAmount = cartTotal + deliveryFee;
  const minimumOrder = 4500;
  
  const handleQuantityChange = (productId: string, delta: number) => {
    const item = cart.find(item => item.product.id === productId);
    if (!item) return;
    
    const newQuantity = item.quantity + delta;
    if (newQuantity > item.product.stock) {
      toast.error(t('cart.notEnoughStock'));
      return;
    }
    updateCartQuantity(productId, newQuantity);
  };
  
  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error(t('cart.empty'));
      return;
    }
    
    if (cartTotal < minimumOrder) {
      toast.error(t('cart.minimumOrderError', { amount: minimumOrder.toLocaleString() }));
      return;
    }
    
    if (isUserLoggedIn) {
      setCurrentPage('checkout');
      return;
    }

    sessionStorage.setItem('postLoginRedirect', 'checkout');
    setCurrentPage('login');
  };
  
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFFDD0] flex items-center justify-center py-20">
        <Card className="p-12 max-w-md text-center bg-white border-2 border-[#D2B48C]">
          <ShoppingBag className="h-20 w-20 text-[#D2B48C] mx-auto mb-6" />
          <h2 className="text-3xl mb-4 text-[#3D2817]">{t('cart.empty')}</h2>
          <p className="text-[#6B5344] mb-8">
            {t('cart.emptyDesc')}
          </p>
          <Button
            onClick={() => setCurrentPage('shop')}
            className="bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
            size="lg"
          >
            {t('cart.browseProducts')}
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl mb-4 text-[#FFFDD0]">{t('cart.title')}</h1>
            <p className="text-xl text-[#FAF3E0]">
              {t('cart.subtitle')}
            </p>
          </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl mb-4 text-[#3D2817]">{t('cart.itemsTitle')} ({cart.length})</h2>
            
            {cart.map(item => (
              <Card key={item.product.id} className="p-6 bg-white border-2 border-[#D2B48C]">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#F0EAD6] to-[#FAF3E0] rounded-lg flex items-center justify-center flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1585355611468-3c418173f128?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZhcm0lMjBlZ2dzfGVufDF8fHx8MTc3MDI3NDM0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt={item.product.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl mb-1 text-[#3D2817]">{item.product.name}</h3>
                    <p className="text-sm text-[#6B5344] mb-3">{item.product.description}</p>
                    <div className="text-lg text-[#C41E3A]">
                      {item.product.price.toLocaleString()} FRW / tray
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(item.product.id, -1)}
                        disabled={item.quantity <= 1}
                        className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <div className="w-12 text-center">
                        <div className="text-xl text-[#3D2817]">{item.quantity}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuantityChange(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="text-xl text-[#3D2817]">
                      {(item.product.price * item.quantity).toLocaleString()} FRW
                    </div>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-[#C41E3A] hover:bg-[#C41E3A] hover:text-white"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t('cart.remove')}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {/* Order Summary */}
          <div>
            <Card className="p-6 bg-white border-2 border-[#D2B48C] sticky top-24">
              <h2 className="text-2xl mb-6 text-[#3D2817]">{t('cart.summaryTitle')}</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[#6B5344]">
                  <span>{t('cart.subtotal')}</span>
                  <span>{cartTotal.toLocaleString()} FRW</span>
                </div>
                <div className="flex justify-between text-[#6B5344]">
                  <span>{t('cart.deliveryFeeLocal')}</span>
                  <span>{deliveryFee.toLocaleString()} FRW</span>
                </div>
                <div className="border-t-2 border-[#D2B48C] pt-3 flex justify-between text-xl text-[#3D2817]">
                  <span>{t('cart.total')}</span>
                  <span className="text-[#C41E3A]">{totalAmount.toLocaleString()} FRW</span>
                </div>
              </div>
              
              {cartTotal < minimumOrder && (
                <div className="bg-[#FF8C00]/10 border border-[#FF8C00] rounded-lg p-3 mb-4">
                  <p className="text-sm text-[#3D2817]">
                    {t('cart.addMore', { amount: (minimumOrder - cartTotal).toLocaleString() })}
                  </p>
                </div>
              )}
              
              <>
                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-[#C41E3A] hover:bg-[#FF6B6B] text-white mb-3"
                  size="lg"
                  disabled={cartTotal < minimumOrder}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />
                  {t('cart.proceed')}
                </Button>
                <Button
                  onClick={() => setCurrentPage('shop')}
                  variant="outline"
                  className="w-full border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                >
                  {t('cart.continueShopping')}
                </Button>
              </>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
