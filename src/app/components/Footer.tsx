import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Footer() {
  const { setCurrentPage } = useApp();

  return (
    <footer className="bg-[#8B4513] text-[#FFFDD0] border-t-4 border-[#FFD700]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl mb-4 text-[#FFD700]">Goodrich Farm</h3>
            <p className="text-[#FAF3E0] text-sm mb-4">
              Quality chicken farming with responsible practices. Fresh eggs delivered to your doorstep.
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
            <h3 className="text-xl mb-4 text-[#FFD700]">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => setCurrentPage('about')}
                  className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('practices')}
                  className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors"
                >
                  Farm Practices
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('shop')}
                  className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors"
                >
                  Shop Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('gallery')}
                  className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors"
                >
                  Gallery
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('contact')}
                  className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('announcements')}
                  className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors"
                >
                  Announcements
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentPage('orders')}
                  className="text-[#FAF3E0] hover:text-[#FFD700] transition-colors"
                >
                  My Orders
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl mb-4 text-[#FFD700]">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-[#FFD700] flex-shrink-0 mt-0.5" />
                <span className="text-[#FAF3E0]">
                  Eastern Province, Kayonza District<br />
                  Rukara Sector, Kawangire Cell
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
            <h3 className="text-xl mb-4 text-[#FFD700]">Delivery Zones</h3>
            <ul className="space-y-2 text-sm text-[#FAF3E0]">
              <li>* Local (10km): 3,000 FRW</li>
              <li>* Regional (51-60km): 10,000 FRW</li>
              <li>* National: Calculated</li>
              <li className="pt-2">
                <span className="text-[#FFD700]">Minimum Order:</span> 4,500 FRW
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#A0522D] mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#FAF3E0]">
            Copyright 2026 Goodrich Chicken Farm. Farmer: HABAKURAMA Jean Dieu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
