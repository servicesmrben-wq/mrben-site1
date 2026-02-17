import { Sparkles } from "lucide-react";
import { classNames } from "@/app/lib/utils";

export default function SectionTitle({ kicker, title, subtitle, subtitleClassName, align = "center" }: { kicker?: string, title: string, subtitle?: string, subtitleClassName?: string, align?: "left" | "center" }) {
  return (
    <div className={classNames("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left")}>
      {kicker ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{kicker}</span>
        </div>
      ) : null}
      <h2 className="mt-4 text-xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-2xl md:text-4xl md:leading-normal">
        {title}
      </h2>
      {subtitle ? (
        <p className={classNames("mt-3 text-base leading-relaxed text-zinc-600", subtitleClassName)}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
