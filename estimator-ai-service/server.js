// 📦 DEPENDENCIES & SETUP
require('tsx/cjs');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');
const { Storage } = require('@google-cloud/storage'); 
const { performance } = require('perf_hooks'); 

// ⚖️ SHARED PRICING SOURCE OF TRUTH
const pricing = require('./pricing');

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

// 🔗 MODEL URL - Production stable endpoint for Gemini 3.5 Flash
const urlG35Flash = 'https://aiplatform.googleapis.com/v1/projects/gen-lang-client-0569585575/locations/global/publishers/google/models/gemini-3.5-flash:generateContent';

// 🚀 MAIN ESTIMATION ROUTE
app.post('/estimate', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const startTime = performance.now(); // ⏱️ START STOPWATCH FOR ENTIRE HOUSESHOT BATCH

    // 🔑 GET ACCESS TOKEN
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    // 🧠 BATCH ENGINE: SYSTEM INSTRUCTIONS
    const systemInstruction = `You are a highly accurate architectural expert for an exterior window cleaning company. 
Analyze ALL provided images of the property simultaneously to count individual panels/sections and determine the overall property vibe difficulty.

CRITICAL VISUAL RULES:
- PANELS/SECTIONS: Count every distinct window panel or section separated by a physical frame. Do not group them. Look closely at large window groupings: if a frame splits the glass, count each distinct panel/section.
- DEDUPLICATION: Compare the images closely. If a window is visible across multiple different images (e.g., a wide shot and a close-up angle of the same wall), ONLY COUNT IT ONCE. Do not double-count panels across files.
- IGNORE DECORATIVE GRIDS: Do not count tiny glass squares (muntins) trapped flat inside the glass. Only count major sliding or fixed structural sections.
- IGNORE SCREENS & RAILINGS: Completely ignore mesh insect screens, structural panels of screened-in porches, and deck balcony railings.
- TRANSOMS & SIDELIGHTS: Windows directly above doors (transoms) or immediately next to doors (sidelights) must be counted separately as individual panels. Map them to 'pane_1st_base'.
- DOORS (PATIO): Count every large glass panel of sliding patio doors as 'patio_door_pane' (e.g., a standard 2-panel sliding door = 2 panels/sections).
- DOORS (ENTRY): Assume 1 glass panel for every entry door found, count as 'entry_door_pane'.

GLOBAL ARCHITECTURAL VIBE CATEGORIES (Assign exactly one to global_pane_vibe):
- "very_dense": Intricate structural transoms, TRUE French doors with many tiny physical frames splitting the glass, complex arches. Maximum difficulty.
- "dense": Mix of highly split windows, garage doors with multiple small separate panels, or standard-sized windows physically divided into 3 or more SMALL sections.
- "normal_dense": Windows with physical complications like a single thick structural sash splitting the top/bottom glass, half-grids, or ASYMMETRICAL SPLITS (e.g., a large main window with a distinct smaller panel structurally framed above/below it, or sliding doors with transoms).
- "normal": Simple clear casements or basic 2-pane sliders. (If a simple window has FLAT internal grids, it stays 'normal' because the glass surface is flat).
- "normal_large": Larger than average clear windows, big sliding doors. These must be entirely clear or symmetrically massive, without small tricky split panels.
- "large_open": Massive floor-to-ceiling architectural glass, A-frames, or massive 2-story window walls.

OUTPUT FORMAT:
Return JSON ONLY. Do not wrap response in markdown code blocks. The output must strictly follow this exact schema. For each item in 'by_image_breakdown', provide a brief single-line explanation of what was counted in 'image_analysis'.
{
  "property_analysis": "Summary of observations across all images...",
  "global_pane_vibe": "normal_dense",
  "stories": 2,
  "by_image_breakdown": [
    {
      "image_name": "filename_example.jpg",
      "image_analysis": "2nd Story: 2x 2-panel. Main: 1x 4-panel sliders.",
      "window_counts": {
        "pane_3rd_story": 0,
        "pane_2nd_story": 2,
        "pane_1st_base": 4,
        "patio_door_pane": 0,
        "entry_door_pane": 0
      }
    }
  ]
}`;

    // 🛡️ SAFETY SETTINGS & CONFIG
    const safetySettings = [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ];
    const generationConfig = { responseMimeType: "application/json", temperature: 0.0 };

    // ☁️ ARRAY FOR TRACKING UPLOADED FILES FOR CLEANUP
    const uploadedFiles = [];
    const contentsParts = [];

    // 🔄 LOOP TO UPLOAD ALL PICTURES TO GCS & PREPARE PAYLOAD PARTS
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const originalFileName = file.originalname || `Image-${i + 1}`;
      const fileName = `estimate-${Date.now()}-${i}.jpg`;
      const gcsFile = gcs.bucket(BUCKET_NAME).file(fileName);
      
      await gcsFile.save(file.buffer, { metadata: { contentType: file.mimetype } });
      const gcsUri = `gs://${BUCKET_NAME}/${fileName}`;
      
      uploadedFiles.push(gcsFile);
      
      // Add reference details so the model can align its response to image_name
      contentsParts.push({ text: `Image Name: ${originalFileName}` });
      contentsParts.push({
        file_data: { mime_type: file.mimetype, file_uri: gcsUri }
      });
    }

    // 📝 COMPILE FINAL PAYLOAD
    const payloadBody = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: contentsParts }],
      safetySettings,
      generationConfig
    };

    // ⚡ EXECUTE MULTIMODAL INFERENCE
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); // 90s deadline for a full batch
    
    let parsedModelResponse = null;

    try {
      const response = await fetch(urlG35Flash, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Vertex-AI-LLM-Request-Type': 'shared',
          'X-Vertex-AI-LLM-Shared-Request-Type': 'priority'
        },
        signal: controller.signal,
        body: JSON.stringify(payloadBody)
      });
      
      clearTimeout(timeout);
      if (!response.ok) throw new Error(`Gemini 3.5 Flash Batch HTTP Error: ${response.status}`);
      
      const rawData = await response.json();
      const rawText = rawData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      parsedModelResponse = JSON.parse(rawText.replace(/```json|```/g, '').trim());
      
    } catch (modelError) {
      clearTimeout(timeout);
      throw modelError;
    } finally {
      // 🧹 CLEANUP ALL FILES FROM GCS REGARDLESS OF API OUTCOME
      await Promise.all(uploadedFiles.map(async (file) => {
        try { await file.delete(); } catch (e) { /* ignore cleanup errors */ }
      }));
    }

    // 🧮 AGGREGATE RESULTS FROM SINGLE MULTI-IMAGE RESPONSE
    let detailedImageLogs = "PANE COUNTING BREAKDOWN:\n";

    const finalTotals = {
      images_count: req.files.length,
      average_vibe_multiplier: 1.0,
      analysis_g3: "", // Populated dynamically below
      analysis_g25: `Global Vibe selected directly by Gemini 3.5 Flash: [${parsedModelResponse.global_pane_vibe || 'normal'}]`,
      window_counts: {
        pane_3rd_story: 0,
        pane_2nd_story: 0,
        pane_1st_base: 0,
        patio_door_pane: 0,
        entry_door_pane: 0,
        pane_vibe: parsedModelResponse.global_pane_vibe || "normal",
        image_vibes: {}
      },
      stories: parsedModelResponse.stories || 1,
      failed_images: [],
      durationSec: ((performance.now() - startTime) / 1000).toFixed(1)
    };

    // Roll up individual file pane allocations into the consolidated counts object
    if (Array.isArray(parsedModelResponse.by_image_breakdown)) {
      parsedModelResponse.by_image_breakdown.forEach(item => {
        const counts = item.window_counts || {};
        
        // Build the combined log text block to preserve front-end tracking presentation
        detailedImageLogs += `\n[${item.image_name}]:\n${item.image_analysis || 'No details provided.'}\n`;

        finalTotals.window_counts.pane_3rd_story += (counts.pane_3rd_story || 0);
        finalTotals.window_counts.pane_2nd_story += (counts.pane_2nd_story || 0);
        finalTotals.window_counts.pane_1st_base += (counts.pane_1st_base || 0);
        finalTotals.window_counts.patio_door_pane += (counts.patio_door_pane || 0);
        finalTotals.window_counts.entry_door_pane += (counts.entry_door_pane || 0);
        
        // Track the chosen global vibe per specific frame for legacy tracking schemas
        finalTotals.window_counts.image_vibes[item.image_name] = finalTotals.window_counts.pane_vibe;
      });
    }

    // Assign the built detailed string to analysis_g3 to preserve UI design
    finalTotals.analysis_g3 = detailedImageLogs + `\n\nOverall Property Context:\n${parsedModelResponse.property_analysis || ''}\n\n\n`;

    // Assign final multiplier value using the configuration mapping logic
    const selectedVibe = finalTotals.window_counts.pane_vibe;
    finalTotals.average_vibe_multiplier = pricing.VIBE_MULTIPLIERS[selectedVibe] || 1.0;

    // Send the structured response object back to the app UI 
    res.json(finalTotals);

  } catch (error) {
    console.error('🔥 Server Error processing image block:', error);
    res.status(500).json({ error: error.message });
  }
});

// 🎧 START LISTENING
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
});