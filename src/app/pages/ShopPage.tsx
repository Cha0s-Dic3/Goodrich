import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export function ShopPage() {
  const { products, addToCart, cart } = useApp();
  const { t } = useI18n();
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  const filteredProducts = selectedSize === 'all' 
    ? products 
    : products.filter(p => p.size === selectedSize);
  
  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  };
  
  const handleAddToCart = (product: typeof products[0]) => {
    const quantity = quantities[product.id] || 1;
    if (quantity > product.stock) {
      toast.error(t('shop.notEnoughStock'));
      return;
    }
    addToCart(product, quantity);
    toast.success(t('shop.addedToCart', { quantity, name: product.name }));
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  };
  
  const sizeFilters = [
    { value: 'all', label: t('shop.filters.all') },
    { value: 'small', label: t('shop.filters.small') },
    { value: 'medium', label: t('shop.filters.medium') },
    { value: 'large', label: t('shop.filters.large') },
    { value: 'extra-large', label: t('shop.filters.extraLarge') }
  ];
  
  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl mb-6 text-[#FFFDD0]">{t('shop.heroTitle')}</h1>
            <p className="text-xl text-[#FAF3E0]">
              {t('shop.heroDesc')}
            </p>
          </div>
        </div>
      </section>
      
      {/* Filters */}
      <section className="py-8 bg-[#F0EAD6] border-b-2 border-[#D2B48C]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {sizeFilters.map(filter => (
              <Button
                key={filter.value}
                onClick={() => setSelectedSize(filter.value)}
                variant={selectedSize === filter.value ? 'default' : 'outline'}
                className={
                  selectedSize === filter.value
                    ? 'bg-[#C41E3A] hover:bg-[#FF6B6B] text-white'
                    : 'border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white'
                }
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </section>
      
      {/* Product Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-16 w-16 text-[#D2B48C] mx-auto mb-4" />
              <p className="text-xl text-[#6B5344]">{t('shop.noProducts')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => {
                const quantity = quantities[product.id] || 1;
                const isInCart = cart.some(item => item.product.id === product.id);
                
                return (
                  <Card key={product.id} className="overflow-hidden bg-white border-2 border-[#D2B48C] hover:border-[#C41E3A] transition-all hover:shadow-xl">
                    {/* Product Image */}
                    <div className="h-56 bg-gradient-to-br from-[#F0EAD6] to-[#FAF3E0] flex items-center justify-center relative">
                      <img
                        src="https://images.unsplash.com/photo-1585355611468-3c418173f128?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZhcm0lMjBlZ2dzfGVufDF8fHx8MTc3MDI3NDM0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                      {isInCart && (
                        <Badge className="absolute top-3 right-3 bg-[#228B22] text-white">
                          {t('shop.inCart')}
                        </Badge>
                      )}
                      {product.stock < 10 && (
                        <Badge className="absolute top-3 left-3 bg-[#FF8C00] text-white">
                          {t('shop.lowStock')}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl text-[#3D2817]">{product.name}</h3>
                        <Badge variant="outline" className="border-[#8B4513] text-[#8B4513] capitalize">
                          {product.size}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-[#6B5344] mb-4">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-2xl text-[#C41E3A]">
                            {product.price.toLocaleString()} FRW
                          </div>
                          <div className="text-xs text-[#6B5344]">
                            {product.quantity} {t('shop.eggsPerTray')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-[#6B5344]">{t('shop.stock')}</div>
                          <div className="text-lg text-[#3D2817]">{product.stock}</div>
                        </div>
                      </div>
                      
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-3 mb-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(product.id, -1)}
                          disabled={quantity <= 1}
                          className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <div className="flex-1 text-center">
                          <div className="text-2xl text-[#3D2817]">{quantity}</div>
                          <div className="text-xs text-[#6B5344]">{t('shop.trays')}</div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuantityChange(product.id, 1)}
                          disabled={quantity >= product.stock}
                          className="border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Add to Cart Button */}
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="w-full bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {product.stock === 0 ? t('shop.outOfStock') : t('shop.addToCart')}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
      
      {/* Info Section */}
      <section className="py-16 bg-[#F0EAD6]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl mb-8 text-center text-[#3D2817]">{t('shop.whyTitle')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white border-2 border-[#228B22]">
                <h3 className="text-lg mb-2 text-[#3D2817]">{t('shop.why.freeRangeTitle')}</h3>
                <p className="text-sm text-[#6B5344]">
                  {t('shop.why.freeRangeDesc')}
                </p>
              </Card>
              
              <Card className="p-6 bg-white border-2 border-[#FFD700]">
                <h3 className="text-lg mb-2 text-[#3D2817]">{t('shop.why.dailyTitle')}</h3>
                <p className="text-sm text-[#6B5344]">
                  {t('shop.why.dailyDesc')}
                </p>
              </Card>
              
              <Card className="p-6 bg-white border-2 border-[#C41E3A]">
                <h3 className="text-lg mb-2 text-[#3D2817]">{t('shop.why.qualityTitle')}</h3>
                <p className="text-sm text-[#6B5344]">
                  {t('shop.why.qualityDesc')}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
