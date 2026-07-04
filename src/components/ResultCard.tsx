import React, { useState } from 'react';
import { 
  Linkedin, Twitter, Facebook, Instagram, Github, Globe, 
  ExternalLink, Compass, ShieldCheck, AlertTriangle, Search, 
  Copy, Check, Image, HelpCircle 
} from 'lucide-react';
import { SocialProfile, CustomSearchLink, ManualSearchInputs } from '../types';

interface ResultCardProps {
  results: SocialProfile[];
  inputs: ManualSearchInputs;
  isLoading: boolean;
}

export default function ResultCard({ results, inputs, isLoading }: ResultCardProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-blue-400" />;
      case 'twitter':
        return <Twitter className="w-5 h-5 text-sky-400" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 text-indigo-400" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-400" />;
      case 'github':
        return <Github className="w-5 h-5 text-slate-300" />;
      default:
        return <Globe className="w-5 h-5 text-teal-400" />;
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'HIGH':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> High Match (খুবই নির্ভরযোগ্য)
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> Medium Match (সম্ভাব্য মিল)
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Match (আংশিক মিল)
          </span>
        );
    }
  };

  // Generate customized manual search links
  const generateManualLinks = (username: string, country: string, niche: string): CustomSearchLink[] => {
    if (!username) return [];

    const encodedUser = encodeURIComponent(username);
    const countryQuery = country ? ` "${encodeURIComponent(country)}"` : '';
    const nicheQuery = niche ? ` "${encodeURIComponent(niche)}"` : '';

    return [
      {
        platform: 'linkedin',
        label: `LinkedIn: ${username}`,
        url: `https://www.google.com/search?q=site:linkedin.com/in/+%22${encodedUser}%22+OR+site:linkedin.com/pub/+%22${encodedUser}%22`,
        icon: 'linkedin',
        description: 'LinkedIn-এ বায়ারের সঠিক প্রোফাইল হ্যান্ডেল খুঁজতে গুগলের সাইট অপারেটর সার্চ।'
      },
      {
        platform: 'linkedin-context',
        label: `LinkedIn + দেশ ও কাজ`,
        url: `https://www.google.com/search?q=site:linkedin.com/in/+%22${encodedUser}%22${countryQuery}${nicheQuery}`,
        icon: 'linkedin',
        description: 'LinkedIn-এ হ্যান্ডেলের সাথে বায়ারের দেশ এবং কাজ মিলিয়ে সূক্ষ্মভাবে খোঁজার লিংক।'
      },
      {
        platform: 'twitter',
        label: `Twitter/X: ${username}`,
        url: `https://twitter.com/search?q=${encodedUser}&f=user`,
        icon: 'twitter',
        description: 'টুইটার বা X-এ সরাসরি বায়ারের ইউজারনেম দিয়ে ইউজার প্রোফাইল সার্চ করুন।'
      },
      {
        platform: 'facebook',
        label: `Facebook: ${username}`,
        url: `https://www.facebook.com/search/people/?q=${encodedUser}`,
        icon: 'facebook',
        description: 'ফেসবুকে সরাসরি বায়ারের ফাইবারের নাম বা হ্যান্ডেল দিয়ে মানুষ সার্চ।'
      },
      {
        platform: 'instagram',
        label: `Instagram: ${username}`,
        url: `https://www.instagram.com/${encodedUser}/`,
        icon: 'instagram',
        description: 'ইনস্টাগ্রামে বায়ারের সঠিক হ্যান্ডেল দিয়ে সরাসরি তার প্রোফাইলে প্রবেশ।'
      },
      {
        platform: 'google-images',
        label: 'গুগল লেন্স ইমেজ সার্চ গাইড',
        url: 'https://images.google.com/',
        icon: 'image',
        description: 'ফাইবার বায়ারের গোল প্রোফাইল ছবিটিতে রাইট ক্লিক করে "Search Image with Google" সিলেক্ট করুন।'
      }
    ];
  };

  const manualLinks = generateManualLinks(inputs.username, inputs.country, inputs.niche);

  return (
    <div id="results-root" className="flex flex-col gap-6">
      
      {/* 1. Automated AI Results Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between mb-5 border-b border-slate-800/60 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              এআই চিহ্নিত প্রোফাইল (AI Discovered Profiles)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              গুগল সার্চ গ্রাউন্ডিং প্রযুক্তি ব্যবহার করে বায়ারের ডিজিটাল ফুটপ্রিন্ট মিলিয়ে দেখা হয়েছে
            </p>
          </div>
          {inputs.username && (
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Active Search</span>
              <span className="text-sm font-semibold text-emerald-400">@{inputs.username}</span>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin"></div>
              <Compass className="w-5 h-5 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-200">এআই গুগলে গভীরভাবে সার্চ করছে...</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                LinkedIn, Twitter, Facebook এবং অন্যান্য ওয়েব হ্যান্ডেলগুলো খুঁজে বের করা হচ্ছে। এতে ২০-৩০ সেকেন্ড সময় লাগতে পারে।
              </p>
            </div>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {results.map((profile) => (
              <div 
                key={profile.id} 
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-950/90 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-center shrink-0 shadow-inner">
                    {getPlatformIcon(profile.platform)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-100 text-sm md:text-base leading-tight">
                        {profile.displayName}
                      </h3>
                      {profile.handle && (
                        <span className="text-xs text-slate-500 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-850">
                          @{profile.handle}
                        </span>
                      )}
                      {getConfidenceBadge(profile.confidence)}
                    </div>
                    {profile.summary && (
                      <p className="text-xs text-slate-400 leading-relaxed font-medium">
                        {profile.summary}
                      </p>
                    )}
                    <div className="mt-1 flex items-start gap-1 text-[11px] text-slate-500 leading-normal">
                      <span className="font-bold text-slate-400 shrink-0">কারণ:</span>
                      <span>{profile.matchReason}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center border-t border-slate-800/40 md:border-t-0 pt-3 md:pt-0 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleCopyLink(profile.url)}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition"
                    title="লিংক কপি করুন"
                  >
                    {copiedLink === profile.url ? (
                      <Check className="w-4 h-4 text-emerald-400 animate-scale" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={profile.url}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/10 border border-emerald-500/20"
                  >
                    ওপেন করুন <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center border border-dashed border-slate-800/80 rounded-xl bg-slate-950/20">
            <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">কোনো এআই সার্চ ফলাফল পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              উপরে বায়ারের নাম/হ্যান্ডেল এবং অন্যান্য তথ্য লিখে "সোশ্যাল প্রোফাইল খুঁজুন" বাটনে ক্লিক করুন। নিচে ম্যানুয়াল সার্চ লিংকস ব্যবহার করতে পারেন।
            </p>
          </div>
        )}
      </div>

      {/* 2. Manual Custom Search Links Generator Section */}
      {inputs.username && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between mb-5 border-b border-slate-800/60 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Search className="w-5 h-5 text-blue-400" />
                ম্যানুয়াল সার্চ লিংকস (Custom Quick Links)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                ফাইবারে বায়ারের সঠিক প্রোফাইল নিশ্চিত করতে নিজের মতন করে খোঁজার শর্টকাট লিংকস
              </p>
            </div>
            <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2 py-0.5 rounded-md">
              Google SEO Operators
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {manualLinks.map((link, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 hover:border-slate-800 hover:bg-slate-950/80 transition-all duration-300 flex flex-col justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    {link.icon === 'linkedin' && <Linkedin className="w-4 h-4 text-blue-400" />}
                    {link.icon === 'twitter' && <Twitter className="w-4 h-4 text-sky-400" />}
                    {link.icon === 'facebook' && <Facebook className="w-4 h-4 text-indigo-400" />}
                    {link.icon === 'instagram' && <Instagram className="w-4 h-4 text-pink-400" />}
                    {link.icon === 'image' && <Image className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      {link.label}
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-normal mt-1">
                      {link.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-900">
                  {link.icon === 'image' ? (
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 bg-slate-900 border border-slate-850 px-2 py-1 rounded">
                      <HelpCircle className="w-3 h-3 text-amber-400" /> রাইট-ক্লিক গুগল লেন্স পদ্ধতি
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => handleCopyLink(link.url)}
                        className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300 transition"
                        title="গুগল সার্চ কোয়েরি কপি করুন"
                      >
                        {copiedLink === link.url ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <a
                        href={link.url}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 transition"
                      >
                        খুঁজুন <ExternalLink className="w-3 h-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
