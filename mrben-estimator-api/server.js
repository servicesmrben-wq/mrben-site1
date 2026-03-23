const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

app.get('/', (req, res) => {
  res.status(200).send('Microservice is healthy');
});

app.post('/estimate', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    const systemInstruction = `You are a highly accurate expert window pane counter. Analyze this photo to count all window panes.

CRITICAL VISUAL RULES:
- FRAMES & SPLITS: Count every distinct glass pane separated by a physical frame. Do not group them. Look closely at large window groupings: if a frame splits the glass, count each distinct pane.
- IGNORE DECORATIVE GRIDS: Do not count the tiny glass squares (muntins) inside a window. Only count the major sliding or fixed structural panes.
- OBSTRUCTIONS & SHADOWS: Actively look behind bare tree branches, plastic winter shelters, and into deep shadows. Mentally reconstruct frames behind branches. Do not miss partially hidden windows.
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

    // Swapped to us-east1 to bypass the crowded global queue
    const url = 'https://aiplatform.googleapis.com/v1/projects/gen-lang-client-0569585575/locations/global/publishers/google/models/gemini-3-flash-preview:generateContent';

    const MAX_RETRIES = 2; 

    // The delay helper function for staggered launching
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const aiPromises = req.files.map(async (file, index) => {
      // THE STAGGERED LAUNCH: Space out each request by 1000ms
      await delay(index * 1000);
      
      let attempt = 0;
      
      // The Self-Healing Retry Loop
      while (attempt <= MAX_RETRIES) {
        try {
          const body = {
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [{
              role: 'user',
              parts: [{
                inline_data: {
                  mime_type: file.mimetype,
                  data: file.buffer.toString('base64')
                }
              }]
            }],
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ],
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.0
            }
          };

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'X-Vertex-AI-LLM-Request-Type': 'shared',
              'X-Vertex-AI-LLM-Shared-Request-Type': 'priority'
            },
            body: JSON.stringify(body)
          });

          if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
          }

          const data = await response.json();
          let textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          if (!textResult) {
            throw new Error('Empty response from model');
          }

          textResult = textResult.replace(/```json|```/g, '').trim();
          
          return JSON.parse(textResult);

        } catch (error) {
          attempt++;
          console.warn(`[Image ${index + 1}] Attempt ${attempt} failed: ${error.message}`);
          
          if (attempt > MAX_RETRIES) {
            console.error(`[Image ${index + 1}] All ${MAX_RETRIES + 1} attempts failed. Giving up.`);
            return { window_counts: {}, stories: 1, analysis: `Img ${index + 1} analysis failed after retries.` };
          }
          
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    });

    const resultsArray = await Promise.all(aiPromises);

    const finalTotals = {
      analysis: "Parallel processing complete. ",
      window_counts: {
        pane_3rd_story: 0,
        pane_2nd_story: 0,
        pane_1st_base: 0,
        patio_door_pane: 0,
        entry_door_pane: 0
      },
      stories: 1
    };

    resultsArray.forEach((result, index) => {
      if (result.analysis) {
        finalTotals.analysis += `[Img ${index + 1}: ${result.analysis}] `;
      }

      if (result.window_counts) {
        finalTotals.window_counts.pane_3rd_story += (result.window_counts.pane_3rd_story || 0);
        finalTotals.window_counts.pane_2nd_story += (result.window_counts.pane_2nd_story || 0);
        finalTotals.window_counts.pane_1st_base += (result.window_counts.pane_1st_base || 0);
        finalTotals.window_counts.patio_door_pane += (result.window_counts.patio_door_pane || 0);
        finalTotals.window_counts.entry_door_pane += (result.window_counts.entry_door_pane || 0);
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