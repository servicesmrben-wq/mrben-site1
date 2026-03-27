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
const urlG25 = 'https://aiplatform.googleapis.com/v1/projects/gen-lang-client-0569585575/locations/global/publishers/google/models/gemini-2.5-flash:generateContent';

app.post('/estimate', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    // --- BRAIN 1: PANES (UNTOUCHED) ---
    const systemInstruction = `You are a highly accurate expert window pane counter. Analyze this photo to count all window panes.

CRITICAL VISUAL RULES:
- FRAMES & SPLITS: Count every distinct glass pane separated by a physical frame. Do not group them. Look closely at large window groupings: if a frame splits the glass, count each distinct pane.
- IGNORE DECORATIVE GRIDS: Do not count the tiny glass squares (muntins) inside a window. Only count the major sliding or fixed structural panes.
- IGNORE SCREENS & SCREENED PORCHES: Completely ignore mesh insect screens and the structural panels of screened-in porches.
- IGNORE RAILINGS & FENCES: If a window is behind a deck railing, balcony, or fence, DO NOT mistake the railing bars for window frames. Ignore the railing completely and count the structural glass panes behind it.
- OBSTRUCTIONS & SHADOWS: Do not miss windows that are partially hidden, even if you only see a small part of a window because of an obstruction, count the visible panes as you would any other window.
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

    // --- BRAIN 2: GROUPS (NEW) ---
    const systemInstructionGroups = `You are a specialized architectural AI. Your ONLY job is to count the overarching structural window openings (groups) in the house's exterior.

CRITICAL VISUAL RULES:
- IGNORE PANES: Completely ignore the glass, muntins, or frames splitting the window.
- WHAT IS A GROUP: Look at the siding or brick. Every distinct hole cut into the wall for a window unit is ONE group.
- BAY/BOW WINDOWS: A massive bay window with 3 or 5 internal sections is still just ONE architectural group.
- DOORS: Do not count entry or patio doors. Focus only on window openings.

OUTPUT FORMAT:
Return JSON ONLY. Use the 'analysis' field to briefly list the groupings you see before outputting the final count.
{
  "analysis": "1 large bay window left, 2 standard windows right...",
  "window_counts": {
    "window_groups": 0
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

            // Payload for Gemini 2.5 (Groups)
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

            // MERGE THE BRAINS
            return {
              analysis: `[Panes (G3): ${parsedPanes.analysis}] | [Groups (G25): ${parsedGroups.analysis}]`,
              window_counts: {
                ...parsedPanes.window_counts,
                window_groups: parsedGroups.window_counts?.window_groups || 0
              },
              stories: parsedPanes.stories || 1
            };

          } catch (error) {
            clearTimeout(timeoutId);
            attempt++;
            const isTimeout = error.name === 'AbortError';
            console.warn(`[Image ${globalIndex + 1}] Attempt ${attempt} failed: ${isTimeout ? '30s Timeout (Zombie Killed)' : error.message}`);
            
            if (attempt > MAX_RETRIES) {
              console.error(`[Image ${globalIndex + 1}] All ${MAX_RETRIES + 1} attempts failed. Giving up.`);
              return { window_counts: {}, stories: 1, analysis: `Img ${globalIndex + 1} analysis failed after retries.` };
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
      analysis: "Parallel processing complete. ",
      window_counts: {
        pane_3rd_story: 0,
        pane_2nd_story: 0,
        pane_1st_base: 0,
        patio_door_pane: 0,
        entry_door_pane: 0,
        window_groups: 0 // ADDED NEW STAT
      },
      stories: 1
    };

    resultsArray.forEach((result, index) => {
      if (result.analysis) finalTotals.analysis += `[Img ${index + 1}: ${result.analysis}] `;

      if (result.window_counts) {
        finalTotals.window_counts.pane_3rd_story += (result.window_counts.pane_3rd_story || 0);
        finalTotals.window_counts.pane_2nd_story += (result.window_counts.pane_2nd_story || 0);
        finalTotals.window_counts.pane_1st_base += (result.window_counts.pane_1st_base || 0);
        finalTotals.window_counts.patio_door_pane += (result.window_counts.patio_door_pane || 0);
        finalTotals.window_counts.entry_door_pane += (result.window_counts.entry_door_pane || 0);
        finalTotals.window_counts.window_groups += (result.window_counts.window_groups || 0); // TALLY THE GROUPS
      }
      
     if (result.stories > finalTotals.stories) {
        finalTotals.stories = result.stories;
      }
    });

    res.json(finalTotals);

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});