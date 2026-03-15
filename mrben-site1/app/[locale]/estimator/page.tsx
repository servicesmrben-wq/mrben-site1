"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link"; // Ensure Link is imported
import { Upload, Loader2, Calculator, AlertTriangle, CheckCircle2, X, ArrowRight } from "lucide-react";
import { PRICING_DATA, PricingKey, RATE_PER_MINUTE } from "@/app/lib/pricing";
import imageCompression from "browser-image-compression";
import { useTranslations } from "next-intl";

export default function EstimatorPage() {
  const t = useTranslations("estimator");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mode, setMode] = useState<"ext" | "in_out">("in_out");
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const resultsRef = useRef<HTMLDivElement>(null);
  const [referenceId, setReferenceId] = useState("");

  // Clean up object URLs
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // Warm up
  useEffect(() => {
    fetch("/api/estimate", { method: "GET" }).catch(() => {});
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(f => f.type.startsWith("image/"));
      
      if (validFiles.length !== newFiles.length) {
        alert(t("errorImageOnly"));
      }

      // Generate stable URLs for new files
      const newPreviews = validFiles.map(f => URL.createObjectURL(f));

      setFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      setResult(null);
      setError(null);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const urlToRemove = prev[index];
      URL.revokeObjectURL(urlToRemove);
      return prev.filter((_, i) => i !== index);
    });
  };

  const BASE_FEE = 60.00;

  const handleCalculate = async () => {
    if (files.length === 0) return;

    // 1. Validation: Max 5 Images
    if (files.length > 5) {
      alert(t("errorMaxImages"));
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    // Generate unique reference ID
    const newRefId = 'EST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setReferenceId(newRefId);

    // Smart Progress Logic
    // Single API call with all images — estimate ~10s per image
    const seconds = files.length * 10 + 5;
    const estimatedWaitTimeMs = seconds * 1000; 
    setTimeLeft(seconds);
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min((elapsed / estimatedWaitTimeMs) * 100, 95); 
      setProgress(calculatedProgress);
    }, 200);

    const countdownInterval = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0));
    }, 1000);

    try {
      // Compress images to avoid payload limits
      const compressionOptions = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 768,
        useWebWorker: true,
      };

      const compressedFilesList = await Promise.all(
        files.map(async (file) => {
          try {
            const compressedFile = await imageCompression(file, compressionOptions);
            return new File([compressedFile], file.name, { type: compressedFile.type });
          } catch (error) {
            console.error("Compression failed:", file.name, error);
            return file;
          }
        })
      );

      // SINGLE API CALL — all images sent together for unified analysis
      const formData = new FormData();
      compressedFilesList.forEach((file) => {
        formData.append("files", file);
      });

      let res;
      let attempts = 0;
      const maxRetries = 1;

      while (attempts <= maxRetries) {
        try {
          res = await fetch("/api/estimate", {
            method: "POST",
            body: formData,
          });

          if (res.ok) break;

          if (attempts < maxRetries && res.status >= 500) {
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 1500));
            continue;
          }

          break;
        } catch (error) {
          if (attempts < maxRetries) {
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 1500));
          } else {
            throw error;
          }
        }
      }

      if (!res) throw new Error(t("errorNetwork"));

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON API Response:", text);
        throw new Error(t("errorServer"));
      }

      if (!res.ok) {
        throw new Error(data.error || t("errorGeneral"));
      }

      const mergedResult = {
        analysis: data.analysis || "",
        window_counts: {
          pane_3rd_story: data.window_counts?.pane_3rd_story || 0,
          pane_2nd_story: data.window_counts?.pane_2nd_story || 0,
          pane_1st_base: data.window_counts?.pane_1st_base || 0,
          patio_door_panel: data.window_counts?.patio_door_panel || 0,
        },
        stories: data.stories || 1,
        mode: mode,
        serviceType: mode === "ext" ? "Exterior Only" : "Inside & Out"
      };

      setResult(mergedResult);
      setProgress(100); 

      // --- BACKGROUND BACKUP TO GOOGLE DRIVE ---
      const DRIVE_CHUNK_SIZE = 2;
      const driveChunks: File[][] = [];
      for (let i = 0; i < compressedFilesList.length; i += DRIVE_CHUNK_SIZE) {
        driveChunks.push(compressedFilesList.slice(i, i + DRIVE_CHUNK_SIZE));
      }

      (async () => {
        for (let i = 0; i < driveChunks.length; i++) {
          try {
            const chunk = driveChunks[i];
            const driveData = new FormData();

            if (i === 0) {
              driveData.append("metadata", JSON.stringify(mergedResult, null, 2));
              driveData.append("referenceId", newRefId);
            }

            chunk.forEach((file) => {
              driveData.append("files", file);
            });
            
            driveData.append("referenceId", newRefId);

            await fetch("/api/save-to-drive", { method: "POST", body: driveData });
          } catch (e) {
            console.warn("Background backup failed:", e);
          }
        }
      })();
      // -----------------------------------------

    } catch (err: any) {
      console.error(err);
      setError(err.message || t("errorGeneral"));
      setProgress(0);
    } finally {
      clearInterval(progressInterval);
      clearInterval(countdownInterval);
      setIsProcessing(false);
    }
  };

  // Scroll into view when result is ready
  useEffect(() => {
    if (result) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [result]);

  const calculateMinutesForMode = (m: "ext" | "in_out") => {
    if (!result || !result.window_counts) return 0;
    
    let totalMinutes = 0;
    Object.entries(result.window_counts).forEach(([key, count]) => {
      const k = key as PricingKey;
      const item = PRICING_DATA[k];
      if (item && typeof count === "number") {
        const unitMinutes = m === "ext" ? item.minutes : item.minutes * 2;
        totalMinutes += unitMinutes * count;
      }
    });
    return totalMinutes;
  };

  const calculateTotalForMode = (m: "ext" | "in_out") => {
    const totalMinutes = calculateMinutesForMode(m);
    const windowCost = totalMinutes * RATE_PER_MINUTE;
    const SAFETY_BUFFER = 1.075; // 7.5% Markup
    let total = (windowCost * SAFETY_BUFFER) + BASE_FEE;
    
    // Round to nearest $5
    total = Math.round(total / 5) * 5;

    return total.toFixed(2);
  };

  const formatHours = (mins: number) => {
    const h = mins / 60;
    return h.toFixed(1) + "h";
  };

  const getTotalPanes = () => {
    if (!result || !result.window_counts) return 0;
    return Object.values(result.window_counts).reduce((sum: number, count: any) => sum + Number(count), 0);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-slate-50 to-emerald-50/30 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            {t("badge")}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-lg text-zinc-600">
            {t("subtitle")}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/60 bg-white/80 p-6 shadow-2xl backdrop-blur-sm md:p-8 ring-1 ring-zinc-900/5">
          
          {/* File Upload */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold text-zinc-900">
              {t("step1")}
            </label>
            <div className="relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 transition duration-300 ease-in-out hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-lg">
              <input 
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <Upload className="h-8 w-8" />
                <span className="text-sm font-medium">{t("clickToSelect")}</span>
                <span className="text-xs text-zinc-400">{t("fileTypes")}</span>
              </div>
            </div>

            {/* Gallery Preview */}
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {files.map((f, i) => (
                  <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200">
                    <Image 
                      src={previews[i]} 
                      alt="preview" 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                    <button 
                      onClick={() => removeFile(i)}
                      className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing Toggle */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold text-zinc-900">
              {t("step2")}
            </label>
            <div className="flex rounded-xl bg-zinc-100 p-1">
              <button
                onClick={() => setMode("in_out")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === "in_out"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {t("insideOut")}
              </button>
              <button
                onClick={() => setMode("ext")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === "ext"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {t("exteriorOnly")}
              </button>
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={files.length === 0 || isProcessing}
            className="group flex w-full transform items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("processing", { count: files.length, time: timeLeft })}</span>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 w-full max-w-[200px] bg-zinc-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            ) : (
              <>
                <Calculator className="h-5 w-5" />
                {t("calculate")}
              </>
            )}
          </button>

          {/* Powered by Gemini Badge */}
          <div className="flex items-center justify-center gap-1.5 mt-4 pb-2">
            <span className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">{t("poweredBy")}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" fill="url(#gemini-gradient)"/>
              <defs>
                <linearGradient id="gemini-gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4285F4"/>
                  <stop offset="50%" stopColor="#9B72CB"/>
                  <stop offset="100%" stopColor="#D96570"/>
                </linearGradient>
              </defs>
            </svg>
            <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-800">
              Gemini 3
            </span>
          </div>

          {error && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-600">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Results Section */}
          {result && (
            <div ref={resultsRef} className="mt-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="mb-6 rounded-2xl bg-emerald-50 p-6 text-center border border-emerald-100">
                
                <div className="text-sm font-medium text-emerald-800 uppercase tracking-wide">{t("estimatedTotal")}</div>
                <div className="mt-1 text-4xl font-bold text-emerald-900">
                  ${calculateTotalForMode(mode)}
                </div>
                
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" />
                    {t("totalPanes", { count: getTotalPanes() })}
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-emerald-700">
                  {t("ref")} <span className="font-mono font-bold">{referenceId}</span> • {t("disclaimer")}
                </div>
              </div>

              <div className="mt-8 border-t border-zinc-100 pt-6">
                
                              <div className="space-y-3">                  <div className="text-sm font-semibold text-zinc-900">{t("breakdown")}</div>
                  
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <div>
                      <div className="text-sm font-medium text-zinc-900">{t("serviceFee")}</div>
                      <div className="text-xs text-zinc-500">{t("standardFee")}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-semibold text-zinc-900 min-w-[60px] text-right">
                        ${BASE_FEE.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {Object.entries(result.window_counts).map(([key, count]) => {
                    const c = count as number;
                    if (c === 0) return null;
                    const k = key as PricingKey;
                    const item = PRICING_DATA[k];
                    
                    return (
                      <div key={key} className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0">
                        <div>
                          <div className="text-sm font-medium text-zinc-900">{item.label}</div>
                          <div className="text-xs text-zinc-500">{item.desc}</div>
                        </div>
                                              <div className="flex items-center gap-4">
                                                <div className="text-sm font-semibold text-zinc-900 min-w-[60px] text-right">
                                                  {c}x
                                                </div>
                                              </div>                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Book Button */}
              <div className="mt-8 border-t border-zinc-100 pt-6">
                <Link
                  href={{
                    pathname: "/", // Link to home page
                    query: {
                      ref: referenceId,
                      quote: calculateTotalForMode(mode),
                      panes: getTotalPanes(),
                      time: formatHours(calculateMinutesForMode(mode)),
                      // Include both for the email/tag
                      q_ext: calculateTotalForMode("ext"),
                      t_ext: formatHours(calculateMinutesForMode("ext")),
                      q_inout: calculateTotalForMode("in_out"),
                      t_inout: formatHours(calculateMinutesForMode("in_out")),
                      
                      s3: result.window_counts.pane_3rd_story,
                      s2: result.window_counts.pane_2nd_story,
                      s1: result.window_counts.pane_1st_base,
                      doors: result.window_counts.patio_door_panel,
                      service: mode === "ext" ? "Exterior Only" : "Inside & Out",
                    },
                    hash: "contact" // Scroll to #contact
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 hover:shadow-emerald-300"
                >
                  {t("bookEstimate")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-center text-xs text-zinc-500">
                  {t("sendsDirectly")}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
