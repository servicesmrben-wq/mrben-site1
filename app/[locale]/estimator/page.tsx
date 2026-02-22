"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // Ensure Link is imported
import { Upload, Loader2, Calculator, AlertTriangle, CheckCircle2, X, ArrowRight } from "lucide-react";
import { PRICING_DATA, PricingKey, RATE_PER_MINUTE } from "@/app/lib/pricing";

// Client-side compression utility
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1024;
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" });
              resolve(newFile);
            } else {
              reject(new Error("Canvas compression failed"));
            }
          },
          "image/jpeg",
          0.7
        );
      };
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function EstimatorPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [compressedFiles, setCompressedFiles] = useState<File[]>([]); // Store ready-to-upload files
  const [previews, setPreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<"ext" | "in_out">("in_out");
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Tracking
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
        alert("Only image files (JPG, PNG) are supported right now.");
      }

      // Generate stable URLs for new files
      const newPreviews = validFiles.map(f => URL.createObjectURL(f));

      setFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      setResult(null);
      setError(null);
      e.target.value = "";

      // Background Compression
      validFiles.forEach(async (file) => {
        try {
          const compressed = await compressImage(file);
          setCompressedFiles(prev => [...prev, compressed]);
        } catch {
          setCompressedFiles(prev => [...prev, file]); // Fallback
        }
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setCompressedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      const urlToRemove = prev[index];
      URL.revokeObjectURL(urlToRemove);
      return prev.filter((_, i) => i !== index);
    });
  };

  const BASE_FEE = 60.00;

  const handleCalculate = async () => {
    if (files.length === 0) return;

    // 1. Validation: Max 8 Images
    if (files.length > 8) {
      alert("Maximum 8 images allowed per request. Please remove some images.");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    // Generate unique reference ID
    const newRefId = 'EST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    setReferenceId(newRefId);

    // Smart Progress Logic
    // Parallel batches of 4 mean 8 images take the same time as 4.
    // 10s per image in the largest batch.
    const effectiveCount = Math.min(files.length, 4);
    const estimatedWaitTimeMs = effectiveCount * 10000 + 2000; 
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min((elapsed / estimatedWaitTimeMs) * 100, 95); 
      setProgress(calculatedProgress);
    }, 200);

    try {
      const CHUNK_SIZE = 4;
      const chunks: File[][] = [];
      for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        chunks.push(files.slice(i, i + CHUNK_SIZE));
      }

      const results = [];

      // SEQUENTIAL PROCESSING
      for (const chunk of chunks) {
        const formData = new FormData();
        chunk.forEach((file) => {
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

        if (!res) throw new Error("Network request failed");

        let data;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          data = await res.json();
        } else {
          const text = await res.text();
          console.error("Non-JSON API Response:", text);
          throw new Error("Server error: The analysis timed out or failed.");
        }

        if (!res.ok) {
          throw new Error(data.error || "Estimation failed");
        }
        
        results.push(data);
      }

      const mergedResult = {
        analysis: "",
        window_counts: {
          pane_3rd_story: 0,
          pane_2nd_story: 0,
          pane_1st_base: 0,
          patio_door_panel: 0
        },
        stories: 1,
        mode: mode,
        serviceType: mode === "ext" ? "Exterior Only" : "Inside & Out"
      };

      results.forEach((res, i) => {
        mergedResult.analysis += `Batch ${i + 1}: ` + (res.analysis || "") + "\n";
        
        Object.keys(mergedResult.window_counts).forEach((key) => {
          const k = key as keyof typeof mergedResult.window_counts;
          mergedResult.window_counts[k] += (res.window_counts[k] || 0);
        });
      });

      setResult(mergedResult);
      setProgress(100); 

      // --- BACKGROUND BACKUP TO GOOGLE DRIVE ---
      const DRIVE_CHUNK_SIZE = 2;
      const driveChunks: File[][] = [];
      for (let i = 0; i < files.length; i += DRIVE_CHUNK_SIZE) {
        driveChunks.push(files.slice(i, i + DRIVE_CHUNK_SIZE));
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

            // Use pre-compressed files here too
            const chunkStartIndex = files.indexOf(chunk[0]);
            const finalChunk = chunk.map((file, idx) => compressedFiles[chunkStartIndex + idx] || file);

            finalChunk.forEach((file) => {
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
      setError(err.message || "An error occurred. Please try fewer images.");
      setProgress(0);
    } finally {
      clearInterval(progressInterval);
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!result || !result.window_counts) return "0.00";
    
    let totalMinutes = 0;
    Object.entries(result.window_counts).forEach(([key, count]) => {
      const k = key as PricingKey;
      const item = PRICING_DATA[k];
      if (item && typeof count === "number") {
        const unitMinutes = mode === "ext" ? item.minutes : item.minutes * 2;
        totalMinutes += unitMinutes * count;
      }
    });

    const windowCost = totalMinutes * RATE_PER_MINUTE;
    const SAFETY_BUFFER = 1.075; // 7.5% Markup
    let total = (windowCost * SAFETY_BUFFER) + BASE_FEE;
    
    // Round to nearest $5
    total = Math.round(total / 5) * 5;

    return total.toFixed(2);
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
            BETA — AI Estimation
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            AI🧠 Window Cleaning Estimator
          </h1>
          <p className="mt-3 text-lg text-zinc-600">
            Upload photos of the exterior of your home (all sides). Our AI will count your windows and give you an instant price estimate.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-zinc-200/60 bg-white/80 p-6 shadow-2xl backdrop-blur-sm md:p-8 ring-1 ring-zinc-900/5">
          
          {/* File Upload */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold text-zinc-900">
              1. Upload 4 Photos of the exterior of your house (Max 8)
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
                <span className="text-sm font-medium">Click to select photos</span>
                <span className="text-xs text-zinc-400">JPG, PNG (Max 10MB per file)</span>
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
              2. Select Service Type
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
                Inside & Out
              </button>
              <button
                onClick={() => setMode("ext")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === "ext"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Exterior Only
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
                  <span>Processing {files.length} images...</span>
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
                Calculate Estimate
              </>
            )}
          </button>

          {/* Powered by Gemini Badge */}
          <div className="flex items-center justify-center gap-1.5 mt-4 pb-2">
            <span className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase">Powered by</span>
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
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="mb-6 rounded-2xl bg-emerald-50 p-6 text-center border border-emerald-100">
                
                <div className="text-sm font-medium text-emerald-800 uppercase tracking-wide">Estimated Total</div>
                <div className="mt-1 text-4xl font-bold text-emerald-900">
                  ${calculateTotal()}
                </div>
                
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Total Panes Counted: {getTotalPanes()}
                </div>
                
                <div className="mt-3 text-xs text-emerald-700">
                  Ref: <span className="font-mono font-bold">{referenceId}</span> • This AI🤖 estimator is still learning and will be reviewed by a human.
                </div>
              </div>

              <div className="mt-8 border-t border-zinc-100 pt-6">
                              {/* 
                              {result.analysis && (
                                <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                                  <div className="text-xs font-semibold uppercase text-blue-700 mb-2">AI Analysis Log</div>
                                  <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">{result.analysis}</p>
                                </div>
                              )} 
                              */}
                
                              <div className="space-y-3">                  <div className="text-sm font-semibold text-zinc-900">Breakdown:</div>
                  
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                    <div>
                      <div className="text-sm font-medium text-zinc-900">Service & Travel Fee</div>
                      <div className="text-xs text-zinc-500">Standard service fee</div>
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
                                                <div className="text-sm text-zinc-600">{c}x</div>
                                                <div className="text-sm font-semibold text-zinc-900 min-w-[60px] text-right">
                                                  ${(c * (mode === "ext" ? item.minutes : item.minutes * 2) * RATE_PER_MINUTE).toFixed(2)}
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
                      quote: calculateTotal(),
                      panes: getTotalPanes(),
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
                  Book This Estimate
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <p className="mt-3 text-center text-xs text-zinc-500">
                  Sends your estimate directly to our team.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
