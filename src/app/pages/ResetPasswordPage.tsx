import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { useApp } from '../context/AppContext';

export function ResetPasswordPage() {
  const { setCurrentPage } = useApp();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedToken = sessionStorage.getItem('resetToken');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      sessionStorage.removeItem('resetToken');
      toast.success('Password updated. Please sign in.');
      setCurrentPage('login');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      <section className="py-12 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FFFDD0] mb-4">Reset Password</h1>
            <p className="text-lg text-[#FAF3E0]">Enter your reset token and new password</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="p-8 bg-white border-2 border-[#D2B48C] shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="token" className="block text-sm font-semibold text-[#3D2817] mb-2">
                    Reset Token
                  </label>
                  <Input
                    id="token"
                    name="token"
                    type="text"
                    placeholder="Paste reset token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="border-[#D2B48C] focus:border-[#FFD700]"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-[#3D2817] mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-[#A0522D]" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 border-[#D2B48C] focus:border-[#FFD700]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#3D2817] mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-[#A0522D]" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {isSubmitting ? 'Please wait...' : 'Reset Password'}
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
