import OpenAI from "openai";
import { NextResponse } from "next/server";

export const maxDuration = 58;
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ status: "Server is awake and ready." }, { status: 200 });
}

const SYSTEM_PROMPT = `You are an expert window‑washing estimator. You will be given MULTIPLE photos of the SAME property. Your job is to count distinct glass sections (pricing units) accurately and conservatively, without double counting across photos.

PRIMARY GOAL:
- **Do not miss sections.** When evidence is ambiguous, choose the higher plausible section count if it matches common residential window patterns. Undercounting is worse than mild overcounting. Explain any ambiguity in the "analysis" text.
- **Occlusion reconstruction is REQUIRED.** If openings are blocked by shelters, trees, snow, deep shadows, vehicles, or glare, reconstruct likely full openings from visible trim/frame geometry and nearby matching units; include these inferred openings in totals and describe them in "analysis".

RAW OUTPUT (NON‑NEGOTIABLE):
- Output MUST be raw JSON only — no markdown, no backticks, no extra text.
- Begin with { and end with }.
- Must include exactly these keys: "analysis", "confidence", "final_counts", "stories".
- Values in "final_counts" must be integers >= 0.
- Use "high", "medium", or "low" for confidence.

DEFINITION OF A GLASS SECTION:
A "glass section" is each physically separate pane of glass bounded by a true frame, mullion, or muntin — a real divider you would need to wipe around. Count every distinct piece of glass you see or can reasonably infer:
- Grid windows: Sections = columns x rows (e.g., 3x2 grid = 6 sections). This includes muntin grids placed between glass layers if the grid bars visibly connect to the outer frame and form a consistent pattern.
- Mulled banks: Within a larger frame, count each individual pane/unit inside.
- Doors: Count all distinct glass panels associated with doors as door_glass_section (entry door lites, sidelights, transoms, patio doors). For patio/slider doors, count each panel if there is a clear divider between panels.
- Basement windows: These are often small; count their sections carefully (often 1 but can be 2+).
- Garage windows: Include them just like house windows.

CRITICAL: MULTI-PHOTO ANTI-DUPLICATE RULE:
These photos may overlap. You must produce ONE set of counts for the property WITHOUT double counting the same windows. To do this:
1. Build a mental "master map" of UNIQUE windows and doors.
2. Use landmarks (door placement, garage, roofline, deck, chimneys, siding) to match windows across photos.
3. For each unique opening, pick the clearest view across all photos to perform the section count.
4. If unsure whether two windows are the same, assume they are the same (to avoid double counting) and note this uncertainty in your analysis.

GRID DETECTION & ANTI-UNDERCOUNT RULES:
Reflections and shadows can create fake lines; at the same time, real muntins can look "decorative." Only ignore a line when it is clearly an illusion. Count a division as a true divider when ANY of these apply:
- The line visibly connects to the frame edge on both ends.
- The line is consistent in width, spacing, and alignment with other grid lines.
- The pattern matches common residential grids (1x1, 2x1, 3x1, 2x2, 3x2, 3x3, 4x2, etc.) or matches other windows on the same wall.
- It appears across multiple angles or photos OR casts a slight shadow/edge.
Do NOT count lines that are:
- Only visible in a single photo as glare or reflection.
- Internal blinds, curtains, screens, or mesh.
- Water streaks, tape, or random dirt.

ROW CHECK (DO NOT MISS HORIZONTAL RAILS):
Most undercounts happen because horizontal splits are missed. For each window:
1. Identify vertical columns first.
2. Then force a row check — look top to bottom for a horizontal rail dividing upper and lower sashes. Many windows are split both ways.
3. Total sections = columns x rows. If the top sash is divided but the bottom is not (or vice versa), count accordingly.

PARTIAL & OBSTRUCTED WINDOWS:
If a window is partially hidden (by a tree, furniture, snow cover, propane tank, etc.):
- Count the visible sections.
- If the window size/type matches a nearby fully visible window on the same wall, infer the hidden rows or columns to match it and mention this inference in your analysis.
- If only a small portion is visible and no matching window exists, assume at least 1 section; increase the count only if the frame lines strongly suggest more.

STORY IDENTIFICATION (STRICT):
Classify the building stories based on visible full floors:
- "sections_1st_base" for the ground level. Raised foundations or split levels still count as 1st unless you see a distinct upper facade.
- "sections_2nd_story" only when a complete second living level is clearly visible (full set of windows separated by a floor line).
- "sections_3rd_story" only if a full third level exists.
If uncertain, classify conservatively as 1st. "stories" must be 1, 2, or 3.

SYMMETRY INFERENCE (USE WITH CAUTION):
Use symmetry to infer counts only when:
- One side of a facade is fully visible, and the other is partly blocked, AND
- Architectural features (rooflines, trim, spacing) strongly indicate a mirror image.
If you infer symmetry, note exactly which windows were inferred in the analysis.

OBSTRUCTIONS & FULL-WIDTH SCANNING:
Do not stop scanning because of trees, tanks, AC units, shelters, or shadows. Scan each facade left-to-right, top-to-bottom. Include garage windows, sidelights, transoms, and basement openings.

COUNTING METHODOLOGY (MANDATORY THREE PASSES):
- PASS 1: Global Inventory — Identify all unique openings across all photos. Do NOT finalize counts yet.
- PASS 2: Per-Opening Detail Count — For each unique opening, zoom in on the clearest view. Apply column x row grid math, verify horizontal rails, assign to correct category.
- PASS 3: Miss Audit — Re-check basement windows, door lites/sidelights/transoms, garage windows. Ensure no double counting across photos.

FINAL JSON OUTPUT (MANDATORY SHAPE):
Return only this object:
{
  "analysis": "Briefly describe which photos were used for the primary counts, what overlaps were avoided, any symmetry or inference used, and any glare or obstruction uncertainties.",
  "confidence": "high/medium/low",
  "final_counts": {
    "sections_3rd_story": 0,
    "sections_2nd_story": 0,
    "sections_1st_base": 0,
    "door_glass_section": 0
  },
  "stories": 1
}

Do not add any other keys or text outside the JSON.`;

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
  const confidenceRaw = typeof data?.confidence === "string" ? data.confidence.toLowerCase() : "medium";
  const confidence: EstimateSchema["confidence"] =
    confidenceRaw === "high" || confidenceRaw === "medium" || confidenceRaw === "low"
      ? confidenceRaw
      : "medium";

  const storyRaw = toNonNegativeInt(data?.stories);
  const stories: EstimateSchema["stories"] = storyRaw >= 3 ? 3 : storyRaw >= 2 ? 2 : 1;

  return {
    analysis: typeof data?.analysis === "string" ? data.analysis : "",
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
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server configuration error: Missing OpenAI API Key" },
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
        const base64 = buffer.toString("base64");
        return [
          { type: "text" as const, text: `Image ${index + 1}:` },
          {
            type: "image_url" as const,
            image_url: {
              url: `data:${file.type};base64,${base64}`,
              detail: "high" as const,
            },
          },
        ];
      })
    );

    const client = new OpenAI({ apiKey });

    const startedAt = Date.now();
    const OVERALL_TIMEOUT_MS = 55000;
    const remainingMs = () => OVERALL_TIMEOUT_MS - (Date.now() - startedAt);

    async function runPass(userText: string) {
      const ms = remainingMs();
      if (ms <= 0) throw new Error("Request Timeout");

      const result = await Promise.race([
        client.chat.completions.create({
          model: "gpt-5.2",
          max_completion_tokens: 2048,
          messages: [
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

    // PASS 1 (FULL COUNT)
    const pass1 = await runPass(
      "PASS 1 FULL COUNT: Build a master map of all unique openings across all images and count all glass sections. Prioritize recall and reconstruct occluded openings. Return raw JSON only in the exact required schema."
    );

    // PASS 2 (AUDIT ONLY)
    let pass2: EstimateSchema | null = null;
    try {
      pass2 = await runPass(
        `PASS 2 AUDIT ONLY: Use the images again and this PASS 1 JSON as baseline:\n${JSON.stringify(pass1)}\nDo NOT recount everything. Only find missed items: occluded/shelter/tree/shadow openings, hidden twin doors/windows inferred by symmetry/trim, basement windows, sliders counted as 1 instead of 2 panels, door glass, and missed horizontal rows on grid windows. Return corrected JSON in the SAME schema. In analysis, explicitly mention inferred hidden openings (example: hidden door behind shelter counted as 2 sections).`
      );
    } catch {
      pass2 = null;
    }

    let finalEstimate: EstimateSchema = pass1;

    if (pass2) {
      const merged = mergePass1Pass2(pass1, pass2);
      const sectionDiff = Math.abs(pass1.final_counts.sections_1st_base - pass2.final_counts.sections_1st_base);
      const doorDiff = Math.abs(pass1.final_counts.door_glass_section - pass2.final_counts.door_glass_section);
      const needsPass3 = sectionDiff >= 3 || doorDiff >= 3;

      if (needsPass3) {
        try {
          finalEstimate = await runPass(
            `PASS 3 ARBITRATION: Choose the most accurate totals from these two candidates using the images as source of truth. PASS 1:\n${JSON.stringify(pass1)}\nPASS 2:\n${JSON.stringify(pass2)}\nFocus on resolving large differences in sections_1st_base and door_glass_section while preserving high recall. Return only the final JSON in the required schema and explain your brief decision in analysis.`
          );
        } catch {
          finalEstimate = merged;
        }
      } else {
        finalEstimate = merged;
      }
    }

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
    const message = error.message || "An unexpected error occurred.";
    const status = message.includes("Timeout") ? 504 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
