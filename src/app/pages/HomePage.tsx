import { ShoppingCart, CheckCircle, Truck, Heart, Megaphone, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

export function HomePage() {
  const { setCurrentPage, products, announcements } = useApp();
  
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
              <span className="text-sm font-semibold">Fresh from our farm to your table</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[#FFFDD0] mb-6 leading-tight">
              Premium Quality<br />Farm Fresh Eggs
            </h1>
            <p className="text-xl text-[#FAF3E0] mb-8 leading-relaxed">
              Raised with care on our 5,000-chicken farm in Eastern Rwanda. 
              Free-range, healthy, and delivered fresh to your doorstep.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => setCurrentPage('shop')}
                size="lg"
                className="bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Shop Now
              </Button>
              <Button
                onClick={() => setCurrentPage('about')}
                size="lg"
                variant="outline"
                className="border-2 border-[#FFFDD0] text-[#FFFDD0] hover:bg-[#FFFDD0] hover:text-[#8B4513]"
              >
                Learn More
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
              <h3 className="text-xl mb-2 text-[#3D2817]">100% Natural</h3>
              <p className="text-sm text-[#6B5344]">No hormones or antibiotics. Just natural, healthy eggs.</p>
            </Card>
            
            <Card className="p-6 text-center bg-white border-2 border-[#D2B48C] hover:border-[#FFD700] transition-colors">
              <div className="w-16 h-16 bg-[#C41E3A] rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl mb-2 text-[#3D2817]">Free-Range</h3>
              <p className="text-sm text-[#6B5344]">Our chickens roam freely in spacious, clean environments.</p>
            </Card>
            
            <Card className="p-6 text-center bg-white border-2 border-[#D2B48C] hover:border-[#FFD700] transition-colors">
              <div className="w-16 h-16 bg-[#D2691E] rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl mb-2 text-[#3D2817]">Fast Delivery</h3>
              <p className="text-sm text-[#6B5344]">Local delivery within 24 hours. Fresh and reliable.</p>
            </Card>
            
            <Card className="p-6 text-center bg-white border-2 border-[#D2B48C] hover:border-[#FFD700] transition-colors">
              <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-[#3D2817]" />
              </div>
              <h3 className="text-xl mb-2 text-[#3D2817]">Quality Guaranteed</h3>
              <p className="text-sm text-[#6B5344]">Every egg is carefully inspected for quality and freshness.</p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-16 bg-[#FFFDD0]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl mb-4 text-[#3D2817]">Our Premium Eggs</h2>
            <p className="text-lg text-[#6B5344] max-w-2xl mx-auto">
              Fresh eggs available in different sizes. All eggs are collected daily and delivered fresh.
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
                    <span className="text-sm text-[#6B5344]">Stock: {product.stock}</span>
                  </div>
                  <Button
                    onClick={() => setCurrentPage('shop')}
                    className="w-full bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
                  >
                    View Details
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
              View All Products
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
              Latest Announcements
            </h2>
            <p className="text-sm text-[#6B5344]">News and updates from Goodrich Farm</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {announcements.length === 0 ? (
              <Card className="p-6 bg-white border-2 border-[#D2B48C] text-center">
                <p className="text-[#6B5344]">No announcements at the moment. Check back soon.</p>
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
          <h2 className="text-4xl text-center mb-12 text-[#3D2817]">What Our Customers Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 bg-white border-2 border-[#D2B48C]">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#FFD700]">★</span>
                ))}
              </div>
              <p className="text-[#3D2817] mb-4 italic">
                "The freshest eggs I've ever had! Delivery is always on time and the quality is exceptional."
              </p>
              <div className="border-t border-[#D2B48C] pt-4">
                <p className="font-semibold text-[#8B4513]">Marie Uwase</p>
                <p className="text-sm text-[#6B5344]">Kigali</p>
              </div>
            </Card>
            
            <Card className="p-6 bg-white border-2 border-[#D2B48C]">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#FFD700]">★</span>
                ))}
              </div>
              <p className="text-[#3D2817] mb-4 italic">
                "I love knowing where my food comes from. Goodrich Farm's transparency and quality are unmatched!"
              </p>
              <div className="border-t border-[#D2B48C] pt-4">
                <p className="font-semibold text-[#8B4513]">Jean Paul Nkusi</p>
                <p className="text-sm text-[#6B5344]">Kayonza</p>
              </div>
            </Card>
            
            <Card className="p-6 bg-white border-2 border-[#D2B48C]">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#FFD700]">★</span>
                ))}
              </div>
              <p className="text-[#3D2817] mb-4 italic">
                "Best farm eggs in Rwanda! Perfect for my restaurant. Consistent quality every single time."
              </p>
              <div className="border-t border-[#D2B48C] pt-4">
                <p className="font-semibold text-[#8B4513]">Grace Mutoni</p>
                <p className="text-sm text-[#6B5344]">Restaurant Owner</p>
              </div>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#8B4513] to-[#C41E3A]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl mb-6 text-[#FFFDD0]">Ready to Order Fresh Eggs?</h2>
          <p className="text-xl text-[#FAF3E0] mb-8 max-w-2xl mx-auto">
            Experience the difference of truly fresh, farm-raised eggs. Order today and taste the quality!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => setCurrentPage('shop')}
              size="lg"
              className="bg-[#FFD700] hover:bg-[#FF8C00] text-[#3D2817]"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Start Shopping
            </Button>
            <Button
              onClick={() => setCurrentPage('contact')}
              size="lg"
              variant="outline"
              className="border-2 border-[#FFFDD0] text-[#FFFDD0] hover:bg-[#FFFDD0] hover:text-[#8B4513]"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
