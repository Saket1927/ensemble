import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
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
} from 'lucide-react';

interface OnboardWizardProps {
  onClose: () => void;
}

export const OnboardWizard: React.FC<OnboardWizardProps> = ({ onClose }) => {
  const { addRestaurant, setActiveRestaurantSlug, setRole } = useTenant();

  const [step, setStep] = useState<number>(1);

  // Step 1: Restaurant Info
  const [name, setName] = useState('THE BOMBAY CANTEEN');
  const [slug, setSlug] = useState('bombaycanteen');
  const [phone, setPhone] = useState('+91 98200 77665');
  const [email, setEmail] = useState('hello@bombaycanteen.com');
  const [address, setAddress] = useState('Kamala Mills, Lower Parel, Mumbai');
  const [cuisine, setCuisine] = useState('Modern Indian Regional');

  // Step 2: Branding
  const [primaryColor, setPrimaryColor] = useState('#2d3748');
  const [secondaryColor, setSecondaryColor] = useState('#dd6b20');
  const [heroImageUrl, setHeroImageUrl] = useState(
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=85'
  );

  // Step 3: Social
  const [instagram, setInstagram] = useState('@thebombaycanteen');
  const [whatsapp, setWhatsapp] = useState('+919820077665');
  const [facebook, setFacebook] = useState('thebombaycanteen');
  const [tiktok, setTiktok] = useState('@thebombaycanteen');

  // Step 4: Menu
  const [starterName, setStarterName] = useState('Eggs Kejriwal on Toast');
  const [starterPrice, setStarterPrice] = useState(420);
  const [mainName, setMainName] = useState('Pork Vindaloo Tacos');
  const [mainPrice, setMainPrice] = useState(580);

  // Step 5: Rewards
  const [topReward, setTopReward] = useState('15% OFF Next Feast');
  const [baseReward, setBaseReward] = useState('10% OFF Welcome Bonus');

  // Step 6: Tables
  const [tablesCount, setTablesCount] = useState<number>(24);

  // Step 7: Final state
  const [createdSlug, setCreatedSlug] = useState<string>('');

  const handleFinishOnboarding = () => {
    const created = addRestaurant({
      name,
      slug: slug.toLowerCase().replace(/[^a-z0-9]/g, ''),
      brandTitle: `${name} • Modern Hospitality`,
      tagline: 'Celebration of seasonal Indian regional treasures.',
      description: `Welcome to ${name}. Dine, review, and earn exclusive rewards.`,
      cuisine,
      address,
      phone,
      email,
      website: `https://${slug}.ensemble.com`,
      googleReviewUrl: `https://g.page/r/${slug}/review`,
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
        youtube: `@${slug}`,
      },
      hashtags: [`#${slug}`, '#EnsembleDining'],
      tablesCount,
      plan: 'Growth',
    });

    setCreatedSlug(created.slug);
    setStep(7);
  };

  const stepsMeta = [
    { num: 1, label: 'Restaurant Info', icon: Building },
    { num: 2, label: 'Branding', icon: Palette },
    { num: 3, label: 'Social', icon: Share2 },
    { num: 4, label: 'Initial Menu', icon: BookOpen },
    { num: 5, label: 'Spin Rewards', icon: Gift },
    { num: 6, label: 'Tables & QR', icon: QrCode },
    { num: 7, label: 'Complete', icon: CheckCircle2 },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in text-slate-200">
      <div className="bg-slate-950 w-full max-w-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Wizard Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Step {step} of 7 • Onboard New Tenant
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
        <div className="px-6 py-3 bg-slate-900/30 border-b border-slate-800/80 flex items-center justify-between overflow-x-auto gap-2">
          {stepsMeta.map((s) => {
            const Icon = s.icon;
            const isDone = s.num < step;
            const isCurrent = s.num === step;
            return (
              <div key={s.num} className="flex items-center space-x-1.5 shrink-0 text-xs">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
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
                  className={`text-[11px] hidden sm:inline ${
                    isCurrent ? 'font-bold text-white' : 'text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step Body Content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
          {step === 1 && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="font-serif text-base font-bold text-white">
                Step 1: Restaurant Basic Information
              </h3>
              <p className="text-slate-400 text-xs">
                Enter the restaurant's operational identity and subdomain handle.
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Restaurant Legal & Display Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                  }}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Subdomain Slug (Unique Tenant Domain)
                </label>
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 font-mono">
                  <span className="text-emerald-400 font-bold">{slug}</span>
                  <span className="text-slate-500">.ensemble.com</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cuisine Style</label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Location Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="font-serif text-base font-bold text-white">
                Step 2: Branding & Color Palette
              </h3>
              <p className="text-slate-400 text-xs">
                Define the primary luxury tones. The customer experience will adapt automatically.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 p-0.5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Accent Gold/Amber Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 p-0.5 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Hero Dining Image URL
                </label>
                <input
                  type="url"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="font-serif text-base font-bold text-white">
                Step 3: Social Handles
              </h3>
              <p className="text-slate-400 text-xs">
                These channels will appear in the customer experience for social amplification.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Instagram</label>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Facebook</label>
                  <input
                    type="text"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">TikTok</label>
                  <input
                    type="text"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="font-serif text-base font-bold text-white">
                Step 4: Starter Menu Items
              </h3>
              <p className="text-slate-400 text-xs">
                Seed initial signature dishes for guests to browse immediately.
              </p>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1">Signature Starter</label>
                  <input
                    type="text"
                    value={starterName}
                    onChange={(e) => setStarterName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={starterPrice}
                    onChange={(e) => setStarterPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1">Signature Main</label>
                  <input
                    type="text"
                    value={mainName}
                    onChange={(e) => setMainName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={mainPrice}
                    onChange={(e) => setMainPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-lg text-white font-bold"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="font-serif text-base font-bold text-white">
                Step 5: Spin & Win Reward Wheel
              </h3>
              <p className="text-slate-400 text-xs">
                Configure default prize options for the restaurant's gamified reward wheel.
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Grand Prize</label>
                <input
                  type="text"
                  value={topReward}
                  onChange={(e) => setTopReward(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Common Prize</label>
                <input
                  type="text"
                  value={baseReward}
                  onChange={(e) => setBaseReward(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-3 animate-fade-in">
              <h3 className="font-serif text-base font-bold text-white">
                Step 6: Dining Tables & Standee Generation
              </h3>
              <p className="text-slate-400 text-xs">
                How many physical dining tables does this restaurant have?
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Total Tables Count
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={tablesCount}
                  onChange={(e) => setTablesCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white font-bold text-base"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  ENSEMBLE will automatically provision Table 1 through Table {tablesCount} with unique QR codes.
                </p>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center space-x-3">
                <QrCode className="w-8 h-8 text-emerald-400" />
                <div>
                  <div className="font-bold text-white text-xs">
                    Automated Subdomain Routing:
                  </div>
                  <div className="font-mono text-emerald-400 text-[11px]">
                    https://{slug}.ensemble.com/t/1 ... /t/{tablesCount}
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 7 && (
            /* Final Confirmation Screen */
            <div className="text-center py-6 space-y-4 animate-slide-up">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-400/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                  Tenant Provisioned Successfully
                </span>
                <h3 className="font-serif text-2xl font-bold text-white">
                  {name} Is Live on ENSEMBLE!
                </h3>
                <p className="text-slate-400 text-xs max-w-sm mx-auto">
                  The restaurant account, dedicated database partition, table QRs, and branded customer portal are online.
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-left space-y-2 max-w-md mx-auto">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Public Customer URL:</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    https://{createdSlug}.ensemble.com
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Restaurant Admin Portal:</span>
                  <span className="font-mono text-amber-400 font-bold">
                    https://{createdSlug}.admin.ensemble.com
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-2">
                <button
                  onClick={() => {
                    setActiveRestaurantSlug(createdSlug);
                    setRole('customer');
                    onClose();
                  }}
                  className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <span>Open Customer Experience</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setActiveRestaurantSlug(createdSlug);
                    setRole('restaurant_admin');
                    onClose();
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center space-x-1.5 border border-slate-700 shadow-md"
                >
                  <span>Open Restaurant Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        {step < 7 && (
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

            {step < 6 ? (
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
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-lg shadow-emerald-950"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Launch Restaurant</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
