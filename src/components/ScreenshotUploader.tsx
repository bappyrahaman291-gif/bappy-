import React, { useState, useRef, useEffect } from 'react';
import { Upload, Clipboard, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface ScreenshotUploaderProps {
  customApiKey: string;
  onExtract: (extractedData: {
    username: string;
    country: string;
    niche: string;
    reviewText: string;
    imageDescription: string;
    freelancerName?: string;
  }) => void;
}

export default function ScreenshotUploader({ customApiKey, onExtract }: ScreenshotUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle pasting image from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          if (items[i].type.indexOf('image') !== -1) {
            const blob = items[i].getAsFile();
            if (blob) {
              processFile(blob);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('দয়া করে একটি সঠিক ছবি (PNG, JPG) আপলোড করুন।');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      setPreview(base64data);
      uploadAndExtract(base64data);
    };
  };

  const uploadAndExtract = async (base64Image: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/identify-screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': customApiKey,
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'স্ক্রিনশট বিশ্লেষণ করতে ব্যর্থ হয়েছে।');
      }

      const data = await response.json();
      if (!data.username) {
        throw new Error('ছবি থেকে কোনো Fiverr ইউজারনেম খুঁজে পাওয়া যায়নি। দয়া করে সঠিক স্ক্রিনশট দিন বা নিজে টাইপ করুন।');
      }

      onExtract(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'সার্ভার সংযোগে সমস্যা হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const clearUpload = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div id="screenshot-uploader-root" className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            সহজ উপায়ে স্ক্যান করুন (Automatic Scan)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            ফাইবারের রিভিউর স্ক্রিনশট বা বায়ারের ছবি আপলোড করুন, অথবা সরাসরি <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">Ctrl + V</kbd> চেপে পেস্ট করুন
          </p>
        </div>
      </div>

      <div
        id="drag-drop-area"
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300 min-h-[220px] cursor-pointer group ${
          dragActive 
            ? 'border-blue-500 bg-blue-500/5' 
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60'
        }`}
        onClick={preview ? undefined : onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileInputChange}
          id="screenshot-file-input"
        />

        {preview ? (
          <div className="w-full flex flex-col items-center gap-4 relative">
            <div className="relative max-h-[180px] rounded-lg overflow-hidden border border-slate-800 group">
              <img 
                src={preview} 
                alt="Uploaded Fiverr review" 
                className="max-h-[180px] w-auto object-contain transition-transform duration-500" 
              />
              
              {/* Scanning effect */}
              {loading && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent top-0 animate-[bounce_2s_infinite] shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex items-center gap-2 text-blue-400 font-medium text-sm animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  গুগল এআই বায়ারের তথ্য খুঁজছে...
                </div>
                <p className="text-xs text-slate-400 max-w-sm">
                  স্ক্রিনশট থেকে Fiverr ইউজারনেম, বায়ারের দেশ এবং রিভিউর টেক্সট স্বয়ংক্রিয়ভাবে বের করা হচ্ছে
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full justify-center">
                <button
                  id="re-scan-btn"
                  onClick={clearUpload}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                >
                  নতুন ছবি দিন (Change Image)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition duration-300">
              <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200">
                ফাইল ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা <span className="text-blue-400 font-semibold underline decoration-dashed underline-offset-4">ব্রাউজ করুন</span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PNG, JPG, JPEG (কম্পিউটার স্ক্রিনশট কপি করে সরাসরি পেস্ট করতে পারেন)
              </p>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-full mt-2">
              <Clipboard className="w-3.5 h-3.5 text-blue-400" />
              <span>ক্লিপবোর্ড থেকে কপি করা ইমেজ পেস্ট করতে <kbd className="font-sans font-bold">Ctrl + V</kbd> চাপুন</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div id="uploader-error-box" className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">ত্রুটি (Error)</p>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
