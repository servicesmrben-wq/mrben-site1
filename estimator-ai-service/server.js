// 📦 DEPENDENCIES & SETUP
require('tsx/cjs');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');
const { Storage } = require('@google-cloud/storage'); 
const { performance } = require('perf_hooks'); 
// const nodemailer = require('nodemailer'); // 📧 Kept for future use

// ⚖️ SHARED PRICING SOURCE OF TRUTH
const pricing = require('./pricing');

/* 📧 NODEMAILER SETUP (Commented out for future use)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
}); 
*/

// 🌐 EXPRESS APP INIT
const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// 📁 MULTER MEMORY STORAGE (Limit: 20MB per file)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 } 
});

// 🔐 GOOGLE CLOUD AUTHENTICATION
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

// ☁️ GCS BUCKET SETUP
const gcs = new Storage();
const BUCKET_NAME = 'mrben-estimator-images-qc'; 

// 🩺 HEALTH CHECK ENDPOINT
app.get('/', (req, res) => {
  res.status(200).send('Microservice is healthy');
});

// 🔗 MODEL URLS gemini-3.1-flash-lite-preview | gemini-3-flash-preview | gemini-3.1-pro-preview
const urlG3 = 'https://aiplatform.googleapis.com/v1/projects/gen-lang-client-0569585575/locations/global/publishers/google/models/gemini-3.1-pro-preview:generateContent';
const urlG25 = 'https://aiplatform.googleapis.com/v1/projects/gen-lang-client-0569585575/locations/global/publishers/google/models/gemini-2.5-pro:generateContent';

