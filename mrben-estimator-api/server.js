const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');
const { Storage } = require('@google-cloud/storage'); 

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

const gcs = new Storage();
const BUCKET_NAME = 'mrben-estimator-images-qc'; 

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

    // --- BRAIN 1: PANES ---
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

SPATIAL MAPPING & FORMAT (ANTI-LOOPING):
- 3rd Story -> 'pane_3rd_story'
- 2nd Story -> 'pane_2nd_story'
- Main/Basement -> 'pane_1st_base'
- IGNORE GEOMETRIC NOISE: Do not look at siding lines, fences, or deck spindles.
- NO SENTENCES: Write a strict, grouped tally to prevent repetitive looping.

OUTPUT FORMAT:
Return JSON ONLY. Do not generate text outside the JSON. Use the 'analysis' field to physically tally the panes you see in this specific image before outputting the final counts. Format it exactly like this example:
{
  "analysis": "2nd Story: 2x 2-pane. Main: 1x 4-pane. Basement: 2x 2-pane sliders.",
  "window_counts": { 
    "pane_3rd_story": 0, 
    "pane_2nd_story": 0, 
    "pane_1st_base": 0, 
    "patio_door_pane": 0,
    "entry_door_pane": 0 
  },
  "stories": 1
}`;

// --- BRAIN 2: ARCHITECTURAL VIBE ---
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

    const CONCURRENCY_LIMIT = 2; 
    const resultsArray = [];

    // THE BATCHING ENGINE
    for (let i = 0; i < req.files.length; i += CONCURRENCY_LIMIT) {
      const batchFiles = req.files.slice(i, i + CONCURRENCY_LIMIT);
      
      const batchPromises = batchFiles.map(async (file, index) => {
        const globalIndex = i + index; 
        const originalFileName = file.originalname || `Image ${globalIndex + 1}`;
        
        const fileName = `estimate-${Date.now()}-${globalIndex}.jpg`;
        const gcsFile = gcs.bucket(BUCKET_NAME).file(fileName);
        
        await gcsFile.save(file.buffer, { metadata: { contentType: file.mimetype } });
        const gcsUri = `gs://${BUCKET_NAME}/${fileName}`;
        
        const safetySettings = [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ];
        const generationConfig = { responseMimeType: "application/json", temperature: 0.0 };

        const bodyPanes = {
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ file_data: { mime_type: file.mimetype, file_uri: gcsUri } }] }],
          safetySettings, generationConfig
        };

        const bodyGroups = {
          systemInstruction: { parts: [{ text: systemInstructionGroups }] },
          contents: [{ role: 'user', parts: [{ file_data: { mime_type: file.mimetype, file_uri: gcsUri } }] }],
          safetySettings, generationConfig
        };

        const fetchOptions = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Vertex-AI-LLM-Request-Type': 'shared',
            'X-Vertex-AI-LLM-Shared-Request-Type': 'priority'
          }
        };

        let parsedPanes = null;
        let parsedGroups = null;

        try {
          // ==========================================
          // TASK 1: THE 30-SECOND FLASH TRAP
          // ==========================================
          const controllerG3 = new AbortController();
          const timeoutG3 = setTimeout(() => controllerG3.abort(), 30000); // Strict 30s
          
          try {
            const resPanes = await fetch(urlG3, { ...fetchOptions, signal: controllerG3.signal, body: JSON.stringify(bodyPanes) });
            clearTimeout(timeoutG3);
            if (!resPanes.ok) throw new Error(`G3 HTTP Error: ${resPanes.status}`);
            
            const dataPanes = await resPanes.json();
            const textPanes = dataPanes.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            parsedPanes = JSON.parse(textPanes.replace(/```json|```/g, '').trim());
            
          } catch (error) {
            clearTimeout(timeoutG3);
            const isTimeout = error.name === 'AbortError';
            console.warn(`[${originalFileName}] Flash 3 failed (${isTimeout ? '30s Timeout' : error.message}). Deploying Gemini 2.5 Pro Rescue...`);
            
            // ==========================================
            // TASK 1.5: THE PRO RESCUE (Fallback)
            // ==========================================
            const controllerG25Fallback = new AbortController();
            const timeoutG25Fallback = setTimeout(() => controllerG25Fallback.abort(), 60000); // Give Pro 60s to save it
            
            const resPanesFallback = await fetch(urlG25, { ...fetchOptions, signal: controllerG25Fallback.signal, body: JSON.stringify(bodyPanes) });
            clearTimeout(timeoutG25Fallback);
            if (!resPanesFallback.ok) throw new Error(`G25 Fallback HTTP Error: ${resPanesFallback.status}`);
            
            const dataPanesFallback = await resPanesFallback.json();
            const textPanesFallback = dataPanesFallback.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            parsedPanes = JSON.parse(textPanesFallback.replace(/```json|```/g, '').trim());
            parsedPanes.analysis = "(RESCUED BY PRO) " + (parsedPanes.analysis || "");
          }

          // ==========================================
          // TASK 2: ARCHITECTURAL VIBE (Independent)
          // ==========================================
          const controllerVibe = new AbortController();
          const timeoutVibe = setTimeout(() => controllerVibe.abort(), 60000);
          
          try {
            const resGroups = await fetch(urlG25, { ...fetchOptions, signal: controllerVibe.signal, body: JSON.stringify(bodyGroups) });
            clearTimeout(timeoutVibe);
            if (!resGroups.ok) throw new Error(`G25 Vibe HTTP Error: ${resGroups.status}`);
            
            const dataGroups = await resGroups.json();
            const textGroups = dataGroups.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            parsedGroups = JSON.parse(textGroups.replace(/```json|```/g, '').trim());
          } catch (vibeError) {
            clearTimeout(timeoutVibe);
            console.warn(`[${originalFileName}] Vibe check failed. Defaulting to normal.`);
            parsedGroups = { window_counts: { pane_vibe: "normal" }, analysis: "Vibe check defaulted." };
          }

          // Cleanup GCS on success
          try { await gcsFile.delete(); } catch (e) { /* ignore */ }

          return {
            status: "success",
            imageName: originalFileName,
            analysis_g3: parsedPanes.analysis || "No pane analysis.",
            analysis_g25: parsedGroups.analysis || "No vibe analysis.",
            window_counts: {
              ...parsedPanes.window_counts,
              pane_vibe: parsedGroups.window_counts?.pane_vibe || "normal"
            },
            stories: parsedPanes.stories || 1
          };

        } catch (fatalError) {
          // If the rescue mission ALSO fails, we officially log the image as dead.
          try { await gcsFile.delete(); } catch (e) { /* ignore */ }
          
          console.error(`[${originalFileName}] FATAL: Both models failed. ${fatalError.message}`);
          return { 
            status: "failed", 
            imageName: originalFileName,
            reason: fatalError.message
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      resultsArray.push(...batchResults);
      
      if (i + CONCURRENCY_LIMIT < req.files.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const finalTotals = {
      analysis_g3: "Pane Counting: ",
      analysis_g25: "Vibe Assessment: ",
      window_counts: {
        pane_3rd_story: 0, pane_2nd_story: 0, pane_1st_base: 0,
        patio_door_pane: 0, entry_door_pane: 0, pane_vibe: "normal" 
      },
      stories: 1,
      failed_images: []
    };

    const vibeWeights = { "dense": 1, "normal_dense": 2, "normal": 3, "normal_large": 4, "large_open": 5 };
    const weightToVibe = { 1: "dense", 2: "normal_dense", 3: "normal", 4: "normal_large", 5: "large_open" };
    
    let totalVibeWeight = 0;
    let validVibeCount = 0;

    resultsArray.forEach((result, index) => {
      if (result.status === "failed") {
        finalTotals.failed_images.push({ file: result.imageName, error: result.reason });
        return; 
      }

      if (result.analysis_g3) finalTotals.analysis_g3 += `[${result.imageName}: ${result.analysis_g3}] `;
      if (result.analysis_g25) finalTotals.analysis_g25 += `[${result.imageName}: ${result.analysis_g25}] `;

      if (result.window_counts) {
        finalTotals.window_counts.pane_3rd_story += (result.window_counts.pane_3rd_story || 0);
        finalTotals.window_counts.pane_2nd_story += (result.window_counts.pane_2nd_story || 0);
        finalTotals.window_counts.pane_1st_base += (result.window_counts.pane_1st_base || 0);
        finalTotals.window_counts.patio_door_pane += (result.window_counts.patio_door_pane || 0);
        finalTotals.window_counts.entry_door_pane += (result.window_counts.entry_door_pane || 0);
        
        if (result.window_counts.pane_vibe) {
          totalVibeWeight += vibeWeights[result.window_counts.pane_vibe] || 3;
          validVibeCount++;
        }
      }
      
      if (result.stories > finalTotals.stories) { finalTotals.stories = result.stories; }
    });

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