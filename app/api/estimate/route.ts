import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";

export const maxDuration = 58;
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ status: "Server is awake and ready." }, { status: 200 });
}

<<<<<<< HEAD
const SYSTEM_PROMPT = `You are an expert window washing estimator. Analyze MULTIPLE photos of the SAME property and return a single unified count — no double counting across photos.

GLASS SECTION (the unit):
Each physically separate piece of glass bounded by a real frame, mullion, or muntin.
- Grid windows: columns × rows (3×2 = 6)
- Mulled banks: count each pane inside the outer frame
- Single uninterrupted pane = 1
- Decorative grids between glass layers = do NOT count unless bars connect to the frame on both ends

ANTI-DUPLICATE (critical for multi-photo):
Build one master map of unique windows. Use landmarks (garage, door, corners, roofline) to identify the same window across photos. Count each window ONCE using the clearest photo. If unsure whether two windows are the same, assume they are.

ROW CHECK (most common undercount):
After counting columns, always scan top-to-bottom for a horizontal rail. Many windows have 2 rows. Total = columns × rows.

CATEGORIES:
- sections_1st_base: all ground floor + basement + anything ambiguous
- sections_2nd_story: only if a full second living floor is clearly visible
- sections_3rd_story: only if a full third floor is clearly visible
- door_glass_section: entry door lites, sidelights, transoms, patio door panels

DO NOT MISS:
Basement windows (near foundation), garage windows, sidelights, transoms, windows behind AC units / propane tanks / shelters.

SYMMETRY: Only infer hidden windows when one side is clearly blocked AND architecture strongly mirrors the visible side. Note it in analysis.

UNDERCOUNTING vs OVERCOUNTING: When genuinely ambiguous, lean toward the higher plausible count and note it.

Return raw JSON only. No markdown, no backticks, nothing before { or after }.

{
  "analysis": "Which photos used as primary, overlaps avoided, symmetry/inference used, any uncertainty.",
  "confidence": "high/medium/low",
  "final_counts": { "sections_3rd_story": 0, "sections_2nd_story": 0, "sections_1st_base": 0, "door_glass_section": 0 },
  "stories": 1
}`;
=======
const SYSTEM_PROMPT = `You are an accuracy-first residential window estimator. Count distinct glass sections from MULTIPLE photos of the SAME property.

PRIORITY:
- Cost is irrelevant. Maximize counting accuracy and especially avoid undercounting.
- Mandatory occlusion reconstruction: shelters, railings, trees, tanks, glare, shadows, snow, and parked items must NOT cause missed openings. Infer hidden panes from trim/frame geometry, matching nearby units, and facade symmetry when justified.
- Multi-photo anti-duplicate rule: build a master map of unique openings by facade/landmarks and count each unique opening once.

MANDATORY RULES:
- Door glass rule: never default door glass to 1 without evidence. Count segmented inserts, sidelights, and door transoms. Infer hidden twin doors when symmetry + spacing/trim strongly indicates paired doors.
- Slider rule: each sliding door panel is a separate section; if a divider indicates 2 panels, never count as 1.
- Transom/clerestory rule: count each transom/clerestory panel as separate sections in addition to the main opening.
- Mull stack rule: count real mullion/muntin subdivisions; do not collapse stacked panes into one section.
- Basement windows and small lower-level openings are easy to miss; explicitly audit and include them.

STORIES:
- sections_1st_base = ground/base level
- sections_2nd_story = full second level openings
- sections_3rd_story = full third level openings
- stories must be integer 1..3, default 1 when uncertain.

MANDATORY INTERNAL 3-PASS THINKING (before final output):
1) Inventory pass: map all unique openings across photos by facade; deduplicate overlaps.
2) Per-opening pass: count sections for each opening (including sliders, transoms/clerestories, door glass segmentation, mull stacks).
3) Occlusion/door audit pass: specifically hunt undercounts from occlusions, hidden twins, missed basement windows, slider undercounts, and missed transoms.

OUTPUT FORMAT (STRICT):
- Return ONLY raw JSON, no markdown, no commentary, no extra keys.
- Required top-level keys exactly: analysis, confidence, final_counts, stories.
- confidence must be one of: high, medium, low.
- final_counts must contain exactly these keys:
  - sections_3rd_story
  - sections_2nd_story
  - sections_1st_base
  - door_glass_section
- final_counts values must be integers >= 0.

JSON schema example:
{
  "analysis": "brief rationale with any inferred occluded/twin openings",
  "confidence": "high",
  "final_counts": {
    "sections_3rd_story": 0,
    "sections_2nd_story": 0,
    "sections_1st_base": 0,
    "door_glass_section": 0
  },
  "stories": 1
}`;

