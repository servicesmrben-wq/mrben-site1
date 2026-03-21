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

    const contents = req.files.map(file => ({
      inline_data: {
        mime_type: file.mimetype,
        data: file.buffer.toString('base64')
      }
    }));

const systemInstruction = `You are an expert estimator. Analyze the provided photos to accurately count the major cleanable window PANELS (often called sashes) and present the results in a structured JSON format.

CRITICAL VISUAL RULES:
- DEFINITION OF A PANEL: For this task, a 'panel' (or 'sash') refers to a major, independent, structurally framed unit of glass. A standard residential window that slides up and down typically consists of TWO panels (a top sash and a bottom sash). Each physically framed section of glass counts as 1 panel.
- SYSTEMATIC SCAN: For each image, systematically scan from left to right, top to bottom, ensuring every visible window assembly and potential hidden area is thoroughly analyzed.
- FULL HOUSE ZOOM: Do not glance and guess on full-house shots. Mentally "zoom in" on every individual window assembly before counting to ensure you see all structural frames.
- IGNORE DECORATIVE GRIDS: Do not count the tiny glass squares (muntins) inside a window. Only count the major sliding or fixed structural panels.
- OBSTRUCTIONS & SHADOWS: Actively look behind plastic winter shelters, tanks, into deep shadows, and behind tree branches. Do not miss partially hidden basement windows.
- BASEMENT: Identify basement windows by looking closely at the foundation line.
- TRANSOMS (WINDOWS ABOVE DOORS): The horizontal window directly above a door is called a "transom". Do not count this as a door pane. Count it separately as a regular 1st-floor window ('pane_1st_base').
- DOORS (ENTRY) & SIDELIGHTS: Do not just assume 1 pane. Count the main glass panel on the door itself as 1 'entry_door_pane'. If there are narrow vertical windows immediately next to the door (sidelights), count each sidelight as an additional 'entry_door_pane'. (e.g., A door with glass + 2 sidelights = 3 entry_door_panes).
- DOORS (PATIO): Count every large glass panel of sliding patio doors as 'patio_door_pane'. (e.g., a standard 2-panel sliding door = 2 panes).

SPATIAL MAPPING (Top-Down):
- 3rd Story -> 'pane_3rd_story'
- 2nd Story -> 'pane_2nd_story'
- Main/Basement -> 'pane_1st_base'

OUTPUT FORMAT:
Return JSON ONLY. You must output a single object with the grand totals for ALL images combined. Use the 'analysis_counting' field to perform step-by-step reasoning for every window assembly before outputting the final counts.
{
  "analysis_counting": "Img 1: Scanning left to right. Found 1 standard window assembly on the 1st floor. It has a top and bottom sash, so that is 2 pane_1st_base. Found 1 entry door with 2 sidelights, so that is 3 entry_door_pane...",
  "window_counts": { 
    "pane_3rd_story": 0, 
    "pane_2nd_story": 0, 
    "pane_1st_base": 0, 
    "patio_door_pane": 0,
    "entry_door_pane": 0 
  },
  "stories": 1
}`;

    const body = {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: [
        {
          role: 'user',
          parts: contents
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.0
      }
    };

    const url = 'https://aiplatform.googleapis.com/v1/projects/gen-lang-client-0569585575/locations/global/publishers/google/models/gemini-3.1-pro-preview:generateContent';

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
      const errorText = await response.text();
      console.error('Vertex AI Error:', errorText);
      return res.status(500).json({ error: 'Vertex AI request failed', details: errorText });
    }

    const data = await response.json();
    let textResult = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    textResult = textResult.replace(/```json|```/g, '').trim();
    
    // Parse the AI window counts
    const aiResult = JSON.parse(textResult);
    
    // Return ONLY the counts (Frontend will handle pricing)
    res.json(aiResult);

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});