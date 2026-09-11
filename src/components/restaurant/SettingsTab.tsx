import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import {
  Settings,
  Palette,
  Share2,
  MapPin,
  Phone,
  Globe,
  CheckCircle2,
  ExternalLink,
  Save,
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const { activeRestaurant, updateRestaurant, setRole } = useTenant();

  const [name, setName] = useState(activeRestaurant.name);
  const [tagline, setTagline] = useState(activeRestaurant.tagline);
  const [primaryColor, setPrimaryColor] = useState(activeRestaurant.branding.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(activeRestaurant.branding.secondaryColor);
  const [address, setAddress] = useState(activeRestaurant.address);
  const [phone, setPhone] = useState(activeRestaurant.phone);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(activeRestaurant.googleReviewUrl);

  const [instagram, setInstagram] = useState(activeRestaurant.socials.instagram);
  const [facebook, setFacebook] = useState(activeRestaurant.socials.facebook);
  const [whatsapp, setWhatsapp] = useState(activeRestaurant.socials.whatsapp);
  const [tiktok, setTiktok] = useState(activeRestaurant.socials.tiktok);
  const [youtube, setYoutube] = useState(activeRestaurant.socials.youtube);

  const [heroImageUrl, setHeroImageUrl] = useState(activeRestaurant.branding.heroImageUrl);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    updateRestaurant(activeRestaurant.id, {
      name,
      tagline,
      address,
      phone,
      googleReviewUrl,
      branding: {
        ...activeRestaurant.branding,
        primaryColor,
        secondaryColor,
        heroImageUrl,
      },
      socials: {
        instagram,
        facebook,
        whatsapp,
        tiktok,
        youtube,
      },
    });

    setSuccessNotice('Branding and settings updated live! Customer experience adapted instantly.');
    setTimeout(() => setSuccessNotice(null), 3500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Restaurant Branding & Digital Profile
          </h2>
          <p className="text-xs text-slate-500">
            Customize luxury palette, social identities, and guest portal configuration for {activeRestaurant.name}.
          </p>
        </div>

        <button
          onClick={() => setRole('customer')}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 transition shadow-sm"
        >
          <span>Preview Customer Experience</span>
          <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
        </button>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center space-x-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Brand Theme & Luxury Colors */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Palette className="w-4 h-4 text-amber-600" />
            <h3 className="font-serif font-bold text-sm text-slate-900">
              Luxury Palette & Visual Identity
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Brand Color (Hero & Headers)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs uppercase"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                e.g. #162c21 (Heritage Forest Green), #0f2744 (Navy Blue), #4a1525 (Burgundy)
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Accent / Muted Gold Color
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-10 h-10 rounded-xl border border-slate-300 p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-200 rounded-xl font-mono text-xs uppercase"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                e.g. #c5a96d (Muted Royal Gold), #d97706 (Amber)
              </p>
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Cover / Hero Food Photograph URL
            </label>
            <input
              type="url"
              value={heroImageUrl}
              onChange={(e) => setHeroImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
            />
          </div>
        </div>

        {/* Restaurant Information */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Globe className="w-4 h-4 text-amber-600" />
            <h3 className="font-serif font-bold text-sm text-slate-900">
              Hospitality & Location Details
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Restaurant Public Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tagline / Motto
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Direct Phone / Reservations
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Google Review Link (for 4+ star redirection)
              </label>
              <input
                type="url"
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* Social Media Channels */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Share2 className="w-4 h-4 text-amber-600" />
            <h3 className="font-serif font-bold text-sm text-slate-900">
              Social Media Accounts (Shown in Customer Experience)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Instagram Handle
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@tasteofindia_heritagegrand"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp Phone
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+919820048123"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Facebook Page Handle
              </label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                TikTok Handle
              </label>
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white shadow-lg transition flex items-center space-x-2"
            style={{ backgroundColor: primaryColor }}
          >
            <Save className="w-4 h-4" />
            <span>Save & Propagate Brand</span>
          </button>
        </div>
      </form>
    </div>
  );
};
