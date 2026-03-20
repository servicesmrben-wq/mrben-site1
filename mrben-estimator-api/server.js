const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');

const app = express();
// FIX 1: Allow Cloud Run to inject its dynamic port
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

    const systemInstruction = `You are an expert window estimator for a cleaning business. Analyze these photos to count the major cleanable window PANELS (often called sashes).

CRITICAL VISUAL RULES:
- BREAK DOWN ASSEMBLIES: Do not count a large window block as just "1". 
- COUNT VERTICAL SECTIONS: Look for thick vertical frames (mullions). A large window often has 2 or 3 vertical columns.
- COUNT HORIZONTAL DIVISIONS: Look for thick horizontal frames separating the top and bottom glass. 
- CALCULATE TOTAL PANELS: Multiply the vertical sections by the horizontal divisions. (e.g., A window with 3 vertical sections, where each section has a top and bottom half, equals 6 total panels). Count these as your base panes.
- IGNORE DECORATIVE GRIDS: Do NOT count the tiny individual glass squares (muntins/grids) inside a larger panel. Count the main panel itself as 1 piece.
- OBSTRUCTIONS & SHADOWS: Actively look behind plastic winter shelters, tanks, and into deep shadows. Do not miss partially hidden basement windows.
- TRANSOMS: Windows above doors count separately (map to 1st floor).
- BASEMENT: Count 2 panels per sliding basement unit. Look closely at the foundation line.
- DOORS (PATIO): Count every large glass panel of sliding patio doors as 'patio_door_pane'. (e.g., a standard 2-panel sliding door = 2 panes).
- DOORS (ENTRY): Standard front/back doors. Assume 1 glass panel for every entry door found, count as 'entry_door_pane'.

SPATIAL MAPPING (Top-Down):
- 3rd Story -> 'pane_3rd_story'
- 2nd Story -> 'pane_2nd_story'
- Main/Basement -> 'pane_1st_base'

OUTPUT FORMAT:
Return JSON ONLY. Use the 'analysis_counting' field to perform step-by-step math for every window assembly before outputting the final counts.
{
  "analysis_counting": "Img 1: Found a large window assembly on the 1st floor. It has 3 vertical sections. Each section is split horizontally into a top and bottom half. 3 x 2 = 6 total panels...",
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

    // Set to 3.1 Pro Preview as requested
    const url = 'https://aiplatform.googleapis.com/v1/projects/gen-lang-client-0569585575/locations/global/publishers/google/models/gemini-3.1-pro-preview-api:generateContent';

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
    
    const aiResult = JSON.parse(textResult);
    res.json(aiResult);

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// FIX 2: Explicitly bind to '0.0.0.0'
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});