import { Sun, Wind, Leaf, Droplets, Heart, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/card';

export function FarmPracticesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#228B22] to-[#8B4513]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl mb-6 text-[#FFFDD0]">Our Farm Practices</h1>
            <p className="text-xl text-[#FAF3E0] leading-relaxed">
              Responsible farming is not a trend — it's our standard. Every practice we follow is designed 
              to protect animal welfare, ensure food safety, and support environmental sustainability.
            </p>
          </div>
        </div>
      </section>
      
      {/* Animal Welfare */}
      <section className="py-16 bg-[#FFFDD0]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Heart className="h-12 w-12 text-[#C41E3A]" />
              <h2 className="text-4xl text-[#3D2817]">Animal Welfare</h2>
            </div>
            
            <p className="text-lg text-[#3D2817] leading-relaxed mb-8">
              We believe healthy chickens grow best in comfortable and natural environments.
            </p>
            
            <div className="space-y-8">
              {/* Free-Range Practices */}
              <Card className="p-8 bg-white border-2 border-[#228B22]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#228B22] rounded-full flex items-center justify-center flex-shrink-0">
                    <Sun className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">Free-Range Practices</h3>
                    <p className="text-[#3D2817] leading-relaxed">
                      Our chickens are raised using free-range methods, allowing them to move freely, 
                      express natural behaviors, and live with reduced stress.
                    </p>
                  </div>
                </div>
              </Card>
              
              {/* Coop Conditions */}
              <Card className="p-8 bg-white border-2 border-[#228B22]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#228B22] rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">Coop Conditions & Space</h3>
                    <ul className="space-y-2 text-[#3D2817]">
                      <li>• Clean, well-maintained housing</li>
                      <li>• Adequate space per bird to prevent overcrowding</li>
                      <li>• Regular sanitation and biosecurity measures</li>
                    </ul>
                  </div>
                </div>
              </Card>
              
              {/* Natural Light & Ventilation */}
              <Card className="p-8 bg-white border-2 border-[#228B22]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#228B22] rounded-full flex items-center justify-center flex-shrink-0">
                    <Wind className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">Natural Light & Ventilation</h3>
                    <p className="text-[#3D2817] mb-3">Our poultry houses are designed to:</p>
                    <ul className="space-y-2 text-[#3D2817]">
                      <li>• Maximize natural daylight</li>
                      <li>• Ensure continuous fresh air circulation</li>
                      <li>• Maintain safe temperature and humidity levels</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Feed & Nutrition */}
      <section className="py-16 bg-[#F0EAD6]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Leaf className="h-12 w-12 text-[#228B22]" />
              <h2 className="text-4xl text-[#3D2817]">Feed & Nutrition</h2>
            </div>
            
            <p className="text-lg text-[#3D2817] leading-relaxed mb-8">
              Nutrition plays a key role in animal health and product quality.
            </p>
            
            <div className="space-y-8">
              {/* Non-GMO Feed */}
              <Card className="p-8 bg-white border-2 border-[#D2691E]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D2691E] rounded-full flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">Non-GMO Feed</h3>
                    <p className="text-[#3D2817] leading-relaxed">
                      We use carefully selected non-GMO feed ingredients to promote natural growth and 
                      overall bird health.
                    </p>
                  </div>
                </div>
              </Card>
              
              {/* No Antibiotics or Hormones */}
              <Card className="p-8 bg-white border-2 border-[#D2691E]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D2691E] rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">No Antibiotics or Hormones</h3>
                    <ul className="space-y-2 text-[#3D2817]">
                      <li>• No growth hormones</li>
                      <li>• No routine antibiotic use</li>
                      <li>• Medication is only used when absolutely necessary and under veterinary guidance</li>
                    </ul>
                  </div>
                </div>
              </Card>
              
              {/* Natural Supplements */}
              <Card className="p-8 bg-white border-2 border-[#D2691E]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#D2691E] rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">Natural Supplements</h3>
                    <p className="text-[#3D2817] mb-3">Our feeding program includes:</p>
                    <ul className="space-y-2 text-[#3D2817]">
                      <li>• Vitamins and minerals</li>
                      <li>• Natural immune-boosting supplements</li>
                      <li>• Balanced protein sources for healthy development</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Sustainability */}
      <section className="py-16 bg-[#FFFDD0]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <Leaf className="h-12 w-12 text-[#228B22]" />
              <h2 className="text-4xl text-[#3D2817]">Sustainability</h2>
            </div>
            
            <p className="text-lg text-[#3D2817] leading-relaxed mb-8">
              We are committed to farming in a way that protects the environment for future generations.
            </p>
            
            <div className="space-y-8">
              {/* Waste Management */}
              <Card className="p-8 bg-white border-2 border-[#228B22]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#228B22] rounded-full flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">Waste Management</h3>
                    <ul className="space-y-2 text-[#3D2817]">
                      <li>• Proper handling and recycling of poultry waste</li>
                      <li>• Use of organic waste for compost and soil enrichment</li>
                      <li>• Clean disposal systems to prevent environmental contamination</li>
                    </ul>
                  </div>
                </div>
              </Card>
              
              {/* Water Conservation */}
              <Card className="p-8 bg-white border-2 border-[#228B22]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#228B22] rounded-full flex items-center justify-center flex-shrink-0">
                    <Droplets className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl mb-3 text-[#3D2817]">Water Conservation</h3>
                    <ul className="space-y-2 text-[#3D2817]">
                      <li>• Controlled water usage systems</li>
                      <li>• Regular monitoring to prevent waste</li>
                      <li>• Clean and safe water supply for all birds</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-[#228B22] to-[#8B4513]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl mb-6 text-[#FFFDD0]">Experience the Difference</h2>
            <p className="text-xl text-[#FAF3E0] mb-8">
              Our commitment to responsible farming means healthier chickens and better eggs for you and your family.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white/10 backdrop-blur-sm border-2 border-[#FFFDD0]">
                <div className="text-3xl mb-2 text-[#FFD700]">5,000</div>
                <div className="text-[#FFFDD0]">Chickens Capacity</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur-sm border-2 border-[#FFFDD0]">
                <div className="text-3xl mb-2 text-[#FFD700]">100%</div>
                <div className="text-[#FFFDD0]">Free-Range</div>
              </Card>
              <Card className="p-6 bg-white/10 backdrop-blur-sm border-2 border-[#FFFDD0]">
                <div className="text-3xl mb-2 text-[#FFD700]">0</div>
                <div className="text-[#FFFDD0]">Antibiotics Used</div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