type EstimateSchema = {
  analysis: string;
  confidence: "high" | "medium" | "low";
  final_counts: {
    sections_3rd_story: number;
    sections_2nd_story: number;
    sections_1st_base: number;
    door_glass_section: number;
  };
  stories: 1 | 2 | 3;
};

const COUNT_FIELDS: (keyof EstimateSchema["final_counts"])[] = [
  "sections_3rd_story",
  "sections_2nd_story",
  "sections_1st_base",
  "door_glass_section",
];
>>>>>>> 209f468ccfef55fde25313206c7f812386c2c11b

function extractJSON(text: string) {
  // Find the JSON block that contains "final_counts" — reliable even with scratchpad text before it
  const marker = text.indexOf('"final_counts"');
  if (marker === -1) throw new Error("No JSON found in response");

  // Walk left from marker to find the opening brace of this object
  let openBrace = -1;
  for (let i = marker; i >= 0; i--) {
    if (text[i] === "{") { openBrace = i; break; }
  }
  if (openBrace === -1) throw new Error("No JSON found in response");

  // Walk right from opening brace, tracking depth to find matching closing brace
  let depth = 0;
  let closeBrace = -1;
  for (let i = openBrace; i < text.length; i++) {
    if (text[i] === "{") depth++;
    if (text[i] === "}") depth--;
    if (depth === 0) { closeBrace = i; break; }
  }
  if (closeBrace === -1) throw new Error("No JSON found in response");

  return JSON.parse(text.slice(openBrace, closeBrace + 1).trim());
}

function toNonNegativeInt(value: unknown) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.max(0, Math.round(num));
}

function normalizeEstimate(data: any): EstimateSchema {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid model JSON: root object missing");
  }
  if (!data.final_counts || typeof data.final_counts !== "object") {
    throw new Error("Invalid model JSON: final_counts missing");
  }
  for (const field of COUNT_FIELDS) {
    if (!(field in data.final_counts)) {
      throw new Error(`Invalid model JSON: missing ${field}`);
    }
  }
  if (typeof data.analysis !== "string") {
    throw new Error("Invalid model JSON: analysis must be a string");
  }

  const confidenceRaw = typeof data?.confidence === "string" ? data.confidence.toLowerCase() : "medium";
  const confidence: EstimateSchema["confidence"] =
    confidenceRaw === "high" || confidenceRaw === "medium" || confidenceRaw === "low"
      ? confidenceRaw
      : "medium";

  const storyRaw = toNonNegativeInt(data?.stories);
  const stories: EstimateSchema["stories"] = storyRaw >= 3 ? 3 : storyRaw >= 2 ? 2 : 1;

  return {
    analysis: data.analysis,
    confidence,
    final_counts: {
      sections_3rd_story: toNonNegativeInt(data?.final_counts?.sections_3rd_story),
      sections_2nd_story: toNonNegativeInt(data?.final_counts?.sections_2nd_story),
      sections_1st_base: toNonNegativeInt(data?.final_counts?.sections_1st_base),
      door_glass_section: toNonNegativeInt(data?.final_counts?.door_glass_section),
    },
    stories,
  };
}

