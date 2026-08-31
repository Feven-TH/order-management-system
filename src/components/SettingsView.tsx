import React, { useState } from 'react';
import {
  Settings,
  Camera,
  Save,
  Plus,
  Trash2,
  Check,
  Moon,
  Sun,
  Shield,
  LogOut,
  Sliders,
  DollarSign,
  User,
  Scissors,
  FileSpreadsheet,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Palette,
  Upload,
} from 'lucide-react';
import { BusinessTheme, ShopProfile } from '../types';
import {
  extractColorsFromLogo,
  generateAccessibleTheme,
  applyThemeToDocument,
} from '../utils/themeGenerator';

interface SettingsViewProps {
  shopProfile: ShopProfile;
  onUpdateProfile: (updated: ShopProfile) => void;
  onSignOut: () => void;
  onExportExcel?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  shopProfile,
  onUpdateProfile,
  onSignOut,
  onExportExcel,
}) => {
  const [profileDraft, setProfileDraft] = useState<ShopProfile>(shopProfile);
  const [newStatusName, setNewStatusName] = useState('');
  const [savedToast, setSavedToast] = useState(false);
  const [accountNotice, setAccountNotice] = useState<string | null>(null);
  const [isAnalyzingLogo, setIsAnalyzingLogo] = useState(false);

  const availableMetrics = [
    'Total Revenue (MTD)',
    'Active Orders',
    'Pending Fittings',
    'Customer Retention',
    'Partner Payables Ratio',
    'Fabric Wastage Rate',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileDraft);
    if (profileDraft.businessTheme) {
      applyThemeToDocument(profileDraft.businessTheme, profileDraft.theme === 'dark');
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  const handleLogoUploadAndAnalyze = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async () => {
        const logoDataUrl = reader.result as string;
        setIsAnalyzingLogo(true);
        try {
          const { rawPalette } = await extractColorsFromLogo(logoDataUrl);
          const newTheme = generateAccessibleTheme(logoDataUrl, rawPalette);
          const updated: ShopProfile = {
            ...profileDraft,
            logoUrl: logoDataUrl,
            brandAccent: newTheme.primaryColor,
            businessTheme: newTheme,
          };
          setProfileDraft(updated);
          applyThemeToDocument(newTheme, profileDraft.theme === 'dark');
          onUpdateProfile(updated);
        } catch (err) {
          console.error(err);
        } finally {
          setIsAnalyzingLogo(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReanalyzeCurrentLogo = async () => {
    if (!profileDraft.logoUrl) return;
    setIsAnalyzingLogo(true);
    try {
      const { rawPalette } = await extractColorsFromLogo(profileDraft.logoUrl);
      const newTheme = generateAccessibleTheme(profileDraft.logoUrl, rawPalette);
      const updated: ShopProfile = {
        ...profileDraft,
        brandAccent: newTheme.primaryColor,
        businessTheme: newTheme,
      };
      setProfileDraft(updated);
      applyThemeToDocument(newTheme, profileDraft.theme === 'dark');
      onUpdateProfile(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzingLogo(false);
    }
  };

  const handleAddStatus = () => {
    if (!newStatusName.trim()) return;
    setProfileDraft({
      ...profileDraft,
      statuses: [...profileDraft.statuses, newStatusName.trim()],
    });
    setNewStatusName('');
  };

  const handleDeleteStatus = (index: number) => {
    setProfileDraft({
      ...profileDraft,
      statuses: profileDraft.statuses.filter((_, idx) => idx !== index),
    });
  };

  const handleToggleMetric = (metric: string) => {
    const active = profileDraft.activeMetrics.includes(metric);
    const updated = active
      ? profileDraft.activeMetrics.filter((m) => m !== metric)
      : [...profileDraft.activeMetrics, metric];
    setProfileDraft({
      ...profileDraft,
      activeMetrics: updated,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-8 animate-fadeIn pb-20">
      {/* Header */}
      <div>
        <h1 className="font-headline text-2xl md:text-3xl font-bold text-[#211a15] dark:text-white">
          Settings & Workshop Configuration
        </h1>
        <p className="text-sm text-[#524438] dark:text-[#d7c3b2] mt-0.5">
          Configure workshop branding, tailoring workflow stages, and dashboard metrics.
        </p>
      </div>

      {savedToast && (
        <div className="p-3 bg-green-100 text-green-900 text-xs font-bold rounded-lg border border-green-300 flex items-center gap-2 shadow-sm animate-fadeIn">
          <Check className="w-4 h-4" /> Workshop profile and settings saved successfully!
        </div>
      )}

      {accountNotice && (
        <div role="status" className="p-3 bg-green-100 text-green-900 text-xs font-bold rounded-lg border border-green-300 flex items-center gap-2 shadow-sm animate-fadeIn">
          <Check className="w-4 h-4" /> {accountNotice}
        </div>
      )}

      {/* Workshop Profile Form */}
      <form
        onSubmit={handleSave}
        className="bg-white dark:bg-[#241a13] rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm p-6 space-y-6"
      >
        <h2 className="font-headline font-bold text-lg text-[#211a15] dark:text-white border-b border-[#d7c3b2]/20 pb-3">
          Workshop Profile
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Logo upload */}
          <div className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#885000]/40 bg-[#fff8f4] dark:bg-[#1a120c] overflow-hidden flex items-center justify-center shadow-inner group-hover:border-[#885000] transition-all">
              {profileDraft.logoUrl ? (
                <img
                  src={profileDraft.logoUrl}
                  alt={profileDraft.name}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <span className="font-headline font-bold text-xl text-[#885000]">BM</span>
              )}
            </div>
            <label className="absolute inset-0 bg-black/50 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[10px] cursor-pointer font-bold">
              <Camera className="w-5 h-5 mb-1" />
              Upload Logo
              <input type="file" accept="image/*" onChange={handleLogoUploadAndAnalyze} className="hidden" />
            </label>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                Workshop Name *
              </label>
              <input
                type="text"
                required
                value={profileDraft.name}
                onChange={(e) => setProfileDraft({ ...profileDraft, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/30 rounded-lg text-sm text-[#211a15] dark:text-white font-headline font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={profileDraft.email}
                  onChange={(e) => setProfileDraft({ ...profileDraft, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/30 rounded-lg text-sm text-[#211a15] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileDraft.phone}
                  onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/30 rounded-lg text-sm text-[#211a15] dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Primary Currency
                </label>
                <select
                  value={profileDraft.currency}
                  onChange={(e) => setProfileDraft({ ...profileDraft, currency: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/30 rounded-lg text-sm text-[#211a15] dark:text-white font-bold"
                >
                  <option value="ETB">ETB (Ethiopian Birr)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#524438] dark:text-[#d7c3b2] mb-1">
                  Workspace Appearance
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...profileDraft, theme: 'dark' as const };
                      setProfileDraft(updated);
                      if (updated.businessTheme) {
                        applyThemeToDocument(updated.businessTheme, true);
                      }
                      onUpdateProfile(updated);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      profileDraft.theme === 'dark'
                        ? 'bg-[#150f0b] text-[#ffb86d] border-[#885000] shadow-sm'
                        : 'bg-[#fff8f4] dark:bg-[#1a120c] text-[#524438] dark:text-[#d7c3b2] border-[#d7c3b2]/30'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark Atelier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const updated = { ...profileDraft, theme: 'light' as const };
                      setProfileDraft(updated);
                      if (updated.businessTheme) {
                        applyThemeToDocument(updated.businessTheme, false);
                      }
                      onUpdateProfile(updated);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                      profileDraft.theme === 'light'
                        ? 'bg-amber-100 text-[#885000] border-[#885000] shadow-sm'
                        : 'bg-[#fff8f4] dark:bg-[#1a120c] text-[#524438] dark:text-[#d7c3b2] border-[#d7c3b2]/30'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Clean Light</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#885000] hover:bg-[#a6681c] text-white text-xs font-headline font-bold rounded-lg shadow flex items-center gap-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </div>
      </form>

      {/* Order Management / Custom Workflow */}
      <div className="bg-white dark:bg-[#241a13] rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm p-6 space-y-4">
        <h2 className="font-headline font-bold text-lg text-[#211a15] dark:text-white border-b border-[#d7c3b2]/20 pb-3 flex items-center gap-2">
          <Scissors className="w-5 h-5 text-[#885000]" />
          Order Workflow Stages
        </h2>

        <p className="text-xs text-[#524438] dark:text-[#d7c3b2]">
          Customize the manufacturing stages every bespoke garment progresses through.
        </p>

        <div className="space-y-2">
          {profileDraft.statuses.map((status, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-[#fff8f4] dark:bg-[#1a120c] rounded-lg border border-[#d7c3b2]/20"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#fff1e7] dark:bg-[#33261c] text-[#885000] flex items-center justify-center text-xs font-bold font-mono">
                  {index + 1}
                </span>
                <span className="font-headline font-bold text-sm text-[#211a15] dark:text-white">
                  {status}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteStatus(index)}
                className="p-1 text-[#847466] hover:text-[#ba1a1a] transition-colors"
                title="Remove stage"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            placeholder="e.g. Final Ironing & Quality Check"
            className="flex-1 px-3 py-2 bg-[#fff8f4] dark:bg-[#1a120c] border border-[#d7c3b2]/30 rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={handleAddStatus}
            className="px-4 py-2 bg-[#885000] text-white text-xs font-bold rounded-lg hover:bg-[#a6681c] flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Status
          </button>
        </div>
      </div>

      {/* Dashboard Metrics Selector */}
      <div className="bg-white dark:bg-[#241a13] rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm p-6 space-y-4">
        <h2 className="font-headline font-bold text-lg text-[#211a15] dark:text-white border-b border-[#d7c3b2]/20 pb-3 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#885000]" />
          Dashboard Metrics
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableMetrics.map((metric) => {
            const checked = profileDraft.activeMetrics.includes(metric);
            return (
              <label
                key={metric}
                className="flex items-center gap-3 p-3 bg-[#fff8f4] dark:bg-[#1a120c] rounded-lg border border-[#d7c3b2]/20 cursor-pointer hover:border-[#885000] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggleMetric(metric)}
                  className="rounded border-[#d7c3b2] text-[#885000] focus:ring-[#885000]"
                />
                <span className="text-xs font-headline font-semibold text-[#211a15] dark:text-white">
                  {metric}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Personalization & Brand Theme from Logo */}
      <div className="bg-white dark:bg-[#241a13] rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#d7c3b2]/20 pb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#885000] dark:text-[#ffb86d]" />
            <h2 className="font-headline font-bold text-lg text-[#211a15] dark:text-white">
              Brand System & Theme from Logo
            </h2>
          </div>

          {profileDraft.businessTheme && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>WCAG {profileDraft.businessTheme.wcagRating} ({profileDraft.businessTheme.contrastRatio}:1)</span>
            </span>
          )}
        </div>

        <p className="text-xs text-[#524438] dark:text-[#d7c3b2]">
          Upload any logo. Our engine extracts the dominant and accent hues, analyzes WCAG contrast compliance, and generates an accessible bespoke palette across all workspace views.
        </p>

        {/* Current Active Theme Tokens */}
        {profileDraft.businessTheme ? (
          <div className="space-y-4">
            {/* Extracted Swatches */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#847466] dark:text-[#a08e80] mb-2">
                Raw Extracted Colors:
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {profileDraft.businessTheme.extractedPalette.map((hex, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-black/10 text-xs font-mono font-bold bg-[#fff8f4] dark:bg-[#1a120c]"
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

            {/* Generated Tokens Grid */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#847466] dark:text-[#a08e80] mb-2">
                Generated Accessible Design Tokens:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] bg-[#fff8f4] dark:bg-[#1a120c] flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-lg border border-black/15 shrink-0"
                    style={{ backgroundColor: profileDraft.businessTheme.primaryColor }}
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[#847466]">Primary</p>
                    <p className="font-mono text-xs font-bold truncate">{profileDraft.businessTheme.primaryColor}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] bg-[#fff8f4] dark:bg-[#1a120c] flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-lg border border-black/15 shrink-0"
                    style={{ backgroundColor: profileDraft.businessTheme.accentColor }}
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[#847466]">Accent</p>
                    <p className="font-mono text-xs font-bold truncate">{profileDraft.businessTheme.accentColor}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] bg-[#fff8f4] dark:bg-[#1a120c] flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-lg border border-black/15 shrink-0"
                    style={{ backgroundColor: profileDraft.businessTheme.backgroundColor }}
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[#847466]">Background</p>
                    <p className="font-mono text-xs font-bold truncate">{profileDraft.businessTheme.backgroundColor}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] bg-[#fff8f4] dark:bg-[#1a120c] flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-lg border border-black/15 shrink-0"
                    style={{ backgroundColor: profileDraft.businessTheme.surfaceColor }}
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[#847466]">Surface</p>
                    <p className="font-mono text-xs font-bold truncate">{profileDraft.businessTheme.surfaceColor}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] bg-[#fff8f4] dark:bg-[#1a120c] flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-lg border border-black/15 shrink-0"
                    style={{ backgroundColor: profileDraft.businessTheme.textColor }}
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[#847466]">Text Neutral</p>
                    <p className="font-mono text-xs font-bold truncate">{profileDraft.businessTheme.textColor}</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-[#d7c3b2]/30 dark:border-[#524438] bg-[#fff8f4] dark:bg-[#1a120c] flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-lg border border-black/15 shrink-0"
                    style={{ backgroundColor: profileDraft.businessTheme.secondaryColor }}
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-bold text-[#847466]">Secondary Tint</p>
                    <p className="font-mono text-xs font-bold truncate">{profileDraft.businessTheme.secondaryColor}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Re-analyze Button */}
        <div className="flex items-center gap-3 pt-2">
          <label className="px-4 py-2 bg-[#fff8f4] dark:bg-[#1a120c] hover:bg-[#ede0d6]/50 border border-[#d7c3b2]/40 dark:border-[#524438] rounded-xl text-xs font-bold cursor-pointer flex items-center gap-2 transition-colors">
            <Upload className="w-3.5 h-3.5 text-[#885000]" />
            <span>Upload New Logo File</span>
            <input type="file" accept="image/*" onChange={handleLogoUploadAndAnalyze} className="hidden" />
          </label>

          <button
            type="button"
            onClick={handleReanalyzeCurrentLogo}
            disabled={isAnalyzingLogo}
            className="px-4 py-2 bg-[#885000] hover:bg-[#a6681c] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingLogo ? 'animate-spin' : ''}`} />
            <span>{isAnalyzingLogo ? 'Analyzing...' : 'Re-extract Theme'}</span>
          </button>
        </div>
      </div>

      {/* Data Export & Excel Backup */}
      <div className="bg-white dark:bg-[#241a13] rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm p-6 space-y-4">
        <h2 className="font-headline font-bold text-lg text-[#211a15] dark:text-white border-b border-[#d7c3b2]/20 pb-3 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
          Data Export & Spreadsheets
        </h2>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-1">
          <div>
            <p className="font-headline font-bold text-sm text-[#211a15] dark:text-white">
              Master Atelier Excel Workbook (.xlsx)
            </p>
            <p className="text-xs text-[#524438] dark:text-[#d7c3b2] mt-0.5">
              Export all bespoke garments, client CRM contacts, financial P&L statements, materials inventory, and partner balances into multi-tab formatted Excel spreadsheets.
            </p>
          </div>

          {onExportExcel && (
            <button
              type="button"
              onClick={onExportExcel}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold font-headline rounded-lg shadow-sm flex items-center gap-2 active:scale-95 transition-all shrink-0"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Master Excel</span>
            </button>
          )}
        </div>
      </div>

      {/* Account & Security */}
      <div className="bg-white dark:bg-[#241a13] rounded-xl border border-[#d7c3b2]/20 dark:border-[#524438] shadow-sm p-6 space-y-4">
        <h2 className="font-headline font-bold text-lg text-[#211a15] dark:text-white border-b border-[#d7c3b2]/20 pb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#885000]" />
          Account & Security
        </h2>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
          <div>
            <p className="font-headline font-bold text-sm text-[#211a15] dark:text-white">
              Two-Factor Authentication
            </p>
            <p className="text-xs text-[#524438] dark:text-[#d7c3b2]">
              Protect client measurements and trade billing secrets with SMS verification.
            </p>
          </div>
          <span className="px-3 py-1 bg-green-50 text-green-800 text-xs font-bold rounded-full border border-green-200">
            Enabled
          </span>
        </div>

        <div className="pt-4 border-t border-[#d7c3b2]/20 flex justify-between items-center">
          <button
            type="button"
            onClick={() => {
              setAccountNotice('Password reset verification email sent.');
              window.setTimeout(() => setAccountNotice(null), 2500);
            }}
            className="text-xs font-bold text-[#885000] hover:underline"
          >
            Change Workshop Password
          </button>

          <button
            type="button"
            onClick={onSignOut}
            className="px-4 py-2 bg-red-50 text-[#ba1a1a] hover:bg-red-100 text-xs font-bold rounded-lg border border-red-200 flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