// 🚀 MAIN ESTIMATION ROUTE
app.post('/estimate', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // 🔑 GET ACCESS TOKEN
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    // 🧠 BRAIN 1: PANES (System Instruction)
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

    // 🧠 BRAIN 2: ARCHITECTURAL VIBE (System Instruction)
const systemInstructionGroups = `You are a specialized architectural assessor for a window cleaning company. 
Your ONLY job is to look at the overall house and categorize the AVERAGE size and density of the window panes. Do not count them. Give me the general "vibe" of the glass using a 6-tier scale.

CRITICAL VISUAL RULES - SIZE VS. SPLITS: 
- IGNORE FLAT GRIDS: If you see thin, decorative grids (muntins) trapped flat inside the glass, completely ignore them. They do not slow down a squeegee.
- SIZE OVERRIDES SPLITS (THE MEGA-PANE RULE): Massive, two-story architectural window walls or huge floor-to-ceiling panes bypass the density penalty because huge individual panes are fast to clean ('large_open').
- THE ASYMMETRICAL PENALTY (TRANSOMS & AWNINGS): If a window is generally large, BUT it has thick structural sashes creating smaller adjacent panes (like a large picture window with a smaller rectangular awning pane below it, or transoms above a door), it is NO LONGER a fast 'normal_large' window. The small split sections require detailed squeegee work, dropping it to 'normal_dense'.

CATEGORIES (Choose exactly one):
1. "very_dense": Intricate structural transoms, TRUE French doors with many tiny physical frames splitting the glass, complex arches. Maximum squeegee difficulty.
2. "dense": Houses with a mix of highly split windows, garage doors with multiple small separate panes, or standard-sized windows physically divided into 3 or more SMALL sections. Very slow squeegee work.
3. "normal_dense": Windows with physical complications like a single thick structural sash splitting the top and bottom glass, half-grids, or ASYMMETRICAL SPLITS (e.g., a large main window with a distinct smaller pane structurally framed above or below it, or sliding doors with transoms). Slower than average.
4. "normal": Simple clear casements or basic 2-pane sliders. (If a simple window has FLAT internal grids, it stays 'normal' because the glass surface is flat).
5. "normal_large": Larger than average clear windows, big sliding doors. These must be entirely clear or symmetrically massive, without small tricky split panes.
6. "large_open": Massive floor-to-ceiling architectural glass, A-frames, or massive 2-story window walls. Very fast wide squeegee swipes.

OUTPUT FORMAT:
Return JSON ONLY. The 'analysis' field MUST START with the exact category name in brackets, followed by a brief explanation.
{
  "analysis": "[normal_dense] Windows are large but have structural horizontal sashes creating smaller awning panes at the bottom.",
  "window_counts": {
    "pane_vibe": "normal_dense"
  }
}`;

    // 🚦 CONCURRENCY & BATCHING ENGINE
    const CONCURRENCY_LIMIT = 2; 
    const resultsArray = [];

    // 🔄 START BATCH LOOP
    for (let i = 0; i < req.files.length; i += CONCURRENCY_LIMIT) {
      const batchFiles = req.files.slice(i, i + CONCURRENCY_LIMIT);
      
      const batchPromises = batchFiles.map(async (file, index) => {
        const startTime = performance.now(); // ⏱️ START STOPWATCH
        const globalIndex = i + index; 
        const originalFileName = file.originalname || `Image ${globalIndex + 1}`;
        
        // ☁️ UPLOAD TO GOOGLE CLOUD STORAGE
        const fileName = `estimate-${Date.now()}-${globalIndex}.jpg`;
        const gcsFile = gcs.bucket(BUCKET_NAME).file(fileName);
        
        await gcsFile.save(file.buffer, { metadata: { contentType: file.mimetype } });
        const gcsUri = `gs://${BUCKET_NAME}/${fileName}`;
        
        // 🛡️ SAFETY SETTINGS & CONFIG
        const safetySettings = [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
        ];
        const generationConfig = { responseMimeType: "application/json", temperature: 0.0 };

        // 📝 PREPARE PAYLOADS
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
          // ⚡ TASK 1: THE 25-SECOND FLASH TRAP
          // ==========================================
          const controllerG3 = new AbortController();
          const timeoutG3 = setTimeout(() => controllerG3.abort(), 120000); // ⏱️ Updated to 120000ms (2 minutes)
          
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
            // 📝 Updated the log message to reflect the new 120s limit
            console.warn(`⚠️ [${originalFileName}] Flash 3 failed (${isTimeout ? '120s Timeout' : error.message}). Deploying Gemini 2.5 Pro Rescue...`);
            
            // ==========================================
            // 🚑 TASK 1.5: THE PRO RESCUE (Fallback)
            // ==========================================
            const controllerG25Fallback = new AbortController();
            const timeoutG25Fallback = setTimeout(() => controllerG25Fallback.abort(), 60000); // 60s rescue window
            
            const resPanesFallback = await fetch(urlG25, { ...fetchOptions, signal: controllerG25Fallback.signal, body: JSON.stringify(bodyPanes) });
            clearTimeout(timeoutG25Fallback);
            if (!resPanesFallback.ok) throw new Error(`G25 Fallback HTTP Error: ${resPanesFallback.status}`);
            
            const dataPanesFallback = await resPanesFallback.json();
            const textPanesFallback = dataPanesFallback.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            parsedPanes = JSON.parse(textPanesFallback.replace(/```json|```/g, '').trim());
            parsedPanes.analysis = "🦸‍♂️ (RESCUED BY PRO) " + (parsedPanes.analysis || "");
          }

          // ==========================================
          // 🎭 TASK 2: ARCHITECTURAL VIBE (Independent)
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
            console.warn(`⚠️ [${originalFileName}] Vibe check failed. Defaulting to normal.`);
            parsedGroups = { window_counts: { pane_vibe: "normal" }, analysis: "Vibe check defaulted." };
          }

          // 🧹 CLEANUP: DELETE FILE FROM GCS
          try { await gcsFile.delete(); } catch (e) { /* ignore */ }

          // 🛑 STOP STOPWATCH & CALCULATE
          const endTime = performance.now(); 
          const durationSec = ((endTime - startTime) / 1000).toFixed(1); 

          // ✅ RETURN SUCCESS FOR THIS IMAGE
          return {
            status: "success",
            imageName: originalFileName,
            analysis_g3: parsedPanes.analysis || "No pane analysis.",
            analysis_g25: parsedGroups.analysis || "No vibe analysis.",
            window_counts: {
              ...parsedPanes.window_counts,
              pane_vibe: parsedGroups.window_counts?.pane_vibe || "normal"
            },
            stories: parsedPanes.stories || 1,
            durationSec: durationSec 
          };

        } catch (fatalError) {
          // 💀 FATAL ERROR: BOTH MODELS FAILED
          try { await gcsFile.delete(); } catch (e) { /* ignore */ }
          
          console.error(`❌ [${originalFileName}] FATAL: Both models failed. ${fatalError.message}`);
          return { 
            status: "failed", 
            imageName: originalFileName,
            reason: fatalError.message
          };
        }
      });

      // ⏳ WAIT FOR BATCH TO FINISH
      const batchResults = await Promise.all(batchPromises);
      resultsArray.push(...batchResults);
      
      // 🚦 THROTTLE BETWEEN BATCHES (1 Second)
      if (i + CONCURRENCY_LIMIT < req.files.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // 🧮 FINAL TOTALS AGGREGATION
    const finalTotals = {
      images_count: req.files.length,
      average_vibe_multiplier: 1.0,
      analysis_g3: "PANE COUNTING:\n",
      analysis_g25: "VIBE ASSESSMENT:\n",
      window_counts: {
        pane_3rd_story: 0, pane_2nd_story: 0, pane_1st_base: 0,
        patio_door_pane: 0, entry_door_pane: 0, pane_vibe: "normal",
        image_vibes: {}
      },
      stories: 1,
      failed_images: []
    };
    
    let totalVibeMultiplier = 0;
    let validVibeCount = 0;

    // 📊 TALLY RESULTS
    resultsArray.forEach((result, index) => {
      if (result.status === "failed") {
        finalTotals.failed_images.push({ file: result.imageName, error: result.reason });
        return; 
      }

      finalTotals.analysis_g3 += `\n[${result.imageName}] (took ${result.durationSec}s):\n${result.analysis_g3}\n`;
      finalTotals.analysis_g25 += `\n[${result.imageName}] (took ${result.durationSec}s):\n${result.analysis_g25}\n`;

      if (result.window_counts) {
        finalTotals.window_counts.pane_3rd_story += (result.window_counts.pane_3rd_story || 0);
        finalTotals.window_counts.pane_2nd_story += (result.window_counts.pane_2nd_story || 0);
        finalTotals.window_counts.pane_1st_base += (result.window_counts.pane_1st_base || 0);
        finalTotals.window_counts.patio_door_pane += (result.window_counts.patio_door_pane || 0);
        finalTotals.window_counts.entry_door_pane += (result.window_counts.entry_door_pane || 0);
        
        if (result.window_counts.pane_vibe) {
          totalVibeMultiplier += pricing.VIBE_MULTIPLIERS[result.window_counts.pane_vibe] || 1.0;
          validVibeCount++;
          finalTotals.window_counts.image_vibes[result.imageName] = result.window_counts.pane_vibe;
        }
      }
      
      if (result.stories > finalTotals.stories) { finalTotals.stories = result.stories; }
    });

    // ⚖️ CALCULATE PRECISE AVERAGE VIBE
    if (validVibeCount > 0) {
      const avgMultiplier = totalVibeMultiplier / validVibeCount;
      finalTotals.average_vibe_multiplier = parseFloat(avgMultiplier.toFixed(4));
      
      // For UI/V1 compatibility, find the "closest" named vibe
      const vibeKeys = Object.keys(pricing.VIBE_MULTIPLIERS);
      const closestVibe = vibeKeys.reduce((prev, curr) => {
        return Math.abs(pricing.VIBE_MULTIPLIERS[curr] - avgMultiplier) < Math.abs(pricing.VIBE_MULTIPLIERS[prev] - avgMultiplier) ? curr : prev;
      });
      finalTotals.window_counts.pane_vibe = closestVibe;
    }

    // Add spacing for combined viewing
    finalTotals.analysis_g3 += "\n\n\n";

    // 📤 SEND FINAL RESPONSE
    res.json(finalTotals);
  } catch (error) {
    console.error('🔥 Server Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🎧 START LISTENING
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
});