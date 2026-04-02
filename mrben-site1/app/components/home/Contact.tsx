"use client";

import React, { useState, useRef, useEffect, RefObject, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Phone, Mail, ArrowRight, Upload, Calculator } from "lucide-react";
import { useLocale } from "next-intl";
import { usePathname, Link } from "@/navigation";
import { loadGooglePlaces } from "@/app/lib/googlePlacesLoader";
import { BRAND } from "@/app/lib/constants";
import { toMailto, formatPhoneNumber } from "@/app/lib/utils";
import confetti from "canvas-confetti";
import { unpackData } from "@/app/lib/url-packer";

function Input({ label, inputRef, ...inputProps }: { label: string, inputRef?: React.RefObject<HTMLInputElement | null>, [key: string]: any }) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-zinc-900">{label}</div>
      <input
        ref={inputRef}
        {...inputProps}
        className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400"
      />
    </label>
  );
}

function ContactContent({ 
  t, 
  contactRef,
  phoneNumber: propPhoneNumber,
  phoneHref: propPhoneHref
}: { 
  t: (key: string, options?: any) => string, 
  contactRef: RefObject<HTMLDivElement | null>,
  phoneNumber?: string,
  phoneHref?: string
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isLevis = pathname === "/levis";
  const phoneNumber = propPhoneNumber ?? (isLevis ? "418-741-2217" : BRAND.phoneDisplay);
  const phoneHref = propPhoneHref ?? (isLevis ? "tel:+14187412217" : BRAND.phoneHref);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    message: "",
  });
  const [company, setCompany] = useState("");
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const autocompleteListenerRef = useRef<any>(null);

  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState("");
  const [previews, setPreviews] = useState<{file: File, url: string}[]>([]);

  const [services, setServices] = useState<string[]>([]);

  const [status, setStatus] = useState({ state: "idle", message: "" });

  // Extract Estimate Params (Handling both packed and unpacked data)
  const estimateData = React.useMemo(() => {
    const packed = searchParams.get("data");
    if (packed) {
      return unpackData(packed);
    }
    return null;
  }, [searchParams]);

  const estimateRef = estimateData?.ref || searchParams.get("ref");
  const estimateQuote = estimateData?.quote || searchParams.get("quote");
  const estimatePanes = estimateData?.panes || searchParams.get("panes");
  const estimateTime = estimateData?.time || searchParams.get("time");
  const estimateConf = estimateData?.conf || searchParams.get("conf");
  
  // Extended comparison params
  const qExt = estimateData?.q_ext || searchParams.get("q_ext");
  const tExt = estimateData?.t_ext || searchParams.get("t_ext");
  const qInOut = estimateData?.q_inout || searchParams.get("q_inout");
  const tInOut = estimateData?.t_inout || searchParams.get("t_inout");

  // Pricing metrics
  const hourlyRate = estimateData?.hr || searchParams.get("hr");
  const markup = estimateData?.markup || searchParams.get("markup");
  const serviceFee = estimateData?.fee || searchParams.get("fee");

  const estimateS3 = estimateData?.s3 || searchParams.get("s3");
  const estimateS2 = estimateData?.s2 || searchParams.get("s2");
  const estimateS1 = estimateData?.s1 || searchParams.get("s1");
  const estimatePatio = estimateData?.patio || searchParams.get("patio");
  const estimateEntry = estimateData?.entry || searchParams.get("entry");
  const estimateVibe = estimateData?.vibe || searchParams.get("vibe");
  const estimateImgCount = estimateData?.imgCount || searchParams.get("imgCount");
  const estimateAvgVibe = estimateData?.avgVibe || searchParams.get("avgVibe");
  const urlService = estimateData?.service || searchParams.get("service");

  useEffect(() => {
    if (estimateQuote) {
      // Pre-fill message or handle logic if needed
      // setForm(p => ({ ...p, message: "I'm interested in the estimate I just generated." }));
    }
    if (urlService) {
      setServices(prev => prev.includes(urlService) ? prev : [...prev, urlService]);
    }
  }, [estimateQuote, urlService]);

  const MAX_IMAGES = 6;
  const MAX_IMAGE_SIZE = 15 * 1024 * 1024;
  const MAX_COMPRESSED_SIZE = 0.5 * 1024 * 1024; // 0.5MB
  const BLOB_THRESHOLD = 3 * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

  const serviceOptions = [
    t("serviceOption1"),
    t("serviceOption2"),
    t("serviceOption3"),
    t("serviceOption4"),
  ];

  function toggleService(label: string) {
    setServices((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  }

  function validateImages(list: File[]) {
    if (list.length > MAX_IMAGES) {
      return t("photoErrorMax");
    }
    if (list.some((file) => !ALLOWED_IMAGE_TYPES.includes(file.type))) {
      return t("photoErrorType");
    }
    if (list.some((file) => file.size > MAX_IMAGE_SIZE)) {
      return t("photoErrorSize");
    }
    return "";
  }

  async function compressImage(file: File) {
    if (!file.type.startsWith("image/")) return file;

    const imageBitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    if (!context) {
      imageBitmap.close?.();
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
    const nextName = `${baseName}.webp`;
    const qualitySteps = [0.82, 0.72, 0.62, 0.52, 0.45];
    const dimensionSteps = [2000, 1600, 1280];
    const longestEdge = Math.max(imageBitmap.width, imageBitmap.height);

    const toBlob = (quality: number) =>
      new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/webp", quality);
      });

    let finalBlob: Blob | null = null;

    for (const maxEdge of dimensionSteps) {
      const scale = Math.min(1, maxEdge / longestEdge);
      const targetWidth = Math.max(1, Math.round(imageBitmap.width * scale));
      const targetHeight = Math.max(1, Math.round(imageBitmap.height * scale));

      canvas.width = targetWidth;
      canvas.height = targetHeight;
      context.clearRect(0, 0, targetWidth, targetHeight);
      context.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

      for (const quality of qualitySteps) {
        const blob = await toBlob(quality);
        if (blob && blob.size <= MAX_COMPRESSED_SIZE) {
          finalBlob = blob;
          break;
        }
      }

      if (finalBlob) break;
    }

    imageBitmap.close?.();

    if (!finalBlob) {
      throw new Error("image_too_large");
    }

    return new File([finalBlob], nextName, {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  }

  React.useEffect(() => {
    const nextPreviews = images.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews(nextPreviews);
    return () => {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [images]);

  useEffect(() => {
    let isMounted = true;

    loadGooglePlaces().then(() => {
      if (!isMounted || !addressInputRef.current) return;
      const googleMaps = /** @type {any} */ (window.google);
      if (!googleMaps?.maps?.places) return;
      if (autocompleteRef.current) return;
      const autocomplete = new (googleMaps.maps.places as any).Autocomplete(
        addressInputRef.current,
        {
          types: ["address"],
          componentRestrictions: { country: "ca" },
        }
      );

      autocomplete.setFields?.(["address_components", "formatted_address"]);

      const handlePlaceChanged = () => {
        const place = autocomplete.getPlace?.();
        const formatted = place?.formatted_address;
        if (!formatted || !place?.address_components?.length) return;

        setForm((prev) => ({ ...prev, address: formatted }));
      };

      const listener = autocomplete.addListener("place_changed", handlePlaceChanged);
      autocompleteRef.current = autocomplete;
      autocompleteListenerRef.current = listener;
    });

    return () => {
      isMounted = false;
      if (autocompleteListenerRef.current?.remove) {
        autocompleteListenerRef.current.remove();
      }
      autocompleteListenerRef.current = null;
      autocompleteRef.current = null;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationMessage = validateImages(images);
    if (validationMessage) {
      setImageError(validationMessage);
      setStatus({
        state: "error",
        message: validationMessage,
      });
      return;
    }

    setStatus({ state: "sending", message: "" });

    try {
      const totalSize = images.reduce((sum, f) => sum + f.size, 0);
      const useBlobBackup = totalSize > BLOB_THRESHOLD;
      
      let uploadedUrls: string[] = [];
      if (useBlobBackup) {
        for (const file of images) {
          const upData = new FormData();
          upData.append("file", file);
          const upRes = await fetch("/api/upload", { method: "POST", body: upData });
          if (!upRes.ok) throw new Error("Upload to backup storage failed.");
          const { url } = await upRes.json();
          uploadedUrls.push(url);
        }
      }

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("email", form.email);
      formData.append("address", String(form.address ?? ""));
      formData.append("services", JSON.stringify(services));
      formData.append("message", form.message);
      formData.append("company", company);
      
      // Inject Estimate Data if present
      if (estimateQuote) {
        formData.append("estimateRef", estimateRef || "");
        formData.append("estimateQuote", estimateQuote);
        formData.append("estimatePanes", estimatePanes || "0");
        formData.append("estimateTime", estimateTime || "N/A");
        formData.append("estimateConf", estimateConf || "0");
        formData.append("estimateVibe", estimateVibe || "normal");
        formData.append("estimateImgCount", estimateImgCount || "0");
        formData.append("estimateAvgVibe", estimateAvgVibe || "1.0");
        formData.append("estimateDetails", `Rez-de-chaussée et sous-sol : ${estimateS1}, Deuxième étage : ${estimateS2}, Troisième étage : ${estimateS3}, Portes patio (panneaux) : ${estimatePatio}, Portes d'entrée (assumé 2 vitres/porte) : ${estimateEntry}`);
        
        // Extended comparison
        formData.append("qExt", qExt || "N/A");
        formData.append("tExt", tExt || "N/A");
        formData.append("qInOut", qInOut || "N/A");
        formData.append("tInOut", tInOut || "N/A");
        formData.append("selectedService", urlService || "N/A");
        
        // Pricing metrics
        formData.append("hourlyRate", hourlyRate || "N/A");
        formData.append("markup", markup || "N/A");
        formData.append("serviceFee", serviceFee || "N/A");
      }
      
      if (useBlobBackup) {
        formData.append("imageUrls", JSON.stringify(uploadedUrls));
      } else {
        images.forEach((file) => {
          formData.append("images", file);
        });
      }

      let res;
      try {
        res = await fetch("/api/contact", {
          method: "POST",
          body: formData,
        });
      } catch (error) {
        console.error("Contact form network error:", error);
        setStatus({
          state: "error",
          message: t("networkError"),
        });
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        setStatus({
          state: "error",
          message: data?.error || t("sendError"),
        });
        return;
      }

      // Save lead to drive
      try {
        const leadData = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          referenceId: estimateRef || `LEAD-${Date.now()}`,
          service: urlService || (services.length ? services.join(", ") : "(none selected)"),
          qExt,
          tExt,
          qInOut,
          tInOut,
          hourlyRate,
          markup,
          imgCount: estimateImgCount,
          avgVibe: estimateAvgVibe
        };

        await fetch("/api/save-lead-to-drive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(leadData)
        });
      } catch (err) {
        console.warn("Failed to save lead to drive", err);
      }

      setStatus({
        state: "success",
        message: t("sendSuccess"),
      });

      const count = 200;
      const defaults = {
        origin: { y: 0.7 }
      };

      function fire(particleRatio: number, opts: any) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });

      setForm({ name: "", phone: "", email: "", address: "", message: "" });
      setCompany("");
      setServices([]);
      setImages([]);
      setImageError("");
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus({
        state: "error",
        message: t("networkError"),
      });
    }
  }

  return (
    <section id="contact" className="bg-zinc-950">
      <div ref={contactRef} aria-hidden="true" className="h-0 w-full" />
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2">
          {/* Left Column (Info) */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/15">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{t("contactK")}</span>
            </div>
            <h3 className="mt-4 text-xl font-semibold leading-tight tracking-tight text-white md:text-3xl md:leading-normal">
              {t("contactT")}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-white/75">{t("contactP")}</p>

            <div className="mt-5 space-y-2 md:mt-6 md:space-y-3">
              <a href={phoneHref} className="flex items-center justify-between rounded-3xl bg-white/10 px-5 py-4 text-white ring-1 ring-white/15 hover:bg-white/15">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t("phone")}</div>
                    <div className="text-sm text-white/75">{phoneNumber}</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-white/60" />
              </a>

              <a href={toMailto(BRAND.emailHref)} className="flex items-center justify-between rounded-3xl bg-white/10 px-5 py-4 text-white ring-1 ring-white/15 hover:bg-white/15">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t("email")}</div>
                    <div className="text-sm text-white/75">{BRAND.email}</div>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-white/60" />
              </a>
            </div>

            <div className="mt-8 rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="text-sm font-semibold text-white">{t("hours")}</div>
              <div className="mt-1 text-sm text-white/75">{t("hoursText")}</div>
              <div className="mt-4 hidden text-sm font-semibold text-white md:block">{t("services")}</div>
              <div className="mt-2 hidden flex-wrap gap-2 md:flex">
                {[t("servicesMenuVitres"), t("servicesMenuGout"), t("servicesMenuSiding")].map((s) => (
                  <span key={s} className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 ring-1 ring-white/10">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (Form) */}
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold text-zinc-900">{t("formT")}</div>
              </div>
            </div>

            {/* Estimate Display Block */}
            {estimateQuote && (
              <div className="mt-4 mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Calculator className="h-5 w-5" />
                  <span className="text-sm font-bold">AI Estimated Total: ${estimateQuote}</span>
                </div>
                <div className="mt-1 text-xs text-emerald-600">
                  {estimatePanes} panes
                </div>
              </div>
            )}

            <form 
              onSubmit={onSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                  e.preventDefault();
                }
              }}
            >
              <div className="absolute left-[-10000px] top-auto h-0 w-0 overflow-hidden">
                <label>
                  Company
                  <input type="text" name="company" autoComplete="off" tabIndex={-1} value={company} onChange={(e) => setCompany(e.target.value)} />
                </label>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label={t("name")} placeholder={t("name")} value={form.name} onChange={(e: any) => setForm((p) => ({ ...p, name: e.target.value }))} />
                <Input label={t("phoneLabel")} placeholder="450-555-0123" value={form.phone} onChange={(e: any) => setForm((p) => ({ ...p, phone: formatPhoneNumber(e.target.value) }))} type="tel" inputMode="numeric" autoComplete="tel" />
                <Input label={t("emailLabel")} placeholder="you@example.com" value={form.email} onChange={(e: any) => setForm((p) => ({ ...p, email: e.target.value }))} />
                <Input label={t("address")} placeholder={t("address")} inputRef={addressInputRef} value={form.address} onChange={(e: any) => setForm((p) => ({ ...p, address: e.target.value }))} />
              </div>

              <div className="mt-4">
                <div className="hidden md:block">
                  <div className="text-sm font-semibold text-zinc-900">{t("choose")}</div>
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {serviceOptions.map((x) => (
                      <label key={x} className="flex items-start gap-2 rounded-2xl border border-zinc-200 p-3">
                        <input type="checkbox" className="mt-1" checked={services.includes(x)} onChange={() => toggleService(x)} />
                        <span className="text-sm text-zinc-700">{x}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="md:hidden">
                  <details className="group">
                    <summary className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-left text-sm font-semibold text-zinc-900 shadow-sm">
                      <span className="flex flex-col">
                        <span>{t("servicesRequested")}</span>
                        <span className="text-xs font-medium text-zinc-500">
                          {t("chooseServices")} {services.length > 0 ? <span className="ml-2 text-[11px] text-zinc-400" aria-live="polite">({services.length} {t("selected")})</span> : null}
                        </span>
                      </span>
                      <span className="ml-3 text-zinc-400 transition-transform group-open:rotate-180" aria-hidden="true">▾</span>
                    </summary>
                    <div className="pt-3">
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {serviceOptions.map((x) => (
                          <label key={x} className="flex items-start gap-2 rounded-2xl border border-zinc-200 p-3">
                            <input type="checkbox" className="mt-1" checked={services.includes(x)} onChange={() => toggleService(x)} />
                            <span className="text-sm text-zinc-700">{x}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </details>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-semibold text-zinc-900">{t("desc")}</div>
                <textarea rows={4} className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400" placeholder={t("descPlaceholder")} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} />
                <p className="mt-2 text-xs text-zinc-500">{t("descHint")}</p>
              </div>

              {/* Image upload */}
              <div className="mt-4">
                <div className="text-sm font-semibold text-zinc-900">{t("photoLabel")}</div>
                <label htmlFor="contactPhotos" className="mt-2 block cursor-pointer rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus-within:border-zinc-400 focus-within:ring-2 focus-within:ring-zinc-200 hover:bg-black/5 active:opacity-90">
                  <div className="flex items-center gap-2 font-semibold">
                    <Upload className="h-4 w-4" />
                    <span>{t("photoSelectButton")}</span>
                  </div>
                  <input
                    id="contactPhotos"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="sr-only"
                    onChange={async (e) => {
                      const selected = Array.from(e.target.files || []);
                      if (!selected.length) return;
                      const nextImages = [...images, ...selected];
                      const validationMessage = validateImages(nextImages);
                      if (validationMessage) {
                        setImageError(validationMessage);
                        setStatus({ state: "idle", message: "" });
                        e.target.value = "";
                        return;
                      }
                      const compressionResults = await Promise.allSettled(selected.map((file) => compressImage(file)));
                      const compressedFiles = compressionResults.filter((result) => result.status === "fulfilled").map((result) => (result as PromiseFulfilledResult<File>).value);
                      if (compressionResults.some((result) => result.status === "rejected")) {
                        setImageError(locale === "fr" ? "Impossible de compresser une image sous 1 Mo." : "Unable to compress an image below 1MB.");
                        setStatus({ state: "idle", message: "" });
                        e.target.value = "";
                        return;
                      }
                      const compressedImages = [...images, ...compressedFiles];
                      const compressedValidationMessage = validateImages(compressedImages);
                      if (compressedValidationMessage) {
                        setImageError(compressedValidationMessage);
                        setStatus({ state: "idle", message: "" });
                        e.target.value = "";
                        return;
                      }
                      setImages(compressedImages);
                      setImageError("");
                      setStatus({ state: "idle", message: "" });
                      e.target.value = "";
                    }}
                  />
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                    <span>{t("photoHelper")}</span>
                    <span className="hidden text-zinc-300 sm:inline">•</span>
                    <span>{t("photoSelected", { count: images.length, max: MAX_IMAGES })}</span>
                  </div>
                </label>
                {imageError && <p className="mt-2 text-xs text-red-600">{imageError}</p>}
                {previews.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-3">
                    {previews.map((preview, index) => (
                      <div key={`${preview.url}-${preview.file.name}`} className="relative h-20 w-20 overflow-hidden rounded-2xl border border-zinc-200">
                        <Image src={preview.url} alt={preview.file.name} fill className="object-cover" unoptimized />
                        <button type="button" aria-label={t("photoRemove")} className="absolute right-1 top-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold text-zinc-700 shadow-sm" onClick={() => { const next = images.filter((_, i) => i !== index); setImages(next); setImageError(validateImages(next)); }}>{t("photoRemove")}</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {status.state !== "idle" && (
                <div className={`mt-4 rounded-2xl p-3 text-sm ${status.state === "success" ? "bg-emerald-50 text-emerald-900" : status.state === "error" ? "bg-red-50 text-red-900" : "bg-zinc-50 text-zinc-900"}`}>
                  {status.state === "sending" ? t("sending") : status.message}
                </div>
              )}

              <button type="submit" disabled={status.state === "sending"} className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 active:opacity-90 disabled:opacity-60">
                {status.state === "sending" ? t("sending") : t("send")} <ArrowRight className="h-4 w-4" />
              </button>

              {/* Privacy Notice */}
              <div className="mt-3 text-center text-[10px] text-zinc-500 leading-none">
                {t("privacyNotice")}
                <Link 
                  href={locale === "fr" ? "/confidentialite" : "/privacy-policy"} 
                  className="font-medium text-zinc-400 underline underline-offset-2 hover:text-zinc-600"
                >
                  {t("privacyLink")}
                </Link>.
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Contact(props: { 
  t: (key: string, options?: any) => string, 
  contactRef: RefObject<HTMLDivElement | null>,
  phoneNumber?: string,
  phoneHref?: string
}) {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <ContactContent {...props} />
    </Suspense>
  );
}
