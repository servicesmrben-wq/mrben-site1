"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Link } from "@/navigation"; 
import { Upload, Loader2, Calculator, AlertTriangle, CheckCircle2, X, ArrowRight, Info } from "lucide-react";
import { PRICING_DATA, PricingKey, RATE_PER_MINUTE, MARKUP_MULTIPLIER, VIBE_MULTIPLIERS, VibeKey } from "@/app/lib/pricing";
import { useTranslations } from "next-intl";
import { packData } from "@/app/lib/url-packer";

// Managed file interface for background processing
interface ManagedFile {
  id: string;
  file: File;
  preview: string;
  status: "compressing" | "ready";
}

export default function EstimatorPage() {
  const t = useTranslations("estimator");
  
  // Dynamically import image-compression only on the client
  const [imageCompression, setImageCompression] = useState<any>(null);
  useEffect(() => {
    import("browser-image-compression").then(mod => {
      setImageCompression(() => mod.default);
    });
  }, []);

  const markupPercent = Math.round((MARKUP_MULTIPLIER - 1) * 100 * 10) / 10;
  const [managedFiles, setManagedFiles] = useState<ManagedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mode, setMode] = useState<"ext" | "in_out">("in_out");
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Instructions Modal State
  const [showInstructions, setShowInstructions] = useState(false);
  const [hasSeenInstructions, setHasSeenInstructions] = useState(false);
  
  // Refs
  const resultsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [referenceId, setReferenceId] = useState("");

  // Clean up object URLs
  useEffect(() => {
    return () => {
      managedFiles.forEach(f => URL.revokeObjectURL(f.preview));
    };
  }, [managedFiles]);

  // Warm up
  useEffect(() => {
    fetch("/api/estimate", { method: "GET" }).catch(() => {});
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const MAX_FILES = 10;
      const currentCount = managedFiles.length;
      
      if (currentCount >= MAX_FILES) {
        alert(t("errorMaxImages"));
        e.target.value = "";
        return;
      }

      const incomingFiles = Array.from(e.target.files);
      const availableSlots = MAX_FILES - currentCount;
      
      const validFiles = incomingFiles
        .filter(f => f.type.startsWith("image/"))
        .slice(0, availableSlots);
      
      if (validFiles.length < incomingFiles.length) {
        if (incomingFiles.some(f => !f.type.startsWith("image/"))) {
          alert(t("errorImageOnly"));
        } else if (incomingFiles.length > availableSlots) {
          alert(t("errorMaxImages"));
        }
      }

      if (validFiles.length === 0) {
        e.target.value = "";
        return;
      }

      // 1. Assign unique IDs and create previews for incoming files
      const newEntries: ManagedFile[] = validFiles.map(f => ({
        id: Math.random().toString(36).substring(7),
        file: f,
        preview: URL.createObjectURL(f),
        status: "compressing"
      }));

      // 2. Add to state IMMEDIATELY
      setManagedFiles(prev => [...prev, ...newEntries]);
      setResult(null);
      setError(null);
      e.target.value = "";

      // 3. Trigger compression in the background for each file
      newEntries.forEach(async (entry) => {
        try {
          if (!imageCompression) {
             // If library not loaded yet, wait slightly or skip
             setManagedFiles(prev => prev.map(f => 
               f.id === entry.id ? { ...f, status: "ready" } : f
             ));
             return;
          }

          const compressionOptions = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
            fileType: 'image/webp' as any,
          };
          
          const compressed = await imageCompression(entry.file, compressionOptions);
          
          // Generate new filename with .webp extension
          const newName = entry.file.name.substring(0, entry.file.name.lastIndexOf('.')) + '.webp';
          const compressedFile = new File([compressed], newName, { type: compressed.type });
          
          setManagedFiles(prev => prev.map(f => 
            f.id === entry.id ? { ...f, file: compressedFile, status: "ready" } : f
          ));
        } catch (err) {
          console.error("Compression failed for:", entry.file.name, err);
          // Fallback to original file on failure
          setManagedFiles(prev => prev.map(f => 
            f.id === entry.id ? { ...f, status: "ready" } : f
          ));
        }
      });
    }
  };

  const removeFile = (id: string) => {
    setManagedFiles(prev => {
      const target = prev.find(f => f.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter(f => f.id !== id);
    });
  };

  const BASE_FEE = 60.00;

  const handleCalculate = async () => {
    if (managedFiles.length === 0) return;

    // 1. Validation: Max 10 Images
    if (managedFiles.length > 10) {
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
    const seconds = managedFiles.length * 10 + 5;
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
      const filesToSend = managedFiles.map(f => f.file);
      const formData = new FormData();
      filesToSend.forEach((file) => {
        formData.append("files", file);
      });

      let res;
      let attempts = 0;
      const maxRetries = 1;
      
      // Using the direct Cloud Run URL to bypass Vercel's 4.5MB limit
      const CLOUD_RUN_URL = "https://mrben-estimator-api-529910920022.us-east1.run.app/estimate";

      while (attempts <= maxRetries) {
        try {
          res = await fetch(CLOUD_RUN_URL, {
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

      const totalPanes = (data.window_counts?.pane_1st_base || 0) + 
                        (data.window_counts?.pane_2nd_story || 0) + 
                        (data.window_counts?.pane_3rd_story || 0) + 
                        (data.window_counts?.patio_door_pane || 0) + 
                        (data.window_counts?.entry_door_pane || 0);
      
      const vibe = (data.window_counts?.pane_vibe || "normal") as VibeKey;
      const difficultyMultiplier = VIBE_MULTIPLIERS[vibe] || 1.0;
      
      // Helper to calculate values for the JSON backup
      const getModeData = (m: "ext" | "in_out") => {
        let baseMinutes = 0;
        Object.entries(data.window_counts || {}).forEach(([key, count]) => {
          const k = key as PricingKey;
          const item = PRICING_DATA[k];
          if (item && typeof count === "number") {
            const unitMinutes = m === "ext" ? item.minutes_ext : (item.minutes_ext + item.minutes_int);
            baseMinutes += unitMinutes * count;
          }
        });
        
        const adjustedMinutes = baseMinutes * difficultyMultiplier;
        const windowCost = adjustedMinutes * RATE_PER_MINUTE;
        let total = (windowCost * MARKUP_MULTIPLIER) + BASE_FEE;
        total = Math.round(total / 5) * 5;
        
        return {
          price: `$${total.toFixed(2)}`,
          time: `${(adjustedMinutes / 60).toFixed(1)}h`
        };
      };

      const inOutData = getModeData("in_out");
      const extData = getModeData("ext");

      const mergedResult = {
        analysis_panes: data.analysis_g3 || "",
        analysis_vibe: data.analysis_g25 || "",
        referenceId: newRefId,
        user_selection: mode === "ext" ? "Extérieur Seulement" : "Intérieur et Extérieur",
        total_panes: totalPanes,
        pricing_metrics: `${RATE_PER_MINUTE * 60}$/heure | Marge : +${markupPercent}% | Frais de service et déplacement : ${BASE_FEE}$`,
        estimates: {
          inside_and_out: {
            label: "Intérieur et Extérieur",
            price: inOutData.price,
            time: inOutData.time
          },
          exterior_only: {
            label: "Extérieur Seulement",
            price: extData.price,
            time: extData.time
          }
        },
        pane_details_formatted: `Rez-de-chaussée et sous-sol : ${data.window_counts?.pane_1st_base || 0}, Deuxième étage : ${data.window_counts?.pane_2nd_story || 0}, Troisième étage : ${data.window_counts?.pane_3rd_story || 0}, Portes patio (panneaux) : ${data.window_counts?.patio_door_pane || 0}, Portes d'entrée : ${data.window_counts?.entry_door_pane || 0}, Type de vitrage (Vibe) : ${vibe}`,
        pane_vibe: vibe,
        window_counts: {
          pane_3rd_story: data.window_counts?.pane_3rd_story || 0,
          pane_2nd_story: data.window_counts?.pane_2nd_story || 0,
          pane_1st_base: data.window_counts?.pane_1st_base || 0,
          patio_door_pane: data.window_counts?.patio_door_pane || 0,
          entry_door_pane: data.window_counts?.entry_door_pane || 0,
          pane_vibe: vibe,
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
      for (let i = 0; i < filesToSend.length; i += DRIVE_CHUNK_SIZE) {
        driveChunks.push(filesToSend.slice(i, i + DRIVE_CHUNK_SIZE));
      }

      (async () => {
        let activeFolderId = "";
        try {
          const metaData = new FormData();
          metaData.append("metadata", JSON.stringify(mergedResult, null, 2));
          metaData.append("referenceId", newRefId);
          
          const metaRes = await fetch("/api/save-to-drive", { method: "POST", body: metaData });
          const metaResult = await metaRes.json();
          if (metaResult.success && metaResult.folderId) {
            activeFolderId = metaResult.folderId;
          }
        } catch (e) {
          console.warn("Metadata backup failed:", e);
        }

        for (let i = 0; i < driveChunks.length; i++) {
          try {
            const chunk = driveChunks[i];
            const driveData = new FormData();
            driveData.append("referenceId", newRefId);
            if (activeFolderId) {
              driveData.append("subfolderId", activeFolderId);
            }
            chunk.forEach((file) => {
              driveData.append("files", file);
            });
            await fetch("/api/save-to-drive", { method: "POST", body: driveData });
          } catch (e) {
            console.warn(`Image batch ${i} backup failed:`, e);
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

  useEffect(() => {
    if (result) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [result]);

  const calculateMinutesForMode = (m: "ext" | "in_out") => {
    if (!result || !result.window_counts) return 0;
    
    let baseMinutes = 0;
    Object.entries(result.window_counts).forEach(([key, count]) => {
      const k = key as PricingKey;
      const item = PRICING_DATA[k];
      if (item && typeof count === "number") {
        const unitMinutes = m === "ext" ? item.minutes_ext : (item.minutes_ext + item.minutes_int);
        baseMinutes += unitMinutes * count;
      }
    });

    // Apply the Vibe Engine Math
    const vibe = (result.window_counts.pane_vibe || "normal") as VibeKey;
    const difficultyMultiplier = VIBE_MULTIPLIERS[vibe] || 1.0;
    
    return baseMinutes * difficultyMultiplier;
  };

  const calculateTotalForMode = (m: "ext" | "in_out") => {
    const adjustedMinutes = calculateMinutesForMode(m);
    const windowCost = adjustedMinutes * RATE_PER_MINUTE;
    
    // Apply dynamic 15% Markup using MARKUP_MULTIPLIER
    let total = (windowCost * MARKUP_MULTIPLIER) + BASE_FEE;
    
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
    return Object.entries(result.window_counts).reduce((sum: number, [key, count]) => {
      return sum + (PRICING_DATA.hasOwnProperty(key) ? Number(count) : 0);
    }, 0);
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    if (!hasSeenInstructions) {
      e.preventDefault();
      setShowInstructions(true);
    }
  };

  const closeModal = () => {
    setShowInstructions(false);
    setHasSeenInstructions(true);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
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
          
          {/* Logo in top right */}
          <div className="absolute right-6 top-6 hidden sm:block">
            <Image 
              src="/brand/mrben-logo-transparent.png" 
              alt="MrBen Logo" 
              width={100} 
              height={50} 
              className="opacity-80"
              priority
            />
          </div>
          
          {/* File Upload */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold text-zinc-900">
              {t("step1Title")}
            </label>
            <div 
              onClick={handleUploadClick}
              className="relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50/50 transition duration-300 ease-in-out hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-lg"
            >
              <input 
                ref={fileInputRef}
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
            {managedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {managedFiles.map((f, i) => (
                  <div key={f.id} className="relative aspect-square overflow-hidden rounded-lg border border-zinc-200">
                    <Image 
                      src={f.preview} 
                      alt="preview" 
                      fill 
                      className="object-cover" 
                      unoptimized 
                    />
                    {f.status === "compressing" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                    <button 
                      onClick={() => removeFile(f.id)}
                      className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 z-10"
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
            disabled={managedFiles.length === 0 || isProcessing || managedFiles.some(f => f.status === "compressing")}
            className="group flex w-full transform items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-4 text-sm font-bold text-white shadow-lg transition duration-300 hover:scale-105 hover:shadow-xl hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isProcessing ? (
              <div className="flex flex-col items-center w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>{t("processing", { count: managedFiles.length, time: timeLeft })}</span>
                </div>
                {/* Progress Bar */}
                <div className="h-1.5 w-full max-w-[200px] bg-zinc-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-300 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            ) : managedFiles.some(f => f.status === "compressing") ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Compressing images...</span>
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
                
                <div className="space-y-3">                  
                  <div className="text-sm font-semibold text-zinc-900">{t("breakdown")}</div>
                  
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
                    
                    if (!item) return null;

                    return (
                      <div key={key} className="flex items-center justify-between border-b border-zinc-100 pb-2 last:border-0">
                        <div>
                          <div className="text-sm font-medium text-zinc-900">{t(item.label)}</div>
                          <div className="text-xs text-zinc-500">{t(item.desc)}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-semibold text-zinc-900 min-w-[60px] text-right">
                            {c}x
                          </div>
                        </div>                      
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Book Button */}
              <div className="mt-8 border-t border-zinc-100 pt-6">
                <Link
                  href={{
                    pathname: "/",
                    query: {
                      data: packData({
                        ref: referenceId,
                        quote: calculateTotalForMode(mode),
                        panes: getTotalPanes(),
                        time: formatHours(calculateMinutesForMode(mode)),
                        q_ext: calculateTotalForMode("ext"),
                        t_ext: formatHours(calculateMinutesForMode("ext")),
                        q_inout: calculateTotalForMode("in_out"),
                        t_inout: formatHours(calculateMinutesForMode("in_out")),
                        hr: RATE_PER_MINUTE * 60,
                        markup: `${markupPercent}%`,
                        fee: BASE_FEE,
                        s3: result.window_counts.pane_3rd_story,
                        s2: result.window_counts.pane_2nd_story,
                        s1: result.window_counts.pane_1st_base,
                        patio: result.window_counts.patio_door_pane,
                        entry: result.window_counts.entry_door_pane,
                        vibe: result.pane_vibe,
                        service: mode === "ext" ? "Exterior Only" : "Inside & Out",
                      })
                    },
                    hash: "contact"
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

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div 
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeModal}
          />
          
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
            <div className="relative p-6 sm:p-8">
              <button 
                onClick={closeModal}
                className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <Info className="h-8 w-8" />
                </div>
                
                <h3 className="mb-2 text-xl font-bold text-zinc-900">
                  {t("step1Title")}
                </h3>
                
                <div className="mb-8 whitespace-pre-wrap text-left text-sm leading-relaxed text-zinc-600 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  {t("step1Instructions")}
                </div>

                <button
                  onClick={closeModal}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-zinc-800 active:scale-[0.98]"
                >
                  {t("gotIt")}
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
