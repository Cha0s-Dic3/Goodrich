import { ShoppingCart, CheckCircle, Truck, Heart, Megaphone, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function HomePage() {
  const { setCurrentPage, products, announcements } = useApp();
  const { t } = useI18n();
  
  const featuredProducts = products.slice(0, 4);
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-br from-[#8B4513] to-[#A0522D] overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1659668093836-17337bf8e07b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwZmFybSUyMHBhc3R1cmV8ZW58MXx8fHwxNzcwMjc0MzM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="inline-block bg-[#FFD700] text-[#3D2817] px-4 py-2 rounded-full mb-6">
              <span className="text-sm font-semibold">{t('home.heroBadge')}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[#FFFDD0] mb-6 leading-tight">
              {t('home.heroTitle1')}<br />{t('home.heroTitle2')}
            </h1>
            <p className="text-xl text-[#FAF3E0] mb-8 leading-relaxed">
              {t('home.heroDescription')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => setCurrentPage('shop')}
                size="lg"
                className="bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {t('home.shopNow')}
              </Button>
              <Button
                onClick={() => setCurrentPage('about')}
                size="lg"
                variant="outline"
                className="border-2 border-[#FFFDD0] text-[#FFFDD0] hover:bg-[#FFFDD0] hover:text-[#8B4513]"
              >
                {t('home.learnMore')}
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <section className="py-16 bg-[#F0EAD6]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="p-6 text-center bg-white border-2 border-[#D2B48C] hover:border-[#FFD700] transition-colors">
              <div className="w-16 h-16 bg-[#228B22] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl mb-2 text-[#3D2817]">{t('home.values.naturalTitle')}</h3>
              <p className="text-sm text-[#6B5344]">{t('home.values.naturalDesc')}</p>
            </Card>
            
            <Card className="p-6 text-center bg-white border-2 border-[#D2B48C] hover:border-[#FFD700] transition-colors">
              <div className="w-16 h-16 bg-[#C41E3A] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl mb-2 text-[#3D2817]">{t('home.values.freeRangeTitle')}</h3>
              <p className="text-sm text-[#6B5344]">{t('home.values.freeRangeDesc')}</p>
            </Card>
            
            <Card className="p-6 text-center bg-white border-2 border-[#D2B48C] hover:border-[#FFD700] transition-colors">
              <div className="w-16 h-16 bg-[#D2691E] rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl mb-2 text-[#3D2817]">{t('home.values.fastTitle')}</h3>
              <p className="text-sm text-[#6B5344]">{t('home.values.fastDesc')}</p>
            </Card>
            
            <Card className="p-6 text-center bg-white border-2 border-[#D2B48C] hover:border-[#FFD700] transition-colors">
              <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-[#3D2817]" />
              </div>
              <h3 className="text-xl mb-2 text-[#3D2817]">{t('home.values.qualityTitle')}</h3>
              <p className="text-sm text-[#6B5344]">{t('home.values.qualityDesc')}</p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16 bg-[#FFFDD0]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-[#3D2817]">{t('home.productsTitle')}</h2>
            <p className="text-lg text-[#6B5344] max-w-2xl mx-auto">
              {t('home.productsDesc')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden bg-white border-2 border-[#D2B48C] hover:border-[#C41E3A] transition-all hover:shadow-xl">
                <div className="h-48 bg-gradient-to-br from-[#F0EAD6] to-[#FAF3E0] flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1585355611468-3c418173f128?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmcmVzaCUyMGZhcm0lMjBlZ2dzfGVufDF8fHx8MTc3MDI3NDM0MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl mb-2 text-[#3D2817]">{product.name}</h3>
                  <p className="text-sm text-[#6B5344] mb-4">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl text-[#C41E3A]">{product.price.toLocaleString()} FRW</span>
                    <span className="text-sm text-[#6B5344]">{t('home.stockLabel')} {product.stock}</span>
                  </div>
                  <Button
                    onClick={() => setCurrentPage('shop')}
                    className="w-full bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
                  >
                    {t('home.viewDetails')}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button
              onClick={() => setCurrentPage('shop')}
              size="lg"
              className="bg-[#8B4513] hover:bg-[#A0522D] text-white"
            >
              {t('home.viewAllProducts')}
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Announcements */}
      <section className="py-12 bg-[#F0EAD6]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl mb-2 text-[#3D2817] flex items-center justify-center gap-3">
              <Megaphone className="h-6 w-6 text-[#C41E3A]" />
              {t('home.announcementsTitle')}
            </h2>
            <p className="text-sm text-[#6B5344]">{t('home.announcementsSubtitle')}</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {announcements.length === 0 ? (
              <Card className="p-6 bg-white border-2 border-[#D2B48C] text-center">
                <p className="text-[#6B5344]">{t('home.noAnnouncements')}</p>
              </Card>
            ) : (
              announcements.slice(0, 3).map(a => (
                <Card key={a.id} className="p-4 bg-white border-2 border-[#D2B48C]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-[#3D2817]">{a.title}</h3>
                      <p className="text-sm text-[#6B5344] mt-2 whitespace-pre-wrap">{a.content}</p>
                    </div>
                    <div className="text-right text-sm text-[#6B5344] ml-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Calendar className="h-4 w-4 text-[#C41E3A]" />
                        <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-16 bg-[#F0EAD6]">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl text-center mb-12 text-[#3D2817]">{t('home.testimonialsTitle')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-white border-2 border-[#D2B48C]">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#FFD700]">★</span>
                ))}
              </div>
              <p className="text-[#3D2817] mb-4 italic">
                "{t('home.testimonials.one.quote')}"
              </p>
              <div className="border-t border-[#D2B48C] pt-4">
                <p className="font-semibold text-[#8B4513]">{t('home.testimonials.one.name')}</p>
                <p className="text-sm text-[#6B5344]">{t('home.testimonials.one.place')}</p>
              </div>
            </Card>
            
            <Card className="p-6 bg-white border-2 border-[#D2B48C]">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#FFD700]">★</span>
                ))}
              </div>
              <p className="text-[#3D2817] mb-4 italic">
                "{t('home.testimonials.two.quote')}"
              </p>
              <div className="border-t border-[#D2B48C] pt-4">
                <p className="font-semibold text-[#8B4513]">{t('home.testimonials.two.name')}</p>
                <p className="text-sm text-[#6B5344]">{t('home.testimonials.two.place')}</p>
              </div>
            </Card>
            
            <Card className="p-6 bg-white border-2 border-[#D2B48C]">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#FFD700]">★</span>
                ))}
              </div>
              <p className="text-[#3D2817] mb-4 italic">
                "{t('home.testimonials.three.quote')}"
              </p>
              <div className="border-t border-[#D2B48C] pt-4">
                <p className="font-semibold text-[#8B4513]">{t('home.testimonials.three.name')}</p>
                <p className="text-sm text-[#6B5344]">{t('home.testimonials.three.place')}</p>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#8B4513] to-[#C41E3A]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl mb-6 text-[#FFFDD0]">{t('home.ctaTitle')}</h2>
          <p className="text-xl text-[#FAF3E0] mb-8 max-w-2xl mx-auto">
            {t('home.ctaDesc')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => setCurrentPage('shop')}
              size="lg"
              className="bg-[#FFD700] hover:bg-[#FF8C00] text-[#3D2817]"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {t('home.startShopping')}
            </Button>
            <Button
              onClick={() => setCurrentPage('contact')}
              size="lg"
              variant="outline"
              className="border-2 border-[#FFFDD0] text-[#FFFDD0] hover:bg-[#FFFDD0] hover:text-[#8B4513]"
            >
              {t('home.contactUs')}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
