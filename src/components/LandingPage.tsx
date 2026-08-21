import React from 'react';
import {
  Scissors,
  Users,
  Ruler,
  TrendingUp,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenAuth: (mode: 'signin' | 'signup') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenAuth,
}) => {
  return (
    <div className="min-h-screen bg-[#fff8f4] text-[#211a15] flex flex-col font-sans selection:bg-[#a6681c] selection:text-white">
      {/* Top Header */}
      <header className="bg-[#fff8f4]/95 backdrop-blur-md w-full top-0 sticky border-b border-[#211a15]/10 z-50">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex justify-between items-center h-20">
          <div
            onClick={onEnterApp}
            className="flex items-center gap-2 text-[#885000] cursor-pointer hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-[#a6681c]/15 flex items-center justify-center text-[#885000]">
              <Scissors className="w-6 h-6" />
            </div>
            <span className="font-headline text-2xl font-bold text-[#885000] tracking-tight">
              AtelierOS
            </span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <a
              href="#features"
              className="text-sm font-semibold text-[#524438] hover:text-[#885000] transition-colors hidden md:block px-3 py-2"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-semibold text-[#524438] hover:text-[#885000] transition-colors hidden md:block px-3 py-2"
            >
              Pricing
            </a>
            <button
              onClick={() => onOpenAuth('signin')}
              className="text-sm font-semibold text-[#885000] hover:bg-[#ede0d6]/60 transition-colors rounded-lg px-4 md:px-6 py-2"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="text-sm font-semibold bg-[#a6681c] text-white hover:bg-[#885000] transition-all rounded-lg px-4 md:px-6 py-2 shadow-sm"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative min-h-[640px] md:min-h-[720px] flex items-center justify-center overflow-hidden">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 z-0 bg-[#ede0d6]/50">
            <div className="absolute inset-0 bg-gradient-to-r from-[#fff8f4] via-[#fff8f4]/90 to-[#fff8f4]/40 z-10 md:to-transparent md:w-3/4"></div>
            <img
              className="w-full h-full object-cover object-right md:object-center absolute inset-0 z-0 mix-blend-multiply opacity-80"
              alt="High-end tailor workspace"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD-llrkQ-skXnYxmUtIloMWH4QMP6i-X1beEGxbF1CL5XRUbIaoaNB2CDC_N-SQkroRKmr7ZKLtibncjQysllM2SPvwglo0CIF5LdngTXgz44VBchW1ykq9-i4UhL7QcUdc5JWKN3jmlqiHDmSNgJmMrKxzl81x6DgjWNyfaUf-JvRVU1j3xg6VEuocvaPtLyyycmW0g2A7jMCgEdyaOwnqYpUzKdFpFBaRJrx-MzzNqd4DIx90PyvkA"
            />
          </div>

          <div className="relative z-20 max-w-[1440px] mx-auto px-4 md:px-10 w-full grid grid-cols-1 md:grid-cols-12 gap-6 py-12">
            <div className="md:col-span-8 lg:col-span-7 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 bg-[#fdbd72]/30 border border-[#fdbd72] text-[#784a05] px-3.5 py-1.5 rounded-full text-xs font-semibold w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                Crafted Exclusively for Bespoke Tailors & Boutiques
              </div>

              <h1 className="font-headline text-4xl md:text-6xl font-bold text-[#211a15] tracking-tight leading-tight">
                Bespoke Business Management.
              </h1>

              <p className="text-lg md:text-xl text-[#524438] max-w-xl leading-relaxed">
                The focused tool for custom clothing shops. Track orders, measurements, and profitability with ease and unmatched precision.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-2">
                <button
                  onClick={onEnterApp}
                  className="bg-[#a6681c] hover:bg-[#885000] text-white font-headline text-base font-semibold rounded-lg px-8 py-4 shadow-md flex items-center justify-center gap-2 group active:scale-[0.98] transition-all"
                >
                  <span>Launch AtelierOS Workspace</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onOpenAuth('signup')}
                  className="bg-white/80 hover:bg-white text-[#524438] hover:text-[#885000] border border-[#847466]/40 hover:border-[#885000] font-headline text-base font-semibold rounded-lg px-8 py-4 flex items-center justify-center transition-colors shadow-sm"
                >
                  Create Free Account
                </button>
              </div>

              <div className="flex items-center gap-6 pt-4 text-xs text-[#524438] font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-700" />
                  <span>Instant Access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-700" />
                  <span>Multi-Currency (ETB, USD, GBP)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-green-700" />
                  <span>Mobile & Desktop Optimized</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-20 md:py-28 bg-[#fff1e7]/60 border-t border-[#d7c3b2]/20">
          <div className="max-w-[1440px] mx-auto px-4 md:px-10">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-[#211a15] mb-4">
                Precision in Every Stitch.
              </h2>
              <p className="text-base md:text-lg text-[#524438]">
                A suite of tools engineered for the unique workflow of bespoke tailors. Manage clients, not spreadsheets.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Customer CRM */}
              <div className="md:col-span-7 bg-white border border-[#847466]/15 rounded-xl p-8 flex flex-col justify-between group hover:border-[#a6681c]/50 transition-all shadow-sm">
                <div>
                  <div className="w-12 h-12 bg-[#a6681c]/10 text-[#a6681c] rounded-lg flex items-center justify-center mb-4">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-[#211a15] mb-2">
                    Customer CRM
                  </h3>
                  <p className="text-sm md:text-base text-[#524438] leading-relaxed">
                    Maintain detailed profiles for every client. Track preferences, past orders, and communication history in one unified view.
                  </p>
                </div>

                <div className="mt-8 border border-[#d7c3b2]/40 rounded-lg overflow-hidden bg-[#fff8f4]/50 group-hover:border-[#a6681c]/30 transition-colors">
                  <div className="border-b border-[#d7c3b2]/30 p-4 bg-white flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#fdbd72] text-[#784a05] font-bold flex items-center justify-center text-sm">
                      AP
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[#211a15]">Arthur Pendelton</div>
                      <div className="text-xs text-[#524438]">Premium Client • Savile Row Member</div>
                    </div>
                  </div>
                  <div className="p-4 flex gap-6 text-sm text-[#524438] font-mono">
                    <div>
                      Orders: <span className="text-[#211a15] font-bold">12</span>
                    </div>
                    <div>
                      LTV: <span className="text-[#211a15] font-bold">$14,500</span>
                    </div>
                    <div>
                      Balance: <span className="text-green-700 font-bold">$0.00</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Measurement History */}
              <div className="md:col-span-5 bg-white border border-[#847466]/15 rounded-xl p-8 flex flex-col justify-between group hover:border-[#a6681c]/50 transition-all shadow-sm">
                <div>
                  <div className="w-12 h-12 bg-[#a6681c]/10 text-[#a6681c] rounded-lg flex items-center justify-center mb-4">
                    <Ruler className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-[#211a15] mb-2">
                    Measurement History
                  </h3>
                  <p className="text-sm md:text-base text-[#524438] leading-relaxed">
                    Version-controlled measurement profiles. Track bodily changes over time and ensure perfect fits consistently across all garments.
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-2 font-mono text-sm bg-[#fff8f4]/60 p-4 rounded-lg border border-[#d7c3b2]/30">
                  <div className="flex justify-between items-center py-1.5 border-b border-[#d7c3b2]/30">
                    <span className="text-[#524438]">Chest</span>
                    <span className="text-[#211a15] font-bold">42.5"</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#d7c3b2]/30">
                    <span className="text-[#524438]">Waist</span>
                    <span className="text-[#211a15] font-bold">34.0"</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5 border-b border-[#d7c3b2]/30">
                    <span className="text-[#524438]">Inseam</span>
                    <span className="text-[#211a15] font-bold">31.5"</span>
                  </div>
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-[#524438]">Shoulder</span>
                    <span className="text-[#211a15] font-bold">18.2"</span>
                  </div>
                </div>
              </div>

              {/* Financial Analytics & Partner Payables */}
              <div className="md:col-span-12 bg-white border border-[#847466]/15 rounded-xl p-8 flex flex-col md:flex-row gap-8 group hover:border-[#a6681c]/50 transition-all shadow-sm">
                <div className="md:w-1/3 flex flex-col justify-center">
                  <div className="w-12 h-12 bg-[#a6681c]/10 text-[#a6681c] rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-[#211a15] mb-2">
                    Financial Analytics
                  </h3>
                  <p className="text-sm md:text-base text-[#524438] leading-relaxed">
                    Understand your profitability at a glance. Track fabric costs, Telafi labor, and margins per garment to optimize your workshop operations.
                  </p>
                </div>

                <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#fff8f4] rounded-lg border border-[#d7c3b2]/30 p-6 flex flex-col justify-center">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#524438] block mb-2">
                      Avg. Gross Margin
                    </span>
                    <span className="font-headline text-4xl font-bold text-[#a6681c] block">
                      68%
                    </span>
                    <div className="mt-2 text-xs text-[#524438] flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-green-700" />
                      <span className="text-green-700 font-bold">+4.2%</span> this quarter
                    </div>
                  </div>

                  <div className="bg-[#fff8f4] rounded-lg border border-[#d7c3b2]/30 p-6 flex flex-col justify-center">
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#524438] block mb-2">
                      Monthly Revenue
                    </span>
                    <span className="font-headline text-4xl font-bold text-[#211a15] block">
                      45,200 <span className="text-base text-[#524438]">ETB</span>
                    </span>
                    <div className="mt-2 text-xs text-[#524438]">
                      Net Profit: <span className="font-bold text-[#885000]">26,700 ETB</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing / CTA Section */}
        <section id="pricing" className="py-20 bg-[#fff1e7] text-[#211a15] text-center px-4 border-t border-[#d7c3b2]/40">
          <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-[#a6681c] text-white flex items-center justify-center shadow-sm">
              <Scissors className="w-6 h-6" />
            </div>
            <h2 className="font-headline text-3xl md:text-5xl font-bold text-[#211a15] tracking-tight">
              Ready to Upgrade Your Atelier Operations?
            </h2>
            <p className="text-base md:text-lg text-[#524438] max-w-xl">
              Join master tailors, bespoke creators, and custom clothing studios organizing their craft with precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={onEnterApp}
                className="bg-[#a6681c] hover:bg-[#885000] text-white font-headline text-base font-semibold px-8 py-4 rounded-xl transition-all shadow-md active:scale-95"
              >
                Open Atelier Workspace Now
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#fff8f4] border-t border-[#d7c3b2]/30 w-full py-8">
        <div className="max-w-[1440px] mx-auto px-4 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-headline font-bold text-lg text-[#211a15] flex items-center gap-2">
            <Scissors className="w-5 h-5 text-[#885000]" />
            <span>AtelierOS</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm text-[#524438]">
            <a href="#" className="hover:text-[#885000] transition-colors font-medium">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[#885000] transition-colors font-medium">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#885000] transition-colors font-medium">
              Support
            </a>
            <a href="#" className="hover:text-[#885000] transition-colors font-medium">
              Contact
            </a>
          </nav>

          <div className="text-xs text-[#847466]">
            © {new Date().getFullYear()} AtelierOS Bespoke Systems. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
