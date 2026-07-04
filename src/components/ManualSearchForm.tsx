import React, { useState, useEffect } from 'react';
import { Search, Globe, FolderHeart, FileText, User, Sparkles, Loader2 } from 'lucide-react';
import { ManualSearchInputs } from '../types';

interface ManualSearchFormProps {
  initialValues: ManualSearchInputs;
  onSearch: (values: ManualSearchInputs) => void;
  isLoading: boolean;
}

export default function ManualSearchForm({ initialValues, onSearch, isLoading }: ManualSearchFormProps) {
  const [values, setValues] = useState<ManualSearchInputs>({
    username: '',
    country: '',
    niche: '',
    reviewText: '',
  });

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.username.trim()) return;
    onSearch(values);
  };

  return (
    <form id="search-form" onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div>
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          বায়ার প্রোফাইল তথ্য (Client Details)
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          স্ক্রিনশট থেকে স্বয়ংক্রিয়ভাবে প্রাপ্ত তথ্য পরিবর্তন করতে পারেন অথবা নতুন তথ্য দিয়ে সরাসরি সার্চ করুন
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fiverr Username */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="username" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            ফাইবার ইউজারনেম (Username) <span className="text-red-400">*</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            placeholder="যেমন: lily_s4"
            value={values.username}
            onChange={handleChange}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500/80 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
          />
        </div>

        {/* Country */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="country" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            দেশ (Country)
          </label>
          <input
            id="country"
            name="country"
            type="text"
            placeholder="যেমন: United States"
            value={values.country}
            onChange={handleChange}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500/80 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
          />
        </div>

        {/* Niche/Category */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="niche" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FolderHeart className="w-3.5 h-3.5 text-slate-400" />
            কাজের ক্যাটাগরি / নিশ (Niche)
          </label>
          <input
            id="niche"
            name="niche"
            type="text"
            placeholder="যেমন: Video Editing, Logo Design, Web Developer, Shopify"
            value={values.niche}
            onChange={handleChange}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500/80 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition"
          />
        </div>

        {/* Review text clues */}
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label htmlFor="reviewText" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            রিভিউ বা মেসেজের বিবরণ (Review text or Clues)
          </label>
          <textarea
            id="reviewText"
            name="reviewText"
            rows={2}
            placeholder="রিভিউতে কোনো নাম বা বিশেষ কথা থাকলে তা এখানে দিন। যেমন: 'I worked with hanvepro and lily did an amazing job...'"
            value={values.reviewText}
            onChange={handleChange}
            className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 focus:border-indigo-500/80 text-sm text-slate-100 placeholder:text-slate-600 outline-none resize-none transition"
          />
        </div>
      </div>

      <button
        id="search-submit-btn"
        type="submit"
        disabled={isLoading || !values.username.trim()}
        className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition duration-300 ${
          isLoading || !values.username.trim()
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/30'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-indigo-200" />
            গুগল ও এআই দিয়ে সোশ্যাল মিডিয়া খোঁজা হচ্ছে...
          </>
        ) : (
          <>
            <Search className="w-4 h-4 text-indigo-200" />
            সোশ্যাল প্রোফাইল খুঁজুন (Deep Social Search)
          </>
        )}
      </button>
    </form>
  );
}
