import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';

export function GalleryPage() {
  const { gallery, loadGallery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadGallery();
  }, []);
  
  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'facilities', label: 'Farm Facilities' },
    { id: 'chickens', label: 'Our Chickens' },
    { id: 'team', label: 'Our Team' },
    { id: 'eggs', label: 'Fresh Eggs' }
  ];
  
  const filteredItems = selectedCategory === 'all'
    ? gallery
    : gallery.filter(item => item.category === selectedCategory);
  
  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl mb-6 text-[#FFFDD0]">Farm Gallery</h1>
            <p className="text-xl text-[#FAF3E0]">
              Take a visual tour of our farm, facilities, and happy chickens. See where your eggs come from!
            </p>
          </div>
        </div>
      </section>
      
      {/* Category Filter */}
      <section className="py-8 bg-[#F0EAD6] border-b-2 border-[#D2B48C] sticky top-20 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map(category => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className={
                  selectedCategory === category.id
                    ? 'bg-[#C41E3A] hover:bg-[#FF6B6B] text-white'
                    : 'border-2 border-[#8B4513] text-[#8B4513] hover:bg-[#8B4513] hover:text-white'
                }
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden bg-white border-2 border-[#D2B48C] hover:border-[#FFD700] transition-all hover:shadow-xl group">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl mb-2 text-[#3D2817]">{item.title}</h3>
                  <p className="text-sm text-[#6B5344]">{item.description}</p>
                </div>
              </Card>
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-xl text-[#6B5344]">No photos in this category yet</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Info Section */}
      <section className="py-16 bg-gradient-to-r from-[#8B4513] to-[#228B22]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl mb-6 text-[#FFFDD0]">Visit Our Farm</h2>
            <p className="text-xl text-[#FAF3E0] mb-8">
              Want to see our operations in person? We welcome visitors to tour our facilities 
              and learn about our farming practices.
            </p>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-[#FFFDD0] rounded-lg p-6">
              <p className="text-[#FFFDD0] mb-2">📍 Eastern Province, Kayonza District, Rukara Sector</p>
              <p className="text-[#FFFDD0]">📞 Call 0788455886 to schedule a visit</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
