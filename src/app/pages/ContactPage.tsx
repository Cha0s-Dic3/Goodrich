import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';

export function ContactPage() {
  const { createMessage } = useApp();
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createMessage(formData);
      toast.success(t('contact.messageSent'));
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      toast.error(err?.message || t('contact.messageFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl mb-6 text-[#FFFDD0]">{t('contact.title')}</h1>
            <p className="text-xl text-[#FAF3E0]">
              {t('contact.subtitle')}
            </p>
          </div>
        </div>
      </section>
      
      {/* Contact Info & Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl mb-8 text-[#3D2817]">{t('contact.getInTouch')}</h2>
              
              <div className="space-y-6">
                {/* Location */}
                <Card className="p-6 bg-white border-2 border-[#D2B48C] hover:border-[#C41E3A] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#C41E3A] rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl mb-2 text-[#3D2817]">{t('contact.locationTitle')}</h3>
                      <p className="text-[#6B5344]">
                        {t('contact.locationLine1')}<br />
                        {t('contact.locationLine2')}<br />
                        {t('contact.locationLine3')}
                      </p>
                    </div>
                  </div>
                </Card>
                
                {/* Phone */}
                <Card className="p-6 bg-white border-2 border-[#D2B48C] hover:border-[#C41E3A] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#228B22] rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl mb-2 text-[#3D2817]">{t('contact.phoneTitle')}</h3>
                      <a href="tel:0788455886" className="text-[#C41E3A] hover:underline text-lg">
                        0788455886
                      </a>
                      <p className="text-sm text-[#6B5344] mt-1">{t('contact.callAnytime')}</p>
                    </div>
                  </div>
                </Card>
                
                {/* Email */}
                <Card className="p-6 bg-white border-2 border-[#D2B48C] hover:border-[#C41E3A] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#FFD700] rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-[#3D2817]" />
                    </div>
                    <div>
                      <h3 className="text-xl mb-2 text-[#3D2817]">{t('contact.emailTitle')}</h3>
                      <a href="mailto:info@goodrichfarm.rw" className="text-[#C41E3A] hover:underline">
                        info@goodrichfarm.rw
                      </a>
                      <p className="text-sm text-[#6B5344] mt-1">{t('contact.reply24h')}</p>
                    </div>
                  </div>
                </Card>
                
                {/* Business Hours */}
                <Card className="p-6 bg-white border-2 border-[#D2B48C] hover:border-[#C41E3A] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#D2691E] rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl mb-2 text-[#3D2817]">{t('contact.hoursTitle')}</h3>
                      <div className="text-[#6B5344] space-y-1">
                        <p>{t('contact.hoursWeekday')}</p>
                        <p>{t('contact.hoursSaturday')}</p>
                        <p>{t('contact.hoursSunday')}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Social Media */}
              <div className="mt-8">
                <h3 className="text-xl mb-4 text-[#3D2817]">{t('contact.followUs')}</h3>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="w-12 h-12 bg-[#8B4513] rounded-full flex items-center justify-center text-white hover:bg-[#C41E3A] transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-[#8B4513] rounded-full flex items-center justify-center text-white hover:bg-[#C41E3A] transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-[#8B4513] rounded-full flex items-center justify-center text-white hover:bg-[#C41E3A] transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl mb-8 text-[#3D2817]">{t('contact.sendMessageTitle')}</h2>
              
              <Card className="p-8 bg-white border-2 border-[#D2B48C]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block mb-2 text-[#3D2817]">{t('contact.form.nameLabel')} *</label>
                    <Input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('contact.form.namePlaceholder')}
                      className="border-[#D2B48C] focus:border-[#C41E3A]"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-[#3D2817]">{t('contact.form.emailLabel')} *</label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="border-[#D2B48C] focus:border-[#C41E3A]"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-[#3D2817]">{t('contact.form.phoneLabel')} *</label>
                    <Input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={t('contact.form.phonePlaceholder')}
                      className="border-[#D2B48C] focus:border-[#C41E3A]"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-[#3D2817]">{t('contact.form.messageLabel')} *</label>
                    <Textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={t('contact.form.messagePlaceholder')}
                      rows={5}
                      className="border-[#D2B48C] focus:border-[#C41E3A]"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-[#C41E3A] hover:bg-[#FF6B6B] text-white"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t('contact.form.sending') : t('contact.form.send')}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
      
      {/* Delivery Information */}
      <section className="py-16 bg-[#F0EAD6]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl mb-8 text-center text-[#3D2817]">{t('contact.deliveryTitle')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white border-2 border-[#228B22] text-center">
                <h3 className="text-xl mb-3 text-[#3D2817]">{t('contact.delivery.localTitle')}</h3>
                <div className="text-3xl text-[#C41E3A] mb-2">3,000 FRW</div>
                <p className="text-sm text-[#6B5344] mb-2">{t('contact.delivery.localDesc1')}</p>
                <p className="text-xs text-[#6B5344]">{t('contact.delivery.localDesc2')}</p>
              </Card>
              
              <Card className="p-6 bg-white border-2 border-[#FFD700] text-center">
                <h3 className="text-xl mb-3 text-[#3D2817]">{t('contact.delivery.regionalTitle')}</h3>
                <div className="text-3xl text-[#C41E3A] mb-2">10,000 FRW</div>
                <p className="text-sm text-[#6B5344] mb-2">{t('contact.delivery.regionalDesc1')}</p>
                <p className="text-xs text-[#6B5344]">{t('contact.delivery.regionalDesc2')}</p>
              </Card>
              
              <Card className="p-6 bg-white border-2 border-[#D2691E] text-center">
                <h3 className="text-xl mb-3 text-[#3D2817]">{t('contact.delivery.nationalTitle')}</h3>
                <div className="text-3xl text-[#C41E3A] mb-2">{t('contact.delivery.calculated')}</div>
                <p className="text-sm text-[#6B5344] mb-2">{t('contact.delivery.nationalDesc1')}</p>
                <p className="text-xs text-[#6B5344]">{t('contact.delivery.nationalDesc2')}</p>
              </Card>
            </div>
            
            <div className="mt-8 text-center">
              <Card className="p-6 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] border-2 border-[#8B4513]">
                <p className="text-[#3D2817]">
                  <strong>{t('contact.delivery.minimumLabel')}</strong> 4,500 FRW
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
