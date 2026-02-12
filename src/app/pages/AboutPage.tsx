import { Target, Eye, Heart, Users, MapPin, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/card';

export function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl mb-6 text-[#FFFDD0]">About Goodrich Farm</h1>
            <p className="text-xl text-[#FAF3E0] leading-relaxed">
              A family-run poultry farm committed to quality, animal welfare, and community growth
            </p>
          </div>
        </div>
      </section>
      
      {/* Our Story */}
      <section className="py-16 bg-[#FFFDD0]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl mb-8 text-[#3D2817] text-center">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-[#3D2817] leading-relaxed mb-6">
                Our chicken farm was founded with one simple goal: to raise healthy chickens using responsible, 
                honest farming practices. What began as a small family effort has grown into a trusted local 
                poultry farm serving households, restaurants, and markets with pride.
              </p>
              <p className="text-lg text-[#3D2817] leading-relaxed mb-6">
                From day one, we focused on quality over quantity, learning from experience, tradition, and 
                modern farming methods to build a farm our community can trust.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Who We Are */}
      <section className="py-16 bg-[#F0EAD6]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Users className="h-12 w-12 text-[#C41E3A]" />
              <h2 className="text-4xl text-[#3D2817]">Who We Are</h2>
            </div>
            <p className="text-lg text-[#3D2817] leading-relaxed mb-6">
              We are a family-run poultry farm supported by a dedicated team of farmers, caretakers, and 
              animal health professionals. Every member of our team plays a role in ensuring our chickens 
              are raised in a clean, safe, and stress-free environment.
            </p>
            <p className="text-lg text-[#3D2817] leading-relaxed">
              Our hands-on approach means we are involved in every stage — from chick care to feeding, 
              health monitoring, and delivery.
            </p>
          </div>
        </div>
      </section>
      
      {/* Mission, Vision, Values */}
      <section className="py-16 bg-[#FFFDD0]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="p-8 bg-white border-2 border-[#C41E3A]">
              <div className="w-16 h-16 bg-[#C41E3A] rounded-full flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl mb-4 text-[#3D2817]">Our Mission</h3>
              <p className="text-[#3D2817] leading-relaxed">
                To produce high-quality, healthy chicken products while maintaining ethical farming practices, 
                protecting animal welfare, and supporting our local community.
              </p>
            </Card>
            
            <Card className="p-8 bg-white border-2 border-[#FFD700]">
              <div className="w-16 h-16 bg-[#FFD700] rounded-full flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-[#3D2817]" />
              </div>
              <h3 className="text-2xl mb-4 text-[#3D2817]">Our Vision</h3>
              <p className="text-[#3D2817] leading-relaxed">
                To become a leading and trusted poultry farm known for quality, transparency, and sustainable 
                farming practices.
              </p>
            </Card>
            
            <Card className="p-8 bg-white border-2 border-[#228B22]">
              <div className="w-16 h-16 bg-[#228B22] rounded-full flex items-center justify-center mb-6">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl mb-4 text-[#3D2817]">Our Values</h3>
              <ul className="space-y-2 text-[#3D2817]">
                <li>• Animal Welfare</li>
                <li>• Quality & Safety</li>
                <li>• Honesty & Transparency</li>
                <li>• Sustainability</li>
                <li>• Community Support</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Our Farm */}
      <section className="py-16 bg-[#F0EAD6]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <MapPin className="h-12 w-12 text-[#C41E3A]" />
              <h2 className="text-4xl text-[#3D2817]">Our Farm</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <Card className="p-6 bg-white border-2 border-[#D2B48C]">
                <h3 className="text-xl mb-4 text-[#3D2817]">Location</h3>
                <p className="text-[#3D2817]">
                  Eastern Province, Kayonza District<br />
                  Rukara Sector, Kawangire Cell
                </p>
              </Card>
              
              <Card className="p-6 bg-white border-2 border-[#D2B48C]">
                <h3 className="text-xl mb-4 text-[#3D2817]">Farm Capacity</h3>
                <p className="text-[#3D2817]">
                  We are able to keep 5,000 chickens at capacity
                </p>
              </Card>
            </div>
            
            <p className="text-lg text-[#3D2817] leading-relaxed">
              Our farm is designed to allow proper space, ventilation, and hygiene, ensuring our chickens 
              grow in a healthy and comfortable environment.
            </p>
          </div>
        </div>
      </section>
      
      {/* Community Involvement */}
      <section className="py-16 bg-[#FFFDD0]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <TrendingUp className="h-12 w-12 text-[#228B22]" />
              <h2 className="text-4xl text-[#3D2817]">Community Involvement</h2>
            </div>
            
            <p className="text-lg text-[#3D2817] leading-relaxed mb-6">
              We actively support our local community by:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white border-2 border-[#228B22]">
                <h4 className="text-lg mb-2 text-[#3D2817]">Reliable Supply</h4>
                <p className="text-[#6B5344]">
                  Providing reliable poultry supply to local markets
                </p>
              </Card>
              
              <Card className="p-6 bg-white border-2 border-[#228B22]">
                <h4 className="text-lg mb-2 text-[#3D2817]">Job Creation</h4>
                <p className="text-[#6B5344]">
                  Creating job opportunities in our community
                </p>
              </Card>
              
              <Card className="p-6 bg-white border-2 border-[#228B22]">
                <h4 className="text-lg mb-2 text-[#3D2817]">Business Support</h4>
                <p className="text-[#6B5344]">
                  Supporting small businesses and households
                </p>
              </Card>
              
              <Card className="p-6 bg-white border-2 border-[#228B22]">
                <h4 className="text-lg mb-2 text-[#3D2817]">Knowledge Sharing</h4>
                <p className="text-[#6B5344]">
                  Sharing knowledge on poultry farming best practices
                </p>
              </Card>
            </div>
            
            <p className="text-lg text-[#3D2817] mt-8 text-center italic">
              We believe strong farms build strong communities.
            </p>
          </div>
        </div>
      </section>
      
      {/* Commitment to Quality */}
      <section className="py-16 bg-gradient-to-r from-[#8B4513] to-[#C41E3A]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl mb-6 text-[#FFFDD0]">Our Commitment to Quality</h2>
            <p className="text-2xl text-[#FAF3E0] italic">
              Quality is not a promise — it is our daily practice.
            </p>
          </div>
        </div>
      </section>
      
      {/* Farmer Info */}
      <section className="py-16 bg-[#F0EAD6]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white p-8 rounded-lg border-4 border-[#FFD700]">
              <h2 className="text-3xl mb-4 text-[#3D2817]">Meet Our Founder</h2>
              <div className="w-24 h-24 bg-[#8B4513] rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-12 w-12 text-[#FFFDD0]" />
              </div>
              <h3 className="text-2xl mb-2 text-[#C41E3A]">HABAKURAMA Jean Dieu</h3>
              <p className="text-lg text-[#6B5344]">Founder & Head Farmer</p>
              <p className="text-[#3D2817] mt-4">
                Leading Goodrich Farm with passion, dedication, and a commitment to excellence in poultry farming.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
