const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Added safety limits to prevent memory leaks from massive uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max per image
});

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

app.get('/', (req, res) => {
  res.status(200).send('Microservice is healthy');
});

// --- MODEL URLS ---
const urlG3 = 'https://aiplatform.googleapis.com/v1/projects/gen-lang-client-0569585575/locations/global/publishers/google/models/gemini-3-flash-preview:generateContent';
const urlG25 = 'https://aiplatform.googleapis.com/v1/projects/gen-lang-client-0569585575/locations/global/publishers/google/models/gemini-2.5-pro:generateContent';

app.post('/estimate', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    // --- BRAIN 1: PANES (WITH LOOP KILLERS) ---
    const systemInstruction = `You are a highly accurate expert window pane counter. Analyze this photo to count all window panes.

CRITICAL VISUAL RULES:
- FRAMES & SPLITS: Count every distinct glass pane separated by a physical frame. Do not group them. Look closely at large window groupings: if a frame splits the glass, count each distinct pane.
- IGNORE DECORATIVE GRIDS (MUNTINS): Completely ignore thin, decorative grids sitting inside the glass. CRITICAL: If a window has grids on the top half but clear glass on the bottom half, count the top section and bottom section as distinct panes separated by the thick structural frame between them.
- IGNORE SCREENS & SCREENED PORCHES: Completely ignore mesh insect screens and the structural panels of screened-in porches. Only count physical, solid glass window panes.
- IGNORE RAILINGS & FENCES: If a window is behind a deck railing, balcony, or fence, DO NOT mistake the railing bars for window frames. Ignore the railing completely and count the structural glass panes behind it.
- OBSTRUCTIONS & SHADOWS: Do not miss windows that are partially hidden, even if you only see a small part of a window because of an obstruction, count the visible panes as you would any other window.
- WINTER SHELTERS (IGLOOS): If an entrance is covered by a plastic/canvas winter shelter, DO NOT count the plastic seams or panels as glass. Assume 1 'entry_door_pane' for the hidden door, and only count actual glass windows you can explicitly see.
- BASEMENT: Look closely at the foundation line to count distinct panes accurately (e.g., a standard sliding basement unit = 2 panes).
- TRANSOMS & SIDELIGHTS: Windows directly above doors (transoms) or immediately next to doors (sidelights) must be counted separately as individual panes. Map them to 'pane_1st_base'.
- DOORS (PATIO): Count every large glass pane of sliding patio doors as 'patio_door_pane' (e.g., a standard 2-panel sliding door = 2 panes).
- DOORS (ENTRY): Assume 1 glass pane for every entry door found, count as 'entry_door_pane'.

SPATIAL MAPPING (Top-Down):
- 3rd Story -> 'pane_3rd_story'
- 2nd Story -> 'pane_2nd_story'
- Main/Basement -> 'pane_1st_base'

OUTPUT FORMAT:
Return JSON ONLY. Use the 'analysis' field to physically tally the panes you see in this specific image before outputting the final counts. Do not generate text outside the JSON.
{
  "analysis": "Top floor left to right: 3, 2. Main floor: 4, 2...",
  "window_counts": { 
    "pane_3rd_story": 0, 
    "pane_2nd_story": 0, 
    "pane_1st_base": 0, 
    "patio_door_pane": 0,
    "entry_door_pane": 0 
  },
  "stories": 1
}`;

// --- BRAIN 2: ARCHITECTURAL VIBE (NEW 5-TIER) ---
    const systemInstructionGroups = `You are a specialized architectural assessor for a window cleaning company. 
Your ONLY job is to look at the overall house and categorize the AVERAGE size and density of the window panes. Do not count them. Give me the general "vibe" of the glass using a 5-tier scale.

CRITICAL VISUAL RULE - FLAT GRIDS VS. STRUCTURAL SASHES: 
- IGNORE FLAT GRIDS: If you see thin, decorative grids (muntins) trapped flat inside the glass, completely ignore them. They do not slow down a squeegee. Do not increase the density category just because of flat internal grids.
- COUNT PHYSICAL SPLITS: Thick horizontal or vertical frames (sashes) that physically split the glass into a top and bottom half DO slow down a squeegee.

CATEGORIES (Choose exactly one):
1. "dense": Intricate structural transoms, TRUE French doors with physical frames splitting the glass, arches. High squeegee difficulty.
2. "normal_dense": Windows with physical complications like thick structural sashes splitting the top and bottom glass (like standard double-hung windows), half-grids (fractional grilles), or asymmetrical splits. Slower than average.
3. "normal": Simple clear casements or basic 2-pane sliders. (If a simple window has FLAT internal grids, it stays 'normal' because the glass surface is flat).
4. "normal_large": Larger than average clear windows, big sliding doors. Faster than average.
5. "large_open": Massive floor-to-ceiling architectural glass, A-frames. Very fast wide squeegee swipes.

OUTPUT FORMAT:
Return JSON ONLY. Use the 'analysis' field to briefly explain your guess.
{
  "analysis": "Windows have flat internal grids (ignored), but thick horizontal sashes physically split the top and bottom panes. Averaging to normal_dense.",
  "window_counts": {
    "pane_vibe": "normal_dense"
  }
}`;

    const MAX_RETRIES = 2; 
    const CONCURRENCY_LIMIT = 2; 
    const resultsArray = [];

    // THE BATCHING ENGINE
    for (let i = 0; i < req.files.length; i += CONCURRENCY_LIMIT) {
      const batchFiles = req.files.slice(i, i + CONCURRENCY_LIMIT);
      
      const batchPromises = batchFiles.map(async (file, index) => {
        const globalIndex = i + index; 
        let attempt = 0;
        
        while (attempt <= MAX_RETRIES) {
          // THE ZOMBIE KILLER (60s timeout for the dual-fetch)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);

          try {
            const inlineData = { mime_type: file.mimetype, data: file.buffer.toString('base64') };
            const safetySettings = [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ];
            const generationConfig = { responseMimeType: "application/json", temperature: 0.0 };

            // Payload for Gemini 3 (Panes)
            const bodyPanes = {
              systemInstruction: { parts: [{ text: systemInstruction }] },
              contents: [{ role: 'user', parts: [{ inline_data: inlineData }] }],
              safetySettings, generationConfig
            };

            // Payload for Gemini 2.5 (Groups/Vibe)
            const bodyGroups = {
              systemInstruction: { parts: [{ text: systemInstructionGroups }] },
              contents: [{ role: 'user', parts: [{ inline_data: inlineData }] }],
              safetySettings, generationConfig
            };

            const fetchOptions = {
              method: 'POST',
              signal: controller.signal,
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'X-Vertex-AI-LLM-Request-Type': 'shared',
                'X-Vertex-AI-LLM-Shared-Request-Type': 'priority'
              }
            };

            // FIRE BOTH MODELS AT ONCE
            const [resPanes, resGroups] = await Promise.all([
              fetch(urlG3, { ...fetchOptions, body: JSON.stringify(bodyPanes) }),
              fetch(urlG25, { ...fetchOptions, body: JSON.stringify(bodyGroups) })
            ]);

            clearTimeout(timeoutId);

            if (!resPanes.ok) throw new Error(`G3 HTTP Error: ${resPanes.status}`);
            if (!resGroups.ok) throw new Error(`G25 HTTP Error: ${resGroups.status}`);

            const dataPanes = await resPanes.json();
            const dataGroups = await resGroups.json();

            let textPanes = dataPanes.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            let textGroups = dataGroups.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

            const parsedPanes = JSON.parse(textPanes.replace(/```json|```/g, '').trim());
            const parsedGroups = JSON.parse(textGroups.replace(/```json|```/g, '').trim());

            // SEPARATE THE BRAIN ANALYSIS
            return {
              analysis_g3: parsedPanes.analysis || "No pane analysis.",
              analysis_g25: parsedGroups.analysis || "No vibe analysis.",
              window_counts: {
                ...parsedPanes.window_counts,
                pane_vibe: parsedGroups.window_counts?.pane_vibe || "normal"
              },
              stories: parsedPanes.stories || 1
            };

          } catch (error) {
            clearTimeout(timeoutId);
            attempt++;
            const isTimeout = error.name === 'AbortError';
            console.warn(`[Image ${globalIndex + 1}] Attempt ${attempt} failed: ${isTimeout ? '60s Timeout (Zombie Killed)' : error.message}`);
            
            if (attempt > MAX_RETRIES) {
              console.error(`[Image ${globalIndex + 1}] All ${MAX_RETRIES + 1} attempts failed. Giving up.`);
              return { window_counts: { pane_vibe: "normal" }, stories: 1, analysis_g3: `Img ${globalIndex + 1} analysis failed.`, analysis_g25: `Img ${globalIndex + 1} analysis failed.` };
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      });

      const batchResults = await Promise.all(batchPromises);
      resultsArray.push(...batchResults);
      
      if (i + CONCURRENCY_LIMIT < req.files.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const finalTotals = {
      analysis_g3: "G3 Pane Counting: ",
      analysis_g25: "G25 Vibe Assessment: ",
      window_counts: {
        pane_3rd_story: 0,
        pane_2nd_story: 0,
        pane_1st_base: 0,
        patio_door_pane: 0,
        entry_door_pane: 0,
        pane_vibe: "normal" // REPLACED GROUPS WITH VIBE
      },
      stories: 1
    };

    // --- VIBE WEIGHTING ENGINE ---
    const vibeWeights = {
      "dense": 1,
      "normal_dense": 2,
      "normal": 3,
      "normal_large": 4,
      "large_open": 5
    };
    const weightToVibe = {
      1: "dense",
      2: "normal_dense",
      3: "normal",
      4: "normal_large",
      5: "large_open"
    };
    
    let totalVibeWeight = 0;
    let validVibeCount = 0;

    resultsArray.forEach((result, index) => {
      if (result.analysis_g3) finalTotals.analysis_g3 += `[Img ${index + 1}: ${result.analysis_g3}] `;
      if (result.analysis_g25) finalTotals.analysis_g25 += `[Img ${index + 1}: ${result.analysis_g25}] `;

      if (result.window_counts) {
        finalTotals.window_counts.pane_3rd_story += (result.window_counts.pane_3rd_story || 0);
        finalTotals.window_counts.pane_2nd_story += (result.window_counts.pane_2nd_story || 0);
        finalTotals.window_counts.pane_1st_base += (result.window_counts.pane_1st_base || 0);
        finalTotals.window_counts.patio_door_pane += (result.window_counts.patio_door_pane || 0);
        finalTotals.window_counts.entry_door_pane += (result.window_counts.entry_door_pane || 0);
        
        // Tally the vibe weights
        if (result.window_counts.pane_vibe) {
          totalVibeWeight += vibeWeights[result.window_counts.pane_vibe] || 3; // Default to 3 (normal)
          validVibeCount++;
        }
      }
      
      if (result.stories > finalTotals.stories) {
        finalTotals.stories = result.stories;
      }
    });

    // Calculate the overall house vibe average
    if (validVibeCount > 0) {
      const avgWeight = Math.round(totalVibeWeight / validVibeCount);
      finalTotals.window_counts.pane_vibe = weightToVibe[avgWeight] || "normal";
    }

    res.json(finalTotals);

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});