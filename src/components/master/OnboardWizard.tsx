import React, { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Building,
  Palette,
  Share2,
  BookOpen,
  Gift,
  QrCode,
  Sparkles,
  ExternalLink,
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react';

import { RestaurantPlanFeatures } from '../../types/tenant';

interface OnboardWizardProps {
  onClose: () => void;
}

export const OnboardWizard: React.FC<OnboardWizardProps> = ({ onClose }) => {
  const { addRestaurant, addMenuItem, setActiveRestaurantSlug } = useTenant();
  const { createStaffAccount } = useAuth();

  const [step, setStep] = useState<number>(1);

  // Step 1: Restaurant Info (Clean Defaults)
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [cuisine, setCuisine] = useState('');

  // Step 2: Branding
  const [primaryColor, setPrimaryColor] = useState('#162c21');
  const [secondaryColor, setSecondaryColor] = useState('#c5a96d');
  const [heroImageUrl, setHeroImageUrl] = useState(
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85'
  );

  // Step 3: Social
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');

  // Step 4: Menu
  const [starterName, setStarterName] = useState('');
  const [starterPrice, setStarterPrice] = useState(350);
  const [mainName, setMainName] = useState('');
  const [mainPrice, setMainPrice] = useState(550);

  // Step 5: Tables & QR
  const [tablesCount, setTablesCount] = useState<number>(20);

  // Step 6: Rewards
  const [topReward, setTopReward] = useState('15% OFF Next Feast');
  const [baseReward, setBaseReward] = useState('10% OFF Welcome Bonus');

  // Step 7: Ordering & Plan
  const [selectedPlan, setSelectedPlan] = useState<'Starter' | 'Growth' | 'Enterprise'>('Growth');
  const [gstPercent, setGstPercent] = useState<number>(5);
  const [serviceChargePercent, setServiceChargePercent] = useState<number>(5);
  const [expiryDate, setExpiryDate] = useState<string>(
    new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0]
  );
  const [planFeatures, setPlanFeatures] = useState<RestaurantPlanFeatures>({
    captainModule: true,
    ordering: true,
    socialRewards: true,
    spinRewards: true,
    billUpload: true,
    customBranding: true,
    analytics: true,
    reviews: true,
  });

  // Step 8: Restaurant Owner Account
  const [ownerName, setOwnerName] = useState('');
  const [ownerLoginId, setOwnerLoginId] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('test password');
  const [showPassword, setShowPassword] = useState(false);

  // Auto-sync owner login ID with slug when slug changes
  useEffect(() => {
    if (slug) {
      setOwnerLoginId(`${slug.toLowerCase().replace(/[^a-z0-9]/g, '')}.owner`);
      setOwnerEmail(`owner@${slug.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`);
    }
  }, [slug]);

  // Step 9: Final state
  const [createdSlug, setCreatedSlug] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleFinishOnboarding = async () => {
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9]/g, '');

    const created = addRestaurant({
      name,
      slug: cleanSlug,
      brandTitle: `${name} • Royal Hospitality`,
      tagline: 'Authentic culinary legacy and exquisite regional treasures.',
      description: `Welcome to ${name}. Dine, review, and earn exclusive rewards.`,
      cuisine,
      address,
      phone,
      email,
      website: `https://ensemble-restaurant.vercel.app/${cleanSlug}`,
      googleReviewUrl: `https://g.page/r/${cleanSlug}/review`,
      branding: {
        primaryColor,
        secondaryColor,
        accentColor: '#fbf9f5',
        surfaceColor: '#ffffff',
        textColor: '#1c1c1c',
        fontFamily: 'Playfair Display, serif',
        logoUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 80" fill="none"><rect width="320" height="80" rx="4" fill="%232d3748"/><text x="40" y="48" fill="%23ffffff" font-family="sans-serif" font-size="20" font-weight="bold">${name.toUpperCase()}</text></svg>`,
        heroImageUrl,
        coverImageUrl: heroImageUrl,
      },
      socials: {
        instagram,
        facebook,
        whatsapp,
        tiktok,
        youtube: `@${cleanSlug}`,
      },
      hashtags: [`#${cleanSlug}`, '#EnsembleDining'],
      tablesCount,
      plan: selectedPlan,
      planFeatures,
      expiryDate,
      chargesConfig: {
        gstPercent,
        serviceChargePercent,
        packagingFee: 30,
      },
    });

    // Create real Owner account in Auth system with hashed password
    await createStaffAccount({
      name: ownerName,
      loginId: ownerLoginId,
      email: ownerEmail,
      password: ownerPassword,
      role: 'owner',
      restaurantId: created.id,
      restaurantName: created.name,
      restaurantSlug: created.slug,
      phone,
    });

    // Populate initial dishes configured in Step 4
    if (starterName && starterName.trim()) {
      addMenuItem({
        restaurantId: created.id,
        name: starterName.trim(),
        category: 'Starters',
        description: `Signature culinary starter prepared fresh at ${name}.`,
        price: starterPrice || 350,
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        isVeg: true,
        isChefSpecial: true,
        isAvailable: true,
        rating: 4.9,
      });
    }

    if (mainName && mainName.trim()) {
      addMenuItem({
        restaurantId: created.id,
        name: mainName.trim(),
        category: 'Mains',
        description: `Exquisite signature main course prepared fresh at ${name}.`,
        price: mainPrice || 550,
        imageUrl: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=800&q=80',
        isVeg: false,
        isChefSpecial: true,
        isAvailable: true,
        rating: 4.9,
      });
    }

    setCreatedSlug(created.slug);
    setStep(9);
  };

  const stepsMeta = [
    { num: 1, label: 'Info', icon: Building },
    { num: 2, label: 'Branding', icon: Palette },
    { num: 3, label: 'Social', icon: Share2 },
    { num: 4, label: 'Menu', icon: BookOpen },
    { num: 5, label: 'Tables', icon: QrCode },
    { num: 6, label: 'Rewards', icon: Gift },
    { num: 7, label: 'Plan', icon: Sparkles },
    { num: 8, label: 'Owner Auth', icon: Shield },
    { num: 9, label: 'Done', icon: CheckCircle2 },
  ];

  const handleCopyCredentials = () => {
    const text = `Restaurant: ${name}\nPublic URL: ${window.location.origin}/${createdSlug}/t/1\nRestaurant Admin: ${window.location.origin}/restaurant/login\nOwner Login: ${ownerLoginId}\nOwner Password: ${ownerPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in text-slate-200 font-sans">
      <div className="bg-slate-950 w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Wizard Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Step {step} of 9 • Onboard New Restaurant
            </span>
            <h2 className="font-serif text-xl font-bold text-white mt-0.5">
              Provision Restaurant Infrastructure
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicators Ribbon */}
        <div className="px-6 py-2.5 bg-slate-900/30 border-b border-slate-800/80 flex items-center justify-between overflow-x-auto gap-2">
          {stepsMeta.map((s) => {
            const Icon = s.icon;
            const isDone = s.num < step;
            const isCurrent = s.num === step;
            return (
              <div key={s.num} className="flex items-center space-x-1 shrink-0 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isDone
                      ? 'bg-emerald-500 text-slate-950'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span
                  className={`text-[10px] hidden md:inline ${
                    isCurrent ? 'font-bold text-white' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Wizard Form Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {/* STEP 1: Restaurant Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                1. General Restaurant Profile
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Restaurant Legal & Brand Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Restaurant Slug (e.g. heritage &rarr; /heritage)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-emerald-400 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Cuisine</label>
                  <input
                    type="text"
                    value={cuisine}
                    onChange={(e) => setCuisine(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Address & Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Branding */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                2. Theme & Visual Identity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Secondary Accent</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Cover / Hero Image URL</label>
                <input
                  type="text"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Social */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                3. Social Media & UGC Handles
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">WhatsApp Business</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Initial Menu */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                4. Seed Signature Menu Items
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Starter Dish</label>
                  <input
                    type="text"
                    value={starterName}
                    onChange={(e) => setStarterName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={starterPrice}
                    onChange={(e) => setStarterPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Main Course</label>
                  <input
                    type="text"
                    value={mainName}
                    onChange={(e) => setMainName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={mainPrice}
                    onChange={(e) => setMainPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Tables & QR */}
          {step === 5 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                5. Tables & QR Code Range
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Total Dining Tables Count
                </label>
                <input
                  type="number"
                  value={tablesCount}
                  onChange={(e) => setTablesCount(Number(e.target.value))}
                  min={1}
                  max={100}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Ensemble will automatically generate table records and unique QR payloads for tables 1 through {tablesCount}.
                </p>
              </div>
            </div>
          )}

          {/* STEP 6: Rewards */}
          {step === 6 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                6. Gamified Wheel Rewards
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Top Jackpot Reward</label>
                <input
                  type="text"
                  value={topReward}
                  onChange={(e) => setTopReward(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Baseline Welcome Reward</label>
                <input
                  type="text"
                  value={baseReward}
                  onChange={(e) => setBaseReward(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                />
              </div>
            </div>
          )}

          {/* STEP 7: Plan & Taxes */}
          {step === 7 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2">
                7. Subscription Tier & Taxes
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Select SaaS Plan</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['Starter', 'Growth', 'Enterprise'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setSelectedPlan(p)}
                      className={`p-3 rounded-xl border text-center transition ${
                        selectedPlan === p
                          ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-xs">{p}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {p === 'Enterprise' ? 'Full Suite' : p === 'Growth' ? 'Popular' : 'Basic'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">GST Tax Rate (%)</label>
                  <input
                    type="number"
                    value={gstPercent}
                    onChange={(e) => setGstPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Service Charge (%)</label>
                  <input
                    type="number"
                    value={serviceChargePercent}
                    onChange={(e) => setServiceChargePercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Subscription Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                </div>
              </div>

              {/* Feature Entitlements Checklist */}
              <div className="pt-2 space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Feature Entitlements & Module Access
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'ordering', label: 'Table Ordering & Open Tabs' },
                    { key: 'captainModule', label: 'Floor Captain Terminal' },
                    { key: 'socialRewards', label: 'Instagram & Social Rewards' },
                    { key: 'spinRewards', label: 'Spin & Win Wheel' },
                    { key: 'billUpload', label: 'Bill Audit & Mystery Scratch' },
                    { key: 'analytics', label: 'Revenue & CRM Analytics' },
                    { key: 'reviews', label: 'Customer Reviews & Feedback' },
                    { key: 'customBranding', label: 'Custom Brand Colors & Theme' },
                  ].map((feat) => (
                    <label
                      key={feat.key}
                      className="flex items-center space-x-2.5 p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-slate-700 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={planFeatures[feat.key as keyof RestaurantPlanFeatures] ?? true}
                        onChange={(e) =>
                          setPlanFeatures((prev) => ({
                            ...prev,
                            [feat.key]: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs text-slate-300 font-medium">{feat.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Restaurant Owner Account Creation */}
          {step === 8 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>8. Provision Initial Restaurant Owner Account</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                  Role: OWNER
                </span>
              </h3>

              <p className="text-xs text-slate-400">
                Create the primary administrative account for this restaurant. Passwords are securely hashed with SHA-256 and never stored in plaintext.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Owner Full Name *
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Owner Login ID * (used on /restaurant/login)
                  </label>
                  <input
                    type="text"
                    value={ownerLoginId}
                    onChange={(e) => setOwnerLoginId(e.target.value)}
                    placeholder="heritage.owner"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-amber-400 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={ownerPassword}
                      onChange={(e) => setOwnerPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3.5 py-2.5 pr-10 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Owner Email Address
                </label>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="owner@heritage.com"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* STEP 9: Complete Screen */}
          {step === 9 && (
            <div className="py-6 text-center space-y-5 animate-scale-up">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white font-serif">
                  {name} Successfully Onboarded!
                </h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto mt-1">
                  Restaurant infrastructure, tables, and Owner authentication credentials are now active.
                </p>
              </div>

              {/* Credentials Summary Box */}
              <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 text-left space-y-3 max-w-lg mx-auto">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Access Credentials</span>
                  <button
                    onClick={handleCopyCredentials}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied!' : 'Copy All'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Public Customer Menu:</span>
                  <a
                    href={`/${createdSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-emerald-400 font-bold hover:underline flex items-center space-x-1"
                  >
                    <span>/{createdSlug}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Table 1 QR View:</span>
                  <a
                    href={`/${createdSlug}/t/1`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-teal-400 font-bold hover:underline flex items-center space-x-1"
                  >
                    <span>/{createdSlug}/t/1</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Captain Floor Terminal:</span>
                  <a
                    href={`/${createdSlug}/captain`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-amber-300 font-bold hover:underline flex items-center space-x-1"
                  >
                    <span>/{createdSlug}/captain</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Restaurant Admin:</span>
                  <a
                    href={`/${createdSlug}/admin`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-indigo-300 font-bold hover:underline flex items-center space-x-1"
                  >
                    <span>/{createdSlug}/admin</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Owner Login ID:</span>
                  <span className="font-mono text-amber-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {ownerLoginId}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Owner Password:</span>
                  <span className="font-mono text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {ownerPassword}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto pt-2">
                <button
                  onClick={() => {
                    window.open(`/${createdSlug}/t/1`, '_blank');
                  }}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <span>Open Customer View</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onClose}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5 border border-slate-700 shadow-md"
                >
                  <span>Done & View List</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        {step < 9 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 flex items-center space-x-1.5 ${
                step === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {step < 8 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-sm"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinishOnboarding}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-lg shadow-emerald-950"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Restaurant & Owner</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
