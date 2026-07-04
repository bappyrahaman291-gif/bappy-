import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ShieldCheck, Globe, HelpCircle, AlertCircle, 
  Search, BookOpen, Link2, DollarSign, ExternalLink, Lightbulb 
} from 'lucide-react';
import ScreenshotUploader from './components/ScreenshotUploader';
import ManualSearchForm from './components/ManualSearchForm';
import ResultCard from './components/ResultCard';
import HistorySidebar from './components/HistorySidebar';
import { ExtractedInfo, ManualSearchInputs, SocialProfile, SearchHistoryItem } from './types';

export default function App() {
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    return localStorage.getItem('fiverr_gemini_api_key') || '';
  });
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => {
    return localStorage.getItem('fiverr_gemini_api_key') || '';
  });
  const [showApiSettings, setShowApiSettings] = useState<boolean>(!localStorage.getItem('fiverr_gemini_api_key'));

  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo>({
    username: '',
    country: '',
    niche: '',
    reviewText: '',
    imageDescription: '',
    hasExtracted: false
  });

  const [manualInputs, setManualInputs] = useState<ManualSearchInputs>({
    username: '',
    country: '',
    niche: '',
    reviewText: '',
  });

  const [results, setResults] = useState<SocialProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem('fiverr_search_history');
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory));
      } catch (e) {
        console.error('Error reading search history', e);
      }
    }
  }, []);

  const showNotification = (type: 'success' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('fiverr_gemini_api_key', apiKeyInput.trim());
    setCustomApiKey(apiKeyInput.trim());
    showNotification('success', 'Gemini API Key সফলভাবে ব্রাউজারে সেভ করা হয়েছে!');
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('fiverr_gemini_api_key');
    setCustomApiKey('');
    setApiKeyInput('');
    showNotification('info', 'Gemini API Key ব্রাউজার থেকে মুছে ফেলা হয়েছে।');
  };

  // Handle data extraction from Screenshot
  const handleExtract = (data: any) => {
    setExtractedInfo({
      username: data.username || '',
      country: data.country || '',
      niche: data.niche || '',
      reviewText: data.reviewText || '',
      imageDescription: data.imageDescription || '',
      freelancerName: data.freelancerName || '',
      hasExtracted: true
    });

    setManualInputs({
      username: data.username || '',
      country: data.country || '',
      niche: data.niche || '',
      reviewText: data.reviewText || '',
    });

    showNotification(
      'success',
      `স্ক্রিনশট স্ক্যান সফল! ইউজারনেম @${data.username} এবং অন্যান্য ক্লু পাওয়া গেছে। নিচে তথ্যগুলো পরীক্ষা করে সামাজিক প্রোফাইল খুঁজুন!`
    );
  };

  // Run deep social search using Gemini search grounding
  const handleSearch = async (inputs: ManualSearchInputs) => {
    setSearchLoading(true);
    setSearchError(null);
    setResults([]);
    setActiveHistoryId(null);

    try {
      const response = await fetch('/api/search-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': customApiKey,
        },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'সার্চ করতে সমস্যা হয়েছে।');
      }

      const data = await response.json();
      const foundResults: SocialProfile[] = (data.results || []).map((p: any, idx: number) => ({
        ...p,
        id: `${Date.now()}-${idx}`
      }));

      setResults(foundResults);

      // Save to history
      const newItem: SearchHistoryItem = {
        id: `hist-${Date.now()}`,
        timestamp: new Date().toISOString(),
        username: inputs.username,
        country: inputs.country,
        results: foundResults,
        inputs: inputs,
      };

      const updatedHistory = [newItem, ...history].slice(0, 50); // Keep up to 50 items
      setHistory(updatedHistory);
      localStorage.setItem('fiverr_search_history', JSON.stringify(updatedHistory));
      setActiveHistoryId(newItem.id);

      if (foundResults.length > 0) {
        showNotification('success', `সাফল্য! এআই সফলভাবে ${foundResults.length}টি সামাজিক প্রোফাইল লিংক খুঁজে পেয়েছে।`);
      } else {
        showNotification('info', `এআই কোনো নিশ্চিত সোশ্যাল প্রোফাইল লিংক খুঁজে পায়নি, তবে নিচে দেওয়া ম্যানুয়াল কাস্টম লিংকগুলো ব্যবহার করে ট্রাই করতে পারেন।`);
      }
    } catch (err: any) {
      console.error(err);
      setSearchError(err.message || 'সার্চ করার সময় কোনো ভুল হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectHistoryItem = (item: SearchHistoryItem) => {
    setManualInputs(item.inputs);
    setResults(item.results);
    setActiveHistoryId(item.id);
    setSearchError(null);
    showNotification('info', `@${item.username}-এর সংরক্ষিত সার্চ ফলাফল লোড করা হয়েছে।`);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updatedHistory = history.filter((item) => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('fiverr_search_history', JSON.stringify(updatedHistory));
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
      setResults([]);
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('আপনি কি সত্যিই সম্পূর্ণ সার্চ হিস্টোরি মুছতে চান?')) {
      setHistory([]);
      localStorage.removeItem('fiverr_search_history');
      setActiveHistoryId(null);
      setResults([]);
    }
  };

  return (
    <div id="app-container" className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* Background radial glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-10 right-1/4 w-[600px] h-[600px] bg-blue-950/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Header Container */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
                Fiverr Client Social Identifier
              </h1>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide">
                ফাইবার বায়ারদের সামাজিক প্রোফাইল অনুসন্ধানের ইন্টেলিজেন্ট এআই হাব
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Gemini Web Search Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Success/Notification Toast */}
        {notification && (
          <div 
            id="global-toast"
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl border shadow-2xl max-w-md animate-fade-in flex items-start gap-3 ${
              notification.type === 'success' 
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' 
                : 'bg-indigo-950/90 border-indigo-500/30 text-indigo-300'
            }`}
          >
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold leading-relaxed">
                {notification.message}
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Concept introduction banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 text-indigo-400">
              <Lightbulb className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">কীভাবে এটি কাজ করে? (Workflow Guide)</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-3xl">
                ১. ফাইবার অর্ডারের রিভিউ সেকশন বা বায়ারের নামের একটি ছোট স্ক্রিনশট নিন এবং ড্রপ বা পেস্ট করুন।<br />
                ২. এআই অটোমেটিক বায়ারের <strong>ইউজারনেম, দেশ ও কাজের নিশ</strong> বের করে নিচে ফর্মটিতে বসাবে।<br />
                ৩. "সোশ্যাল প্রোফাইল খুঁজুন" বাটনে ক্লিক করলে বায়ারের ইউজারনেম ও দেশ মিলিয়ে গুগল সার্চের মাধ্যমে তার আসল LinkedIn, Twitter, Facebook প্রোফাইল লিংকের একটি তালিকা পাওয়া যাবে।
              </p>
            </div>
          </div>
        </div>

        {/* API Key Configuration Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between cursor-pointer select-none" onClick={() => setShowApiSettings(!showApiSettings)}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-200">API Key কনফিগারেশন (Settings)</h3>
                <p className="text-[11px] text-slate-400">
                  {customApiKey ? '✅ আপনার কাস্টম API Key সক্রিয় আছে' : '⚠️ এআই সার্ভিস ব্যবহারের জন্য Gemini API Key দিন'}
                </p>
              </div>
            </div>
            <button className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              {showApiSettings ? 'আড়াল করুন (Hide)' : 'দেখুন (Configure)'}
            </button>
          </div>

          {showApiSettings && (
            <div className="mt-4 pt-4 border-t border-slate-800/60 flex flex-col gap-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                এই অ্যাপটি গুগলের এআই মডেল ব্যবহার করে। অ্যাপটি চালাতে একটি <strong>Gemini API Key</strong> প্রয়োজন। আপনি ২ উপায়ে এটি সেট করতে পারেন:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850">
                  <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-1.5 text-blue-400">
                    <span>১. AI Studio Secrets (সেরা পদ্ধতি)</span>
                  </h4>
                  <p className="text-slate-400 leading-normal">
                    ডানদিকের প্যানেলে অথবা Settings &gt; Secrets এ যান। <strong>GEMINI_API_KEY</strong> নামে একটি সিক্রেট তৈরি করে আপনার API Key-টি পেস্ট করুন। এটি আজীবনের জন্য সুরক্ষিত থাকবে।
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-850">
                  <h4 className="font-bold text-slate-200 mb-1 flex items-center gap-1.5 text-indigo-400">
                    <span>২. সরাসরি নিচে পেস্ট করুন (তাৎক্ষণিক পদ্ধতি)</span>
                  </h4>
                  <p className="text-slate-400 leading-normal">
                    আপনার যদি সিক্রেট সেট করতে অসুবিধা হয়, তবে নিচে সরাসরি কী-টি পেস্ট করে সেভ করে রাখুন। এটি আপনার ব্রাউজারের লোকাল স্টোরেজে সুরক্ষিত থাকবে।
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveApiKey} className="flex flex-col sm:flex-row gap-3 mt-1">
                <div className="flex-1 relative">
                  <input
                    type="password"
                    placeholder="আপনার Gemini API Key এখানে দিন (যেমন: AIzaSy...)"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-slate-100 placeholder:text-slate-600 outline-none"
                  />
                  {apiKeyInput && (
                    <span className="absolute right-3 top-2.5 text-[10px] text-slate-500 font-mono">
                      {apiKeyInput.substring(0, 6)}...
                    </span>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="submit"
                    disabled={!apiKeyInput.trim()}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-xs font-bold text-white transition cursor-pointer"
                  >
                    সেভ করুন (Save)
                  </button>
                  {customApiKey && (
                    <button
                      type="button"
                      onClick={handleClearApiKey}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition"
                    >
                      মুছুন (Clear)
                    </button>
                  )}
                </div>
              </form>
              <div className="text-[10px] text-slate-500 flex items-center justify-between">
                <span>API Key না থাকলে <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5">এখান থেকে ফ্রি কি নিন <ExternalLink className="w-2.5 h-2.5" /></a></span>
                <span>🔒 ডাটা শুধুমাত্র আপনার ব্রাউজারে সংরক্ষিত থাকে</span>
              </div>
            </div>
          )}
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Input & Scan Control panels - spans 5 cols) */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            <ScreenshotUploader customApiKey={customApiKey} onExtract={handleExtract} />
            
            <ManualSearchForm 
              initialValues={manualInputs} 
              onSearch={handleSearch} 
              isLoading={searchLoading} 
            />
          </section>

          {/* Right Column (Results and Search History panels - spans 7 cols) */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            {searchError && (
              <div id="search-error-box" className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold">সার্চ ত্রুটি (Search Error)</h4>
                  <p className="mt-0.5 leading-relaxed">{searchError}</p>
                </div>
              </div>
            )}

            <ResultCard 
              results={results} 
              inputs={manualInputs} 
              isLoading={searchLoading} 
            />

            <HistorySidebar 
              history={history}
              onSelectItem={handleSelectHistoryItem}
              onDeleteItem={handleDeleteHistoryItem}
              onClearAll={handleClearAllHistory}
              activeId={activeHistoryId}
            />
          </section>

        </div>
      </main>

      {/* Humble Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950 py-8 text-center mt-12">
        <div className="max-w-7xl mx-auto px-4 text-slate-500 text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Fiverr Client Social Identifier. Crafted for freelancers to discover real professional networks.</p>
          <p className="flex items-center gap-1.5 font-medium text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            100% Secure & Compliant with Public OSINT queries
          </p>
        </div>
      </footer>
    </div>
  );
}
