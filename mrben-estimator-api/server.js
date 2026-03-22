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

const systemInstruction = `You are a highly accurate expert window pane counter. Analyze these photos to count all window panes.

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
Return JSON ONLY. You MUST use the 'analysis' field to explicitly tally the panes before outputting the final integers. 

CRITICAL DENSITY RULE: For images with many windows, DO NOT summarize, group, or guess. You must systematically point to them in your text to force a physical count (e.g., "Top floor left to right: grouping of 3, grouping of 2. Main floor: massive block of 4, slider of 2...").

{
  "analysis": "Top floor scan: left window has 2 panes, middle has 3 panes, right has 2. (Total 2nd story = 7). Main floor scan: large picture window split into 4 panes, plus 1 sliding patio door (2 panes). (Total 1st base = 6)...",
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
      // Re-added safety settings to bypass the 45-second silent blocks
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.0
      }
    };

    // Updated Vertex AI URL to Gemini 3 Flash Preview
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
    // console.log("RAW VERTEX RESPONSE:", JSON.stringify(data, null, 2));
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