function allowsLowerCountFromPass2(field: keyof EstimateSchema["final_counts"], analysis: string) {
  const text = analysis.toLowerCase();
  const overcountSignals = ["double-count", "double count", "double counted", "duplicate", "overcount", "counted twice"];
  const hasOvercountSignal = overcountSignals.some((signal) => text.includes(signal));
  if (!hasOvercountSignal) return false;

  const fieldSignals: Record<keyof EstimateSchema["final_counts"], string[]> = {
    sections_3rd_story: ["sections_3rd_story", "3rd story", "third story", "third-floor", "third floor"],
    sections_2nd_story: ["sections_2nd_story", "2nd story", "second story", "second-floor", "second floor"],
    sections_1st_base: ["sections_1st_base", "1st base", "first floor", "ground level", "ground floor", "facade"],
    door_glass_section: ["door_glass_section", "door glass", "door lite", "sidelight", "transom", "patio door", "slider"],
  };

  return fieldSignals[field].some((signal) => text.includes(signal));
}

function storyIncreaseJustified(pass2Analysis: string) {
  const text = pass2Analysis.toLowerCase();
  const storySignals = [
    "full second",
    "full third",
    "distinct upper facade",
    "separate floor line",
    "clear second story",
    "clear third story",
    "complete second",
    "complete third",
  ];
  return storySignals.some((signal) => text.includes(signal));
}

