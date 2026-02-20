"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, Loader2, Calculator, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { PRICING_DATA, PricingKey } from "@/app/lib/pricing";
import { compressImage } from "@/app/lib/imageCompression";

export default function EstimatorPage() {
  // AI Window Cleaning Estimator Logic
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<"ext" | "in_out">("ext");
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // Basic validation
      const validFiles = newFiles.filter(f => f.type.startsWith("image/"));
      if (validFiles.length !== newFiles.length) {
        alert("Only image files (JPG, PNG) are supported right now.");
      }

      setFiles(prev => [...prev, ...validFiles]);
      setResult(null);
      setError(null);
      
      // Reset input
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const BASE_FEE = 60.00;

  const handleCalculate = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Compress all images
      const compressedFiles = await Promise.all(
        files.map(async (f) => {
          try {
            return await compressImage(f);
          } catch {
            return f; // Fallback to original if compression fails
          }
        })
      );

      // 2. Prepare FormData
      const formData = new FormData();
      compressedFiles.forEach((file) => {
        formData.append("files", file); // Append multiple files with same key
      });

      // 3. Send to API
      const res = await fetch("/api/estimate", {
        method: "POST",
        body: formData,
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Non-JSON API Response:", text);
        throw new Error("Server error: The analysis timed out or failed. Please try fewer images.");
      }

      if (!res.ok) {
        throw new Error(data.error || "Estimation failed");
      }

      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred. Please try fewer images.");
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!result || !result.window_counts) return 0;
    
    let total = BASE_FEE;
    Object.entries(result.window_counts).forEach(([key, count]) => {
      const k = key as PricingKey;
      const item = PRICING_DATA[k];
      if (item && typeof count === "number") {
        const unitPrice = mode === "ext" ? item.price : item.price * 2;
        total += unitPrice * count;
      }
    });
    return total.toFixed(2);
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        
        {/* Header with Beta Badge */}
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
              1. Upload Photos
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
                <span className="text-xs text-zinc-400">JPG, PNG (Max 10MB per file before compression)</span>
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
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing {files.length} images...
              </>
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
                <div className="mt-2 text-xs text-emerald-700">
                  *Based on detected windows. Final price may vary upon onsite inspection.
                </div>
              </div>

              {result.analysis && (
                <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="text-xs font-semibold uppercase text-blue-700 mb-2">AI Analysis Log</div>
                  <p className="text-sm text-blue-900 whitespace-pre-wrap leading-relaxed">{result.analysis}</p>
                </div>
              )}

              {result.audio_summary && result.audio_summary !== "None" && (
                <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="text-xs font-semibold uppercase text-zinc-500 mb-2">Notes Detected</div>
                  <p className="text-sm text-zinc-700 italic">"{result.audio_summary}"</p>
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

              {/* Safety Warning for Vintage Sliders */}
              {(result.window_counts.alum_double_slider > 0) && (
                <div className="mt-6 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Note:</span> We detected vintage double-slider windows. These often require disassembly to clean properly, which takes extra time and care.
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
