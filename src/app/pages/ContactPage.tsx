import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

export function ContactPage() {
  const { createMessage } = useApp();
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
      toast.success('Message sent! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to send message');
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
            <h1 className="text-5xl mb-6 text-[#FFFDD0]">Contact Us</h1>
            <p className="text-xl text-[#FAF3E0]">
              Have questions? We're here to help. Reach out to us through any of the channels below.
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
              <h2 className="text-3xl mb-8 text-[#3D2817]">Get In Touch</h2>
              
              <div className="space-y-6">
                {/* Location */}
                <Card className="p-6 bg-white border-2 border-[#D2B48C] hover:border-[#C41E3A] transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#C41E3A] rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl mb-2 text-[#3D2817]">Our Location</h3>
                      <p className="text-[#6B5344]">
                        Eastern Province<br />
                        Kayonza District<br />
                        Rukara Sector, Kawangire Cell
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
                      <h3 className="text-xl mb-2 text-[#3D2817]">Phone</h3>
                      <a href="tel:0788455886" className="text-[#C41E3A] hover:underline text-lg">
                        0788455886
                      </a>
                      <p className="text-sm text-[#6B5344] mt-1">Call us anytime</p>
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
                      <h3 className="text-xl mb-2 text-[#3D2817]">Email</h3>
                      <a href="mailto:info@goodrichfarm.rw" className="text-[#C41E3A] hover:underline">
                        info@goodrichfarm.rw
                      </a>
                      <p className="text-sm text-[#6B5344] mt-1">We reply within 24 hours</p>
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
                      <h3 className="text-xl mb-2 text-[#3D2817]">Business Hours</h3>
                      <div className="text-[#6B5344] space-y-1">
                        <p>Monday - Friday: 7:00 AM - 6:00 PM</p>
                        <p>Saturday: 7:00 AM - 4:00 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Social Media */}
              <div className="mt-8">
                <h3 className="text-xl mb-4 text-[#3D2817]">Follow Us</h3>
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
              <h2 className="text-3xl mb-8 text-[#3D2817]">Send Us a Message</h2>
              
              <Card className="p-8 bg-white border-2 border-[#D2B48C]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block mb-2 text-[#3D2817]">Your Name *</label>
                    <Input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="border-[#D2B48C] focus:border-[#C41E3A]"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-[#3D2817]">Email Address *</label>
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
                    <label className="block mb-2 text-[#3D2817]">Phone Number *</label>
                    <Input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter your phone number"
                      className="border-[#D2B48C] focus:border-[#C41E3A]"
                    />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-[#3D2817]">Message *</label>
                    <Textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="How can we help you?"
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
                    {isSubmitting ? 'Sending...' : 'Send Message'}
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
            <h2 className="text-3xl mb-8 text-center text-[#3D2817]">Delivery Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-white border-2 border-[#228B22] text-center">
                <h3 className="text-xl mb-3 text-[#3D2817]">Local Delivery</h3>
                <div className="text-3xl text-[#C41E3A] mb-2">3,000 FRW</div>
                <p className="text-sm text-[#6B5344] mb-2">Within 10km radius</p>
                <p className="text-xs text-[#6B5344]">Next-day delivery available</p>
              </Card>
              
              <Card className="p-6 bg-white border-2 border-[#FFD700] text-center">
                <h3 className="text-xl mb-3 text-[#3D2817]">Regional Delivery</h3>
                <div className="text-3xl text-[#C41E3A] mb-2">10,000 FRW</div>
                <p className="text-sm text-[#6B5344] mb-2">51-60km distance</p>
                <p className="text-xs text-[#6B5344]">2 delivery days per week</p>
              </Card>
              
              <Card className="p-6 bg-white border-2 border-[#D2691E] text-center">
                <h3 className="text-xl mb-3 text-[#3D2817]">National Shipping</h3>
                <div className="text-3xl text-[#C41E3A] mb-2">Calculated</div>
                <p className="text-sm text-[#6B5344] mb-2">By weight & zone</p>
                <p className="text-xs text-[#6B5344]">Weekly dispatch schedule</p>
              </Card>
            </div>
            
            <div className="mt-8 text-center">
              <Card className="p-6 bg-gradient-to-r from-[#FFD700] to-[#FF8C00] border-2 border-[#8B4513]">
                <p className="text-[#3D2817]">
                  <strong>Minimum Order:</strong> 4,500 FRW
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
