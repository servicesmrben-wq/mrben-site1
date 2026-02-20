"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // Ensure Link is imported
import { Upload, Loader2, Calculator, AlertTriangle, CheckCircle2, X, ArrowRight } from "lucide-react";
import { PRICING_DATA, PricingKey } from "@/app/lib/pricing";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mode, setMode] = useState<"ext" | "in_out">("ext");
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(f => f.type.startsWith("image/"));
      if (validFiles.length !== newFiles.length) {
        alert("Only image files (JPG, PNG) are supported right now.");
      }
      setFiles(prev => [...prev, ...validFiles]);
      setResult(null);
      setError(null);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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

    // Smart Progress Logic
    const estimatedWaitTimeMs = files.length * 5000 + 2000; 
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min((elapsed / estimatedWaitTimeMs) * 100, 95); 
      setProgress(calculatedProgress);
    }, 200);

    try {
      // 2. Chunking Logic
      const CHUNK_SIZE = 4;
      const chunks: File[][] = [];
      for (let i = 0; i < files.length; i += CHUNK_SIZE) {
        chunks.push(files.slice(i, i + CHUNK_SIZE));
      }

      // 3. Process Chunks in Parallel
      const fetchPromises = chunks.map(async (chunk, index) => {
        const compressedChunk = await Promise.all(
          chunk.map(async (f) => {
            try { return await compressImage(f); } catch { return f; }
          })
        );

        const formData = new FormData();
        compressedChunk.forEach((file) => {
          formData.append("files", file); 
        });

        const res = await fetch("/api/estimate", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Batch ${index + 1} failed`);
        }
        return res.json();
      });

      const results = await Promise.all(fetchPromises);

      // 4. Merge Results
      const mergedResult = {
        analysis: "",
        window_counts: {
          pane_3rd_story: 0,
          pane_2nd_story: 0,
          pane_1st_base: 0,
          patio_door_panel: 0
        },
        stories: 1
      };

      results.forEach((res, i) => {
        mergedResult.analysis += `Batch ${i + 1}: ` + res.analysis + "\n";
        
        Object.keys(mergedResult.window_counts).forEach((key) => {
          const k = key as keyof typeof mergedResult.window_counts;
          mergedResult.window_counts[k] += (res.window_counts[k] || 0);
        });
      });

      setResult(mergedResult);
      setProgress(100); 
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
    
    let windowSum = 0;
    Object.entries(result.window_counts).forEach(([key, count]) => {
      const k = key as PricingKey;
      const item = PRICING_DATA[k];
      if (item && typeof count === "number") {
        const unitPrice = mode === "ext" ? item.price : item.price * 2;
        windowSum += unitPrice * count;
      }
    });

    const SAFETY_BUFFER = 1.15; // 15% Markup
    const total = (windowSum * SAFETY_BUFFER) + BASE_FEE;
    
    return total.toFixed(2);
  };

  const getTotalPanes = () => {
    if (!result || !result.window_counts) return 0;
    return Object.values(result.window_counts).reduce((sum: number, count: any) => sum + Number(count), 0);
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            BETA — AI Estimation
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
            AI Window Cleaning Estimator
          </h1>
          <p className="mt-3 text-lg text-zinc-600">
            Upload photos of your home (all sides). Our AI will count your windows and give you an instant price estimate.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
          
          {/* File Upload */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold text-zinc-900">
              1. Upload Photos (Max 8)
            </label>
            <div className="relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:border-zinc-400 hover:bg-zinc-100">
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
                      src={URL.createObjectURL(f)} 
                      alt="preview" 
                      fill 
                      className="object-cover" 
                      onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
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
                onClick={() => setMode("ext")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${
                  mode === "ext"
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                Exterior Only
              </button>
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
            </div>
          </div>

          {/* Calculate Button */}
          <button
            onClick={handleCalculate}
            disabled={files.length === 0 || isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
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
                {/* Total Panes Count */}
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4" />
                  Total Panes Counted: {getTotalPanes()}
                </div>
                <div className="mt-3 text-xs text-emerald-700">
                  *Includes 15% safety buffer & base fee. Final price may vary upon onsite inspection.
                </div>
              </div>

              {result.analysis && (
                <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="text-xs font-semibold uppercase text-blue-700 mb-2">AI Analysis Log</div>
                  <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">{result.analysis}</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="text-sm font-semibold text-zinc-900">Breakdown:</div>
                
                {/* Base Fee Line */}
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
                          ${(c * (mode === "ext" ? item.price : item.price * 2)).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Book Button */}
              <div className="mt-8 border-t border-zinc-100 pt-6">
                <Link
                  href={{
                    pathname: "/contact",
                    query: {
                      quote: calculateTotal(),
                      panes: getTotalPanes(),
                      s3: result.window_counts.pane_3rd_story,
                      s2: result.window_counts.pane_2nd_story,
                      s1: result.window_counts.pane_1st_base,
                      doors: result.window_counts.patio_door_panel,
                    }
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
