"use client";

import { useState } from "react";
import { Upload, Loader2, Calculator, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PRICING_DATA, PricingKey } from "@/app/lib/pricing";

export default function EstimatorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<"ext" | "in_out">("ext");
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleCalculate = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Estimation failed");
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateTotal = () => {
    if (!result || !result.window_counts) return 0;
    
    let total = 0;
    Object.entries(result.window_counts).forEach(([key, count]) => {
      const k = key as PricingKey;
      const price = mode === "ext" ? PRICING_DATA[k]?.price_ext : PRICING_DATA[k]?.price_in_out;
      if (price && typeof count === "number") {
        total += price * count;
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
            Upload a video or photo of your home. Our AI will count your windows and give you an instant price estimate.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
          
          {/* File Upload */}
          <div className="mb-8">
            <label className="mb-3 block text-sm font-semibold text-zinc-900">
              1. Upload Video or Photo
            </label>
            <div className="relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 transition hover:border-zinc-400 hover:bg-zinc-100">
              <input 
                type="file" 
                accept="video/*,image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              {file ? (
                <div className="flex flex-col items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="h-8 w-8" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-500">
                  <Upload className="h-8 w-8" />
                  <span className="text-sm font-medium">Click to select or drag file here</span>
                  <span className="text-xs text-zinc-400">MP4, MOV, JPG, PNG accepted</span>
                </div>
              )}
            </div>
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
            disabled={!file || isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Analyzing media...
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

              {result.audio_summary && result.audio_summary !== "None" && (
                <div className="mb-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="text-xs font-semibold uppercase text-zinc-500 mb-2">Audio Notes Detected</div>
                  <p className="text-sm text-zinc-700 italic">"{result.audio_summary}"</p>
                </div>
              )}

              <div className="space-y-3">
                <div className="text-sm font-semibold text-zinc-900">Breakdown:</div>
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
                          ${(c * (mode === "ext" ? item.price_ext : item.price_in_out)).toFixed(2)}
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
