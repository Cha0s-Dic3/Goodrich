import { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';

export function ForgotPasswordPage() {
  const { setCurrentPage } = useApp();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to request reset');
      }
      if (data.resetToken) {
        sessionStorage.setItem('resetToken', data.resetToken);
        toast.success('Reset token created. Continue to reset password.');
        setCurrentPage('reset-password');
      } else {
        toast.success('If the email exists, a reset link will be sent.');
        setCurrentPage('login');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to request reset');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      <section className="py-12 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FFFDD0] mb-4">Forgot Password</h1>
            <p className="text-lg text-[#FAF3E0]">Enter your email to reset your password</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="p-8 bg-white border-2 border-[#D2B48C] shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[#3D2817] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-[#A0522D]" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 border-[#D2B48C] focus:border-[#FFD700]"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#C41E3A] hover:bg-[#FF6B6B] text-white font-semibold"
                  size="lg"
                >
                  {isSubmitting ? 'Please wait...' : 'Send Reset Link'}
                </Button>

                <div className="text-center pt-4 border-t border-[#D2B48C]">
                  <button
                    type="button"
                    onClick={() => setCurrentPage('login')}
                    className="text-sm font-semibold text-[#C41E3A] hover:text-[#A0522D] transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
