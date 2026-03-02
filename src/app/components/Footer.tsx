import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';

export function Footer() {
  const { setCurrentPage, isAdmin } = useApp();
  const { t } = useI18n();

  return (
    <footer className="bg-[#8B4513] text-[#FFFDD0] border-t-4 border-[#FFD700]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl mb-4 text-[#FFD700]">{t('footer.brand')}</h3>
            <p className="text-[#FAF3E0] text-sm mb-4">
              {t('footer.about')}
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-[#A0522D] rounded-full hover:bg-[#C41E3A] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-[#A0522D] rounded-full hover:bg-[#C41E3A] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-[#A0522D] rounded-full hover:bg-[#C41E3A] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl mb-4 text-[#FFD700]">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => setCurrentPage('about')}
                  className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors"
                >
                  {t('footer.links.about')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('practices')}
                  className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors"
                >
                  {t('footer.links.practices')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('shop')}
                  className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors"
                >
                  {t('footer.links.shop')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('gallery')}
                  className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors"
                >
                  {t('footer.links.gallery')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('contact')}
                  className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors"
                >
                  {t('footer.links.contact')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('announcements')}
                  className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors"
                >
                  {t('footer.links.announcements')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('orders')}
                  className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors"
                >
                  {t('footer.links.orders')}
                </button>
              </li>
              {/* Hidden Admin Link - Only visible to admins */}
              {isAdmin && (
                <li className="mt-2 pt-2 border-t border-[#A0522D]">
                  <button
                    onClick={() => setCurrentPage('admin')}
                    className="text-[#FFD700] hover:text-[#FF6B6B] transition-colors font-semibold"
                  >
                    {t('footer.links.admin') || 'Admin Dashboard'}
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl mb-4 text-[#FFD700]">{t('footer.contactTitle')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <span className="text-[#FAF3E0]">
                  {t('footer.addressLine1')}<br />
                  {t('footer.addressLine2')}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-[#FFD700] flex-shrink-0" />
                <a href="tel:0788455886" className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors">
                  0788455886
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#FFD700] flex-shrink-0" />
                <span className="text-[#FAF3E0]">info@goodrichfarm.rw</span>
              </li>
            </ul>
          </div>

          {/* Delivery Zones */}
          <div>
            <h3 className="text-xl mb-4 text-[#FFD700]">{t('footer.deliveryTitle')}</h3>
            <ul className="space-y-2 text-sm text-[#FAF3E0]">
              <li>* {t('footer.delivery.local')}</li>
              <li>* {t('footer.delivery.regional')}</li>
              <li>* {t('footer.delivery.national')}</li>
              <li className="pt-2">
                <span className="text-[#FFD700]">{t('footer.delivery.minimumLabel')}</span> {t('footer.delivery.minimumValue')}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#A0522D] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#FAF3E0]">
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
