import React, { useState } from 'react';
import {
  Scissors,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store,
  Phone,
  Camera,
  X,
  ArrowRight,
} from 'lucide-react';
import { ShopProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  onSuccess: (updatedProfile?: Partial<ShopProfile>) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [brandName, setBrandName] = useState('Bespoke Master');
  const [email, setEmail] = useState('tailor@atelier.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [password, setPassword] = useState('bespoke123');
  const [rememberMe, setRememberMe] = useState(true);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    'https://lh3.googleusercontent.com/aida-public/AB6AXuC7fpPZ3exVUiAs8q1DEUlSVObDCWBpIx37a8E3ZV77pr5oeH4Bvnr7jl0zeO2CovvoxzwUbUEVT2B-8-SfnISrM5lS7Rb7LRqeBiQgd8KGEeBCEV6lA-XKb7RTniHvwipqKJRbqgXCV846ziAsM8McG4rvr8CS8_5sSC6m9ZDPpKxIaPHbmEXaoWeSDPpdahEx3p5L_e39DJMG6SR4AnI5gnnzhpxfuaj4CCjm9z6b-0adTGGlkXZlaQ'
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage(mode === 'signin' ? 'Signing in...' : 'Creating workspace...');
    setTimeout(() => {
      onSuccess({
        name: brandName,
        email: email,
        phone: phone,
        logoUrl: logoPreview || undefined,
      });
      onClose();
    }, 600);
  };

  const handleSocialAuth = (provider: 'Google' | 'Apple') => {
    setToastMessage(`Connecting with ${provider}...`);
    setTimeout(() => {
      onSuccess({
        name: `${provider} Atelier`,
        email: `user@${provider.toLowerCase()}.com`,
      });
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#fff8f4] dark:bg-[#1c1510] text-[#211a15] dark:text-[#f7ebe1] rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] shadow-2xl w-full max-w-md overflow-hidden relative max-h-[92vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#847466] dark:text-[#a08e80] hover:text-[#885000] dark:hover:text-[#ffb86d] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] rounded-full p-2 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8 overflow-y-auto">
          {/* Branding Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#fff1e7] dark:bg-[#33261c] rounded-lg border border-[#211a15]/10 dark:border-[#524438] mb-3 text-[#885000] dark:text-[#ffb86d]">
              <Scissors className="w-6 h-6" />
            </div>
            <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#211a15] dark:text-white tracking-tight">
              AtelierOS
            </h1>
            <p className="text-sm text-[#524438] dark:text-[#d7c3b2] mt-1">
              {mode === 'signin'
                ? 'Sign in to your workspace.'
                : 'Create your bespoke workspace.'}
            </p>
          </div>

          {toastMessage && (
            <div className="mb-4 p-2.5 bg-[#fdbd72]/30 border border-[#fdbd72] text-[#784a05] dark:text-[#fdbd72] text-xs font-semibold rounded text-center">
              {toastMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                {/* Shop Logo upload */}
                <div className="flex flex-col items-center justify-center mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-2 w-full text-center">
                    Shop Logo
                  </label>
                  <label className="relative group cursor-pointer">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#847466]/30 bg-[#fff1e7] dark:bg-[#33261c] flex items-center justify-center overflow-hidden hover:border-[#885000] transition-colors shadow-inner">
                      {logoPreview ? (
                        <img
                          src={logoPreview}
                          alt="Logo preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-6 h-6 text-[#847466] dark:text-[#a08e80]" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <span className="text-[10px] text-[#885000] dark:text-[#ffb86d] font-semibold block text-center mt-1">
                      Upload Logo
                    </span>
                  </label>
                </div>

                {/* Brand Name Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                    Brand Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#847466]">
                      <Store className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Your Brand Name"
                      className="w-full pl-10 pr-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000] transition-all"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                    Contact Phone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#847466]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-3 py-2 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000] transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                {mode === 'signup' ? 'Work Email' : 'Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#847466]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tailor@atelier.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000] transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#847466]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#241a13] border border-[#211a15]/15 dark:border-[#524438] rounded-lg text-sm text-[#211a15] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#885000] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#847466] hover:text-[#885000] dark:hover:text-[#ffb86d] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & Forgot Password */}
            {mode === 'signin' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#524438] dark:text-[#d7c3b2]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-[#847466]/40 text-[#885000] focus:ring-[#885000]"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setToastMessage('Password reset instructions sent to your email.')}
                  className="text-[#885000] dark:text-[#ffb86d] hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full bg-[#885000] hover:bg-[#a6681c] text-white font-headline font-semibold py-3 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all mt-4"
            >
              <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social Auth (Sign up screen) */}
          {mode === 'signup' && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#211a15]/10 dark:border-[#524438]"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-[#fff8f4] dark:bg-[#1c1510] text-[#524438] dark:text-[#d7c3b2]">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Google')}
                  className="flex justify-center items-center py-2 px-4 border border-[#211a15]/15 dark:border-[#524438] rounded-lg bg-white dark:bg-[#241a13] text-xs font-semibold text-[#211a15] dark:text-white hover:bg-[#fff1e7] dark:hover:bg-[#33261c] transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialAuth('Apple')}
                  className="flex justify-center items-center py-2 px-4 border border-[#211a15]/15 dark:border-[#524438] rounded-lg bg-white dark:bg-[#241a13] text-xs font-semibold text-[#211a15] dark:text-white hover:bg-[#fff1e7] dark:hover:bg-[#33261c] transition-colors"
                >
                  <svg
                    className="w-4 h-4 mr-2 fill-current text-[#211a15] dark:text-white"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16.365 21.439c-1.355.975-2.738.995-4.148.016-1.385-.96-2.77-.96-4.155 0-1.854 1.285-3.535 1.026-4.733-.872-4.055-6.425-3.545-12.793 1.942-13.882 1.69-.335 3.19.646 4.095.646.91 0 2.65-1.127 4.61-.95 1.23.056 3.09.432 4.28 2.164-3.415 2.072-2.88 6.55.512 7.848-1.045 2.678-2.42 5.035-2.403 5.03z" />
                    <path d="M15.225 4.394c-.95.836-2.28 1.4-3.565 1.295-.275-1.57.51-2.94 1.41-3.76C14.07 1.01 15.46.42 16.685.5c.23 1.545-.525 3.058-1.46 3.894z" />
                  </svg>
                  Apple
                </button>
              </div>
            </div>
          )}

          {/* Switch Mode Footer */}
          <div className="mt-6 pt-4 border-t border-[#211a15]/10 dark:border-[#524438] text-center text-xs text-[#524438] dark:text-[#d7c3b2]">
            {mode === 'signin' ? (
              <p>
                Need an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#885000] dark:text-[#ffb86d] font-bold hover:underline"
                >
                  Create Account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-[#885000] dark:text-[#ffb86d] font-bold hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
