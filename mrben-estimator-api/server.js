const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleAuth } = require('google-auth-library');

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

// Health check
app.get('/', (req, res) => {
  res.status(200).send('Microservice is healthy');
});

// Estimate route
app.post('/estimate', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Get access token from service account
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    // Convert files to base64 inline_data
    const contents = req.files.map(file => ({
      inline_data: {
        mime_type: file.mimetype,
        data: file.buffer.toString('base64')
      }
    }));

    // FIXED: Ensure variable name matches below (singular)
    const systemInstruction = `You are an expert estimator. Analyze these photos to count window panes.

CRITICAL VISUAL RULES:
- OBSTRUCTIONS & SHADOWS: Actively look behind plastic winter shelters, tanks, and into deep shadows. Do not miss partially hidden basement windows.
- MULLIONS: Count every distinct glass pane separated by a frame. Look closely at large window blocks: if a frame divides it, count each section (e.g., a 3-section window = 3 panes). Standard slider/hung = 2 panes.
- TRANSOMS: Windows above doors count separately (map to 1st floor).
- BASEMENT: Count 2 panes per sliding basement unit. Look closely at the foundation line.
- DOORS: Count each panel of sliding/entry doors as 'patio_door_panel'.

SPATIAL MAPPING (Top-Down):
- 3rd Story -> 'pane_3rd_story'
- 2nd Story -> 'pane_2nd_story'
- Main/Basement -> 'pane_1st_base'

OUTPUT FORMAT:
Return JSON ONLY. Use the 'analysis' field to briefly perform step-by-step reasoning per image to avoid missing hidden windows before outputting the final counts.
{
  "analysis": "Img 1: Found 3 main windows (3 panes), plus 1 hidden basement slider in shadow (2 panes)...",
  "window_counts": { "pane_3rd_story": 0, "pane_2nd_story": 0, "pane_1st_base": 0, "patio_door_panel": 0 },
  "stories": 1
}`;

    // FIXED: Properly structured request body
    const body = {
      systemInstruction: {
        parts: [{ text: systemInstruction }] // Matches the Vertex AI requirement
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

    const url = 'https://aiplatform.googleapis.com/v1/projects/gen-lang-client-0569585575/locations/global/publishers/google/models/gemini-3-flash-preview:generateContent';

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
    
    // Clean markdown backticks if present
    textResult = textResult.replace(/```json|```/g, '').trim();
    
    res.json(JSON.parse(textResult));

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});