function mergePass1Pass2(pass1: EstimateSchema, pass2: EstimateSchema): EstimateSchema {
  const mergedCounts = { ...pass1.final_counts };

  for (const field of COUNT_FIELDS) {
    const p1 = pass1.final_counts[field];
    const p2 = pass2.final_counts[field];
    if (p2 < p1 && allowsLowerCountFromPass2(field, pass2.analysis)) {
      mergedCounts[field] = p2;
    } else {
      mergedCounts[field] = Math.max(p1, p2);
    }
  }

  let mergedStories = pass1.stories;
  if (pass2.stories < pass1.stories) {
    mergedStories = pass1.stories;
  } else if (pass2.stories > pass1.stories) {
    mergedStories = storyIncreaseJustified(pass2.analysis) ? pass2.stories : pass1.stories;
  }

  return {
    analysis: [pass1.analysis, pass2.analysis].filter(Boolean).join("\n\nAUDIT: "),
    confidence: pass2.confidence === "low" && pass1.confidence !== "low" ? pass1.confidence : pass2.confidence,
    final_counts: mergedCounts,
    stories: mergedStories,
  };
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: Missing AI API Key" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Validate file types before processing
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.type}. Please upload JPEG, PNG, GIF, or WebP images.` },
          { status: 400 }
        );
      }
    }

    const imageParts = await Promise.all(
      files.map(async (file, index) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return [
          { type: "text" as const, text: `Image ${index + 1}:` },
          {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: buffer.toString("base64"),
            },
          },
        ];
      })
    );

    const client = new Anthropic({ apiKey });

    const startedAt = Date.now();
    const OVERALL_TIMEOUT_MS = 55000;
    const remainingMs = () => OVERALL_TIMEOUT_MS - (Date.now() - startedAt);

<<<<<<< HEAD
    const callConfig = {
      model: "claude-sonnet-4-6",
      max_tokens: 1024, // JSON-only output is small
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user" as const,
          content: [
            ...imageParts.flat(),
=======
    async function runPass(userText: string, maxCompletionTokens: number) {
      const ms = remainingMs();
      if (ms <= 0) throw new Error("Request Timeout");

      const result = await Promise.race([
        client.chat.completions.create({
          model: "gpt-5.2",
          max_completion_tokens: maxCompletionTokens,
          messages: [
>>>>>>> 209f468ccfef55fde25313206c7f812386c2c11b
            {
              role: "system" as const,
              content: SYSTEM_PROMPT,
            },
            {
              role: "user" as const,
              content: [
                ...imageParts.flat(),
                {
                  type: "text" as const,
                  text: userText,
                },
              ],
            },
          ],
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Request Timeout")), ms)),
      ]) as OpenAI.Chat.ChatCompletion;

      const rawText = result.choices[0]?.message?.content ?? "";
      return normalizeEstimate(extractJSON(rawText));
    }

    let pass1: EstimateSchema;
    try {
      pass1 = await runPass(
        "Full count across all images using the system rules. Return ONLY the required JSON.",
        1200
      );
    } catch (error: any) {
      return NextResponse.json({
        analysis: `Pass 1 failed: ${error?.message || "Unknown estimator error"}`,
        confidence: "low",
        window_counts: {
          pane_3rd_story: 0,
          pane_2nd_story: 0,
          pane_1st_base: 0,
          patio_door_panel: 0,
        },
        stories: 1,
      });
    }

<<<<<<< HEAD
    // Single API call with self-review
    const result = await Promise.race([
      client.messages.create(callConfig),
      timeoutPromise,
    ]) as Anthropic.Message;

    const rawText = result.content[0].type === "text" ? result.content[0].text : "";
    const parsedData = extractJSON(rawText);
=======
    // PASS 2 (AUDIT ONLY)
    let pass2: EstimateSchema | null = null;
    try {
      pass2 = await runPass(
        `Audit-only pass. Use the same images and this PASS 1 JSON verbatim as baseline:\n${JSON.stringify(pass1)}\nDO NOT recount everything. Only hunt undercount causes: occluded openings (shelters/railings/trees/tanks), hidden twin doors/windows inferred by symmetry/trim spacing, slider panels counted as 1 instead of 2, missed basement windows, missed transoms/clerestories, and missed mull stack divisions. Return corrected JSON in the SAME schema ONLY.`,
        1000
      );
    } catch {
      pass2 = null;
    }

    let finalEstimate: EstimateSchema = pass1;

    if (pass2) {
      const merged = mergePass1Pass2(pass1, pass2);
      const sectionDiff = Math.abs(pass1.final_counts.sections_1st_base - pass2.final_counts.sections_1st_base);
      const doorDiff = Math.abs(pass1.final_counts.door_glass_section - pass2.final_counts.door_glass_section);
      const needsPass3 = sectionDiff >= 3 || doorDiff >= 2 || pass2.confidence === "low";

      if (needsPass3) {
        try {
          finalEstimate = await runPass(
            `Arbitration pass. Use the same images plus these candidates. PASS 1:\n${JSON.stringify(pass1)}\nPASS 2:\n${JSON.stringify(pass2)}\nChoose the most accurate totals using the estimator rules with focus on occlusions, doors, sliders, transoms/clerestories, and mull stack divisions. Return ONLY schema JSON.`,
            800
          );
        } catch {
          finalEstimate = merged;
        }
      } else {
        finalEstimate = merged;
      }
    }
>>>>>>> 209f468ccfef55fde25313206c7f812386c2c11b

    // Remap new "sections_*" keys back to "pane_*" keys for frontend compatibility
    const counts = finalEstimate.final_counts;
    const mappedCounts = {
      pane_3rd_story: counts.sections_3rd_story ?? 0,
      pane_2nd_story: counts.sections_2nd_story ?? 0,
      pane_1st_base: counts.sections_1st_base ?? 0,
      patio_door_panel: counts.door_glass_section ?? 0,
    };

    return NextResponse.json({
      analysis: finalEstimate.analysis,
      confidence: finalEstimate.confidence,
      window_counts: mappedCounts,
      stories: finalEstimate.stories || 1,
    });

  } catch (error: any) {
    console.error("Estimation Error:", error);
    return NextResponse.json({
      analysis: `Estimator pipeline error: ${error?.message || "An unexpected error occurred."}`,
      confidence: "low",
      window_counts: {
        pane_3rd_story: 0,
        pane_2nd_story: 0,
        pane_1st_base: 0,
        patio_door_panel: 0,
      },
      stories: 1,
    });
  }
}
