import { useEffect, useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useI18n } from '../hooks/useI18n';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

export function LoginPage() {
  const { setCurrentPage, userLogin, isUserLoggedIn, isAdmin } = useApp();
  const { t } = useI18n();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const resolvePostLoginRedirect = () => {
    const target = sessionStorage.getItem('postLoginRedirect');
    if (target) {
      sessionStorage.removeItem('postLoginRedirect');
      return target;
    }
    return 'checkout';
  };

  useEffect(() => {
    if (isUserLoggedIn) {
      setCurrentPage(resolvePostLoginRedirect());
    }
  }, [isUserLoggedIn, setCurrentPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (isAdmin) {
      toast.error(t('login.adminLoggedIn'));
      return;
    }

    if (isLogin) {
      if (!formData.email || !formData.password) {
        toast.error(t('login.fillAll'));
        return;
      }
    } else {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        toast.error(t('login.fillAll'));
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error(t('login.passwordMismatch'));
        return;
      }
    }

    setIsSubmitting(true);
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || t('login.authFailed'));
        }
        return res.json();
      })
      .then((data) => {
        userLogin(data.token, data.user);
        toast.success(isLogin ? t('login.success') : t('login.createdSuccess'));
        setCurrentPage(resolvePostLoginRedirect());
      })
      .catch((err) => {
        toast.error(err.message || t('login.authFailed'));
      })
      .finally(() => setIsSubmitting(false));
  };

  return (
    <div className="min-h-screen bg-[#FFFDD0]">
      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-br from-[#8B4513] to-[#A0522D]">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#FFFDD0] mb-4">
              {isLogin ? t('login.welcomeBack') : t('login.createAccount')}
            </h1>
            <p className="text-lg text-[#FAF3E0]">
              {isLogin
                ? t('login.signInDesc')
                : t('login.createDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Login/Signup Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="p-8 bg-white border-2 border-[#D2B48C] shadow-lg">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field (Signup only) */}
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-[#3D2817] mb-2">
                      {t('login.fullName')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-[#A0522D]" />
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder={t('login.fullNamePlaceholder')}
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 border-[#D2B48C] focus:border-[#FFD700]"
                      />
                    </div>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[#3D2817] mb-2">
                    {t('login.emailAddress')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-[#A0522D]" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder={t('login.emailPlaceholder')}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 border-[#D2B48C] focus:border-[#FFD700]"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-[#3D2817] mb-2">
                    {t('login.password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-[#A0522D]" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder={t('login.passwordPlaceholder')}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 border-[#D2B48C] focus:border-[#FFD700]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#A0522D] hover:text-[#8B4513]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Field (Signup only) */}
                {!isLogin && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#3D2817] mb-2">
                      {t('login.confirmPassword')}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-[#A0522D]" />
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={t('login.confirmPasswordPlaceholder')}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 border-[#D2B48C] focus:border-[#FFD700]"
                      />
                    </div>
                  </div>
                )}

                {/* Forgot Password Link (Login only) */}
                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setCurrentPage('forgot-password')}
                      className="text-sm text-[#C41E3A] hover:text-[#A0522D] transition-colors"
                    >
                      {t('login.forgotPassword')}
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#C41E3A] hover:bg-[#FF6B6B] text-white font-semibold"
                  size="lg"
                >
                  {isSubmitting ? t('login.pleaseWait') : (isLogin ? t('login.signIn') : t('login.createAccount'))}
                </Button>

                {/* Toggle Between Login and Signup */}
                <div className="text-center pt-4 border-t border-[#D2B48C]">
                  <p className="text-sm text-[#6B5344] mb-2">
                    {isLogin ? t('login.noAccount') : t('login.haveAccount')}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setFormData({ email: '', password: '', name: '', confirmPassword: '' });
                    }}
                    className="text-sm font-semibold text-[#C41E3A] hover:text-[#A0522D] transition-colors"
                  >
                    {isLogin ? t('login.createAccount') : t('login.signIn')}
                  </button>
                </div>
              </form>

              {/* Continue Shopping Link */}
              <div className="mt-6 text-center pt-4 border-t border-[#D2B48C]">
                <button
                  onClick={() => setCurrentPage('shop')}
                  className="text-sm text-[#A0522D] hover:text-[#8B4513] transition-colors"
                >
                  {t('login.continueShopping')}
                </button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
