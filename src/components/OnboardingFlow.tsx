/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Upload,
  Camera,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Palette,
  Store,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Coins,
  RefreshCw,
  X,
  Sliders,
} from 'lucide-react';
import { BusinessTheme, ShopProfile } from '../types';
import {
  extractColorsFromLogo,
  generateAccessibleTheme,
  applyThemeToDocument,
  SAMPLE_ATELIER_LOGOS,
} from '../utils/themeGenerator';

interface OnboardingFlowProps {
  isOpen: boolean;
  initialShopProfile: ShopProfile;
  onClose: () => void;
  onComplete: (updatedProfile: ShopProfile) => void;
}

export type OnboardingStep =
  | 'signup'
  | 'business_name'
  | 'upload_logo'
  | 'analyzing'
  | 'theme_generated';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  isOpen,
  initialShopProfile,
  onClose,
  onComplete,
}) => {
  // Step state
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('signup');

  // Account Credentials
  const [email, setEmail] = useState('tailor@atelier.com');
  const [password, setPassword] = useState('bespoke2026');
  const [showPassword, setShowPassword] = useState(false);

  // Business info
  const [shopName, setShopName] = useState(initialShopProfile.name || 'Savile Row Atelier');
  const [phone, setPhone] = useState(initialShopProfile.phone || '+44 20 7946 0912');
  const [currency, setCurrency] = useState(initialShopProfile.currency || 'USD');

  // Logo & Analysis
  const [logoUrl, setLogoUrl] = useState<string>(
    initialShopProfile.businessTheme?.logoUrl ||
      initialShopProfile.logoUrl ||
      SAMPLE_ATELIER_LOGOS[1].url
  );
  const [isCustomUpload, setIsCustomUpload] = useState(false);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const [analyzingStageText, setAnalyzingStageText] = useState('Analyzing image pixels...');

  // Theme Output
  const [generatedTheme, setGeneratedTheme] = useState<BusinessTheme | null>(
    initialShopProfile.businessTheme || null
  );

  if (!isOpen) return null;

  // Trigger logo analysis with visual progress steps
  const analyzeLogoAndBuildTheme = async (imageSource: string) => {
    setCurrentStep('analyzing');
    setAnalyzingProgress(15);
    setAnalyzingStageText('Loading logo geometry & canvas...');

    // Step 1: Pixel analysis
    setTimeout(async () => {
      setAnalyzingProgress(45);
      setAnalyzingStageText('Sampling chromatic distribution & histograms...');

      try {
        const { dominantColors, rawPalette } = await extractColorsFromLogo(imageSource);

        setTimeout(() => {
          setAnalyzingProgress(75);
          setAnalyzingStageText('Running WCAG 2.1 AAA contrast & accessibility matrix...');

          setTimeout(() => {
            setAnalyzingProgress(100);
            setAnalyzingStageText('Synthesizing accessible bespoke design tokens...');

            const theme = generateAccessibleTheme(imageSource, rawPalette);
            setGeneratedTheme(theme);

            // Preview live in DOM right away
            const isDark = initialShopProfile.theme !== 'light';
            applyThemeToDocument(theme, isDark);

            setTimeout(() => {
              setCurrentStep('theme_generated');
            }, 500);
          }, 600);
        }, 500);
      } catch (err) {
        console.error('Error during theme extraction:', err);
        const fallbackTheme = generateAccessibleTheme(imageSource, ['#7A4E2D', '#C49A6C', '#F3E6D8']);
        setGeneratedTheme(fallbackTheme);
        const isDark = initialShopProfile.theme !== 'light';
        applyThemeToDocument(fallbackTheme, isDark);
        setCurrentStep('theme_generated');
      }
    }, 400);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setLogoUrl(dataUrl);
        setIsCustomUpload(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalApply = () => {
    if (!generatedTheme) return;

    const updatedProfile: ShopProfile = {
      ...initialShopProfile,
      name: shopName.trim() || 'My Atelier',
      phone: phone.trim(),
      email: email.trim(),
      currency: currency,
      logoUrl: generatedTheme.logoUrl,
      brandAccent: generatedTheme.primaryColor,
      businessTheme: generatedTheme,
    };

    // Commit to app & storage
    applyThemeToDocument(generatedTheme, initialShopProfile.theme === 'dark');
    onComplete(updatedProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#fff8f4] dark:bg-[#1a120c] text-[#211a15] dark:text-[#f7ebe1] rounded-2xl border border-[#d7c3b2]/40 dark:border-[#524438] shadow-2xl w-full max-w-xl overflow-hidden relative max-h-[94vh] flex flex-col transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#847466] dark:text-[#a08e80] hover:text-[#885000] dark:hover:text-[#ffb86d] hover:bg-[#ede0d6] dark:hover:bg-[#33261c] rounded-full p-2 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Progress Track */}
        <div className="w-full bg-[#ede0d6]/60 dark:bg-[#33261c]/60 h-1.5 flex">
          <div
            className="bg-[#885000] dark:bg-[#ffb86d] h-full transition-all duration-500 ease-out"
            style={{
              width:
                currentStep === 'signup'
                  ? '20%'
                  : currentStep === 'business_name'
                  ? '40%'
                  : currentStep === 'upload_logo'
                  ? '60%'
                  : currentStep === 'analyzing'
                  ? '80%'
                  : '100%',
            }}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto max-h-[85vh]">
          {/* STEP 1: SIGN UP */}
          {currentStep === 'signup' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#fff1e7] dark:bg-[#33261c] rounded-2xl border border-[#d7c3b2]/40 dark:border-[#524438] mb-3 text-[#885000] dark:text-[#ffb86d] shadow-sm">
                  <Scissors className="w-7 h-7" />
                </div>
                <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#211a15] dark:text-white">
                  Welcome to AtelierOS
                </h2>
                <p className="text-sm text-[#524438] dark:text-[#d7c3b2] mt-1 max-w-sm mx-auto">
                  Create your workspace account. In just two steps, your logo will automatically generate your workspace theme.
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1.5">
                    Tailor / Master Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#847466] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="master@savilerow.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#241a13] border border-[#d7c3b2]/40 dark:border-[#524438] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#885000] text-[#211a15] dark:text-white shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#847466] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-[#241a13] border border-[#d7c3b2]/40 dark:border-[#524438] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#885000] text-[#211a15] dark:text-white shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-[#847466] hover:text-[#885000] dark:hover:text-[#ffb86d] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep('business_name')}
                  className="w-full py-3 bg-[#a6681c] hover:bg-[#885000] text-white font-headline font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <span>Continue to Business Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BUSINESS NAME & DETAILS */}
          {currentStep === 'business_name' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#885000] dark:text-[#ffb86d] mb-1">
                  <span>Step 2 of 4</span>
                </div>
                <h2 className="font-headline text-2xl font-bold text-[#211a15] dark:text-white">
                  Enter Shop & Business Name
                </h2>
                <p className="text-xs text-[#524438] dark:text-[#d7c3b2] mt-1">
                  This will appear on client receipts, fitting cards, and invoice sheets.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1.5">
                    Atelier / Shop Name
                  </label>
                  <div className="relative">
                    <Store className="w-4 h-4 text-[#847466] absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="e.g. Master Sartoria, Addis Bespoke"
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#241a13] border border-[#d7c3b2]/40 dark:border-[#524438] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#885000] text-[#211a15] dark:text-white shadow-2xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1.5">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#847466] absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-[#241a13] border border-[#d7c3b2]/40 dark:border-[#524438] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#885000] text-[#211a15] dark:text-white shadow-2xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1.5">
                      Currency
                    </label>
                    <div className="relative">
                      <Coins className="w-4 h-4 text-[#847466] absolute left-3.5 top-3 pointer-events-none" />
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-[#241a13] border border-[#d7c3b2]/40 dark:border-[#524438] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#885000] text-[#211a15] dark:text-white shadow-2xs font-semibold"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="ETB">ETB (Br)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="NGN">NGN (₦)</option>
                        <option value="KES">KES (KSh)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('signup')}
                  className="px-4 py-2.5 border border-[#d7c3b2]/40 dark:border-[#524438] text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6]/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep('upload_logo')}
                  className="px-6 py-3 bg-[#a6681c] hover:bg-[#885000] text-white font-headline font-bold text-sm rounded-xl shadow-md flex items-center gap-2 active:scale-98 transition-all flex-1 justify-center"
                >
                  <span>Continue to Upload Logo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: UPLOAD LOGO */}
          {currentStep === 'upload_logo' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#885000] dark:text-[#ffb86d] mb-1">
                  <span>Step 3 of 4</span>
                </div>
                <h2 className="font-headline text-2xl font-bold text-[#211a15] dark:text-white">
                  Upload Your Brand Logo
                </h2>
                <p className="text-xs text-[#524438] dark:text-[#d7c3b2] mt-1">
                  Our system will extract dominant & complementary colors, then generate an accessible, balanced design palette for your workspace.
                </p>
              </div>

              {/* Upload Drop Zone */}
              <div className="border-2 border-dashed border-[#885000]/40 dark:border-[#ffb86d]/40 hover:border-[#885000] dark:hover:border-[#ffb86d] bg-white dark:bg-[#241a13] rounded-2xl p-6 text-center transition-all shadow-inner relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />

                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-2xl bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/40 dark:border-[#524438] flex items-center justify-center overflow-hidden mb-3.5 shadow-sm group-hover:scale-105 transition-transform">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt="Selected Logo"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-[#885000] dark:text-[#ffb86d]" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm font-bold text-[#885000] dark:text-[#ffb86d]">
                    <Upload className="w-4 h-4" />
                    <span>{isCustomUpload ? 'Change Uploaded Logo' : 'Upload Logo Image (PNG, JPG, SVG)'}</span>
                  </div>
                  <p className="text-[11px] text-[#847466] dark:text-[#a08e80] mt-1">
                    Drag and drop your file here, or click to browse
                  </p>
                </div>
              </div>

              {/* Quick Preset Tailor Logos */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#847466] dark:text-[#a08e80] mb-2">
                  Or pick a curated bespoke brand to preview:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SAMPLE_ATELIER_LOGOS.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLogoUrl(sample.url);
                        setIsCustomUpload(false);
                      }}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        logoUrl === sample.url
                          ? 'border-[#885000] bg-[#fff1e7] dark:bg-[#33261c] shadow-xs'
                          : 'border-[#d7c3b2]/30 dark:border-[#524438] bg-white dark:bg-[#241a13] hover:border-[#885000]/50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg shrink-0 overflow-hidden border border-black/10">
                        <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#211a15] dark:text-white truncate">
                          {sample.name}
                        </p>
                        <p className="text-[10px] text-[#847466] truncate">{sample.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('business_name')}
                  className="px-4 py-2.5 border border-[#d7c3b2]/40 dark:border-[#524438] text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6]/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={() => analyzeLogoAndBuildTheme(logoUrl)}
                  className="px-6 py-3 bg-[#a6681c] hover:bg-[#885000] text-white font-headline font-bold text-sm rounded-xl shadow-md flex items-center gap-2 active:scale-98 transition-all flex-1 justify-center"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Logo & Generate Theme</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ANALYZING LOGO ANIMATION */}
          {currentStep === 'analyzing' && (
            <div className="py-8 text-center space-y-6 animate-fadeIn">
              <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                {/* Outer pulsing ring */}
                <div className="absolute inset-0 rounded-3xl border-4 border-[#885000]/20 dark:border-[#ffb86d]/20 animate-ping" />
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-[#241a13] border-2 border-[#885000] dark:border-[#ffb86d] p-2.5 shadow-xl flex items-center justify-center overflow-hidden z-10">
                  <img src={logoUrl} alt="Analyzing Logo" className="w-full h-full object-contain" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-headline text-xl font-bold text-[#211a15] dark:text-white flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-[#885000] dark:text-[#ffb86d]" />
                  <span>Analyzing Brand Colors</span>
                </h3>
                <p className="text-xs text-[#524438] dark:text-[#d7c3b2] font-medium">
                  {analyzingStageText}
                </p>
              </div>

              {/* Progress bar */}
              <div className="max-w-xs mx-auto">
                <div className="w-full bg-[#ede0d6] dark:bg-[#33261c] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#885000] dark:bg-[#ffb86d] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${analyzingProgress}%` }}
                  />
                </div>
                <span className="text-[11px] text-[#847466] mt-1.5 block font-mono font-bold">
                  {analyzingProgress}% Completed
                </span>
              </div>
            </div>
          )}

          {/* STEP 5: GENERATED THEME & CONTRAST VALIDATION */}
          {currentStep === 'theme_generated' && generatedTheme && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#885000] dark:text-[#ffb86d]">
                    Theme Generated
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WCAG {generatedTheme.wcagRating} Compliant ({generatedTheme.contrastRatio}:1)</span>
                  </span>
                </div>
                <h2 className="font-headline text-2xl font-bold text-[#211a15] dark:text-white mt-1">
                  {generatedTheme.harmonyName}
                </h2>
                <p className="text-xs text-[#524438] dark:text-[#d7c3b2]">
                  Extracted from your logo and transformed into an accessible, balanced atelier design system.
                </p>
              </div>

              {/* Raw Extracted vs Designed Tokens comparison */}
              <div className="bg-white dark:bg-[#241a13] border border-[#d7c3b2]/35 dark:border-[#524438] rounded-2xl p-4.5 space-y-4 shadow-2xs">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#847466] dark:text-[#a08e80] mb-2">
                    Raw Logo Colors Extracted
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {generatedTheme.extractedPalette.map((hex, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-black/10 text-[11px] font-mono font-bold bg-[#fff8f4] dark:bg-[#1a120c]"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        <span>{hex}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-[#d7c3b2]/30 dark:bg-[#524438]" />

                {/* Generated Usable Tokens */}
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#847466] dark:text-[#a08e80] mb-2.5">
                    Synthesized Design System Tokens
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    {/* Primary */}
                    <div className="p-2.5 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] bg-[#fff8f4] dark:bg-[#1a120c]">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-lg border border-black/10 shrink-0"
                          style={{ backgroundColor: generatedTheme.primaryColor }}
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase font-bold text-[#847466]">Primary Brand</p>
                          <p className="font-mono text-xs font-bold truncate">{generatedTheme.primaryColor}</p>
                        </div>
                      </div>
                    </div>

                    {/* Accent */}
                    <div className="p-2.5 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] bg-[#fff8f4] dark:bg-[#1a120c]">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-lg border border-black/10 shrink-0"
                          style={{ backgroundColor: generatedTheme.accentColor }}
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase font-bold text-[#847466]">Accent</p>
                          <p className="font-mono text-xs font-bold truncate">{generatedTheme.accentColor}</p>
                        </div>
                      </div>
                    </div>

                    {/* Background */}
                    <div className="p-2.5 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] bg-[#fff8f4] dark:bg-[#1a120c]">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-lg border border-black/10 shrink-0"
                          style={{ backgroundColor: generatedTheme.backgroundColor }}
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase font-bold text-[#847466]">Background</p>
                          <p className="font-mono text-xs font-bold truncate">{generatedTheme.backgroundColor}</p>
                        </div>
                      </div>
                    </div>

                    {/* Surface */}
                    <div className="p-2.5 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] bg-[#fff8f4] dark:bg-[#1a120c]">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-lg border border-black/10 shrink-0"
                          style={{ backgroundColor: generatedTheme.surfaceColor }}
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase font-bold text-[#847466]">Surface Card</p>
                          <p className="font-mono text-xs font-bold truncate">{generatedTheme.surfaceColor}</p>
                        </div>
                      </div>
                    </div>

                    {/* Text */}
                    <div className="p-2.5 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] bg-[#fff8f4] dark:bg-[#1a120c]">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-lg border border-black/10 shrink-0"
                          style={{ backgroundColor: generatedTheme.textColor }}
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase font-bold text-[#847466]">Text Neutral</p>
                          <p className="font-mono text-xs font-bold truncate">{generatedTheme.textColor}</p>
                        </div>
                      </div>
                    </div>

                    {/* Secondary Badge */}
                    <div className="p-2.5 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] bg-[#fff8f4] dark:bg-[#1a120c]">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-5 h-5 rounded-lg border border-black/10 shrink-0"
                          style={{ backgroundColor: generatedTheme.secondaryColor }}
                        />
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase font-bold text-[#847466]">Secondary Tint</p>
                          <p className="font-mono text-xs font-bold truncate">{generatedTheme.secondaryColor}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Mini Workspace Preview */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#847466] dark:text-[#a08e80] mb-2">
                  Live Workspace Preview
                </p>
                <div
                  className="p-4 rounded-2xl border transition-all"
                  style={{
                    backgroundColor: generatedTheme.backgroundColor,
                    borderColor: generatedTheme.borderColor,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg overflow-hidden border border-black/10">
                        <img src={generatedTheme.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-bold font-headline" style={{ color: generatedTheme.textColor }}>
                          {shopName}
                        </p>
                        <p className="text-[10px]" style={{ color: generatedTheme.textMuted }}>
                          Order Management & Atelier CRM
                        </p>
                      </div>
                    </div>

                    <span
                      className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: generatedTheme.secondaryColor,
                        color: generatedTheme.primaryColor,
                        borderColor: generatedTheme.borderColor,
                      }}
                    >
                      In Cutting
                    </span>
                  </div>

                  <div
                    className="p-3 rounded-xl border flex items-center justify-between"
                    style={{
                      backgroundColor: generatedTheme.surfaceColor,
                      borderColor: generatedTheme.borderColor,
                    }}
                  >
                    <div>
                      <p className="text-xs font-bold" style={{ color: generatedTheme.textColor }}>
                        Alexander Sterling
                      </p>
                      <p className="text-[11px]" style={{ color: generatedTheme.textMuted }}>
                        3-Piece Savile Bespoke Suit
                      </p>
                    </div>

                    <button
                      type="button"
                      className="text-xs font-bold px-3 py-1.5 rounded-lg text-white shadow-xs"
                      style={{ backgroundColor: generatedTheme.primaryColor }}
                    >
                      View Order
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep('upload_logo')}
                  className="px-4 py-2.5 border border-[#d7c3b2]/40 dark:border-[#524438] text-[#524438] dark:text-[#d7c3b2] hover:bg-[#ede0d6]/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Choose Another Logo</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalApply}
                  className="px-6 py-3.5 bg-[#a6681c] hover:bg-[#885000] text-white font-headline font-bold text-sm rounded-xl shadow-lg flex items-center gap-2 active:scale-98 transition-all flex-1 justify-center"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Apply Theme & Enter Dashboard</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
