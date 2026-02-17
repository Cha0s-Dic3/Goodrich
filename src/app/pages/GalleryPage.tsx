import { useEffect, useState } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';

export function GalleryPage() {
  const { gallery, loadGallery } = useApp();
  const { t } = useI18n();
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadGallery();
  }, []);

  const categories = [
    { id: 'all', label: t('gallery.filters.all') },
    { id: 'facilities', label: t('gallery.filters.facilities') },
    { id: 'chickens', label: t('gallery.filters.chickens') },
    { id: 'team', label: t('gallery.filters.team') },
    { id: 'eggs', label: t('gallery.filters.eggs') }
  ];

  const filteredItems = selectedCategory === 'all'
    ? gallery
    : gallery.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      <section className="py-20 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl mb-6 text-[#FFFDD0]">{t('gallery.heroTitle')}</h1>
            <p className="text-xl text-[#FAF3E0]">
              {t('gallery.heroDesc')}
            </p>
          </div>
        </div>
      </section>

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
              <p className="text-xl text-[#6B5344]">{t('gallery.empty')}</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-[#8B4513] to-[#228B22]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl mb-6 text-[#FFFDD0]">{t('gallery.visitTitle')}</h2>
            <p className="text-xl text-[#FAF3E0] mb-8">
              {t('gallery.visitDesc')}
            </p>
            <div className="bg-white/10 backdrop-blur-sm border-2 border-[#FFFDD0] rounded-lg p-6">
              <p className="text-[#FFFDD0] mb-2">{t('gallery.visitAddress')}</p>
              <p className="text-[#FFFDD0]">{t('gallery.visitCall')}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
